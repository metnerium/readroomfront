import React, { useState, useEffect } from 'react';
import {
    Panel, PanelHeader, Header, Button, Group, Div, Avatar,
    FormLayoutGroup, FormItem, Input, Textarea, Snackbar,
    Title, Text, Card, CardGrid, PanelHeaderButton,
    ScreenSpinner, ConfigProvider, useAdaptivity, ButtonGroup
} from '@vkontakte/vkui';
import {
    Icon28ChevronBack,
    Icon20DoorEnterArrowRightOutline, Icon24PenOutline
} from '@vkontakte/icons';
import axios from 'axios';
import bridge from "@vkontakte/vk-bridge";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";

const API_BASE_URL = 'https://api-metnerium.ru';

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'М';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'К';
    }
    return num.toString();
};

export const Profile = ({ id, fetchedUser, token }) => {
    const { viewWidth } = useAdaptivity();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [snackbar, setSnackbar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const routeNavigator = useRouteNavigator();

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response1 = await axios.get(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userId = response1.data.id || 'me';
            const response = await axios.get(`${API_BASE_URL}/users/profile/${userId}`);
            setProfile(response.data);
            setEditedProfile(response.data);
        } catch (error) {
            console.error('Не удалось загрузить профиль:', error);
            showError('Не удалось загрузить профиль. Пожалуйста, попробуйте снова.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => setIsEditing(true);
    const handleLogout = async () => {
        await bridge.send('VKWebAppStorageSet', { key: 'token', value: '' });
        await routeNavigator.push('/welcome');
    }
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await axios.put(`${API_BASE_URL}/users/me`, editedProfile, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsEditing(false);
            await routeNavigator.push('/profile');
            showSuccess('Профиль успешно обновлен!');
        } catch (error) {
            console.error('Не удалось обновить профиль:', error);
            showError('Не удалось обновить профиль. Пожалуйста, попробуйте снова.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
    };

    const showError = (message) => {
        setSnackbar(
            <Snackbar onClose={() => setSnackbar(null)} duration={3000}>
                {message}
            </Snackbar>
        );
    };

    const showSuccess = (message) => {
        setSnackbar(
            <Snackbar onClose={() => setSnackbar(null)} duration={3000}>
                {message}
            </Snackbar>
        );
    };

    const renderEditForm = () => (
        <Panel id={id}>
            <PanelHeader
                left={<PanelHeaderButton onClick={() => setIsEditing(false)}><Icon28ChevronBack /></PanelHeaderButton>}
            >
                Редактирование профиля
            </PanelHeader>
            <Group>
                <FormLayoutGroup>
                    <FormItem top="Полное имя">
                        <Input
                            name="full_name"
                            value={editedProfile.full_name}
                            onChange={handleChange}
                        />
                    </FormItem>
                    <FormItem top="Псевдоним">
                        <Input
                            name="pseudonym"
                            value={editedProfile.pseudonym}
                            onChange={handleChange}
                        />
                    </FormItem>
                    <FormItem top="О себе">
                        <Textarea
                            name="bio"
                            value={editedProfile.bio}
                            onChange={handleChange}
                        />
                    </FormItem>
                </FormLayoutGroup>
            </Group>
            <Div>
                <Button size="l" stretched onClick={handleSave}>
                    Сохранить изменения
                </Button>
            </Div>
        </Panel>
    );

    const renderProfile = () => (
        <Panel id={id}>
            <PanelHeader
            >
                Профиль
            </PanelHeader>
            {profile && (
                <Div>
                    <Group>
                        <Div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: 'linear-gradient(45deg, #ff0000, #9C27B0)', padding: '20px', borderRadius: '12px' }}>
                            <Avatar src={profile.avatar_url || fetchedUser?.photo_200} size={96} style={{ border: '4px solid #FFF' }} />
                            <Title level="2" style={{ marginTop: 16, color: '#FFF' }}>{profile.full_name}</Title>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{profile.pseudonym || '@' + profile.full_name.toLowerCase().replace(' ', '')}</Text>
                            <ButtonGroup>
                                <Button mode={"secondary"} onClick={handleLogout}><Icon20DoorEnterArrowRightOutline/></Button>
                                <Button mode={"secondary"} onClick={handleEdit}><Icon24PenOutline/></Button>
                            </ButtonGroup>
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
                </Div>
            )}
            {snackbar}
        </Panel>
    );

    return (
        <ConfigProvider>
            {isLoading && <ScreenSpinner state="loading" />}
            {isEditing ? renderEditForm() : renderProfile()}
        </ConfigProvider>
    );
};
