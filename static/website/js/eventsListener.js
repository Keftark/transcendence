import { checkEscapeKey } from "./main.js";
import { gameEventsListener, isInGame } from "./levelLocal.js";
import { chatIsFocused } from "./chat.js";
import { isSettingsOpen } from "./menu.js";

function mainMenuEvents(event)
{
    const focusableElements = document.querySelectorAll('button, input, a, textarea, select');
    const visibleElements = Array.from(focusableElements).filter(box => {
        return box.offsetParent !== null;
    });
    const focusable = Array.prototype.slice.call(visibleElements);
    const currentIndex = focusable.indexOf(document.activeElement);
    if (chatIsFocused)
        return;
    if (isInGame && !document.getElementById('gameMenuPanel').classList.contains('show') && !isSettingsOpen())
        return;
    if (event.key === 'ArrowDown') {
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