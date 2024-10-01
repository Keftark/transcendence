import { StartLevelLocal, unloadLevel } from './levelLocal.js';
import { LevelMode, setLevelState } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('mainPlayButton');
    playButton.addEventListener('click', clickPlay);
    const settingsButton = document.getElementById('settingsButton');
    settingsButton.addEventListener('click', openSettings);
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

document.getElementById('backButton').addEventListener('click', () => {
    clickBackButtonMenu();
});

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
    const overlay = document.getElementById('overlay');
    
    overlay.style.display = 'block'; // Show the overlay first
    profilePanel.style.display = 'block'; // Show the profile panel

    // Small delay for fade-in effect
    setTimeout(() => {
        overlay.classList.add('show'); // Fade in the overlay
        profilePanel.classList.add('show'); // Fade in the profile panel
        setTimeout(() => {
            document.getElementById('closeProfileButton').focus();
        }, 50);
    }, 10);
}

export function closeProfile()
{
    const profilePanel = document.getElementById('profilePanel');
    const overlay = document.getElementById('overlay');

    // Fade out the overlay and profile panel
    overlay.classList.remove('show');
    profilePanel.classList.remove('show');

    // Wait for the transition to finish, then hide them
    setTimeout(() => {
        overlay.style.display = 'none';
        profilePanel.style.display = 'none';
    }, 150); // Match the transition duration
}

export function openSettings()
{
    const settingsPanel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('overlay');
    
    overlay.style.display = 'block'; // Show the overlay first
    settingsPanel.style.display = 'block'; // Show the profile panel

    // Small delay for fade-in effect
    setTimeout(() => {
        overlay.classList.add('show'); // Fade in the overlay
        settingsPanel.classList.add('show'); // Fade in the profile panel
        setTimeout(() => {
            document.getElementById('closeSettingsButton').focus();
        }, 50); // Delay to ensure rendering is complete
    }, 10);
}

export function closeSettings()
{
    const settingsPanel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('overlay');

    overlay.classList.remove('show');
    settingsPanel.classList.remove('show');

    setTimeout(() => {
        overlay.style.display = 'none';
        settingsPanel.style.display = 'none';
    }, 150);
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
                modeSelectionText, modeLocal, modeComputer');
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
    StartLevelLocal();
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