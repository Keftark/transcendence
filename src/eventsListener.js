import { checkEscapeKey } from "./main";
import { eventsListener } from "./levelLocal";

document.addEventListener('keydown', function(event) {
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
});

document.addEventListener('mousemove', function() {
    document.body.classList.remove('hide-cursor');
});

document.addEventListener('keydown',  eventsListener);