import { clickBackButtonMenu, loadMainMenu } from './menu.js';
import { initTranslation, changeLanguage } from './translate.js';
import { setButtonsColors,  } from './menu.js';
import { addMainEvents } from './eventsListener.js';
import { createPlayerStats, playerStats } from './playerManager.js';

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

function changeCursors()
{
    document.body.style.cursor = "url('./icons/cursor.png'), auto";
    const buttons = document.querySelectorAll('button');
    
    // Loop through each button and change the cursor
    buttons.forEach(button => {
        button.style.cursor = "url('./icons/cursor-button.png'), move";
    });

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.cursor = "url('./icons/cursor-text.png'), move";
    });
}

changeCursors();
addMainEvents();
initTranslation();
setButtonsColors();
window.changeLanguage = changeLanguage;
const button = document.getElementById('mainPlayButton');
button.focus();