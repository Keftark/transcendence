import { sendInvitationDuel } from './chat.js';
import { addMainEvents } from './eventsListener.js';
import { isInGame, reinitLevelFunction, setCameraType, StartLevel, unloadLevel } from './levelLocal.js';
import { getLevelState, setLevelState } from './main.js';
import { navigateTo } from './pages.js';
import { playerStats } from './playerManager.js';
import { getRules, openRules, setCustomRules } from './rules.js';
import { loadScores, removeAllScores } from './scoreManager.js';
import { changeLanguage, getTranslation } from './translate.js';
import { LevelMode } from './variables.js';

const overlayPanel = document.getElementById('overlay');
const profilePanel = document.getElementById('profilePanel');
const matchListPanel = document.getElementById('matchListPanel');
const mainPlayButton = document.getElementById('mainPlayButton');
const menuPanel = document.getElementById('gameMenuPanel');
const hoverImage = document.getElementById('homeImg');
const buttonsColors = document.querySelectorAll('.colorize-btn');
const logInButtons = document.getElementById('loginbuttons');
const logOutButtons = document.getElementById('logoutbuttons');
const mainPanel = document.getElementById('mainPanel');
const mainMenuPanel = document.getElementById('mainMenuPanel');
const toggleCameraText = document.getElementById('cameraTypeHeader');
const gameSettingsButton = document.getElementById('settingsButton');

const buttonsLanguage = document.querySelectorAll('.language');
const imageSources = {
  mainPlayButton: 'static/images/playImage.png',
  mainProfileButton: 'static/images/profileImage.png',
  mainSettingsButton: 'static/images/settingsImage.png',
};
let selectedMode;
let currentColorIndex = 0;
let currentLangIndex = 0;
let currentCameraType = 0;
let settingsIsOpen = false;
let profileIsOpen = false;

document.getElementById('header-title').addEventListener('click', () => {
    navigateTo('home');
});

mainPlayButton.addEventListener('click', () => {
    clickPlay();
});

gameSettingsButton.addEventListener('click', () => {
    openSettings();
});

menuPanel.addEventListener('mouseenter', () => {
    openGameMenu();
});

menuPanel.addEventListener('mouseleave', () => {
    closeGameMenu();
});

document.getElementById('profileButton').addEventListener('click', () => {
    openProfile();
});

document.getElementById('mainProfileButton').addEventListener('click', () => {
    openProfile();
});

document.getElementById('closeProfileButton').addEventListener('click', () => {
    closeProfile();
});

gameSettingsButton.addEventListener('click', () => {
    openSettings();
});

document.getElementById('reinitLevelButton').addEventListener('click', () => {
    reinitLevelFunction();
});

document.getElementById('mainSettingsButton').addEventListener('click', () => {
    openSettings();
});

document.getElementById('closeSettingsButton').addEventListener('click', () => {
    closeSettings();
});

document.getElementById('mainButton').addEventListener('click', () => {
    clickBackButtonMenu();
});

document.getElementById('modeLocalButton').addEventListener('click', () => {
    selectedMode = LevelMode.LOCAL;
    openRules();
    // clickPlayGame(LevelMode.LOCAL);
});

document.getElementById('modeComputerButton').addEventListener('click', () => {
    selectedMode = LevelMode.ADVENTURE;
    openRules();
    // clickPlayGame(LevelMode.ADVENTURE);
});

document.getElementById('modeBackButton').addEventListener('click', () => {
    clickBackButtonMenu();
});

document.getElementById('perspectiveButton').addEventListener('click', () => {
    playerStats.cameraOrthographic = false;
    toggleCameraType(0);
});

document.getElementById('orthographicButton').addEventListener('click', () => {
    playerStats.cameraOrthographic = true;
    toggleCameraType(1);
});

document.getElementById('modeDuelButton').addEventListener('click', () => {
    openDuelPanel();
});

document.querySelectorAll('.mainMenuButton').forEach(button => {
  button.addEventListener('mouseover', () => showImage(button.id));
  button.addEventListener('mouseout', hideImage);
  button.addEventListener('focus', () => showImage(button.id));
  button.addEventListener('blur', hideImage);
});

