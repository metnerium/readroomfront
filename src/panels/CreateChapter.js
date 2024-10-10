import React, { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, PanelHeaderBack, Group, FormItem, Input, Textarea, Select, Button,
    Div, FormLayoutGroup, ScreenSpinner
} from '@vkontakte/vkui';
import bridge from "@vkontakte/vk-bridge";
import axios from "axios";
import { useActiveVkuiLocation, useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export const CreateChapter = ({ id, onBackClick }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [chapterNumber, setChapterNumber] = useState(1);
    const [storyId, setStoryId] = useState('');
    const [myStories, setMyStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const routeNavigator = useRouteNavigator();

    useEffect(() => {
        fetchMyStories();
    }, []);

    const fetchMyStories = async () => {
        try {
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;

            const response = await axios.get('https://api-metnerium.ru/stories/my-stories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setMyStories(response.data.map(story => ({
                value: story.id.toString(),
                label: story.title
            })));
        } catch (error) {
            console.error('Ошибка при получении списка историй:', error);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;

            const chapterData = {
                title,
                content,
                chapter_number: chapterNumber,
                story_id: parseInt(storyId, 10)
            };

            const response = await axios.post('https://api-metnerium.ru/chapters/', chapterData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {
                throw new Error('Ошибка при создании главы');
            }

            await routeNavigator.push('/')// Возвращаемся на предыдущую страницу
        } catch (error) {
            console.error('Ошибка при создании главы:', error);
            // Здесь можно добавить отображение ошибки пользователю
        } finally {
            setLoading(false);
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader left={<PanelHeaderBack onClick={onBackClick} />}>
                Создание главы
            </PanelHeader>
            <Group>
                <FormLayoutGroup>
                    <FormItem top="История">
                        <Select
                            value={storyId}
                            onChange={(e) => setStoryId(e.target.value)}
                            options={myStories}
                            placeholder="Выберите историю"
                        />
                    </FormItem>
                    <FormItem top="Название главы">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Введите название главы"
                        />
                    </FormItem>
                    <FormItem top="Номер главы">
                        <Input
                            type="number"
                            value={chapterNumber}
                            onChange={(e) => setChapterNumber(parseInt(e.target.value, 10))}
                            placeholder="Введите номер главы"
                        />
                    </FormItem>
                    <FormItem top="Содержание главы">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Введите содержание главы"
                            rows={10}
                        />
                    </FormItem>
                    <FormItem>
                        <Button size="l" stretched onClick={handleSubmit} disabled={loading}>
                            Создать главу
                        </Button>
                    </FormItem>
                </FormLayoutGroup>
            </Group>
            {loading && <ScreenSpinner />}
        </Panel>
    );
};
