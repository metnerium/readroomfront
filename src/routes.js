import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';
export const DEFAULT_VIEW = 'default_view';

export const DEFAULT_VIEW_PANELS = {
  HOME: 'home',
  WELCOME: 'welcome',
  AUTH: 'auth',
  PROFILE: 'profile',
  SAVED: 'saved',
  CREATEHISTORY: 'createhistory',
  CREATECHAPTER: 'createchapter',
  HISTORYDETAILS: 'historydetails',
  CHAPTERDETAILS: 'chapterdetails',
};

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.HOME, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.WELCOME, '/welcome', []),
      createPanel(DEFAULT_VIEW_PANELS.AUTH, '/auth', []),
      createPanel(DEFAULT_VIEW_PANELS.PROFILE, '/profile', []),
      createPanel(DEFAULT_VIEW_PANELS.SAVED, '/saved', []),
      createPanel(DEFAULT_VIEW_PANELS.CREATEHISTORY, '/createhistory', []),
      createPanel(DEFAULT_VIEW_PANELS.CREATECHAPTER, '/createchapter', []),
      createPanel(DEFAULT_VIEW_PANELS.HISTORYDETAILS, '/historydetails/:storyId', []),
      createPanel(DEFAULT_VIEW_PANELS.CHAPTERDETAILS, '/chapterdetails/:chapterId', []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
