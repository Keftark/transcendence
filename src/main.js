import { clickBackButtonMenu, loadMainMenu } from './menu.js';
import { initTranslation, changeLanguage } from './translate.js';
import { setButtonsColors,  } from './menu.js';
import { addMainEvents } from './eventsListener.js';
import { createPlayerStats, playerStats } from './playerManager.js';

export const LevelMode = {
	MENU: 0,
	MODESELECTION: 1,
	ADVENTURE: 2,
	DUEL: 3,
	DUELCUSTOM: 4,
	LOCAL: 5,
	LOCALCUSTOM: 6,
	TOURNAMENTLOBBY: 7,
	TOURNAMENT: 8,
};

export const ArenaType = 
{
    SPACE: 0,
    CAVE: 1
}

let levelMode = LevelMode.MENU;
let arenaType = ArenaType.SPACE;

export function setLevelState(newLevelMode)
{
    levelMode = newLevelMode;
}

export function getLevelState()
{
    return levelMode;
}

export function setArenaType(newArenaType)
{
    arenaType = newArenaType;
}

export function getArenaType()
{
    return arenaType;
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

export function isLevelMode(value) {
    return Object.values(LevelMode).includes(value);
}

changeCursors();
addMainEvents();
initTranslation();
setButtonsColors();
window.changeLanguage = changeLanguage;
const button = document.getElementById('mainPlayButton');
button.focus();
document.getElementById('rules').style.display = 'flex';