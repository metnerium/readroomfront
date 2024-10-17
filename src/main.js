import { createRoot } from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import { AppConfig } from './AppConfig.js';

vkBridge.send('VKWebAppInit');

createRoot(document.getElementById('root')).render(<AppConfig />);

console.log = () => {};

if(!window.console) window.console = {};
const methods = ["log", "debug", "warn", "info"];
for(let i=0; i<methods.length; i++){
  console[methods[i]] = function(){};
}


if (import.meta.env.MODE === 'development') {
  import('./eruda.js');
}
