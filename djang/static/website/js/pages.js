import { onCloseDuel, onOpenDuel } from "./duelPanel.js";
import { unloadLevel } from "./levelLocal.js";
import { isALevelMode } from "./main.js";
import { onPlayGame, onMainMenuOpen } from "./menu.js";
import { onModesClose, onModesOpen } from "./modesSelection.js";
import { onRegistrationClose, onRegistrationOpen, welcomeBackUser } from "./registration.js";
import { onCloseRules, onOpenRules } from "./rules.js";
import { onSignInClose, onSignInOpen } from "./signIn.js";
import { endOfTournamentMatch, onTournamentLobbyOpen } from "./tournament.js";

let currentPath = localStorage.getItem('currentPath') || 'home';;
let lastMode = null;

function onOpenPage(path, otherVar = null) {
    switch (path) {
        case 'home':
            onMainMenuOpen();
            break;
        case 'registering':
            onRegistrationOpen();
            break;
        case 'signIn':
            onSignInOpen();
            break;
        case 'modes':
            onModesOpen();
            break;
        case 'rules':
            onOpenRules(otherVar);
            break;
        case 'duel':
            onOpenDuel();
            break;
        case 'game-local':
            onPlayGame(otherVar);
            break;
        case 'game-online':
            onPlayGame(otherVar);
            break;
        case 'game-tournament':
            onPlayGame(otherVar);
            break;
        case 'game-ai':
            onPlayGame(otherVar);
            break;
        case 'game-multi':
            onPlayGame(otherVar);
            break;
        case 'tournament-lobby':
            onTournamentLobbyOpen();
            break;
    }
}

function onClosePage(path) {
    switch (path) {
        case 'registering':
            onRegistrationClose();
            break;
        case 'signIn':
            onSignInClose();
            break;
        case 'modes':
            onModesClose();
            break;
        case 'rules':
            onCloseRules();
            break;
        case 'duel':
            onCloseDuel();
            break;
        case 'game-tournament':
            unloadLevel();
            endOfTournamentMatch();
            break;
        case 'game-local':
            unloadLevel();
            break;
        case 'game-ai':
            unloadLevel();
            break;
        case 'game-online':
            unloadLevel();
            break;
        case 'game-multi':
            unloadLevel();
            break;
    }
}

export function getCurrentView() {
    return currentPath;
}

export function navigateTo(path, otherVar = null) {
    // Hide current page
    if (currentPath != path)
    {
        document.getElementById(currentPath).style.display = 'none';
        onClosePage(currentPath);
    }
    
    if (isALevelMode(otherVar))
        lastMode = otherVar;
    else
        lastMode = null;

    currentPath = path;
    localStorage.setItem('currentPath', currentPath);
    // Show the next page
    const nextPage = document.getElementById(path);
    if (nextPage) {
        nextPage.style.display = 'flex';
        onOpenPage(path, otherVar);
    }

    // Update the URL to reflect the path
    if (history.state?.path !== path) {
        history.pushState({ path }, "", `/${path}`);  // Make sure the URL matches Django's path
    }
}

// Handle back/forward navigation
window.onpopstate = function (event) {
    const path = event.state ? event.state.path : 'home';
    navigateTo(path, lastMode);
};

// Initial navigation on page load
setTimeout(() => {
    const initialPath = window.location.pathname.split('/')[1] || currentPath;
    navigateTo(initialPath);  // Navigate to the path based on the URL
    welcomeBackUser();
}, 100);