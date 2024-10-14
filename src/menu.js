import { addMainEvents } from './eventsListener.js';
import { StartLevel, unloadLevel } from './levelLocal.js';
import { getLevelState, LevelMode, setLevelState } from './main.js';
import { playerStats } from './playerManager.js';
const overlayPanel = document.getElementById('overlay');

// document.addEventListener('DOMContentLoaded', () => {
//     const playButton = document.getElementById('mainPlayButton');
//     playButton.addEventListener('click', clickPlay);
// });

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
    loadMainMenu();
});

document.getElementById('modeLocal').addEventListener('click', () => {
    clickPlayGame(LevelMode.LOCAL);
});

document.getElementById('modeComputer').addEventListener('click', () => {
    clickPlayGame(LevelMode.ADVENTURE);
});

document.getElementById('backButton').addEventListener('click', () => {
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

export function openProfile()
{
    if (playerStats.isRegistered === false)
    {
     
        return;
    }
    document.getElementById('nameProfile').innerText = playerStats.nickname;
    document.getElementById('firstNameProfile').innerText = playerStats.firstName;
    document.getElementById('lastNameProfile').innerText = playerStats.lastName;
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
    const profilePanel = document.getElementById('profilePanel');
    const matchListPanel = document.getElementById('matchListPanel');
    const matchListButton = document.getElementById('seeMatchesButton');
    if (profilePanel.classList.contains('toLeft') === false) {
        if (playerStats.matches.length === 0)
        {
            document.getElementById('noMatchHistory').style.display = 'block';
            document.getElementById('victories').style.display = 'none';
            matchListButton.style.backgroundColor = '#ffffff56';
        }
        else
        {
            document.getElementById('noMatchHistory').style.display = 'none';
            document.getElementById('victories').style.display = 'block';
        }
        matchListPanel.style.display = 'flex';
        setTimeout(() => {
            profilePanel.classList.add('toLeft');
            matchListPanel.classList.add('toRight');
            matchListButton.classList.add('open');
        }, 50);
    }
    else {
            profilePanel.classList.remove('toLeft');
            matchListPanel.classList.remove('toRight');
            matchListButton.classList.remove('open');
        setTimeout(() => {
            matchListPanel.style.display = 'none';
        }, 100);
    }
}

export function closeProfile()
{
    const profilePanel = document.getElementById('profilePanel');
    const matchListPanel = document.getElementById('matchListPanel');
    if (profilePanel.classList.contains('toLeft') === true) {
        profilePanel.classList.remove('toLeft');
        matchListPanel.classList.remove('toRight');
        document.getElementById('seeMatchesButton').classList.remove('open');
        setTimeout(() => {
            matchListPanel.style.display = 'none';
            profilePanel.style.display = 'none';
        }, 100);
    }
    else
    {
        matchListPanel.style.display = 'none';
        profilePanel.style.display = 'none';
    }
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

const textElements = document.querySelectorAll(' \
    h1, h2, h3, p, button, #top-text, #menu-label span, #pressplay, #play, #score-left, #score-right, #playername-left, \
    #playername-right');

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
    textElements.forEach(element => {
        element.style.color = newColor;
    });
}

export function loadMainMenu()
{
    unloadLevel();
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

export function clickPlayGame(mode)
{
    hideMainMenu();
    hideModeChoice();
    StartLevel(mode);
}

export function showModeChoice()
{
    document.getElementById('modeSelection').style.display = 'flex';
    setLevelState(LevelMode.MODESELECTION);
    const modeLocal = document.getElementById('modeLocal');
    modeLocal.focus();
}

function hideModeChoice()
{
    document.getElementById('modeSelection').style.display = 'none';
}

export function clickBackButtonMenu()
{
    hideModeChoice();
    showMainMenu();
}