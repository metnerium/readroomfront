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
};

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.HOME, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.WELCOME, '/welcome', []),
      createPanel(DEFAULT_VIEW_PANELS.AUTH, '/auth', []),
      createPanel(DEFAULT_VIEW_PANELS.PROFILE, '/profile', []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
