import { setButtonsColors, closeProfile, closeSettings, focusOldButton, isProfileOpen, isSettingsOpen, openOrCloseGameMenu, setLanguageButtons } from './menu.js';
import { initTranslation } from './translate.js';
import { addMainEvents } from './eventsListener.js';
import { LevelMode } from './variables.js';
import { isChatOpen, tryCloseChat } from './chat.js';
import { clickCancelRules } from './rules.js';
import { gameEnded, isInGame } from './levelLocal.js';
import { clickCancelRegister, closeGdprPanel, isGdprOpen, isRegistrationOpen } from './registration.js';
import { getCurrentView } from './pages.js';
import { closeDuelPanel } from './duelPanel.js';
import { clickBackButtonMenu, closeMatchList, isMatchListOpen } from './modesSelection.js';
import { addSocketListener } from './sockets.js';
import { closePaddleChoice, isPaddleChoiceOpen } from './customizeSkins.js';
import { clickCancelSignIn, isSigninOpen } from './signIn.js';
import { getAddress } from './apiFunctions.js';
import { askBackTournamentView, cancelAddPlayerTournament, cancelBackTournamentView, isAddPlayerTournamentIsOpen, isInAskBackTournamentView, isTournamentViewOpen, quitTournamentLobby } from './tournament.js';

window.onbeforeunload = function() {
    localStorage.removeItem('currentPath');
};

export function setLevelState(newLevelMode)
{
    if (!newLevelMode)
        return;
    localStorage.setItem('levelMode', newLevelMode);
}

export function isAnOnlineMode(currentMode)
{
    return currentMode === LevelMode.ONLINE ||
           currentMode === LevelMode.MULTI;
}

export function isAnOfflineMode(currentMode)
{
    return currentMode === LevelMode.LOCAL ||
           currentMode === LevelMode.TOURNAMENT ||
           currentMode === LevelMode.ADVENTURE;
}

export function getLevelState()
{
    return parseInt(localStorage.getItem('levelMode'));
}

export function checkEscapeKey()
{
    const currentView = getCurrentView();
    if (isGdprOpen)
        closeGdprPanel();
    else if (isMatchListOpen())
        closeMatchList();
    else if (isSigninOpen())
        clickCancelSignIn();
    else if (isRegistrationOpen())
        clickCancelRegister();
    else if (isChatOpen())
        tryCloseChat();
    else if (isSettingsOpen())
        closeSettings();
    else if (isProfileOpen())
        closeProfile();
    else if (isPaddleChoiceOpen())
        closePaddleChoice();
    else if (isInAskBackTournamentView())
        cancelBackTournamentView();
    else if (isTournamentViewOpen())
        askBackTournamentView();
    else if (isAddPlayerTournamentIsOpen())
        cancelAddPlayerTournament();
    else if (currentView === 'rules')
        clickCancelRules();
    else if (currentView === 'modes')
        clickBackButtonMenu();
    else if (currentView === 'tournament-lobby')
        quitTournamentLobby();
    else if (currentView === 'duel')
        closeDuelPanel();
    else if (isInGame && !gameEnded)
        openOrCloseGameMenu();
}

function changeCursors()
{
    const buttons = document.querySelectorAll('button, input[type="checkbox"], .arena, #showPasswordButton, #showConfirmPasswordButton, #header-title, #profilePictureChangeButton, a, #askSignIn, #askRegister, #friendsHeader');
    buttons.forEach(button => {
        button.style.cursor = "url('./static/icons/cursor-button.webp'), pointer";
    });
    
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="password"]');
    inputs.forEach(input => {
        input.style.cursor = "url('./static/icons/cursor-text.webp') 4 10, auto";
    });

    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
        label.style.cursor = "url('./static/icons/cursor.webp'), auto";
    });
    document.body.style.cursor = "url('./static/icons/cursor.webp'), auto";
}

export function isALevelMode(value) {
    return Object.values(LevelMode).includes(value);
}

export function hasDisabledButtonEffect(button)
{
    return button.classList.contains('disabledButtonHover');
}

export function addDisableButtonEffect(button) {
    button.classList.add('disabledButtonHover');
}

// Function to remove the hover effect
export function removeDisableButtonEffect(button) {
    button.classList.remove('disabledButtonHover');
}

export function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// export function IsLoggedIn()
// {
//     document.addEventListener("DOMContentLoaded", function() {
//         fetch('/check-login/')
//             .then(response => response.json())
//             .then(data => {
//                 return (data.is_logged_in)
//             })
//             .catch(error => {
//                 console.error('Error checking login status:', error);
//             });
//     });
// }

// function retrievePlayer()
// {
//     if (isUserLoggedIn())
//     {
//         const currentPage = getCurrentView();
//         switch (currentPage)
//         {
//             case "home":
                
//             break;
//         }
//     }
// }

export let socket = null;
export let listener = null;

function openSocket(ip)
{
    // pour le docker
    // console.log(ip);
    // socket = new WebSocket(`wss://${ip}:7777/`);
    // listener = new WebSocket(`wss://${ip}:7777/`);

    // cluster lumineux
    // socket = new WebSocket('ws://10.11.200.72:7777/ws/');
    // listener = new WebSocket('ws://10.11.200.72:7777/ws/');

    // cluster sombre
    socket = new WebSocket(`ws://10.12.200.194:7777/ws/`);
    listener = new WebSocket(`ws://10.12.200.194:7777/ws/`);
    
    socket.onopen = function() {
        console.log("WebSocket connected");
    };
    
    socket.onclose = function() {
        socket = null;
        console.log('WebSocket closed');
    };
    socket.onerror = (error) => console.log("Websocket Error:", error);

    listener.onopen = function() {
        console.log("WebSocket connected");
    };
    
    listener.onclose = function() {
        listener = null;
        console.log('WebSocket closed');
    };
    listener.onerror = (error) => console.log("Websocket Listener Error:", error);
    
    addSocketListener(); 
    // setTimeout(() => {
    //     connectToServerInput();
    //     connectToServerOutput();
    // }, 150);
}

changeCursors();
addMainEvents();
initTranslation();
setButtonsColors();
setLanguageButtons();

focusOldButton();

document.addEventListener("DOMContentLoaded", function() {
    getAddress()
        .then(data => {
            openSocket(data);
        })
        .catch(error => {
            console.error('Error getting address:', error);
        });
});