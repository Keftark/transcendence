import { isLevelMode } from "./main";
import { onModesClose, onModesOpen, loadMainMenu, onPlayGame } from "./menu";
import { onRegistrationClose, onRegistrationOpen } from "./registration";
import { onCloseRules, onOpenRules } from "./rules";

let currentPath;
let lastMode = null;

function onOpenPage(path, otherVar = null)
{
    switch (path)
    {
        case 'registering':
            onRegistrationOpen();
        break;
        case 'modes':
            onModesOpen();
        break;
        case 'rules':
            onOpenRules();
        break;
        case 'game-local':
            onPlayGame(otherVar);
        break;
        case 'game-ai':
            onPlayGame(otherVar);
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
        case 'modes':
            onModesClose();
        break;
        case 'rules':
            onCloseRules();
        break;
        case 'game-local':
            loadMainMenu();
        break;
        case 'game-ai':
            loadMainMenu();
        break;
    }
}

export function navigateTo(path, otherVar = null) {
    // Hide all page and subpage elements
    document.getElementById(currentPath).style.display = 'none';
    onClosePage(currentPath);
    if (isLevelMode(otherVar))
        lastMode = otherVar;
    else
        lastMode = null;
    currentPath = path;
    // Show the specific section that matches the `path`
    const section = document.getElementById(path);
    if (section) {
        section.style.display = 'block';
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