document.getElementById('perspectiveButton').classList.add('applyBorderOptions');
document.getElementById('lang1Button').classList.add('applyBorderOptions');
document.getElementById('color1Button').classList.add('applyBorderOptions');

let oldButton = mainPlayButton;

export function openGameMenu()
{
    if (menuPanel.classList.contains('show') === false) {
        setTimeout(() => {
            menuPanel.classList.add('show');
        });
    }
}

export function closeGameMenu()
{
    menuPanel.classList.remove('show');
}

export function openOrCloseGameMenu()
{
    menuPanel.classList.toggle('show');
    if (menuPanel.classList.contains('show'))
    {
        if (playerStats.isRegistered)
            document.getElementById('profileButton').focus();
        else
            gameSettingsButton.focus();
    }
    else
        document.activeElement.blur();
}

export function openProfile(player = playerStats)
{
    if (player.isRegistered === false)
        return;
    profileIsOpen = true;
    loadScores(player);
    if (player.matches.length === 0)
        document.getElementById('seeMatchesButton').style.display = 'none';
    else
        document.getElementById('seeMatchesButton').style.display = 'flex';
    document.getElementById('nameProfile').innerText = player.nickname;
    document.getElementById('firstNameProfile').innerText = player.firstName;
    document.getElementById('lastNameProfile').innerText = player.lastName;
    document.getElementById('mailProfile').innerText = player.mail;
    overlayPanel.style.display = 'block';
    profilePanel.style.display = 'flex';
    if (getLevelState() === LevelMode.MENU)
        oldButton = document.getElementById('mainProfileButton');
    document.getElementById('closeProfileButton').focus();
}

window.showMatchList = showMatchList;
export function showMatchList()
{
    if (profilePanel.classList.contains('toLeft') === false)
    {
        matchListPanel.style.display = 'flex';
        setTimeout(() => {
            profilePanel.classList.add('toLeft');
            matchListPanel.classList.add('toRight');
        }, 100);
    }
    else
    {
        closeMatchList();
    }
}

function closeMatchList()
{
    profilePanel.classList.remove('toLeft');
    matchListPanel.classList.remove('toRight');
    setTimeout(() => {
        matchListPanel.style.display = 'none';
    }, 100);
}

export function closeProfile()
{
    profileIsOpen = false;
    if (profilePanel.classList.contains('toLeft') === true) {
        closeMatchList();
        setTimeout(() => {
            profilePanel.style.display = 'none';
        }, 100);
    }
    else
    {
        matchListPanel.style.display = 'none';
        profilePanel.style.display = 'none';
    }
    removeAllScores();
    focusOldButton();
    overlayPanel.style.display = 'none';
}

export function openSettings()
{
    settingsIsOpen = true;
    overlayPanel.style.display = 'block';
    document.getElementById('settingsPanel').style.display = 'flex';
    if (getLevelState() === LevelMode.MENU)
        oldButton = document.getElementById('mainSettingsButton');
    else
        oldButton = gameSettingsButton;
    document.getElementById('closeSettingsButton').focus();
}

export function closeSettings()
{
    settingsIsOpen = false;
    document.getElementById('settingsPanel').style.display = 'none';
    focusOldButton();
    overlayPanel.style.display = 'none';
}

function changeOutlineColors(newIndex)
{
    if (currentColorIndex === newIndex)
        return;
    if (currentColorIndex != -1)
        buttonsColors[currentColorIndex].classList.remove('applyBorderOptions');
    currentColorIndex = newIndex;
    buttonsColors[currentColorIndex].classList.add('applyBorderOptions');
}

export function setButtonsColors()
{
    buttonsColors.forEach(button => {
        button.addEventListener('click', function() {
            changeOutlineColors(parseInt(this.getAttribute('data-index'), 10));
            changeTextsColor(this.getAttribute('data-color'));
        });
    });
}

export function changeTextsColor(newColor)
{
    const textElements = document.querySelectorAll(' \
        h1, h2, div, h3, p, button, #header-title, #menu-label span, #pressplay, #play, #score-left, #score-right, #playername-left, \
        #playername-right, #inputChat, input');
    textElements.forEach(element => {
        element.style.color = newColor;
    });
    playerStats.colors = newColor;
}

