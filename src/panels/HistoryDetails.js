import  { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, Group, Avatar, Text, Title, Div, Image, List, Card, CardGrid, ScreenSpinner,
    Header, SimpleCell, InfoRow, Button, IconButton, FormItem, Input, Textarea, Select, File, FormStatus,
    Alert, ButtonGroup
} from '@vkontakte/vkui';
import {
    Icon28ViewOutline, Icon28LikeOutline, Icon28BookmarkOutline, Icon28LikeCircleFillRed,
    Icon28Bookmark, Icon24PenOutline, Icon20DoorEnterArrowRightOutline, Icon24Camera, Icon20DeleteOutline
} from '@vkontakte/icons';
import bridge from "@vkontakte/vk-bridge";
import { useRouteNavigator, useParams } from '@vkontakte/vk-mini-apps-router';
import axios from "axios";
import { Breadcrumbs } from '../Breadcrumbs';

const formatPublishDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const options = { day: 'numeric', month: 'long' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    if (date.toDateString() === now.toDateString()) {
        return `Сегодня в ${date.toLocaleTimeString('ru-RU', timeOptions)}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Вчера в ${date.toLocaleTimeString('ru-RU', timeOptions)}`;
    } else {
        return `${date.toLocaleDateString('ru-RU', options)} в ${date.toLocaleTimeString('ru-RU', timeOptions)}`;
    }
};
const genresOptions = [
    { value: 'fiction', label: 'Художественная литература' },
    { value: 'non-fiction', label: 'Нон-фикшн' },
    { value: 'mystery', label: 'Детектив' },
    { value: 'romance', label: 'Романтика' },
    { value: 'science_fiction', label: 'Научная фантастика' },
    { value: 'fantasy', label: 'Фэнтези' },
    { value: 'horror', label: 'Ужасы' },
    { value: 'poetry', label: 'Поэзия' },
    { value: 'thoughts', label: 'Размышления' },
    { value: 'ideas', label: 'Идеи' }
];

