import  { useState } from 'react';
import { Panel, PanelHeader, Button, Group, FormLayoutGroup, FormItem, Input, Div, Text } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';
import { register } from '../api';

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
                const user = await bridge.send('VKWebAppGetUserInfo');
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
                console.log('Регистрация успешна:', response);
                await onLogin(email, password);
            } else {
                await handleLogin(email, password);
            }
        } catch (error) {
            console.error(isRegistering ? 'Ошибка регистрации:' : 'Ошибка входа:', error);
            // Здесь можно добавить отображение ошибки пользователю
        }
    };

    const handleLogin = async (email, password) => {
        try {
            onLogin(email, password);
        } catch (error) {
            console.error('Ошибка входа:', error);
            // Здесь можно добавить отображение ошибки пользователю
        }
    };

    const requestEmail = async () => {
        try {
            const { email: vkEmail } = await bridge.send('VKWebAppGetEmail');
            setEmail(vkEmail);
        } catch (error) {
            console.error('Не удалось получить email:', error);
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader/>
            <Div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                boxSizing: 'border-box',
                padding: '20px'
            }}>
                <Text weight="medium" style={{ fontSize: '24px', marginBottom: '20px' }}>ReadRoom</Text>
                <Group style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    borderRadius: '8px'
                }}>
                    <FormLayoutGroup>
                        <FormItem top="Email">
                            <Input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Введите ваш email"
                            />
                        </FormItem>
                        <FormItem top="Пароль">
                            <Input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите пароль"
                            />
                        </FormItem>
                        {isRegistering && (
                            <>
                                <FormItem top="Полное имя">
                                    <Input
                                        type="text"
                                        name="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Введите ваше полное имя"
                                    />
                                </FormItem>
                                <FormItem top="Псевдоним">
                                    <Input
                                        type="text"
                                        name="pseudonym"
                                        value={pseudonym}
                                        onChange={(e) => setPseudonym(e.target.value)}
                                        placeholder="Придумайте псевдоним"
                                    />
                                </FormItem>
                                <FormItem top="О себе">
                                    <Input
                                        type="text"
                                        name="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Расскажите немного о себе"
                                    />
                                </FormItem>
                            </>
                        )}
                        <FormItem>
                            <Button size="l" stretched onClick={handleSubmit} mode="primary">
                                {isRegistering ? 'Зарегистрироваться' : 'Войти'}
                            </Button>
                        </FormItem>
                        <FormItem>
                            <Button stretched size="l" mode="secondary" onClick={requestEmail}>
                                Получить Email из VK
                            </Button>
                        </FormItem>
                    </FormLayoutGroup>
                </Group>
                <Div style={{ marginTop: '20px' }}>
                    <Text weight="regular" style={{ textAlign: 'center', marginBottom: '8px' }}>
                        {isRegistering ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
                    </Text>
                    <Button stretched size="l" mode="secondary" onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Войти' : 'Зарегистрироваться'}
                    </Button>
                </Div>
            </Div>
        </Panel>
    );
};

