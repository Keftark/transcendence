import { checkEscapeKey } from "./main.js";
import { gameEventsListener, isInGame } from "./levelLocal.js";
import { chatIsFocused } from "./chat.js";
import { isProfileOpen, isSettingsOpen } from "./menu.js";
import { isRegistrationOpen } from "./registration.js";
import { isMatchListOpen } from "./modesSelection.js";
import { isSigninOpen } from "./signIn.js";
import { isPaddleChoiceOpen } from "./customizeSkins.js";

function mainMenuEvents(event)
{
    let focusableElements;
    if (chatIsFocused)
        return;
    if (isInGame && !document.getElementById('gameMenuPanel').classList.contains('show') && !isSettingsOpen())
        return;
    if (isRegistrationOpen())
        focusableElements = document.getElementById('registering').querySelectorAll('button, input, a, textarea, select');
    else if (isSigninOpen())
        focusableElements = document.getElementById('signIn').querySelectorAll('button, input, a, textarea, select');
    else if (isPaddleChoiceOpen())
        focusableElements = document.getElementById('choosePaddlePanel').querySelectorAll('button, input, a, textarea, select');
    else if (isProfileOpen())
        focusableElements = document.getElementById('profilePanel').querySelectorAll('button, input, a, textarea, select');
    else if (isSettingsOpen())
        focusableElements = document.getElementById('settingsPanel').querySelectorAll('button, input, a, textarea, select');
    else if (isMatchListOpen())
        focusableElements = document.getElementById('spectateList').querySelectorAll('button, input, a, textarea, select');
    else
        focusableElements = document.querySelectorAll('button, input, a, textarea, select');
    
    const visibleElements = Array.from(focusableElements).filter(box => {
        return box.offsetParent !== null && !box.classList.contains('disabledButtonHover');
    });
    const focusable = Array.prototype.slice.call(visibleElements);
    const currentIndex = focusable.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || (event.key === 'Enter' && document.activeElement.classList.contains('inputfield'))) {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % focusable.length;
        focusable[nextIndex].focus();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
        focusable[prevIndex].focus();
    }
}

function escapeEvent(event)
{
    if (event.key === 'Escape') {
        checkEscapeKey();
    }
}

export function removeMainEvents()
{
    // document.removeEventListener('keydown', mainMenuEvents);
}

export function addMainEvents()
{
    document.addEventListener('keydown', mainMenuEvents);
}


document.addEventListener('keydown',  gameEventsListener);
document.addEventListener('keydown',  escapeEvent);