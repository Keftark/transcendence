import { addMainEvents } from './eventsListener.js';
import { StartLevel, unloadLevel } from './levelLocal.js';
import { getLevelState, LevelMode, setLevelState } from './main.js';

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
    clickPlayLocal();
});

document.getElementById('modeComputer').addEventListener('click', () => {
    clickPlayAdventure();
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
            panel.classList.add('show'); // Add the show class to fade in
        });
    }
}

export function closeMenu()
{
    const panel = document.getElementById('menuPanel');
    
    if (panel.classList.contains('show')) {
        panel.classList.remove('show'); // Remove the show class to fade out
    }
}

export function openProfile()
{
    const profilePanel = document.getElementById('profilePanel');
    profilePanel.style.display = 'block';
    if (getLevelState() === LevelMode.MENU)
        oldButton = document.getElementById('mainProfileButton');
    document.getElementById('closeProfileButton').focus();
}

export function closeProfile()
{
    const profilePanel = document.getElementById('profilePanel');
    profilePanel.style.display = 'none';
    if (oldButton != null)
    {
        oldButton.focus();
        oldButton = null;
    }
}

export function openSettings()
{
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
}

export function setNewColor()
{
    const buttons = document.querySelectorAll('.colorize-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedColor = this.getAttribute('data-color');
            const textElements = document.querySelectorAll(' \
                h1, h2, p, #top-text, #menu-label span, #pressplay, #play, #score-left, #score-right, #playername-left, \
                #playername-right, #closeProfileButton, #closeSettingsButton, .menuButton, .mainMenuButton, \
                #modeSelectionText, #modeLocal, #modeComputer, #modeSelectionText, #mainMenuText, #backButton');
            textElements.forEach(element => {
                element.style.color = selectedColor;
            });
        });
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
}

function hideMainMenu()
{
    const mainMenuPanel = document.getElementById('mainMenuPanel');
    mainMenuPanel.style.display = 'none';
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

export function clickPlayLocal()
{
    hideMainMenu();
    hideModeChoice();
    StartLevel(LevelMode.LOCAL);
}

export function clickPlayAdventure()
{
    hideMainMenu();
    hideModeChoice();
    StartLevel(LevelMode.ADVENTURE);
}

export function showModeChoice()
{
    const modeSelection = document.getElementById('modeSelection');
    modeSelection.style.display = 'flex';
    setLevelState(LevelMode.MODESELECTION);
    const modeLocal = document.getElementById('modeLocal');
    modeLocal.focus();
}

function hideModeChoice()
{
    const modeSelection = document.getElementById('modeSelection');
    modeSelection.style.display = 'none';
}

export function clickBackButtonMenu()
{
    hideModeChoice();
    showMainMenu();
}