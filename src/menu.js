import { addMainEvents } from './eventsListener.js';
import { isInGame, setCameraType, StartLevel, unloadLevel } from './levelLocal.js';
import { getLevelState, setLevelState } from './main.js';
import { navigateTo } from './pages.js';
import { playerStats } from './playerManager.js';
import { getRules, openRules, setCustomRules } from './rules.js';
import { loadScores, removeAllScores } from './scoreManager.js';
import { getTranslation } from './translate.js';
import { LevelMode } from './variables.js';
const overlayPanel = document.getElementById('overlay');
const profilePanel = document.getElementById('profilePanel');
const matchListPanel = document.getElementById('matchListPanel');
const matchListButton = document.getElementById('seeMatchesButton');
let selectedMode;

document.getElementById('mainPlayButton').addEventListener('click', () => {
    clickPlay();
});

document.getElementById('settingsButton').addEventListener('click', () => {
    openSettings();
});

document.getElementById('menuPanel').addEventListener('mouseenter', () => {
    openMenu();
});

document.getElementById('menuPanel').addEventListener('mouseleave', () => {
    closeMenu();
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

document.getElementById('settingsButton').addEventListener('click', () => {
    openSettings();
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

document.getElementById('modeLocal').addEventListener('click', () => {
    selectedMode = LevelMode.LOCAL;
    openRules();
    // clickPlayGame(LevelMode.LOCAL);
});

document.getElementById('modeComputer').addEventListener('click', () => {
    selectedMode = LevelMode.ADVENTURE;
    openRules();
    // clickPlayGame(LevelMode.ADVENTURE);
});

document.getElementById('modeBackButton').addEventListener('click', () => {
    clickBackButtonMenu();
});

let oldButton = null;

export function openMenu()
{
    const panel = document.getElementById('menuPanel');
    
    if (panel.classList.contains('show') === false) {
        setTimeout(() => {
            panel.classList.add('show');
        });
    }
}

export function closeMenu()
{
    const panel = document.getElementById('menuPanel');
    
    if (panel.classList.contains('show')) {
        panel.classList.remove('show');
    }
}

export function openProfile(player = playerStats)
{
    if (player.isRegistered === false)
        return;
    loadScores(player);
    if (player.matches.length === 0)
        document.getElementById('seeMatchesButton').style.display = 'none';
    else
        document.getElementById('seeMatchesButton').style.display = 'block';
    document.getElementById('nameProfile').innerText = player.nickname;
    document.getElementById('firstNameProfile').innerText = player.firstName;
    document.getElementById('lastNameProfile').innerText = player.lastName;
    document.getElementById('mailProfile').innerText = player.mail;
    overlayPanel.style.display = 'block';
    const profilePanel = document.getElementById('profilePanel');
    profilePanel.style.display = 'block';
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
            matchListButton.classList.add('open');
        }, 50);
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
    document.getElementById('seeMatchesButton').classList.remove('open');
    setTimeout(() => {
        matchListPanel.style.display = 'none';
    }, 100);
}

export function closeProfile()
{
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
    if (oldButton != null)
    {
        oldButton.focus();
        oldButton = null;
    }
    overlayPanel.style.display = 'none';
}

export function openSettings()
{
    overlayPanel.style.display = 'block';
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.style.display = 'block'; // Show the profile panel
    if (getLevelState() === LevelMode.MENU)
        oldButton = document.getElementById('mainSettingsButton');
    document.getElementById('closeSettingsButton').focus();
}

export function closeSettings()
{
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.style.display = 'none';
    if (oldButton != null)
    {
        oldButton.focus();
        oldButton = null;
    }
    overlayPanel.style.display = 'none';
}

export function setButtonsColors()
{
    const buttons = document.querySelectorAll('.colorize-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            changeTextsColor(this.getAttribute('data-color'));
        });
    });
}

export function changeTextsColor(newColor)
{
    const textElements = document.querySelectorAll(' \
        h1, h2, div, h3, p, button, #header-title, #menu-label span, #pressplay, #play, #score-left, #score-right, #playername-left, \
        #playername-right');
    textElements.forEach(element => {
        element.style.color = newColor;
    });
    playerStats.colors = newColor;
}

export function loadMainMenu()
{
    unloadLevel();
    setHeaderVisibility(true);
    showMainMenu();
    addMainEvents();
}

function showMainMenu()
{
    setLevelState(LevelMode.MENU);
    const mainPanel = document.getElementById('mainPanel');
    mainPanel.style.display = 'flex';
    const mainMenuPanel = document.getElementById('mainMenuPanel');
    mainMenuPanel.style.display = 'flex';
    const button = document.getElementById('mainPlayButton');
    button.focus();
    if (playerStats.isRegistered)
        document.getElementById('logoutbuttons').style.display = 'flex';
    else
        document.getElementById('loginbuttons').style.display = 'flex';
}

function hideMainMenu()
{
    const mainMenuPanel = document.getElementById('mainMenuPanel');
    mainMenuPanel.style.display = 'none';
    document.getElementById('loginbuttons').style.display = 'none';
    document.getElementById('logoutbuttons').style.display = 'none';
}

function hideMainPanel()
{
    const mainPanel = document.getElementById('mainPanel');
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
}

export function onPlayGame(mode)
{
    hideMainMenu();
    StartLevel(mode);
}

export function showModeChoice()
{
    navigateTo('modes');
}

export function onModesOpen()
{
    setLevelState(LevelMode.MODESELECTION);
    const modeLocal = document.getElementById('modeLocal');
    modeLocal.focus();
}

export function clickBackButtonMenu()
{
    navigateTo('home', getLevelState());
}

export function onModesClose()
{
    showMainMenu();
}

export function openDuelPanel(otherPlayer = "")
{
    // if otherPlayer != "" and if isInTheDatabase(otherPlayer), sends an invitation to this player
}

export function setHeaderVisibility(isVisible)
{
    if (isVisible === true)
        document.getElementById('header-title').style.display = 'block';
    else
        document.getElementById('header-title').style.display = 'none';
}

const toggleCamera = document.getElementById('cameraTypeCheckbox');
const toggleCameraText = document.getElementById('cameraTypeText');

toggleCamera.addEventListener('change', () => {
    toggleCameraType();
});

export function toggleCameraType()
{
    playerStats.cameraOrthographic = toggleCamera.checked;
    if (playerStats.cameraOrthographic)
        toggleCameraText.innerText = getTranslation('orthographic');
    else
        toggleCameraText.innerText = getTranslation('perspective');
    if (isInGame === true)
        setCameraType();
}

export function uncheckCameraToggle()
{
    toggleCamera.checked = false;
}