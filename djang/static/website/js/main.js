import { closeProfile, closeSettings, focusOldButton, isProfileOpen, isSettingsOpen, openOrCloseGameMenu, setLanguageButtons, isAskingDeleteAccount, cancelDeleteAccount, isMiniProfileOpen, closeMiniProfile, isChangePasswordOpen, closeChangePassword, isEditProfileOpen, closeEditProfileField } from './menu.js';
import { initTranslation } from './translate.js';
import { addMainEvents } from './eventsListener.js';
import { LevelMode } from './variables.js';
import { displayWelcomeMessage, isChatOpen, tryCloseChat } from './chat.js';
import { clickCancelRules } from './rules.js';
import { gameEnded, isInGame } from './levelLocal.js';
import { clickCancelRegister, clickLogOut, closeGdprPanel, isGdprOpen, isRegistrationOpen } from './registration.js';
import { getCurrentView } from './pages.js';
import { closeDuelPanel } from './duelPanel.js';
import { clickBackButtonMenu, closeMatchList, isMatchListOpen } from './modesSelection.js';
import { addSocketListener, connectToServerInput, connectToServerOutput } from './sockets.js';
import { closePaddleChoice, isPaddleChoiceOpen } from './customizeSkins.js';
import { clickCancelSignIn, isSigninOpen } from './signIn.js';
import { getAddress } from './apiFunctions.js';
import { askBackTournamentView, cancelAddPlayerTournament, cancelBackTournamentView, closeTournamentViewPanel, isAddPlayerTournamentIsOpen, isInAskBackTournamentView, isTournamentViewOpen, quitTournamentLobby } from './tournament.js';
import { loadBlocks, loadFriends } from './friends.js';
import { closeMultiPanel } from './multiPanel.js';
import { startFPSCounter } from './fpsCounter.js';

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
    if (isGdprOpen())
        closeGdprPanel();
    else if (isEditProfileOpen())
        closeEditProfileField();
    else if (isChangePasswordOpen())
        closeChangePassword();
    else if (isAskingDeleteAccount())
        cancelDeleteAccount();
    else if (isMiniProfileOpen())
        closeMiniProfile();
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
    {
        if (isInGame)
            closeTournamentViewPanel();
        else
            askBackTournamentView();
    }
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
    else if (currentView === 'multi')
        closeMultiPanel();
    else if (isInGame && !gameEnded)
        openOrCloseGameMenu();
}

function changeCursors()
{
    const buttons = document.querySelectorAll('button, input[type="color"], input[type="checkbox"], .arena, #inputSignInPassword, #showCurrentPasswordButton, #showNewPasswordButton, #showConfirmNewPasswordButton, #showPasswordButton, #showConfirmPasswordButton, #header-title, a, #askSignIn, #askRegister, #friendsHeader, .headerProfileButton');
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

export let socket = null;
export let listener = null;
let ip_address;

export function getSocket()
{
    return socket;
}

export function getListener()
{
    return listener;
}

export function closeSocket()
{
    if (socket === null)
        return;
    socket.close();
    socket = null;
}

export function closeListener()
{
    if (listener === null)
        return;
    listener.close();
    listener = null;
}

export function openSocket()
{
    socket = new WebSocket(`wss://${ip_address}:7777/`);
    listener = new WebSocket(`wss://${ip_address}:7777/`);
    
    socket.onopen = function() {
        console.log("WebSocket connected");
        connectToServerInput();
    };
    
    socket.onclose = function() {
        socket = null;
        console.log('WebSocket closed');
        clickLogOut();
    };
    socket.onerror = (error) => console.log("Websocket Error:", error);

    listener.onopen = function() {
        console.log("WebSocket listener connected");
        connectToServerOutput();
        loadFriends();
        loadBlocks();
        displayWelcomeMessage();
    };
    
    listener.onclose = function() {
        listener = null;
        console.log('WebSocket listener closed');
    };
    listener.onerror = (error) => console.log("Websocket Listener Error:", error);
    
    addSocketListener(); 
}

changeCursors();
addMainEvents();
initTranslation();
setLanguageButtons();

focusOldButton();

document.addEventListener("DOMContentLoaded", function() {
    getAddress()
        .then(data => {
            ip_address = data;
        })
        .catch(error => {
            console.error('Error getting address:', error);
        });
});