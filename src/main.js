import { clickBackButtonMenu, loadMainMenu } from './menu.js';
import { initTranslation, changeLanguage } from './translate.js';
import { setNewColor,  } from './menu.js';

export const LevelMode = {
    MENU: 0,
    MODESELECTION: 1,
    LOCAL: 2,
    ADVENTURE: 3,
};

let levelMode = LevelMode.MENU;

export function setLevelState(newLevelMode)
{
    levelMode = newLevelMode;
}

function checkEscapeKey()
{
    if (levelMode === LevelMode.MODESELECTION)
        clickBackButtonMenu();
}

document.addEventListener('keydown', function(event) {
    const focusableElements = document.querySelectorAll('button, input, a, textarea, select');
    const focusable = Array.prototype.slice.call(focusableElements);
    const currentIndex = focusable.indexOf(document.activeElement);
    
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        // Move focus to the next element
        const nextIndex = (currentIndex + 1) % focusable.length;
        focusable[nextIndex].focus();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        // Move focus to the previous element
        const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
        focusable[prevIndex].focus();
    } else if (event.key === 'Escape') {
        checkEscapeKey();
    }
});

initTranslation();
setNewColor();
window.changeLanguage = changeLanguage;
const button = document.getElementById('mainPlayButton');
button.focus();