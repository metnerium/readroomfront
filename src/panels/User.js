import React, { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, Header, Button, Group, Div, Avatar,
    FormLayoutGroup, FormItem, Input, Textarea, Snackbar,
    Title, Text, Card, CardGrid, PanelHeaderButton,
    ScreenSpinner, ConfigProvider, useAdaptivity, ButtonGroup,
    SimpleCell, InfoRow, IconButton
} from '@vkontakte/vkui';
import {
    Icon28ChevronBack,
    Icon20DoorEnterArrowRightOutline, Icon24PenOutline,
    Icon24ChevronDown
} from '@vkontakte/icons';
import axios from 'axios';
import bridge from "@vkontakte/vk-bridge";
import {useParams, useRouteNavigator} from "@vkontakte/vk-mini-apps-router";

const API_BASE_URL = 'https://api-metnerium.ru';

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'М';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'К';
    }
    return num.toString();
};

const StoryWithChapters = ({ story, chapters, onStoryClick, onChapterClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const routeNavigator = useRouteNavigator();

    return (
        <Div>
            <SimpleCell
                onClick={() => onStoryClick(story.id)}
                after={
                    <IconButton onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}>
                        <Icon24ChevronDown style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                    </IconButton>
                }
            >
                <InfoRow header={story.title}>
                    {`${chapters.length} ${chapters.length === 1 ? 'глава' : 'главы'}`}
                </InfoRow>
            </SimpleCell>

            {isExpanded && (
                <Div style={{ paddingLeft: 12 }}>
                    {chapters.map((chapter) => (
                        <SimpleCell
                            key={chapter.id}
                            onClick={() => onChapterClick(chapter.id)}
                        >
                            <InfoRow header={`Глава ${chapter.chapter_number}: ${chapter.title}`}>
                            </InfoRow>
                        </SimpleCell>
                    ))}
                </Div>
            )}
        </Div>
    );
};

export const User = ({ id }) => {
    const { viewWidth } = useAdaptivity();
    const [profile, setProfile] = useState(null);
    const [storiesWithChapters, setStoriesWithChapters] = useState([]);
    const [snackbar, setSnackbar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const routeNavigator = useRouteNavigator();
    const { userId } = useParams();


    useEffect(() => {
        fetchProfile();
        fetchUserStories();
    }, [userId]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/users/profile/${userId}`);
            setProfile(response.data);
        } catch (error) {
            console.error('Не удалось загрузить профиль:');
            showError('Не удалось загрузить профиль. Пожалуйста, попробуйте снова.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserStories = async () => {
        try {
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;
            const response = await axios.get(`${API_BASE_URL}/usercontent/users/${userId}/stories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const storiesPromises = response.data.map(async (story) => {
                const chaptersResponse = await axios.get(`${API_BASE_URL}/chapters/story/${story.id}`);
                return { ...story, chapters: chaptersResponse.data };
            });
            const storiesWithChapters = await Promise.all(storiesPromises);
            setStoriesWithChapters(storiesWithChapters);
        } catch (error) {
            console.error('Не удалось загрузить истории пользователя:');
            showError('Не удалось загрузить истории. Пожалуйста, попробуйте снова.');
        }
    };


    const showError = (message) => {
        setSnackbar(
            <Snackbar onClose={() => setSnackbar(null)} duration={3000}>
                {message}
            </Snackbar>
        );
    };

    const handleStoryClick = (storyId) => {
        routeNavigator.push(`/historydetails/${storyId}`);
    };

    const handleChapterClick = (chapterId) => {
        routeNavigator.push(`/chapterdetails/${chapterId}`);
    };

    return (
        <ConfigProvider>
            {isLoading && <ScreenSpinner state="loading" />}
            <Panel id={id}>
                <PanelHeader>
                    Профиль
                </PanelHeader>
                {profile && (
                    <Div>
                        <Group>
                            <Div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: 'linear-gradient(45deg, #ff0000, #9C27B0)', padding: '20px', borderRadius: '12px' }}>
                                <Avatar src={profile.avatar_url || fetchedUser?.photo_200} size={96} style={{ border: '4px solid #FFF' }} />
                                <Title level="2" style={{ marginTop: 16, color: '#FFF' }}>{profile.full_name}</Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{profile.pseudonym || '@' + profile.full_name.toLowerCase().replace(' ', '')}</Text>
                            </Div>
                        </Group>

                        <Group header={<Header mode="secondary">Статистика</Header>}>
                            <CardGrid size="l">
                                <Card>
                                    <Div style={{ textAlign: 'center' }}>
                                        <Title level="3">Подписчики</Title>
                                        <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatNumber(profile.followers_count)}</Text>
                                    </Div>
                                </Card>
                                <Card>
                                    <Div style={{ textAlign: 'center' }}>
                                        <Title level="3">Подписки</Title>
                                        <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatNumber(profile.following_count)}</Text>
                                    </Div>
                                </Card>
                                <Card>
                                    <Div style={{ textAlign: 'center' }}>
                                        <Title level="3">Истории</Title>
                                        <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatNumber(profile.stories_count)}</Text>
                                    </Div>
                                </Card>
                            </CardGrid>
                        </Group>

                        <Group header={<Header mode="secondary">О себе</Header>}>
                            <Div>
                                <Text style={{ fontStyle: 'italic' }}>{profile.bio || 'Информация отсутствует'}</Text>
                            </Div>
                        </Group>

                        <Group header={<Header mode="secondary">Истории</Header>}>
                            {storiesWithChapters.map((story) => (
                                <StoryWithChapters
                                    key={story.id}
                                    story={story}
                                    chapters={story.chapters}
                                    onStoryClick={handleStoryClick}
                                    onChapterClick={handleChapterClick}
                                />
                            ))}
                        </Group>
                    </Div>
                )}
                {snackbar}
            </Panel>
        </ConfigProvider>
    );
};

