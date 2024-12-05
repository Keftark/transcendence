import { createNewPlayer, playerStats, resetPlayerStats } from "./playerManager.js";
import { removeAllScores } from "./scoreManager.js";
import { getTranslation } from "./translate.js";
import { navigateTo } from "./pages.js";
import { addDisableButtonEffect, removeDisableButtonEffect } from "./main.js";
import { checkAccessToChat } from "./chat.js";

const inputNick = document.getElementById('inputName');
const inputFirstName = document.getElementById('inputFirstName');
const inputLastName = document.getElementById('inputLastName');
const inputMail = document.getElementById('inputMail');
const inputPassword = document.getElementById('inputPassword');
const inputConfirmPassword = document.getElementById('inputConfirmPassword');
const registrationPanel = document.getElementById('registeringpanel');
const overlayPanel = document.getElementById('overlay');
const logInButtons = document.getElementById('loginbuttons');
const logOutButtons = document.getElementById('logoutbuttons');
const profileButton = document.getElementById('mainProfileButton');
const passwordImg = document.getElementById('showPasswordButton');
const passwordConfirmImg = document.getElementById('showConfirmPasswordButton');

const registerErrorName = document.getElementById('registerErrorName');
const registerErrorFirstName = document.getElementById('registerErrorFirstName');
const registerErrorLastName = document.getElementById('registerErrorLastName');
const registerErrorMail = document.getElementById('registerErrorMail');
const registerErrorPassword = document.getElementById('registerErrorPassword');
const registerErrorConfirmPassword = document.getElementById('registerErrorConfirmPassword');
const registerConfirm = document.getElementById('registerConfirm');

const gdprPanel = document.getElementById('overlayGdpr');
const checkboxGdpr = document.getElementById('checkboxGdpr');

let isRegistOpen = false;
let showPass = false;
let showPassConfirm = false;
export let isGdprOpen = false;


document.getElementById('buttonLogOut').addEventListener('click', () => {
    clickLogOut();
});

registerConfirm.addEventListener('click', () => {
    acceptRegistration();
});

document.getElementById('registerCancel').addEventListener('click', () => {
    clickCancelRegister();
});

document.getElementById('buttonSignUp').addEventListener('click', () => {
    showRegistrationPanel();
});

passwordImg.addEventListener('click', () => {
    toggleShowPassword();
});

passwordConfirmImg.addEventListener('click', () => {
    toggleShowPasswordConfirm();
});

document.getElementById('askSignIn').addEventListener('click', () => {
    registrationPanel.classList.remove('showReg');
    setTimeout(() => {
        navigateTo('signIn');
    }, 300);
});

document.getElementById('gdprBack').addEventListener('click', () => {
    closeGdprPanel();
});

checkboxGdpr.addEventListener('click', () => {
    clickCheckboxGdpr();
});



function  resetRegistrationInputs()
{
    inputConfirmPassword.value = inputPassword.value = inputMail.value = inputLastName.value = inputFirstName.value = inputNick.value = "";
    registerErrorName.innerText = "";
    registerErrorFirstName.innerText = "";
    registerErrorLastName.innerText = "";
    registerErrorMail.innerText = "";
    registerErrorPassword.innerText = "";
    registerErrorConfirmPassword.innerText = "";
    showPassConfirm = showPass = false;
    passwordConfirmImg.src = 'static/icons/eyeOpen.png';
    passwordImg.src = 'static/icons/eyeOpen.png';
    inputConfirmPassword.type = "password";
    inputPassword.type = "password";
}

export function clickCancelRegister()
{
    registrationPanel.classList.remove('showReg');
    setTimeout(() => {
        navigateTo('home');
    }, 300);
}

export function onRegistrationClose()
{
    isRegistOpen = false;
    resetRegistrationInputs();
    overlayPanel.style.display = 'none';
}

export function showRegistrationPanel()
{
    navigateTo('registering');
}

export function onRegistrationOpen()
{
    isRegistOpen = true;
    checkboxGdpr.checked = false;
    verifyCheckboxGdpr();
    overlayPanel.style.display = 'block';
    setTimeout(() => {
        registrationPanel.classList.add('showReg');
    }, 10);
    inputNick.focus();
}

