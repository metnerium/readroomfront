import React, { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, Group, Div, Text, Title,
    Search, Card, Button, ScreenSpinner,
    Spacing, Avatar, IconButton, CardScroll,
    Alert
} from '@vkontakte/vkui';
import {
    Icon16Chevron,
    Icon28LikeOutline, Icon28ViewOutline, Icon28BookmarkOutline,
    Icon24PenOutline
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

const StoryCard = ({ story, onClick }) => (
    <Card mode="shadow" style={{ width: 300, marginRight: 16 }} onClick={() => onClick(story.id)}>
        <Div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <Avatar size={36} src={story.author_avatar_url} />
                <Text weight="medium" style={{ marginLeft: 12 }}>{story.author_name}</Text>
            </div>
            <Title level="3" style={{ marginBottom: 8, fontSize: 18 }}>{story.title}</Title>
            <img src={story.cover_image_url} alt={story.title} style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />
            <Text style={{ marginBottom: 12 }}>{story.summary}</Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}><IconButton><Icon28LikeOutline/></IconButton>{story.likes_count}</span>
                    <span style={{ display: 'flex', alignItems: 'center' }}><IconButton><Icon28BookmarkOutline/></IconButton>{story.bookmarks_count}</span>
                    <span style={{ display: 'flex', alignItems: 'center' }}><Icon28ViewOutline/>{story.views}</span>
                </div>
            </div>
        </Div>
    </Card>
);

export const Home = ({ id }) => {
    const [storiesByGenre, setStoriesByGenre] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const routeNavigator = useRouteNavigator();

    const fetchStories = async () => {
        setLoading(true);
        setError(null);
        try {
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;

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
            console.error('Ошибка при загрузке историй:', error);
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
                            <Title level="2" style={{ margin: '16px 0 8px 16px' }}>{genresMap[genre] || genre}</Title>
                            <CardScroll>
                                {stories.map((story) => (
                                    <StoryCard key={story.id} story={story} onClick={handleStoryClick} />
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
