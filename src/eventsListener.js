import { checkEscapeKey } from "./main";
import { eventsListener } from "./levelLocal";

function mainMenuEvents(event)
{
    const focusableElements = document.querySelectorAll('button, input, a, textarea, select');
    const focusable = Array.prototype.slice.call(focusableElements);
    const currentIndex = focusable.indexOf(document.activeElement);
    
    if (event.key === 'ArrowDown') {
        document.body.classList.add('hide-cursor');
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % focusable.length;
        focusable[nextIndex].focus();
    } else if (event.key === 'ArrowUp') {
        document.body.classList.add('hide-cursor');
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
        focusable[prevIndex].focus();
    } else if (event.key === 'Escape') {
        document.body.classList.add('hide-cursor');
        checkEscapeKey();
    }
}

function mouseMoveMenu()
{
    document.body.classList.remove('hide-cursor');
}

export function removeMainEvents()
{
    document.removeEventListener('keydown', mainMenuEvents);
    document.removeEventListener('mousemove', mouseMoveMenu);
}

export function addMainEvents()
{
    document.addEventListener('keydown', mainMenuEvents);
    document.addEventListener('mousemove', mouseMoveMenu);
}


document.addEventListener('keydown',  eventsListener);