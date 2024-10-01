import { loadMainMenu } from './menu.js';
import { initTranslation, changeLanguage } from './translate.js';
import { setNewColor } from './menu.js';

export const LevelMode = {
    MENU: 0,
    LOCAL: 1,
    ADVENTURE: 2,
};

let levelMode = LevelMode.MENU;

export function setLevelState(newLevelMode)
{
    levelMode = newLevelMode;
}


initTranslation();
setNewColor();
window.changeLanguage = changeLanguage;
// loadMainMenu();