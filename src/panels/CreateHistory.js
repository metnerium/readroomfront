import React, { useState } from 'react';
import {
    Panel, PanelHeader, PanelHeaderBack, Group, FormItem, Input, Textarea, Select, File, Button,
    Div, Image, FormLayoutGroup, ScreenSpinner, FormStatus
} from '@vkontakte/vkui';
import { Icon24Camera } from '@vkontakte/icons';
import bridge from "@vkontakte/vk-bridge";
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import axios from "axios";

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

export const CreateHistory = ({ id, onBackClick }) => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [genre, setGenre] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const routeNavigator = useRouteNavigator();

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Размер файла не должен превышать 5MB');
                return;
            }
            setCoverImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            handleBlur('coverImage');
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!title.trim()) errors.title = 'Пожалуйста, введите название истории';
        if (!summary.trim()) errors.summary = 'Пожалуйста, введите краткое описание истории';
        if (!genre) errors.genre = 'Пожалуйста, выберите жанр';
        if (!previewImage) errors.coverImage = 'Пожалуйста, загрузите обложку';
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

            const storyData = {
                title,
                summary,
                genre,
                cover_image_url: previewImage
            };

            const response = await axios.post('https://api-metnerium.ru/stories/', storyData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {
                throw new Error('Ошибка при создании истории');
            }
            await routeNavigator.push('/');
        } catch (error) {
            setError('Ошибка при создании истории: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getFieldStatus = (field) => {
        if (!touched[field] && !submitAttempted) return 'default';
        const errors = validateForm();
        return errors[field] ? 'error' : 'valid';
    };

    return (
        <Panel id={id}>
            <PanelHeader left={<PanelHeaderBack onClick={onBackClick} />}>
                Создание истории
            </PanelHeader>
            <Group>
                {error && <FormStatus mode="error">{error}</FormStatus>}
                <FormLayoutGroup>
                    <FormItem
                        top="Название"
                        status={getFieldStatus('title')}
                        bottom={getFieldStatus('title') === 'error' ? 'Обязательное поле' : ''}
                    >
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => handleBlur('title')}
                            placeholder="Введите название истории"
                        />
                    </FormItem>
                    <FormItem
                        top="Краткое описание"
                        status={getFieldStatus('summary')}
                        bottom={getFieldStatus('summary') === 'error' ? 'Обязательное поле' : ''}
                    >
                        <Textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            onBlur={() => handleBlur('summary')}
                            placeholder="Введите краткое описание истории"
                        />
                    </FormItem>
                    <FormItem
                        top="Жанр"
                        status={getFieldStatus('genre')}
                        bottom={getFieldStatus('genre') === 'error' ? 'Обязательное поле' : ''}
                    >
                        <Select
                            value={genre}
                            onChange={(e) => {
                                setGenre(e.target.value);
                                handleBlur('genre');
                            }}
                            options={genresOptions}
                            placeholder="Выберите жанр"
                        />
                    </FormItem>
                    <FormItem
                        top="Обложка"
                        status={getFieldStatus('coverImage')}
                        bottom={getFieldStatus('coverImage') === 'error' ? 'Обязательное поле' : ''}
                    >
                        <File
                            before={<Icon24Camera />}
                            size="m"
                            accept="image/*"
                            onChange={handleImageChange}
                        >
                            Загрузить обложку
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
                        <Button size="l" stretched onClick={handleSubmit} disabled={loading}>
                            Создать историю
                        </Button>
                    </FormItem>
                </FormLayoutGroup>
            </Group>
            {loading && <ScreenSpinner />}
        </Panel>
    );
};