function checkFields()
{
    let inputValue = inputNick.value;
    let errors = 0;
    if (inputValue.trim() === "")
    {
        registerErrorName.innerText = getTranslation('errEmptyName');
        errors++;
    }
    else
        registerErrorName.innerText = "";
    // check if the name is in the database and return false if it's in
    inputValue = inputFirstName.value;
    if (inputValue.trim() === "")
    {
        registerErrorFirstName.innerText = getTranslation('errEmptyFirstName');
        errors++;
    }
    else
        registerErrorFirstName.innerText = "";
    inputValue = inputLastName.value;
    if (inputValue.trim() === "")
    {
        registerErrorLastName.innerText = getTranslation('errEmptyLastName');
        errors++;
    }
    else
        registerErrorLastName.innerText = "";
    inputValue = inputMail.value;
    if (inputValue.trim() === "")
    {
        registerErrorMail.innerText = getTranslation('errEmptyMail');
        errors++;
    }
    else
        registerErrorMail.innerText = "";
    if (!inputValue.includes('@'))
    {
        registerErrorMail.innerText = getTranslation('errBadMail');
        errors++;
    }
    else
        registerErrorMail.innerText = "";
    // check if the mail is in the database and return false if it's in
    inputValue = inputPassword.value;
    if (inputValue.trim() === "")
    {
        registerErrorPassword.innerText = getTranslation('errEmptyPassword');
        errors++;
    }
    else
        registerErrorPassword.innerText = "";
    inputValue = inputConfirmPassword.value;
    if (inputValue.trim() === "")
    {
        registerErrorConfirmPassword.innerText = getTranslation('errEmptyPasswordConfirm');
        errors++;
    }
    else if (inputPassword.value != inputConfirmPassword.value)
    {
        registerErrorConfirmPassword.innerText = getTranslation('errDifferentPasswords');
        errors++;
    }
    else
        registerErrorConfirmPassword.innerText = "";
    if (errors > 0)
        return false;
    return true;
}

export function acceptRegistration()
{
    // if (checkFields() === false)
    //     return;
    if (registerConfirm.classList.contains('disabledButtonHover'))
        return;
    createNewPlayer();
    clickCancelRegister();
    replaceLogInButtons();
    removeDisableButtonEffect(profileButton);
    checkAccessIfRegistered();
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
    addDisableButtonEffect(profileButton);
    removeAllScores();
    checkAccessIfRegistered();
}

export function isRegistrationOpen()
{
    return isRegistOpen;
}

function toggleShowPassword()
{
    showPass = !showPass;
    if (showPass)
    {
        passwordImg.src = 'static/icons/eyeClose.png';
        inputPassword.type = "text";
    }
    else
    {
        passwordImg.src = 'static/icons/eyeOpen.png';
        inputPassword.type = "password";
    }
}

function toggleShowPasswordConfirm()
{
    showPassConfirm = !showPassConfirm;
    if (showPassConfirm)
    {
        passwordConfirmImg.src = 'static/icons/eyeClose.png';
        inputConfirmPassword.type = "text";
    }
    else
    {
        passwordConfirmImg.src = 'static/icons/eyeOpen.png';
        inputConfirmPassword.type = "password";
    }
}

function checkAccessModes()
{
    if (playerStats.isRegistered)
    {
        document.getElementById('mainBackground').classList.add('enlightened');
        removeDisableButtonEffect(document.getElementById('modesOnlineButton'));
        document.getElementById('modesOnlineText').classList.remove('disabledText');
    }
    else
    {
        document.getElementById('mainBackground').classList.remove('enlightened');
        addDisableButtonEffect(document.getElementById('modesOnlineButton'));
        document.getElementById('modesOnlineText').classList.add('disabledText');
    }
}

export function checkAccessIfRegistered()
{
    checkAccessToChat();
    checkAccessModes();
}

function verifyCheckboxGdpr()
{
    if (!checkboxGdpr.checked)
        addDisableButtonEffect(registerConfirm);
    else
        removeDisableButtonEffect(registerConfirm);
}

function clickCheckboxGdpr()
{
    verifyCheckboxGdpr();
}

export function openGdprPanel()
{
    isGdprOpen = true;
    checkboxGdpr.checked = !checkboxGdpr.checked;
    gdprPanel.style.display = 'flex';
}

export function closeGdprPanel()
{
    isGdprOpen = false;
    gdprPanel.style.display = 'none';
}

addDisableButtonEffect(profileButton);
resetRegistrationInputs();

setTimeout(() => {
    checkAccessIfRegistered();
}, 0);