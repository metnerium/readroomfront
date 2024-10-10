import React, { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, PanelHeaderBack, Group, Cell, Avatar,
    Text, Title, Div, Image, List, Card, CardGrid, ScreenSpinner,
    Header, SimpleCell, InfoRow
} from '@vkontakte/vkui';
import {
    Icon28ViewOutline,
    Icon28LikeOutline,
    Icon28BookmarkOutline,
    Icon28CalendarOutline,
    Icon28UsersOutline, Icon24ArrowLeftOutline
} from '@vkontakte/icons';
import bridge from "@vkontakte/vk-bridge";
import { useRouteNavigator, useParams } from '@vkontakte/vk-mini-apps-router';
import api from '../api';

export const HistoryDetails = ({ id }) => {
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const routeNavigator = useRouteNavigator();
    const { storyId } = useParams();

    useEffect(() => {
        fetchStoryAndChapters();
    }, [storyId]);

    const fetchStoryAndChapters = async () => {
        try {
            setLoading(true);
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;

            const storyResponse = await api.get(`/stories/${storyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStory(storyResponse.data);

            const chaptersResponse = await api.get(`/chapters/story/${storyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setChapters(chaptersResponse.data);
        } catch (error) {
            console.error('Ошибка при загрузке истории и глав:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ScreenSpinner />;
    }

    if (!story) {
        return <Div>История не найдена</Div>;
    }

    return (
        <Panel id={id}>
            <PanelHeader>
                Просмотр истории
            </PanelHeader>
            <Group>
                <CardGrid size="l">
                    <Card mode="outline">
                        <div style={{ position: 'relative' }}>
                            <Image
                                size={200}
                                src={story.cover_image_url}
                                alt={story.title}
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            />
                            <Div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                padding: '16px'
                            }}>
                                <SimpleCell
                                    before={<Avatar src={story.author_avatar_url} size={36} />}
                                    description={<Text style={{ color: 'white' }}>Автор</Text>}
                                >
                                    <Text weight="medium" style={{ color: 'white' }}>{story.author_name}</Text>
                                </SimpleCell>
                            </Div>
                        </div>
                    </Card>
                </CardGrid>

                <Group >
                    <SimpleCell>
                        <Title level="1" weight="medium" style={{ color: 'white', marginBottom: '8px' }}>
                            {story.title}
                        </Title>
                    </SimpleCell>
                    <SimpleCell before={<Icon28CalendarOutline />}>
                        <InfoRow header="Дата публикации">
                            {new Date(story.created_at).toLocaleDateString()}
                        </InfoRow>
                    </SimpleCell>
                    <SimpleCell multiline>
                        <InfoRow header="Описание">
                            {story.summary}
                        </InfoRow>
                    </SimpleCell>

                    <Div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <InfoRow header="Просмотры" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Icon28ViewOutline />
                            <Text weight="medium">{story.views}</Text>
                        </InfoRow>
                        <InfoRow header="Лайки" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Icon28LikeOutline />
                            <Text weight="medium">{story.likes_count}</Text>
                        </InfoRow>
                        <InfoRow header="Закладки" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Icon28BookmarkOutline />
                            <Text weight="medium">{story.bookmarks_count}</Text>
                        </InfoRow>
                    </Div>
                </Group>

                <Group header={<Header mode="secondary">Главы</Header>}>
                    <List>
                        {chapters.map((chapter, index) => (
                            <SimpleCell
                                key={chapter.id}
                                expandable
                                onClick={() => routeNavigator.push(`/chapterdetails/${chapter.id}`)}
                            >
                                Глава {index + 1}: {chapter.title}
                            </SimpleCell>
                        ))}
                    </List>
                </Group>
            </Group>
        </Panel>
    );
};
