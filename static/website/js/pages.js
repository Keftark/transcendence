import { onCloseDuel, onOpenDuel } from "./duelPanel.js";
import { unloadLevel } from "./levelLocal.js";
import { isLevelMode } from "./main.js";
import { onModesClose, onModesOpen, onPlayGame, onMainMenuOpen } from "./menu.js";
import { onRegistrationClose, onRegistrationOpen } from "./registration.js";
import { onCloseRules, onOpenRules } from "./rules.js";
import { onSignInClose, onSignInOpen } from "./signIn.js";
import { onTournamentMenuOpen } from "./tournament.js";

let currentPath;
let lastMode = null;

function onOpenPage(path, otherVar = null)
{
    switch (path)
    {
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
            onOpenRules();
        break;
        case 'duel':
            onOpenDuel();
        break;
        case 'game-local':
            onPlayGame(otherVar);
        break;
        case 'game-ai':
            onPlayGame(otherVar);
        break;
        case 'tournamentMenu':
            onTournamentMenuOpen();
        break;
    }
}

function onClosePage(path)
{
    switch (path)
    {
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
        case 'game-local':
            unloadLevel();
        break;
        case 'game-ai':
            unloadLevel();
        break;
    }
}

export function navigateTo(path, otherVar = null) {
    document.getElementById(currentPath).style.display = 'none';
    onClosePage(currentPath);
    if (isLevelMode(otherVar))
        lastMode = otherVar;
    else
        lastMode = null;
    currentPath = path;
    const nextPage = document.getElementById(path);
    if (nextPage) {
        nextPage.style.display = 'block';
        onOpenPage(path, otherVar);
    }

    if (history.state?.path !== path) {
        history.pushState({ path }, "", `/${path}`);
    }
}

// Handle back/forward navigation
window.onpopstate = function(event) {
    const path = event.state ? event.state.path : 'home';
    navigateTo(path, lastMode);
};

// Initial navigation on page load
currentPath = 'home';
navigateTo('home');