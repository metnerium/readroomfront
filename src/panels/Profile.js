import  { useState, useEffect } from 'react';
import { Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar, FormLayoutGroup, FormItem, Input, Textarea, Snackbar } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Icon24Error } from '@vkontakte/icons';
import axios from 'axios';

const API_BASE_URL = '/';

export const Profile = ({ id, fetchedUser, token }) => {
    const routeNavigator = useRouteNavigator();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [snackbar, setSnackbar] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setEditedProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            showError('Failed to load profile. Please try again.');
        }
    };

    const handleEdit = () => setIsEditing(true);

    const handleSave = async () => {
        try {
            const response = await axios.put(`${API_BASE_URL}/users/me`, editedProfile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setIsEditing(false);
            showSuccess('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            showError('Failed to update profile. Please try again.');
        }
    };

    const handleChange = (e) => {
        setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                const response = await axios.post(`${API_BASE_URL}/users/avatar`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setEditedProfile({ ...editedProfile, avatar_url: response.data.avatar_url });
            } catch (error) {
                console.error('Failed to upload avatar:', error);
                showError('Failed to upload avatar. Please try again.');
            }
        }
    };

    const showError = (message) => {
        setSnackbar(
            <Snackbar
                layout="vertical"
                onClose={() => setSnackbar(null)}
                before={<Icon24Error />}
                duration={3000}
            >
                {message}
            </Snackbar>
        );
    };

    const showSuccess = (message) => {
        setSnackbar(
            <Snackbar
                layout="vertical"
                onClose={() => setSnackbar(null)}
                duration={3000}
            >
                {message}
            </Snackbar>
        );
    };

    return (
        <Panel id={id}>
            <PanelHeader>Profile</PanelHeader>
            {profile && (
                <Group header={<Header mode="secondary">User Profile</Header>}>
                    {!isEditing ? (
                        <>
                            <Cell
                                before={<Avatar src={profile.avatar_url || fetchedUser?.photo_200} size={80} />}
                                description={profile.pseudonym}
                            >
                                {profile.full_name}
                            </Cell>
                            <Cell>
                                <Header mode="secondary">Bio</Header>
                                {profile.bio || 'No bio available'}
                            </Cell>
                            <Cell>
                                <Header mode="secondary">Email</Header>
                                {profile.email}
                            </Cell>
                            <Div>
                                <Button stretched size="l" mode="secondary" onClick={handleEdit} style={{ marginBottom: 16 }}>
                                    Edit Profile
                                </Button>
                                <Button stretched size="l" mode="secondary" onClick={() => routeNavigator.push('/')}>
                                    Back to Home
                                </Button>
                            </Div>
                        </>
                    ) : (
                        <FormLayoutGroup>
                            <FormItem top="Avatar" bottom="Click to change avatar">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    style={{ display: 'none' }}
                                    id="avatar-upload"
                                />
                                <label htmlFor="avatar-upload">
                                    <Avatar src={editedProfile.avatar_url || fetchedUser?.photo_200} size={80} style={{ cursor: 'pointer' }} />
                                </label>
                            </FormItem>
                            <FormItem top="Full Name">
                                <Input
                                    name="full_name"
                                    value={editedProfile.full_name}
                                    onChange={handleChange}
                                />
                            </FormItem>
                            <FormItem top="Pseudonym">
                                <Input
                                    name="pseudonym"
                                    value={editedProfile.pseudonym}
                                    onChange={handleChange}
                                />
                            </FormItem>
                            <FormItem top="Bio">
                                <Textarea
                                    name="bio"
                                    value={editedProfile.bio}
                                    onChange={handleChange}
                                />
                            </FormItem>
                            <FormItem>
                                <Button size="l" stretched onClick={handleSave}>
                                    Save Changes
                                </Button>
                            </FormItem>
                            <FormItem>
                                <Button size="l" stretched mode="secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </FormItem>
                        </FormLayoutGroup>
                    )}
                </Group>
            )}
            {snackbar}
        </Panel>
    );
};

