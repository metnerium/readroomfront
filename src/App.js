import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner, Snackbar } from '@vkontakte/vkui';
import { useActiveVkuiLocation, useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { Icon16Done, Icon16Cancel } from '@vkontakte/icons';
import api, { login } from './api';

import { Home } from './panels/Home';
import { Welcome } from './panels/Welcome';
import { Auth } from './panels/Auth';
import { Profile } from './panels/Profile';
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.WELCOME } = useActiveVkuiLocation();
  const routeNavigator = useRouteNavigator();
  const [fetchedUser, setUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size="large" />);
  const [token, setToken] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUser(user);

      try {
        const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
        console.log('Сохраненный токен:', storedToken.keys[0].value);
        if (storedToken.keys[0].value) {
          setToken(storedToken.keys[0].value);
          await routeNavigator.push('/');
        } else {
          await routeNavigator.push('/welcome');
        }
      } catch (error) {
        console.error('Не удалось получить токен из хранилища:', error);
        showSnackbar('Ошибка', 'Не удалось получить данные пользователя', 'red');
      }

      setPopout(null);
    }
    fetchData();
  }, [routeNavigator]);

  const showSnackbar = (title, text, color) => {
    setSnackbar(
        <Snackbar
            onClose={() => setSnackbar(null)}
            before={color === 'green' ? <Icon16Done fill="var(--vkui--color_icon_positive)" /> : <Icon16Cancel fill="var(--vkui--color_icon_negative)" />}
        >
          <b>{title}</b><br />{text}
        </Snackbar>
    );
  };

  const handleLogin = async (email, password) => {
    try {
      console.log('Попытка входа с:', { email, password });
      const data = await login(email, password);
      console.log('Ответ при входе:', data);
      if (data && data.access_token) {
        const newToken = data.access_token;
        setToken(newToken);
        await bridge.send('VKWebAppStorageSet', { key: 'token', value: newToken });
        console.log('Токен сохранен:', newToken);
        await routeNavigator.push('/');
        showSnackbar('Успех', 'Вы успешно вошли в систему', 'green');
      } else {
        console.error('Вход не удался: В ответе нет токена доступа');
        showSnackbar('Ошибка', 'Не удалось войти в систему', 'red');
      }
    } catch (error) {
      console.error('Вход не удался:', error.response ? error.response.data : error.message);
      showSnackbar('Ошибка', 'Не удалось войти в систему', 'red');
    }
  };

  const handleRegister = async (userData) => {
    try {
      console.log('Попытка регистрации с:', userData);
      const response = await api.post('/register', userData);
      console.log('Ответ при регистрации:', response.data);
      const newToken = response.data.access_token;
      setToken(newToken);
      await bridge.send('VKWebAppStorageSet', { key: 'token', value: newToken });
      await routeNavigator.push('/');
      showSnackbar('Успех', 'Вы успешно зарегистрировались', 'green');
    } catch (error) {
      console.error('Регистрация не удалась:', error.response ? error.response.data : error.message);
      showSnackbar('Ошибка', 'Не удалось зарегистрироваться', 'red');
    }
  };

  const handleLogout = async () => {
    setToken(null);
    await bridge.send('VKWebAppStorageSet', { key: 'token', value: '' });
    await routeNavigator.push('/welcome');
    showSnackbar('Информация', 'Вы вышли из системы', 'green');
  };

  return (
      <SplitLayout popout={popout}>
        <SplitCol>
          <View activePanel={activePanel}>
            <Home id={DEFAULT_VIEW_PANELS.HOME} fetchedUser={fetchedUser} onLogout={handleLogout} />
            <Welcome id={DEFAULT_VIEW_PANELS.WELCOME} />
            <Auth id={DEFAULT_VIEW_PANELS.AUTH} onLogin={handleLogin} onRegister={handleRegister} />
            <Profile id={DEFAULT_VIEW_PANELS.PROFILE} fetchedUser={fetchedUser} token={token} />
          </View>
          {snackbar}
        </SplitCol>
      </SplitLayout>
  );
};
