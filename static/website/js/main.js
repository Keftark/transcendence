import { setButtonsColors, clickBackButtonMenu, closeProfile, closeSettings, focusOldButton, isProfileOpen, isSettingsOpen, openOrCloseGameMenu, setLanguageButtons } from './menu.js';
import { initTranslation } from './translate.js';
import { addMainEvents } from './eventsListener.js';
import { ArenaType, LevelMode } from './variables.js';
import { isChatOpen, tryCloseChat } from './chat.js';
import { clickCancelRules, isRulesOpen } from './rules.js';
import { gameEnded, isInGame } from './levelLocal.js';
import { clickCancelRegister, isRegistrationOpen } from './registration.js';
import { closeTournamentMenu } from './tournament.js';

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
    if (isRegistrationOpen())
        clickCancelRegister();
    else if (isChatOpen())
        tryCloseChat();
    else if (isSettingsOpen())
        closeSettings();
    else if (isProfileOpen())
        closeProfile();
    else if (isRulesOpen())
        clickCancelRules();
    else if (levelMode === LevelMode.MODESELECTION)
        clickBackButtonMenu();
    else if (levelMode === LevelMode.TOURNAMENTLOBBY)
        closeTournamentMenu();
    else if (isInGame && !gameEnded)
        openOrCloseGameMenu();
}

function changeCursors()
{
    document.body.style.cursor = "url('./static/icons/cursor.png'), auto";
    const buttons = document.querySelectorAll('button, input[type="checkbox"], .arena, #showPasswordButton, #showConfirmPasswordButton, #header-title');
    
    // Loop through each button and change the cursor
    buttons.forEach(button => {
        button.style.cursor = "url('./static/icons/cursor-button.png'), move";
    });

    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="password"]');
    inputs.forEach(input => {
        input.style.cursor = "url('./static/icons/cursor-text.png') 4 10, move";
    });
}

export function isLevelMode(value) {
    return Object.values(LevelMode).includes(value);
}

export function addDisableButtonEffect(button) {
    if (button.classList.contains('disabledButtonHover'))
        return;
    button.classList.add('disabledButtonHover');
    button.style.opacity = 0.5;
}

// Function to remove the hover effect
export function removeDisableButtonEffect(button) {
    if (!button.classList.contains('disabledButtonHover'))
        return;
    button.classList.remove('disabledButtonHover');
    button.style.opacity = 1;
}

changeCursors();
addMainEvents();
initTranslation();
setButtonsColors();
setLanguageButtons();

focusOldButton();