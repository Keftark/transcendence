import { checkEscapeKey, isElementVisible } from "./main.js";
import { gameEventsListener, isInGame } from "./levelLocal.js";
import { chatIsFocused } from "./chat.js";
import { isAskingDeleteAccount, isChangePasswordOpen, isEditProfileOpen, isMiniProfileOpen, isProfileOpen, isSettingsOpen } from "./menu.js";
import { isGdprOpen, isRegistrationOpen } from "./registration.js";
import { isMatchListOpen } from "./modesSelection.js";
import { isSigninOpen } from "./signIn.js";
import { isPaddleChoiceOpen } from "./customizeSkins.js";
import { isAddPlayerTournamentIsOpen, isInAskBackTournamentView, isTournamentViewOpen } from "./tournament.js";

function getFocusableElements()
{
    if (isGdprOpen())
        return [document.getElementById('gdprBack')];
    else if (isEditProfileOpen())
        return document.getElementById('changeFieldProfileConfirm').querySelectorAll('button, input');
    else if (isChangePasswordOpen())
        return document.getElementById('changePasswordProfileConfirm').querySelectorAll('button, input');
    else if (isAskingDeleteAccount())
        return document.getElementById('buttonsAskDelete').querySelectorAll('button');
    else if (isMiniProfileOpen())
        return document.getElementById('miniProfilePanel').querySelectorAll('button');
    else if (isRegistrationOpen())
        return document.getElementById('registering').querySelectorAll('button, input, a, textarea, select, #askSignIn');
    else if (isSigninOpen())
        return document.getElementById('signIn').querySelectorAll('button, input, a, textarea, select, #askRegister');
    else if (isPaddleChoiceOpen())
        return document.getElementById('choosePaddlePanel').querySelectorAll('button, input, a, textarea, select');
    else if (isProfileOpen())
        return document.getElementById('profilePanel').querySelectorAll('button, input, a, textarea, select, .headerProfileButton');
    else if (isSettingsOpen())
        return document.getElementById('settingsPanel').querySelectorAll('button, input, a, textarea, select');
    else if (isMatchListOpen())
        return document.getElementById('spectateList').querySelectorAll('button, input, a, textarea, select');
    else if (isInAskBackTournamentView())
        return document.getElementById('askBackTournamentViewPanel').querySelectorAll('button, input, a, textarea, select');
    else if (isTournamentViewOpen())
        return document.getElementById('tournamentMatchsCanvas').querySelectorAll('button, input, a, textarea, select');
    else if (isAddPlayerTournamentIsOpen())
        return document.getElementById('addPlayerTournamentPanel').querySelectorAll('button, input, a, textarea, select');
    else
        return document.querySelectorAll('button, input, a, textarea, select');
}

function mainMenuEvents(event)
{
    if (chatIsFocused
        || (isInGame && !document.getElementById('gameMenuPanel').classList.contains('show') && !isSettingsOpen()))
        return;

    const focusableElements = getFocusableElements();
    const visibleElements = Array.from(focusableElements).filter(box => {
        return box.offsetParent !== null && !box.classList.contains('disabledButtonHover');
    });
    const focusable = Array.prototype.slice.call(visibleElements);
    if (focusable.length == 1)
    {
        if (isElementVisible(focusable[0]))
            focusable[0].focus();
        return;
    }
    const currentIndex = focusable.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || (event.key === 'Enter' && (document.activeElement.classList.contains('inputfield')))) {
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