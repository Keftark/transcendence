import { clickBackButtonMenu, loadMainMenu } from './menu.js';
import { initTranslation, changeLanguage } from './translate.js';
import { setNewColor,  } from './menu.js';

export const LevelMode = {
    MENU: 0,
    MODESELECTION: 1,
    LOCAL: 2,
    ADVENTURE: 3,
};

let levelMode = LevelMode.MENU;

export function setLevelState(newLevelMode)
{
    levelMode = newLevelMode;
}

export function getLevelState()
{
    return levelMode;
}

export function checkEscapeKey()
{
    if (levelMode === LevelMode.MODESELECTION)
        clickBackButtonMenu();
}

initTranslation();
setNewColor();
window.changeLanguage = changeLanguage;
const button = document.getElementById('mainPlayButton');
button.focus();