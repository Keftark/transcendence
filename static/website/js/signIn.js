import { navigateTo } from "./pages.js";
import { getTranslation } from "./translate.js";

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
    signInErrorName.innerText = "";
    showPass = false;
    passwordImg.src = 'static/icons/eyeOpen.png';
    inputPassword.type = "password";
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

function nameIsInDatabase(name)
{
    let isInDb;

    if (name.trim() === "")
    {
        signInErrorName.innerText = getTranslation('errEmptyName');
        return false;
    }

    // faire l'appel a la base de donnees et verifier si le nom existe

    if (isInDb === false)
    {
        signInErrorName.innerText = getTranslation('errIncorrectName');
        return false;
    }
    signInErrorName.innerText = "";
    return true;
}

function passwordIsValid(pass)
{
    let isInDb;

    // faire l'appel a la base de donnees et verifier si le password existe

    if (isInDb === false)
    {
        signInErrorPassword.innerText = getTranslation('errBadPassword');
        return false;
    }
    signInErrorPassword.innerText = "";
    return true;
}

function clickConfirmSignIn()
{
    let errors = 0;
    if (!nameIsInDatabase(inputNick.value))
        errors++;
    if (!passwordIsValid(inputPassword.value))
        errors++;

    if (errors === 0)
        console.log("oui !");
    else
        console.log("non !");
}

export function clickCancelSignIn()
{
    signInPanel.classList.remove('showReg');
    setTimeout(() => {
        navigateTo('home');
    }, 300);
}