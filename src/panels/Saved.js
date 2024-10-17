import React, { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, Group, Div, Text,
    Card, Button, ScreenSpinner, Avatar, IconButton
} from '@vkontakte/vkui';
import {
    Icon28LikeOutline, Icon28ViewOutline, Icon28BookmarkOutline,
    Icon28LikeCircleFillRed, Icon28Bookmark
} from '@vkontakte/icons';
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import bridge from "@vkontakte/vk-bridge";
import api from '../api';

const StoryCard = ({ story, onClick, token, onLikeChange, onFollowChange, onBookmarkChange, currentUserId }) => {
    const [isLiked, setIsLiked] = useState(story.is_liked);
    const [likesCount, setLikesCount] = useState(story.likes_count);
    const [isFollowing, setIsFollowing] = useState(story.is_following_author);
    const [isBookmarked, setIsBookmarked] = useState(story.is_bookmarked);
    const [bookmarksCount, setBookmarksCount] = useState(story.bookmarks_count);

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            if (isLiked) {
                await api.delete(`/social/likes/${story.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setLikesCount(prev => prev - 1);
            } else {
                await api.post('/social/likes', { story_id: story.id }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setLikesCount(prev => prev + 1);
            }
            setIsLiked(!isLiked);
            if (onLikeChange) onLikeChange(story.id, !isLiked);
        } catch (error) {
            console.error('Error toggling like:');
        }
    };

    const handleFollow = async (e) => {
        e.stopPropagation();
        try {
            if (isFollowing) {
                await api.delete(`/social/unfollow/${story.author_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await api.post('/social/follow', { followed_id: story.author_id }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            setIsFollowing(!isFollowing);
            if (onFollowChange) onFollowChange(story.author_id, !isFollowing);
        } catch (error) {
            console.error('Error toggling follow:');
        }
    };

    const handleBookmark = async (e) => {
        e.stopPropagation();
        try {
            if (isBookmarked) {
                await api.delete(`/social/bookmarks/${story.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setBookmarksCount(prev => prev - 1);
            } else {
                await api.post('/social/bookmarks', { story_id: story.id }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setBookmarksCount(prev => prev + 1);
            }
            setIsBookmarked(!isBookmarked);
            if (onBookmarkChange) onBookmarkChange(story.id, !isBookmarked);
        } catch (error) {
            console.error('Error toggling bookmark:');
        }
    };

    return (
        <Card mode="shadow" style={{ width: '100%', marginBottom: 16 }} onClick={() => onClick(story.id)}>
            <Div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar size={36} src={story.author_avatar_url} />
                        <Text weight="medium" style={{ marginLeft: 12 }}>{story.author_name}</Text>
                    </div>
                    {story.author_id !== currentUserId && (
                        <Button
                            mode={isFollowing ? "secondary" : "primary"}
                            size="s"
                            onClick={handleFollow}
                        >
                            {isFollowing ? "Отписаться" : "Подписаться"}
                        </Button>
                    )}
                </div>
                <Text weight="semibold" style={{ marginBottom: 8, fontSize: 18 }}>{story.title}</Text>
                <img src={story.cover_image_url} alt={story.title} style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />
                <Text style={{ marginBottom: 12 }}>{story.summary}</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={handleLike}>
                                {isLiked ? <Icon28LikeCircleFillRed /> : <Icon28LikeOutline />}
                            </IconButton>
                            {likesCount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={handleBookmark}>
                                {isBookmarked ? <Icon28Bookmark /> : <Icon28BookmarkOutline />}
                            </IconButton>
                            {bookmarksCount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center' }}><Icon28ViewOutline/>{story.views}</span>
                    </div>
                </div>
            </Div>
        </Card>
    );
};

export const Saved = ({ id }) => {
    const [bookmarkedStories, setBookmarkedStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const routeNavigator = useRouteNavigator();

    const fetchBookmarkedStories = async () => {
        setLoading(true);
        setError(null);
        try {
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;
            setToken(token);

            // Получение ID текущего пользователя
            const userInfo = await api.get('/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCurrentUserId(userInfo.data.id);

            const response = await api.get('/users/bookmarks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (Array.isArray(response.data)) {
                setBookmarkedStories(response.data);
            } else {
                throw new Error('Получен неверный формат данных');
            }
        } catch (error) {
            console.error('Ошибка при загрузке закладок:');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarkedStories();
    }, []);

    const handleStoryClick = (storyId) => {
        routeNavigator.push(`/historydetails/${storyId}`);
    };

    const handleLikeChange = (storyId, newLikeStatus) => {
        setBookmarkedStories(prevStories =>
            prevStories.map(story =>
                story.id === storyId
                    ? {...story, is_liked: newLikeStatus, likes_count: newLikeStatus ? story.likes_count + 1 : story.likes_count - 1}
                    : story
            )
        );
    };

    const handleFollowChange = (authorId, newFollowStatus) => {
        setBookmarkedStories(prevStories =>
            prevStories.map(story =>
                story.author_id === authorId
                    ? {...story, is_following_author: newFollowStatus}
                    : story
            )
        );
    };

    const handleBookmarkChange = (storyId, newBookmarkStatus) => {
        if (!newBookmarkStatus) {
            // Если история больше не в закладках, удаляем её из списка
            setBookmarkedStories(prevStories =>
                prevStories.filter(story => story.id !== storyId)
            );
        } else {
            setBookmarkedStories(prevStories =>
                prevStories.map(story =>
                    story.id === storyId
                        ? {...story, is_bookmarked: newBookmarkStatus, bookmarks_count: story.bookmarks_count + 1}
                        : story
                )
            );
        }
    };

    if (loading && bookmarkedStories.length === 0) {
        return <ScreenSpinner />;
    }

    return (
        <Panel id={id}>
            <PanelHeader>Закладки</PanelHeader>

            <Group>
                {error && (
                    <Div>
                        <Text weight="regular" style={{ textAlign: 'center', color: 'var(--vkui--color_text_negative)' }}>
                            Ошибка: {error}. Пожалуйста, попробуйте позже.
                        </Text>
                    </Div>
                )}

                {!error && bookmarkedStories.length > 0 ? (
                    <Div>
                        {bookmarkedStories.map((story) => (
                            <StoryCard
                                key={story.id}
                                story={story}
                                onClick={handleStoryClick}
                                token={token}
                                onLikeChange={handleLikeChange}
                                onFollowChange={handleFollowChange}
                                onBookmarkChange={handleBookmarkChange}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </Div>
                ) : (
                    !loading && (
                        <Div>
                            <Text weight="regular" style={{ textAlign: 'center' }}>У вас пока нет сохраненных историй.</Text>
                        </Div>
                    )
                )}
            </Group>
        </Panel>
    );
};
