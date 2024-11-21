import { setButtonsColors, closeProfile, closeSettings, focusOldButton, isProfileOpen, isSettingsOpen, openOrCloseGameMenu, setLanguageButtons } from './menu.js';
import { initTranslation } from './translate.js';
import { addMainEvents } from './eventsListener.js';
import { LevelMode } from './variables.js';
import { isChatOpen, tryCloseChat } from './chat.js';
import { clickCancelRules } from './rules.js';
import { gameEnded, isInGame } from './levelLocal.js';
import { clickCancelRegister, isRegistrationOpen } from './registration.js';
import { closeTournamentJoinMenu, closeTournamentLobbyMenu, closeTournamentMenu } from './tournament.js';
import { getCurrentView } from './pages.js';
import { closeDuelPanel } from './duelPanel.js';
import { clickBackButtonMenu } from './modesSelection.js';

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
    const currentView = getCurrentView();
    if (isRegistrationOpen())
        clickCancelRegister();
    else if (isChatOpen())
        tryCloseChat();
    else if (isSettingsOpen())
        closeSettings();
    else if (isProfileOpen())
        closeProfile();
    else if (currentView === 'rules')
        clickCancelRules();
    else if (currentView === 'modes')
        clickBackButtonMenu();
    else if (currentView === 'tournament-lobby')
        closeTournamentLobbyMenu();
    else if (currentView === 'tournament-menu')
        closeTournamentMenu();
    else if (currentView === 'tournament-join')
        closeTournamentJoinMenu();
    else if (currentView === 'duel')
        closeDuelPanel();
    else if (isInGame && !gameEnded)
        openOrCloseGameMenu();
}

function changeCursors()
{
    document.body.style.cursor = "url('./static/icons/cursor.png'), auto";
    
    const buttons = document.querySelectorAll('button, input[type="checkbox"], .arena, #showPasswordButton, #showConfirmPasswordButton, #header-title');
    buttons.forEach(button => {
        button.style.cursor = "url('./static/icons/cursor-button.png'), move";
    });

    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="password"]');
    inputs.forEach(input => {
        input.style.cursor = "url('./static/icons/cursor-text.png') 4 10, move";
    });
}

export function isALevelMode(value) {
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