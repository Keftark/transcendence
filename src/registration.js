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
    document.getElementById('registerErrorName').innerText = "";
    document.getElementById('registerErrorFirstName').innerText = "";
    document.getElementById('registerErrorLastName').innerText = "";
    document.getElementById('registerErrorMail').innerText = "";
    document.getElementById('registerErrorPassword').innerText = "";
    document.getElementById('registerErrorConfirmPassword').innerText = "";
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

function checkFields()
{
    let inputValue = inputNick.value;
    let errors = 0;
    if (inputValue.trim() === "")
    {
        document.getElementById('registerErrorName').innerText = getTranslation('errEmptyName');
        errors++;
    }
    else
        document.getElementById('registerErrorName').innerText = "";
    // check if the name is in the database and return false if it's in
    inputValue = inputFirstName.value;
    if (inputValue.trim() === "")
    {
        document.getElementById('registerErrorFirstName').innerText = getTranslation('errEmptyFirstName');
        errors++;
    }
    else
        document.getElementById('registerErrorFirstName').innerText = "";
    inputValue = inputLastName.value;
    if (inputValue.trim() === "")
    {
        document.getElementById('registerErrorLastName').innerText = getTranslation('errEmptyLastName');
        errors++;
    }
    else
        document.getElementById('registerErrorLastName').innerText = "";
    inputValue = inputMail.value;
    if (inputValue.trim() === "")
    {
        document.getElementById('registerErrorMail').innerText = getTranslation('errEmptyMail');
        errors++;
    }
    else
        document.getElementById('registerErrorMail').innerText = "";
    if (!inputValue.includes('@'))
    {
        document.getElementById('registerErrorMail').innerText = getTranslation('errBadMail');
        errors++;
    }
    else
        document.getElementById('registerErrorMail').innerText = "";
    // check if the mail is in the database and return false if it's in
    inputValue = inputPassword.value;
    if (inputValue.trim() === "")
    {
        document.getElementById('registerErrorPassword').innerText = getTranslation('errBadPassword');
        errors++;
    }
    else
        document.getElementById('registerErrorPassword').innerText = "";
    inputValue = inputConfirmPassword.value;
    if (inputValue.trim() === "")
    {
        document.getElementById('registerErrorConfirmPassword').innerText = getTranslation('errBadPasswordConfirm');
        errors++;
    }
    else if (inputPassword.value != inputConfirmPassword.value)
    {
        document.getElementById('registerErrorConfirmPassword').innerText = getTranslation('errDifferentPasswords');
        errors++;
    }
    else
        document.getElementById('registerErrorConfirmPassword').innerText = "";
    if (errors > 0)
        return false;
    return true;
}

export function acceptRegistration()
{
    if (checkFields() === false)
        return;
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