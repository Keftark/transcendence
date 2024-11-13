import { checkEscapeKey } from "./main.js";
import { gameEventsListener } from "./levelLocal.js";
import { chatIsFocused } from "./chat.js";

function mainMenuEvents(event)
{
    const focusableElements = document.querySelectorAll('button, input, a, textarea, select');
    const focusable = Array.prototype.slice.call(focusableElements);
    const currentIndex = focusable.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && !chatIsFocused) {
        document.body.classList.add('hide-cursor');
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % focusable.length;
        focusable[nextIndex].focus();
    } else if (event.key === 'ArrowUp' && !chatIsFocused) {
        document.body.classList.add('hide-cursor');
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
        focusable[prevIndex].focus();
    }
}

function escapeEvent(event)
{
    if (event.key === 'Escape') {
        document.body.classList.add('hide-cursor');
        checkEscapeKey();
    }
}

export function showCursor()
{
    document.body.classList.remove('hide-cursor');
}

export function removeMainEvents()
{
    document.removeEventListener('keydown', mainMenuEvents);
    document.removeEventListener('mousemove', showCursor);
}

export function addMainEvents()
{
    document.addEventListener('keydown', mainMenuEvents);
    document.addEventListener('mousemove', showCursor);
}


document.addEventListener('keydown',  gameEventsListener);
document.addEventListener('keydown',  escapeEvent);