import React, { useState, useEffect } from 'react';
import {
    Panel,
    PanelHeader,
    Group,
    Div,
    Text,
    Title,
    Header,
    SimpleCell,
    InfoRow,
    ScreenSpinner,
    Button,
    FormItem,
    Input,
    Textarea,
    FormStatus,
    ButtonGroup,
    Alert
} from '@vkontakte/vkui';
import { useRouteNavigator, useParams } from '@vkontakte/vk-mini-apps-router';
import bridge from "@vkontakte/vk-bridge";
import axios from "axios";
import { Breadcrumbs } from '../Breadcrumbs';
import { Icon24PenOutline, Icon20DeleteOutline } from '@vkontakte/icons';

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

export const ChapterDetails = ({ id }) => {
    const [chapter, setChapter] = useState(null);
    const [story, setStory] = useState(null);
    const [editedChapter, setEditedChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [prevChapterId, setPrevChapterId] = useState(null);
    const [nextChapterId, setNextChapterId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [popout, setPopout] = useState(null);
    const routeNavigator = useRouteNavigator();
    const { chapterId } = useParams();

    useEffect(() => {
        fetchChapterDetails();

    }, [chapterId]);


    const fetchChapterDetails = async () => {
        try {
            setLoading(true);
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;

            const chapterResponse = await axios.get(`https://api-metnerium.ru/chapters/${chapterId}`, {
                headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setChapter(chapterResponse.data);

            const storyResponse = await axios.get(`https://api-metnerium.ru/stories/${chapterResponse.data.story_id}`, {
                headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            setStory(storyResponse.data);

            const chaptersResponse = await axios.get(`https://api-metnerium.ru/chapters/story/${chapterResponse.data.story_id}`, {
                headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const chapters = chaptersResponse.data;
            const currentIndex = chapters.findIndex(ch => ch.id === parseInt(chapterId));
            setPrevChapterId(currentIndex > 0 ? chapters[currentIndex - 1].id : null);
            setNextChapterId(currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].id : null);
        } catch (error) {
            console.error('Ошибка при загрузке главы:',);
            setError('Ошибка при загрузке главы: ');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (content) => {
        const paragraphs = content.split('<br>');
        return paragraphs.map((paragraph, index) => (
            <Text key={index} style={{ marginBottom: '10px' }}>{paragraph}</Text>
        ));
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedChapter({...chapter, content: chapter.content.replace(/<br>/g, '\n')});
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedChapter(null);
        setError('');
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;

            const updatedChapter = {
                ...editedChapter,
                content: editedChapter.content.replace(/\n/g, '<br>')
            };

            const response = await axios.put(`https://api-metnerium.ru/chapters/${chapterId}`, updatedChapter, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            setChapter(response.data);
            setIsEditing(false);
            setError('');
        } catch (error) {
            console.error('Ошибка при сохранении изменений:');
            setError('Ошибка при сохранении изменений: ');
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
                        action: () => deleteChapter(),
                    },
                ]}
                actionsLayout="horizontal"
                onClose={() => setPopout(null)}
                header="Подтверждение удаления"
                text="Вы уверены, что хотите удалить эту главу?"
            />
        );
    };

    const deleteChapter = async () => {
        try {
            setLoading(true);
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;

            await axios.delete(`https://api-metnerium.ru/chapters/${chapterId}`, {
                headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }
            });

            routeNavigator.push(`/historydetails/${chapter.story_id}`);
        } catch (error) {
            console.error('Ошибка при удалении главы:');
            setError('Ошибка при удалении главы: ');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ScreenSpinner />;
    }

    if (!chapter || !story) {
        return <Div>Глава не найдена</Div>;
    }

    const breadcrumbItems = [
        { text: 'Главная', onClick: () => routeNavigator.push('/') },
        { text: 'История', onClick: () => routeNavigator.push(`/historydetails/${chapter.story_id}`) },
        { text: `Глава ${chapter.chapter_number}` }
    ];

    return (
        <Panel id={id}>
            <PanelHeader>Глава {chapter.chapter_number}</PanelHeader>
            <Group>
                <Div style={{ margin: '0', padding: '0' }}>
                    <Breadcrumbs items={breadcrumbItems} />
                </Div>
            </Group>
            {error && <FormStatus mode="error">{error}</FormStatus>}
            {!isEditing ? (
                <>
                    <Group>
                        <Div>
                            <Title level="1" weight="medium">{chapter.title}</Title>
                            <InfoRow header={formatPublishDate(chapter.created_at)}></InfoRow>
                        </Div>
                    </Group>
                    <Group header={<Header mode="secondary">Содержание</Header>}>
                        <Div>
                            {renderContent(chapter.content)}
                        </Div>
                    </Group>
                    <Div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {prevChapterId && (
                            <Button onClick={() => routeNavigator.push(`/chapterdetails/${prevChapterId}`)}>
                                Предыдущая глава
                            </Button>
                        )}
                        {nextChapterId && (
                            <Button onClick={() => routeNavigator.push(`/chapterdetails/${nextChapterId}`)}>
                                Следующая глава
                            </Button>
                        )}
                    </Div>
                    {story.is_my_story && (
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
                </>
            ) : (
                <Group>
                    <FormItem top="Название главы">
                        <Input
                            value={editedChapter.title}
                            onChange={(e) => setEditedChapter({...editedChapter, title: e.target.value})}
                        />
                    </FormItem>
                    <FormItem top="Номер главы">
                        <Input
                            type="number"
                            value={editedChapter.chapter_number}
                            onChange={(e) => setEditedChapter({...editedChapter, chapter_number: parseInt(e.target.value, 10)})}
                        />
                    </FormItem>
                    <FormItem top="Содержание главы">
                        <Textarea
                            value={editedChapter.content}
                            onChange={(e) => setEditedChapter({...editedChapter, content: e.target.value})}
                            rows={10}
                        />
                    </FormItem>
                    <FormItem>
                        <ButtonGroup mode="horizontal" gap="m" stretched>
                            <Button size="l" stretched onClick={handleSaveEdit} disabled={loading}>
                                Сохранить изменения
                            </Button>
                            <Button size="l" stretched mode="secondary" onClick={handleCancelEdit}>
                                Отменить
                            </Button>
                        </ButtonGroup>
                    </FormItem>
                </Group>
            )}
            {popout}
        </Panel>
    );
};
