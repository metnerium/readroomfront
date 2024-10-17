import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {View, SplitLayout, SplitCol, ScreenSpinner, Snackbar, Epic, TabbarItem, Tabbar} from '@vkontakte/vkui';
import { useActiveVkuiLocation, useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import {
  Icon16Done,
  Icon16Cancel,
  Icon28NewsfeedOutline,
  Icon28UserCircleOutline, Icon28FavoriteOutline
} from '@vkontakte/icons';
import api, { login } from './api';

import { Home } from './panels/Home';
import { Welcome } from './panels/Welcome';
import { Auth } from './panels/Auth';
import { Profile } from './panels/Profile';
import {Saved} from './panels/Saved';
import {ChapterDetails, CreateHistory} from "./panels/index.js";
import {CreateChapter} from "./panels/index.js";
import {HistoryDetails} from './panels/index.js';
import {Category} from './panels/Category';
import {User} from './panels/User';
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.WELCOME } = useActiveVkuiLocation();
  const routeNavigator = useRouteNavigator();
  const [fetchedUser, setUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size="large" />);
  const [token, setToken] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [activeStory, setActiveStory] = useState('home');
  const isAuthRoute = [DEFAULT_VIEW_PANELS.WELCOME, DEFAULT_VIEW_PANELS.AUTH].includes(activePanel);
  const shouldShowTabbar = ![DEFAULT_VIEW_PANELS.WELCOME, DEFAULT_VIEW_PANELS.AUTH].includes(activePanel);

  const url = window.location.search.slice(1);

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUser(user);

      try {
        const storedToken = await bridge.send('VKWebAppStorageGet', { keys: ['token'] });
        if (storedToken.keys[0].value) {
          setToken(storedToken.keys[0].value);
          await routeNavigator.push('/');
        } else {
          await routeNavigator.push('/welcome');
        }
      } catch (error) {
        showSnackbar('Ошибка', 'Не удалось получить данные пользователя', 'red');
      }

      setPopout(null);
    }
    fetchData();
    fetchAd();
  }, [routeNavigator]);
  const fetchAd = async () => {
    bridge.send('VKWebAppCheckNativeAds', {
      ad_format: 'interstitial' /* Тип рекламы */
    })
        .then((data) => {
          if (data.result) {
            ads();
          } else {
            // Материалов нет
          }
        })
        .catch((error) => { console.log(error); });
  }
  const ads = async() =>{
    bridge.send('VKWebAppShowBannerAd', {
      banner_location: 'top'
    })
        .then((data) => {
          if (data.result) {
            // Баннерная реклама отобразилась
          }
        })
        .catch((error) => {
          // Ошибка
          console.log(error);
        });
  }
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
      const data = await login(email, password);
      if (data && data.access_token) {
        const newToken = data.access_token;
        setToken(newToken);
        await bridge.send('VKWebAppStorageSet', { key: 'token', value: newToken });
        await routeNavigator.push('/');
        showSnackbar('Успех', 'Вы успешно вошли в систему', 'green');
      } else {
        showSnackbar('Ошибка', 'Не удалось войти в систему', 'red');
      }
    } catch (error) {
      showSnackbar('Ошибка', 'Не удалось войти в систему', 'red');
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      const newToken = response.data.access_token;
      setToken(newToken);
      await bridge.send('VKWebAppStorageSet', { key: 'token', value: newToken });
      await routeNavigator.push('/');
      showSnackbar('Успех', 'Вы успешно зарегистрировались', 'green');
    } catch (error) {
      showSnackbar('Ошибка', 'Не удалось зарегистрироваться', 'red');
    }
  };

  const handleLogout = async () => {
    setToken(null);
    await bridge.send('VKWebAppStorageSet', { key: 'token', value: '' });
    await routeNavigator.push('/welcome');
    showSnackbar('Информация', 'Вы вышли из системы', 'green');
  };


  const tabbar = !isAuthRoute ? (
      <Tabbar>
        <TabbarItem
            onClick={() => routeNavigator.push('/saved')}
            selected={activePanel === DEFAULT_VIEW_PANELS.SAVED}
            text="Сохраненное"
        ><Icon28FavoriteOutline /></TabbarItem>
        <TabbarItem
            onClick={() => routeNavigator.push('/')}
            selected={activePanel === DEFAULT_VIEW_PANELS.HOME}
            text="Главная"
        ><Icon28NewsfeedOutline /></TabbarItem>
        <TabbarItem
            onClick={() => routeNavigator.push('/profile')}
            selected={activePanel === DEFAULT_VIEW_PANELS.PROFILE}
            text="Профиль"
        ><Icon28UserCircleOutline /></TabbarItem>
      </Tabbar>
  ) : null;

  return (
      <SplitLayout popout={popout}>
        <SplitCol>
          <Epic activeStory={activePanel} tabbar={tabbar}>
            <Home id={DEFAULT_VIEW_PANELS.HOME} fetchedUser={fetchedUser} onLogout={handleLogout} />
            <Saved id={DEFAULT_VIEW_PANELS.SAVED} />
            <Profile id={DEFAULT_VIEW_PANELS.PROFILE} fetchedUser={fetchedUser} token={token} />
            <Welcome id={DEFAULT_VIEW_PANELS.WELCOME} />
            <Auth id={DEFAULT_VIEW_PANELS.AUTH} onLogin={handleLogin} onRegister={handleRegister} />
            <CreateHistory id={DEFAULT_VIEW_PANELS.CREATEHISTORY} />
            <CreateChapter id={DEFAULT_VIEW_PANELS.CREATECHAPTER} />
            <HistoryDetails id={DEFAULT_VIEW_PANELS.HISTORYDETAILS}/>
            <ChapterDetails id={DEFAULT_VIEW_PANELS.CHAPTERDETAILS} />
            <Category id={DEFAULT_VIEW_PANELS.CATEGORY} />
            <User id={DEFAULT_VIEW_PANELS.USER} />
          </Epic>
          {snackbar}
        </SplitCol>
      </SplitLayout>
  );
};
