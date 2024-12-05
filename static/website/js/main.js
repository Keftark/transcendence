import { setButtonsColors, closeProfile, closeSettings, focusOldButton, isProfileOpen, isSettingsOpen, openOrCloseGameMenu, setLanguageButtons } from './menu.js';
import { initTranslation } from './translate.js';
import { addMainEvents } from './eventsListener.js';
import { LevelMode } from './variables.js';
import { isChatOpen, tryCloseChat } from './chat.js';
import { clickCancelRules } from './rules.js';
import { gameEnded, isInGame } from './levelLocal.js';
import { clickCancelRegister, closeGdprPanel, isGdprOpen, isRegistrationOpen } from './registration.js';
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
    if (isGdprOpen)
        closeGdprPanel();
    else if (isRegistrationOpen())
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
    
    const buttons = document.querySelectorAll('button, input[type="checkbox"], .arena, #showPasswordButton, #showConfirmPasswordButton, #header-title, #profilePictureChangeButton, a, #askSignIn, #askRegister');
    buttons.forEach(button => {
        button.style.cursor = "url('./static/icons/cursor-button.png'), pointer";
    });
    
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="password"]');
    inputs.forEach(input => {
        input.style.cursor = "url('./static/icons/cursor-text.png') 4 10, auto";
    });

    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
        label.style.cursor = "url('./static/icons/cursor.png'), auto";
    });
    document.body.style.cursor = "url('./static/icons/cursor.png'), auto";
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

// const websocket = new WebSocket("ws://localhost:8001/");
// websocket.onopen = () => console.log("Connected");
// websocket.onmessage = (event) => console.log("Message:", event.data);
// websocket.onerror = (error) => console.log("Error:", error);

// function sendMoves(board, socket) {
//     // When clicking a column, send a "play" event for a move in that column.
//     board.addEventListener("click", ({ target }) => {
//       const event = {
//         type: "color",
//         action: "get"
//       };
//       socket.send(JSON.stringify(event));
//     });
//   }

// websocket.addEventListener("message", ({ data }) => {
//     const event = JSON.parse(data);
//     switch (event.type) {
//         case "color":
//             console.log("Event action: " + event.target);
//         break;
//     }
// });

// sendMoves(document.getElementById("header-title"), websocket);