function changeOutlineLanguage(newIndex)
{
    if (currentLangIndex === newIndex)
        return;
    if (currentLangIndex != -1)
        buttonsLanguage[currentLangIndex].classList.remove('applyBorderOptions');
    currentLangIndex = newIndex;
    buttonsLanguage[currentLangIndex].classList.add('applyBorderOptions');
}

export function setLanguageButtons()
{
    buttonsLanguage.forEach(button => {
        button.addEventListener('click', function() {
            changeOutlineLanguage(parseInt(this.getAttribute('data-lang'), 10));
            changeLanguage(this.getAttribute('data-language'));
        });
    });
}

function showMainMenu()
{
    setLevelState(LevelMode.MENU);
    mainPanel.style.display = 'flex';
    mainMenuPanel.style.display = 'flex';
    focusOldButton();
    if (playerStats.isRegistered)
        logOutButtons.style.display = 'flex';
    else
        logInButtons.style.display = 'flex';
}

function hideMainMenu()
{
    mainMenuPanel.style.display = 'none';
    logInButtons.style.display = 'none';
    logOutButtons.style.display = 'none';
}

function hideMainPanel()
{
    mainPanel.style.display = 'none';
}

export function clickPlay()
{
    hideMainPanel();
    showModeChoice();
}

export function clickPlayGame()
{
    setCustomRules();
    if (selectedMode === LevelMode.LOCAL)
        navigateTo('game-local', selectedMode);
    else if (selectedMode === LevelMode.ADVENTURE)
        navigateTo('game-ai', selectedMode);
    else if (selectedMode === LevelMode.DUEL)
    {
        sendInvitationDuel(playerStats.nickname);
        navigateTo('duel');
    }
}

export function onPlayGame(mode)
{
    hideMainMenu();
    StartLevel(mode);
}

export function showModeChoice()
{
    navigateTo('modes');
    selectedMode = LevelMode.MODESELECTION;
}

export function onModesOpen()
{
    if (getLevelState() === LevelMode.MENU)
        oldButton = mainPlayButton;
    setLevelState(LevelMode.MODESELECTION);
    document.getElementById('modeLocalButton').focus();
}

export function clickBackButtonMenu()
{
    navigateTo('home', getLevelState());
}

export function onModesClose()
{
    // showMainMenu();
}

export function openDuelPanel()
{
    if (playerStats.isRegistered)
        navigateTo('duel');
    // else
        
    // if otherPlayer != "" and if isInTheDatabase(otherPlayer), sends an invitation to this player
}

export function setHeaderVisibility(isVisible)
{
    if (isVisible === true)
        document.getElementById('header-title').style.display = 'block';
    else
        document.getElementById('header-title').style.display = 'none';
}

export function toggleCameraType(cameraType)
{
    if (cameraType === currentCameraType)
        return;
    if (playerStats.cameraOrthographic)
    {
        currentCameraType = 1;
        document.getElementById('perspectiveButton').classList.remove('applyBorderOptions');
        document.getElementById('orthographicButton').classList.add('applyBorderOptions');
        toggleCameraText.innerText = getTranslation('cameraTypeHeader') + getTranslation('orthographic');
    }
    else
    {
        currentCameraType = 0;
        document.getElementById('perspectiveButton').classList.add('applyBorderOptions');
        document.getElementById('orthographicButton').classList.remove('applyBorderOptions');
        toggleCameraText.innerText = getTranslation('cameraTypeHeader') + getTranslation('perspective');
    }
    if (isInGame === true)
        setCameraType();
}

function showImage(buttonId) {
  hoverImage.src = imageSources[buttonId];
  hoverImage.style.opacity = 0.2;
}

function hideImage() {
    hoverImage.style.opacity = 0;
}

export function focusOldButton()
{
        setTimeout(() => {
            if (oldButton != null)
            {
                oldButton.focus();
                oldButton = null;
            }
        }, 0);
}

export function onMainMenuOpen()
{
    setHeaderVisibility(true);
    showMainMenu();
    addMainEvents();
    mainPlayButton.focus();
}

export function askForDuel()
{
    if (selectedMode === LevelMode.DUEL || isInGame)
        return;
    selectedMode = LevelMode.DUEL;
    navigateTo('rules');
}

export function isSettingsOpen()
{
    return settingsIsOpen;
}

export function isProfileOpen()
{
    return profileIsOpen;
}