import { createNewPlayer, resetPlayerStats } from "./playerManager";
import { getTranslation } from "./translate";

const inputNick = document.getElementById('inputName');
const inputFirstName = document.getElementById('inputFirstName');
const inputLastName = document.getElementById('inputLastName');
const inputMail = document.getElementById('inputMail');
const inputPassword = document.getElementById('inputPassword');
const inputConfirmPassword = document.getElementById('inputConfirmPassword');
const registrationPanel = document.getElementById('registering');
const overlayPanel = document.getElementById('overlay');
const logInButtons = document.getElementById('loginbuttons');
const logOutButtons = document.getElementById('logoutbuttons');
const profileButton = document.getElementById('mainProfileButton');

window.showRegistrationPanel = showRegistrationPanel;
window.clickCancelRegister = clickCancelRegister;
window.acceptRegistration = acceptRegistration;
window.clickLogOut = clickLogOut;

function  resetRegistrationInputs()
{
    inputNick.value = "";
    inputFirstName.value = "";
    inputLastName.value = "";
    inputMail.value = "";
    inputPassword.value = "";
    inputConfirmPassword.value = "";
}

export function clickCancelRegister()
{
    resetRegistrationInputs();

    overlayPanel.style.display = 'none';
    if (registrationPanel.classList.contains('showReg')) {
        registrationPanel.classList.remove('showReg');
    }
    setTimeout(() => {
        registrationPanel.style.display = 'none';
    }, 300);
}

export function showRegistrationPanel()
{
    overlayPanel.style.display = 'block';
    registrationPanel.style.display = 'block';
    if (registrationPanel.classList.contains('showReg') === false) {
        setTimeout(() => {
            registrationPanel.classList.add('showReg');
        }, 10);
    }
    inputNick.focus();
}

export function acceptRegistration()
{
    createNewPlayer();
    clickCancelRegister();
    replaceLogInButtons();
    addHoverEffect();
}

function replaceLogInButtons()
{
    logOutButtons.style.display = 'flex';
    logInButtons.style.display = 'none';
}

function replaceLogOutButtons()
{
    logInButtons.style.display = 'flex';
    logOutButtons.style.display = 'none';
}

export function clickLogOut()
{
    replaceLogOutButtons();
    resetPlayerStats();
    removeHoverEffect();
}

function addHoverEffect() {
    profileButton.classList.add('mainButtonHover');
    profileButton.style.opacity = 1;
}

// Function to remove the hover effect
function removeHoverEffect() {
    profileButton.classList.remove('mainButtonHover');
    profileButton.style.opacity = 0.5;
}

removeHoverEffect();
resetRegistrationInputs();