import { createNewPlayer, editPlayerStats, playerStats, resetPlayerStats } from "./playerManager.js";
import { removeAllScores } from "./scoreManager.js";
import { getTranslation } from "./translate.js";
import { navigateTo } from "./pages.js";
import { addDisableButtonEffect, closeListener, closeSocket, getListener, getSocket, listener, openSocket, removeDisableButtonEffect, socket } from "./main.js";
import { callGameDialog, checkAccessToChat } from "./chat.js";
import { getLoggedInUser, logoutUser, registerUser, updateSettingsInDatabase } from "./apiFunctions.js";
import { deleteAllFriendRequests, showFriendsBox } from "./friends.js";
import { EmotionType } from "./variables.js";

const inputName = document.getElementById('inputName');
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
let gdprIsOpen = false;
let isFirstTime = true;

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
    inputConfirmPassword.value = inputPassword.value = inputMail.value = inputLastName.value = inputFirstName.value = inputName.value = "";
    registerErrorName.innerText = "";
    registerErrorFirstName.innerText = "";
    registerErrorLastName.innerText = "";
    registerErrorMail.innerText = "";
    registerErrorPassword.innerText = "";
    registerErrorConfirmPassword.innerText = "";
    showPassConfirm = showPass = false;
    passwordConfirmImg.src = 'static/icons/eyeOpen.webp';
    passwordImg.src = 'static/icons/eyeOpen.webp';
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
    isFirstTime = true;
    isRegistOpen = true;
    checkboxGdpr.checked = false;
    verifyCheckboxGdpr();
    overlayPanel.style.display = 'block';
    setTimeout(() => {
        registrationPanel.classList.add('showReg');
    }, 10);
    setTimeout(() => {
        openGdprPanel();
    }, 300);
}

function checkFields()
{
    let inputValue = inputName.value;
    let errors = 0;
    if (inputValue.trim() === "")
    {
        registerErrorName.innerText = getTranslation('errEmptyName');
        errors++;
    }
    else
        registerErrorName.innerText = "";
    // checks if the name is in the database and returns false if it's in
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

export async function welcomeBackUser()
{
    getLoggedInUser().then(user => {
        if (user) {
            editPlayerStats(user);
            replaceLogInButtons();
            removeDisableButtonEffect(profileButton);
            checkAccessIfRegistered();
        }
    });
}

export function logInUserUI()
{
    // console.log("Id: " + playerStats.id);
    openSocket();
    replaceLogInButtons();
    removeDisableButtonEffect(profileButton);
    checkAccessIfRegistered();
}

function displayErrors(errors) {
    const errorContainer = document.getElementById('registerErrorPassword');
    errorContainer.textContent = "";
    errors.forEach((error) => {
        errorContainer.innerHTML += error + "\n";
    });
}

async function acceptRegistration() {
    if (checkFields() === false)
        return;
    if (registerConfirm.classList.contains('disabledButtonHover'))
        return;
    const result = await registerUser(inputName.value, inputFirstName.value, inputLastName.value, inputMail.value, inputPassword.value);
    if (result.success === false) {
        displayErrors(result.errors);
        return;
    }
    await createNewPlayer();
    callGameDialog("entityRegister", EmotionType.NORMAL);
    clickCancelRegister();
    logInUserUI();
    updateSettingsInDatabase();
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

export function clickLogOut(isAlreadyLoggedOut = false)
{
    if (!playerStats.isRegistered)
        return;
    closeSocket();
    closeListener();
    if (!isAlreadyLoggedOut)
        logoutUser();
    replaceLogOutButtons();
    resetPlayerStats();
    addDisableButtonEffect(profileButton);
    removeAllScores();
    checkAccessIfRegistered();
    deleteAllFriendRequests();
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
        passwordImg.src = 'static/icons/eyeClose.webp';
        inputPassword.type = "text";
    }
    else
    {
        passwordImg.src = 'static/icons/eyeOpen.webp';
        inputPassword.type = "password";
    }
}

function toggleShowPasswordConfirm()
{
    showPassConfirm = !showPassConfirm;
    if (showPassConfirm)
    {
        passwordConfirmImg.src = 'static/icons/eyeClose.webp';
        inputConfirmPassword.type = "text";
    }
    else
    {
        passwordConfirmImg.src = 'static/icons/eyeOpen.webp';
        inputConfirmPassword.type = "password";
    }
}

export function checkAccessModes()
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
    showFriendsBox(playerStats.isRegistered);
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

export function isGdprOpen()
{
    return gdprIsOpen;
}

export function openGdprPanel()
{
    gdprIsOpen = true;
    gdprPanel.style.display = 'flex';
    setTimeout(() => {
        
        document.getElementById('gdprPanel').focus();
    }, 10);
}

export function closeGdprPanel()
{
    document.querySelector('#gdprPanel').scrollTop = 0;
    gdprIsOpen = false;
    gdprPanel.style.display = 'none';
    if (isFirstTime)
        inputName.focus();
    else
        checkboxGdpr.focus();
    isFirstTime = false;
}

function addSelectableTexts()
{
    const elements = document.querySelectorAll('#askSignIn, #askRegister');
	elements.forEach(function(element) {
		element.addEventListener('click', function(event) {
			event.preventDefault();
		});
	});
}

addDisableButtonEffect(profileButton);
resetRegistrationInputs();
addSelectableTexts();