import React, { useState } from 'react';
import {
    Panel, PanelHeader, PanelHeaderBack, Group, FormItem, Input, Textarea, Select, File, Button,
    Div, Image, FormLayoutGroup, ScreenSpinner
} from '@vkontakte/vkui';
import { Icon24Camera } from '@vkontakte/icons';
import bridge from "@vkontakte/vk-bridge";
import { useActiveVkuiLocation, useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
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
    const routeNavigator = useRouteNavigator();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            // Получение токена из хранилища
            const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
            const token = storedToken.keys[0].value;

            // Подготовка данных для отправки
            const storyData = {
                title,
                summary,
                genre,
                cover_image_url: previewImage // Используем base64 изображения напрямую
            };

            // Отправка запроса
            const response = await axios.post('https://api-metnerium.ru/stories/', storyData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {
                throw new Error('Ошибка при создании истории');
            }
            await routeNavigator.push('/')
            // История успешно создана
             // Возвращаемся на предыдущую страницу
        } catch (error) {
            console.error('Ошибка при создании истории:', error);
            // Здесь можно добавить отображение ошибки пользователю
        } finally {
            setLoading(false);
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader left={<PanelHeaderBack onClick={onBackClick} />}>
                Создание истории
            </PanelHeader>
            <Group>
                <FormLayoutGroup>
                    <FormItem top="Название">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Введите название истории"
                        />
                    </FormItem>
                    <FormItem top="Краткое описание">
                        <Textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Введите краткое описание истории"
                        />
                    </FormItem>
                    <FormItem top="Жанр">
                        <Select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            options={genresOptions}
                            placeholder="Выберите жанр"
                        />
                    </FormItem>
                    <FormItem top="Обложка">
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
