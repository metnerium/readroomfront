import { useState } from 'react';
import { Panel, PanelHeader, Header, Button, Group, FormLayoutGroup, FormItem, Input, Div, Text } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';
import { register } from '../api';
const user = await bridge.send('VKWebAppGetUserInfo');

export const Auth = ({ id, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [fullName, setFullName] = useState('');
    const [pseudonym, setPseudonym] = useState('');
    const [bio, setBio] = useState('');

    const handleSubmit = async () => {
        try {
            if (isRegistering) {
                const userData = {
                    email,
                    password,
                    full_name: fullName,
                    pseudonym,
                    bio,
                    avatar_url: user.photo_200,
                    role: 'reader'
                };
                const response = await register(userData);
                console.log('Registration successful:', response);
                // После успешной регистрации автоматически входим
                await onLogin(email, password);
            } else {
                await handleLogin(email, password);
            }
        } catch (error) {
            console.error(isRegistering ? 'Registration failed:' : 'Login failed:', error);
            // Здесь можно добавить отображение ошибки пользователю
        }
    };

    const handleLogin = async (email, password) => {
        try {
            onLogin(email, password);
        } catch (error) {
            console.error('Login error:', error);
            // Здесь можно добавить отображение ошибки пользователю
        }
    };

    const requestEmail = async () => {
        try {
            const { email: vkEmail } = await bridge.send('VKWebAppGetEmail');
            setEmail(vkEmail);
        } catch (error) {
            console.error('Failed to get email:', error);
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader>{isRegistering ? 'Sign Up' : 'Log In'}</PanelHeader>
            <Group header={<Header mode="secondary">{isRegistering ? 'Create an account' : 'Enter your credentials'}</Header>}>
                <FormLayoutGroup>
                    <FormItem top="Email">
                        <Input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </FormItem>
                    <FormItem>
                        <Button onClick={requestEmail} size="m">Get Email from VK</Button>
                    </FormItem>
                    <FormItem top="Password">
                        <Input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormItem>
                    {isRegistering && (
                        <>
                            <FormItem top="Full Name">
                                <Input
                                    type="text"
                                    name="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </FormItem>
                            <FormItem top="Pseudonym">
                                <Input
                                    type="text"
                                    name="pseudonym"
                                    value={pseudonym}
                                    onChange={(e) => setPseudonym(e.target.value)}
                                />
                            </FormItem>
                            <FormItem top="Bio">
                                <Input
                                    type="text"
                                    name="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </FormItem>
                        </>
                    )}
                    <FormItem>
                        <Button size="l" stretched onClick={handleSubmit}>
                            {isRegistering ? 'Sign Up' : 'Log In'}
                        </Button>
                    </FormItem>
                </FormLayoutGroup>
            </Group>
            <Div>
                <Text weight="regular" style={{ textAlign: 'center', marginBottom: 8 }}>
                    {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}
                </Text>
                <Button mode="tertiary" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? 'Log in' : 'Sign up'}
                </Button>
            </Div>
        </Panel>
    );
};

