import React, { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, PanelHeaderBack, Group, FormItem, Input, Textarea, Select, Button,
    Div, FormLayoutGroup, ScreenSpinner, FormStatus
} from '@vkontakte/vkui';
import bridge from "@vkontakte/vk-bridge";
import axios from "axios";
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export const CreateChapter = ({ id, onBackClick }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [chapterNumber, setChapterNumber] = useState(1);
    const [storyId, setStoryId] = useState('');
    const [myStories, setMyStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const routeNavigator = useRouteNavigator();

    useEffect(() => {
        fetchMyStories();
    }, []);

    const fetchMyStories = async () => {
        try {
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;
            const userInfo = await axios.get('https://api-metnerium.ru/users/me', {
                headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const userId = userInfo.data.id;
            const response = await axios.get(`https://api-metnerium.ru/usercontent/users/${userId}/stories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setMyStories(response.data.map(story => ({
                value: story.id.toString(),
                label: story.title
            })));
        } catch (error) {
            setError('Ошибка при получении списка историй: ' + error.message);
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const validateForm = () => {
        const errors = {};
        if (!storyId) errors.storyId = 'Пожалуйста, выберите историю';
        if (!title.trim()) errors.title = 'Пожалуйста, введите название главы';
        if (!content.trim()) errors.content = 'Пожалуйста, введите содержание главы';
        if (chapterNumber < 1) errors.chapterNumber = 'Номер главы должен быть положительным числом';
        return errors;
    };

    const handleSubmit = async () => {
        setSubmitAttempted(true);
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        setLoading(true);
        setError('');

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
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {
                throw new Error('Ошибка при создании главы');
            }

            await routeNavigator.push('/');
        } catch (error) {
            setError('Ошибка при создании главы: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getFieldStatus = (field) => {
        if (!touched[field] && !submitAttempted) return 'default';
        const errors = validateForm();
        return errors[field] ? 'error' : 'valid';
    };
    const handleContentChange = (e) => {
        const newContent = e.target.value.replace(/\n/g, '<br>');
        setContent(newContent);
    };

    return (
        <Panel id={id}>
            <PanelHeader left={<PanelHeaderBack onClick={onBackClick} />}>
                Создание главы
            </PanelHeader>
            <Group>
                {error && <FormStatus mode="error">{error}</FormStatus>}
                <FormLayoutGroup>
                    <FormItem
                        top="История"
                        status={getFieldStatus('storyId')}
                        bottom={getFieldStatus('storyId') === 'error' ? 'Обязательное поле' : ''}
                    >
                        <Select
                            value={storyId}
                            onChange={(e) => {
                                setStoryId(e.target.value);
                                handleBlur('storyId');
                            }}
                            onBlur={() => handleBlur('storyId')}
                            options={myStories}
                            placeholder="Выберите историю"
                        />
                    </FormItem>
                    <FormItem
                        top="Название главы"
                        status={getFieldStatus('title')}
                        bottom={getFieldStatus('title') === 'error' ? 'Обязательное поле' : ''}
                    >
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => handleBlur('title')}
                            placeholder="Введите название главы"
                        />
                    </FormItem>
                    <FormItem
                        top="Номер главы"
                        status={getFieldStatus('chapterNumber')}
                        bottom={getFieldStatus('chapterNumber') === 'error' ? 'Должно быть положительное число' : ''}
                    >
                        <Input
                            type="number"
                            value={chapterNumber}
                            onChange={(e) => setChapterNumber(parseInt(e.target.value, 10))}
                            onBlur={() => handleBlur('chapterNumber')}
                            placeholder="Введите номер главы"
                        />
                    </FormItem>
                    <FormItem
                        top="Содержание главы"
                        status={getFieldStatus('content')}
                        bottom={getFieldStatus('content') === 'error' ? 'Обязательное поле' : ''}
                    >
                        <Textarea
                            value={content.replace(/<br>/g, '\n')}
                            onChange={handleContentChange}
                            onBlur={() => handleBlur('content')}
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