export const HistoryDetails = ({ id }) => {
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedStory, setEditedStory] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState('');
    const [popout, setPopout] = useState(null);
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
            setToken(token);

            const userInfo = await axios.get('https://api-metnerium.ru/users/me', {
                headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setCurrentUserId(userInfo.data.id);

            const storyResponse = await axios.get(`https://api-metnerium.ru/stories/${storyId}`, {
                headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setStory(storyResponse.data);
            setEditedStory(storyResponse.data);
            setPreviewImage(storyResponse.data.cover_image_url);

            const chaptersResponse = await axios.get(`https://api-metnerium.ru/chapters/story/${storyId}`, {
                headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setChapters(chaptersResponse.data);
        } catch (error) {
            console.error('Ошибка при загрузке истории и глав:');
            setError('Ошибка при загрузке истории и глав');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            if (story.is_liked) {
                await axios.delete(`https://api-metnerium.ru/social/likes/${story.id}`, {
                    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                setStory(prev => ({...prev, is_liked: false, likes_count: prev.likes_count - 1}));
            } else {
                await axios.post('https://api-metnerium.ru/social/likes', { story_id: story.id }, {
                    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                setStory(prev => ({...prev, is_liked: true, likes_count: prev.likes_count + 1}));
            }
        } catch (error) {
            console.error('Ошибка при изменении лайка:');
        }
    };

    const handleBookmark = async () => {
        try {
            if (story.is_bookmarked) {
                await axios.delete(`https://api-metnerium.ru/social/bookmarks/${story.id}`, {
                    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                setStory(prev => ({...prev, is_bookmarked: false, bookmarks_count: prev.bookmarks_count - 1}));
            } else {
                await axios.post('https://api-metnerium.ru/social/bookmarks', { story_id: story.id }, {
                    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                setStory(prev => ({...prev, is_bookmarked: true, bookmarks_count: prev.bookmarks_count + 1}));
            }
        } catch (error) {
            console.error('Ошибка при изменении закладки:');
        }
    };

    const handleUser = () => {
        routeNavigator.push(`/user/${story.author_id}`);
    };

    const handleStartReading = () => {
        if (chapters.length > 0) {
            routeNavigator.push(`/chapterdetails/${chapters[0].id}`);
        }
    };

    const handleFollow = async () => {
        try {
            if (story.is_following_author) {
                await axios.delete(`https://api-metnerium.ru/social/unfollow/${story.author_id}`, {
                    headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                setStory(prev => ({...prev, is_following_author: false}));
            } else {
                await axios.post('https://api-metnerium.ru/social/follow', { followed_id: story.author_id }, {
                    headers: {  'accept': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                setStory(prev => ({...prev, is_following_author: true}));
            }
        } catch (error) {
            console.error('Ошибка при изменении подписки:');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedStory(story);
        setPreviewImage(story.cover_image_url);
        setError('');
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            const response = await axios.put(`https://api-metnerium.ru/stories/${storyId}`, editedStory, {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setStory(response.data);
            setIsEditing(false);
            setError('');
        } catch (error) {
            console.error('Ошибка при сохранении изменений:');
            setError('Ошибка при сохранении изменений');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        setPopout(
            <Alert
                actions={[
                    {
                        title: 'Отмена',
                        autoclose: true,
                        mode: 'cancel',
                    },
                    {
                        title: 'Удалить',
                        autoclose: true,
                        mode: 'destructive',
                        action: () => deleteStory(),
                    },
                ]}
                actionsLayout="horizontal"
                onClose={() => setPopout(null)}
                header="Подтверждение удаления"
                text="Вы уверены, что хотите удалить эту историю?"
            />
        );
    };

    const deleteStory = async () => {
        try {
            setLoading(true);
            await axios.delete(`https://api-metnerium.ru/stories/${storyId}`, {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            });
            routeNavigator.push('/');
        } catch (error) {
            console.error('Ошибка при удалении истории:');
            setError('Ошибка при удалении истории');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Размер файла не должен превышать 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setEditedStory(prev => ({ ...prev, cover_image_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return <ScreenSpinner />;
    }

    if (!story) {
        return <Div>История не найдена</Div>;
    }

    const breadcrumbItems = [
        { text: 'Главная', onClick: () => routeNavigator.push('/') },
        { text: story.title }
    ];

    return (
        <Panel id={id}>
            <PanelHeader>Просмотр истории</PanelHeader>
            {!isEditing && (
                <>
                    <Group>
                        <Div style={{ margin: '0', padding: '0' }}>
                            <Breadcrumbs items={breadcrumbItems} />
                        </Div>
                    </Group>
                    <Group>
                        <Div style={{ margin: '0', padding: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <SimpleCell
                                before={<Avatar src={story.author_avatar_url} size={36} onClick={handleUser}/>}
                                description={<Text style={{ color: 'white' }} onClick={handleUser}>Автор истории</Text>}
                            >
                                <Text weight="medium" onClick={handleUser}>{story.author_name}</Text>
                                <InfoRow header={formatPublishDate(story.created_at)}></InfoRow>
                            </SimpleCell>
                            {story.author_id !== currentUserId && (
                                <Div style={{ marginRight: '5px',}}>
                                    <Button
                                        mode={story.is_following_author ? "secondary" : "primary"}
                                        size="m"
                                        onClick={handleFollow}
                                    >
                                        {story.is_following_author ? "Отписаться" : "Подписаться"}
                                    </Button>
                                </Div>
                            )}
                        </Div>
                    </Group>
                    <CardGrid size="l">
                        <Card mode="outline">
                            <div style={{ position: 'relative' }}>
                                <Image
                                    size={200}
                                    src={story.cover_image_url}
                                    alt={story.title}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                />
                            </div>
                        </Card>
                    </CardGrid>
                    <Group>
                        <SimpleCell>
                            <Title level="1" weight="medium" style={{ marginBottom: '8px' }}>
                                {story.title}
                            </Title>
                            <Card style={{ width: '100%', minHeight: '200px', maxHeight: '400px', overflow: 'auto' }}>
                                <Div>
                                    <Text style={{
                                        whiteSpace: 'pre-wrap',
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word'
                                    }}>
                                        {story.summary}
                                    </Text>
                                </Div>
                            </Card>
                            <Div>
                                <Button size="l" stretched onClick={handleStartReading} disabled={chapters.length === 0}>
                                    Начать чтение
                                </Button>
                            </Div>
                        </SimpleCell>
                        <Div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <InfoRow header="" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                                <IconButton>
                                    <Icon28ViewOutline />
                                </IconButton>
                                <Text weight="medium">{story.views}</Text>
                            </InfoRow>
                            <InfoRow header="" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                                <IconButton onClick={handleLike}>
                                    {story.is_liked ? <Icon28LikeCircleFillRed /> : <Icon28LikeOutline />}
                                </IconButton>
                                <Text weight="medium">{story.likes_count}</Text>
                            </InfoRow>
                            <InfoRow header="" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                                <IconButton onClick={handleBookmark}>
                                    {story.is_bookmarked ? <Icon28Bookmark /> : <Icon28BookmarkOutline />}
                                </IconButton>
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
                </>
            )}
            {isEditing && (
                <Group>
                    {error && <FormStatus mode="error">{error}</FormStatus>}
                    <FormItem top="Название">
                        <Input
                            value={editedStory.title}
                            onChange={(e) => setEditedStory(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </FormItem>
                    <FormItem top="Краткое описание">
                        <Textarea
                            value={editedStory.summary}
                            onChange={(e) => setEditedStory(prev => ({ ...prev, summary: e.target.value }))}
                        />
                    </FormItem>
                    <FormItem top="Жанр">
                        <Select
                            value={editedStory.genre}
                            onChange={(e) => setEditedStory(prev => ({ ...prev, genre: e.target.value }))}
                            options={genresOptions}
                        />
                    </FormItem>
                    <FormItem top="Обложка">
                        <File
                            before={<Icon24Camera />}
                            size="m"
                            accept="image/*"
                            onChange={handleImageChange}
                        >
                            Изменить обложку
                        </File>
                    </FormItem>
                    {previewImage && (
                        <Div>
                            <Image
                                size={200}
                                src={previewImage}
                                alt="Предпросмотр обложки"
                            />
                        </Div>
                    )}
                    <FormItem>
                        <Button size="l" stretched onClick={handleSaveEdit}>
                            Сохранить изменения
                        </Button>
                    </FormItem>
                    <FormItem>
                        <Button size="l" stretched mode="secondary" onClick={handleCancelEdit}>
                            Отменить
                        </Button>
                    </FormItem>
                </Group>
            )}
            {story.is_my_story && !isEditing && (
                <Div>
                    <ButtonGroup mode="horizontal" gap="m" stretched>
                        <Button mode="secondary" onClick={handleEdit} before={<Icon24PenOutline/>} stretched>
                            Редактировать
                        </Button>
                        <Button mode="secondary" onClick={handleDelete} before={<Icon20DeleteOutline/>} stretched>
                            Удалить
                        </Button>
                    </ButtonGroup>
                </Div>
            )}
            {popout}
        </Panel>
    );
};
