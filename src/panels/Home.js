import React, { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, Group, Div, Text, Title,
    Search, Card, Button, ScreenSpinner,
    Spacing, Avatar, IconButton, CardScroll,
    Alert, SimpleCell
} from '@vkontakte/vkui';
import {
    Icon16Chevron,
    Icon28LikeOutline, Icon28ViewOutline, Icon28BookmarkOutline,
    Icon24PenOutline, Icon28LikeCircleFillRed, Icon28Bookmark, Icon20ArrowRightOutline
} from '@vkontakte/icons';
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import bridge from "@vkontakte/vk-bridge";
import api from '../api';

const genresMap = {
    'fiction': 'Художественная литература',
    'non-fiction': 'Нон-фикшн',
    'mystery': 'Детектив',
    'romance': 'Романтика',
    'science_fiction': 'Научная фантастика',
    'fantasy': 'Фэнтези',
    'horror': 'Ужасы',
    'poetry': 'Поэзия',
    'thoughts': 'Размышления',
    'ideas': 'Идеи'
};

const StoryCard = ({ story, onClick, token, onLikeChange, onFollowChange, onBookmarkChange, currentUserId }) => {
    const [isLiked, setIsLiked] = useState(story.is_liked);
    const [likesCount, setLikesCount] = useState(story.likes_count);
    const [isFollowing, setIsFollowing] = useState(story.is_following_author);
    const [isBookmarked, setIsBookmarked] = useState(story.is_bookmarked);
    const [bookmarksCount, setBookmarksCount] = useState(story.bookmarks_count);
    const routeNavigator = useRouteNavigator();

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

    const handleUser = () => {
        routeNavigator.push(`/user/${story.author_id}`)
    }
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
        <Card mode="shadow" style={{ width: 300, marginRight: 16 }}>
            <Div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar size={36} src={story.author_avatar_url} onClick={handleUser}/>
                        <Text weight="medium" style={{ marginLeft: 12 }} onClick={handleUser}>{story.author_name}</Text>
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
                <Title level="3" style={{ marginBottom: 8, fontSize: 18 }} onClick={() => onClick(story.id)}>{story.title}</Title>
                {story.cover_image_url && (
                    <img src={story.cover_image_url} alt={story.title}
                         style={{width: '100%', borderRadius: 8, marginBottom: 12}} onClick={() => onClick(story.id)}/>

                )}
                <Text style={{marginBottom: 12}} onClick={() => onClick(story.id)}>{story.summary}</Text>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

export const Home = ({ id }) => {
    const [storiesByGenre, setStoriesByGenre] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [token, setToken] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const routeNavigator = useRouteNavigator();

    const fetchStories = async () => {
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

            const response = await api.get(`/stories/?limit=100&search=${searchTerm}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (Array.isArray(response.data.stories)) {
                const groupedStories = response.data.stories.reduce((acc, story) => {
                    if (!acc[story.genre]) {
                        acc[story.genre] = [];
                    }
                    acc[story.genre].push(story);
                    return acc;
                }, {});
                setStoriesByGenre(groupedStories);
            } else {
                throw new Error('Получен неверный формат данных');
            }
        } catch (error) {
            console.error('Ошибка при загрузке историй:');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, [searchTerm]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchStories();
        }
    };

    const handleWriteButtonClick = () => {
        setIsAlertOpen(true);
    };

    const handleAlertClose = () => {
        setIsAlertOpen(false);
    };

    const handleWriteStory = () => {
        handleAlertClose();
        routeNavigator.push('/createhistory');
    };

    const handleWriteChapter = () => {
        handleAlertClose();
        routeNavigator.push('/createchapter');
    };

    const handleStoryClick = (storyId) => {
        routeNavigator.push(`/historydetails/${storyId}`);
    };

    const handleLikeChange = (storyId, newLikeStatus) => {
        setStoriesByGenre(prevState => {
            return Object.fromEntries(
                Object.entries(prevState).map(([genre, stories]) => [
                    genre,
                    stories.map(story =>
                        story.id === storyId ? {...story, is_liked: newLikeStatus, likes_count: newLikeStatus ? story.likes_count + 1 : story.likes_count - 1} : story
                    )
                ])
            );
        });
    };

    const handleFollowChange = (authorId, newFollowStatus) => {
        setStoriesByGenre(prevState => {
            return Object.fromEntries(
                Object.entries(prevState).map(([genre, stories]) => [
                    genre,
                    stories.map(story =>
                        story.author_id === authorId ? {...story, is_following_author: newFollowStatus} : story
                    )
                ])
            );
        });
    };

    const handleBookmarkChange = (storyId, newBookmarkStatus) => {
        setStoriesByGenre(prevState => {
            return Object.fromEntries(
                Object.entries(prevState).map(([genre, stories]) => [
                    genre,
                    stories.map(story =>
                        story.id === storyId ? {...story, is_bookmarked: newBookmarkStatus, bookmarks_count: newBookmarkStatus ? story.bookmarks_count + 1 : story.bookmarks_count - 1} : story
                    )
                ])
            );
        });
    };

    if (loading && Object.keys(storiesByGenre).length === 0) {
        return <ScreenSpinner />;
    }

    return (
        <Panel id={id}>
            <PanelHeader>ReadRoom</PanelHeader>

            <Group>
                <Div style={{ display: 'flex', alignItems: 'center', padding: '0px 0px' }}>
                    <Search
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleSearch}
                        after={
                            <IconButton onClick={fetchStories}>
                                <Icon16Chevron />
                            </IconButton>
                        }
                        placeholder="Поиск историй..."
                        style={{ flexGrow: 1 }}
                    />
                    <IconButton onClick={handleWriteButtonClick} style={{ marginLeft: 8 }}>
                        <Icon24PenOutline />
                    </IconButton>
                </Div>

                <Spacing size={16} />

                {error && (
                    <Div>
                        <Text weight="regular" style={{ textAlign: 'center', color: 'var(--vkui--color_text_negative)' }}>
                            Ошибка: {error}. Пожалуйста, попробуйте позже.
                        </Text>
                    </Div>
                )}

                {!error && Object.keys(storiesByGenre).length > 0 ? (
                    Object.entries(storiesByGenre).map(([genre, stories]) => (
                        <div key={genre}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                margin: '16px 16px 8px 16px'
                            }}>
                                <Title level="2">{genresMap[genre] || genre}</Title>
                                <Button
                                    mode="tertiary"
                                    onClick={() => routeNavigator.push(`/categories/${genre}`)}
                                    after={<Icon20ArrowRightOutline/>}
                                >
                                    Все истории
                                </Button>
                            </div>
                            <CardScroll>
                                {stories.map((story) => (
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
                            </CardScroll>
                        </div>
                    ))
                ) : (
                    !loading && (
                        <Div>
                            <Text weight="regular" style={{ textAlign: 'center' }}>Истории не найдены. Попробуйте изменить параметры поиска.</Text>
                        </Div>
                    )
                )}
            </Group>

            {isAlertOpen && (
                <Alert
                    actions={[
                        {
                            title: 'Написать историю',
                            autoclose: true,
                            mode: 'default',
                            action: handleWriteStory,
                        },
                        {
                            title: 'Написать главу',
                            autoclose: true,
                            mode: 'default',
                            action: handleWriteChapter,
                        }
                    ]}
                    actionsLayout="vertical"
                    onClose={handleAlertClose}
                    header="Что вы хотите написать?"
                    text="Выберите тип контента, который вы хотите создать"
                />
            )}
        </Panel>
    );
};
