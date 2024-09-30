import { loadMainMenu } from './menu.js';
import { initTranslation, changeLanguage } from './translate.js';
import { setNewColor } from './menu.js';

initTranslation();
setNewColor();
window.changeLanguage = changeLanguage;
loadMainMenu();