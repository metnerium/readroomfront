import React, { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, Group, Div, Text, Title,
    Search, Card, ScreenSpinner, CardScroll, IconButton,
    PanelHeaderBack
} from '@vkontakte/vkui';
import { Icon16Chevron } from '@vkontakte/icons';
import { useRouteNavigator, useParams } from "@vkontakte/vk-mini-apps-router";
import bridge from "@vkontakte/vk-bridge";
import api from '../api';
import { StoryCard } from './StoryCard';

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

export const Category = ({ id }) => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [token, setToken] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const routeNavigator = useRouteNavigator();
    const { category } = useParams();
    const genre = category;
    const fetchStories = async () => {
        setLoading(true);
        setError(null);
        try {
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;
            setToken(token);

            const userInfo = await api.get('/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCurrentUserId(userInfo.data.id);

            const response = await api.get(`/stories/?genre=${genre}&limit=100&search=${searchTerm}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (Array.isArray(response.data.stories)) {
                setStories(response.data.stories);
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
    }, [genre, searchTerm]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchStories();
        }
    };

    const handleStoryClick = (storyId) => {
        routeNavigator.push(`/historydetails/${storyId}`);
    };

    const handleLikeChange = (storyId, newLikeStatus) => {
        setStories(prevStories =>
            prevStories.map(story =>
                story.id === storyId
                    ? {...story, is_liked: newLikeStatus, likes_count: newLikeStatus ? story.likes_count + 1 : story.likes_count - 1}
                    : story
            )
        );
    };

    const handleFollowChange = (authorId, newFollowStatus) => {
        setStories(prevStories =>
            prevStories.map(story =>
                story.author_id === authorId
                    ? {...story, is_following_author: newFollowStatus}
                    : story
            )
        );
    };

    const handleBookmarkChange = (storyId, newBookmarkStatus) => {
        setStories(prevStories =>
            prevStories.map(story =>
                story.id === storyId
                    ? {...story, is_bookmarked: newBookmarkStatus, bookmarks_count: newBookmarkStatus ? story.bookmarks_count + 1 : story.bookmarks_count - 1}
                    : story
            )
        );
    };

    if (loading && stories.length === 0) {
        return <ScreenSpinner />;
    }

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
                {genresMap[genre] || genre}
            </PanelHeader>

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
                </Div>

                {error && (
                    <Div>
                        <Text weight="regular" style={{ textAlign: 'center', color: 'var(--vkui--color_text_negative)' }}>
                            Ошибка: {error}. Пожалуйста, попробуйте позже.
                        </Text>
                    </Div>
                )}

                {!error && stories.length > 0 ? (
                    <Div>
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
                    </Div>
                ) : (
                    !loading && (
                        <Div>
                            <Text weight="regular" style={{ textAlign: 'center' }}>Истории не найдены. Попробуйте изменить параметры поиска.</Text>
                        </Div>
                    )
                )}
            </Group>
        </Panel>
    );
};
