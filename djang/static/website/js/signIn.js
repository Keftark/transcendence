import { logInPlayer } from "./apiFunctions.js";
import { callGameDialog } from "./chat.js";
import { navigateTo } from "./pages.js";
import { logInUserUI } from "./registration.js";
import { getTranslation } from "./translate.js";
import { EmotionType } from "./variables.js";

const signInPanel = document.getElementById('signinpanel');
const overlayPanel = document.getElementById('overlay');
const inputPassword = document.getElementById('inputSignInPassword');
const inputNick = document.getElementById('inputSignInName');
const passwordImg = document.getElementById('showSignInPasswordButton');
const signInErrorName = document.getElementById('signInErrorName');
const signInErrorPassword = document.getElementById('signInErrorPassword');
let isSignInOpen = false;
let showPass = false;

document.getElementById('buttonLogIn').addEventListener('click', () => {
    showLogInPanel();
});

document.getElementById('signInConfirm').addEventListener('click', () => {
    clickConfirmSignIn();
});

document.getElementById('signInCancel').addEventListener('click', () => {
    clickCancelSignIn();
});

passwordImg.addEventListener('click', () => {
    toggleShowPassword();
});

document.getElementById('askRegister').addEventListener('click', () => {
    signInPanel.classList.remove('showReg');
    setTimeout(() => {
        navigateTo('registering');
    }, 300);
});

export function isSigninOpen()
{
    return isSignInOpen;
}

function showLogInPanel()
{
    navigateTo('signIn');
}

export function onSignInOpen()
{
    isSignInOpen = true;
    overlayPanel.style.display = 'block';
    setTimeout(() => {
        signInPanel.classList.add('showReg');
    }, 10);
    inputNick.focus();
}

export function onSignInClose()
{
    isSignInOpen = false;
    resetSignInInputs();
    overlayPanel.style.display = 'none';
}

function  resetSignInInputs()
{
    inputPassword.value = inputNick.value = "";
    signInErrorPassword.innerText = signInErrorName.innerText = "";
    showPass = false;
    passwordImg.src = 'static/icons/eyeOpen.webp';
    inputPassword.type = "password";
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

export function invalidCredentials()
{
    signInErrorPassword.innerText = getTranslation('errInvalidCredentials');
}

async function clickConfirmSignIn()
{
    const username = inputNick.value;
    const password = inputPassword.value;

    await logInPlayer(username, password)
    .then(() => {
        callGameDialog("entityLogIn", EmotionType.NORMAL);
    })
    .catch((error) => {
        console.error("Failed to log in:", error);
    });
}

export function clickCancelSignIn(login = false)
{
    signInPanel.classList.remove('showReg');
    setTimeout(() => {
        navigateTo('home');
        if (login)
            logInUserUI();
    }, 300);
}