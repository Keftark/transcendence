import { getTranslation } from "./translate";

const inputNick = document.getElementById('inputName');
const inputFirstName = document.getElementById('inputFirstName');
const inputLastName = document.getElementById('inputLastName');
const inputMail = document.getElementById('inputMail');
const inputPassword = document.getElementById('inputPassword');
const inputConfirmPassword = document.getElementById('inputConfirmPassword');
const registrationPanel = document.getElementById('registering');
const overlayPanel = document.getElementById('overlay');

window.showRegistrationPanel = showRegistrationPanel;
window.clickCancelRegister = clickCancelRegister;
window.acceptRegistration = acceptRegistration;

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
            registrationPanel.classList.add('showReg'); // Add the show class to fade in
        }, 10);
    }
    inputNick.focus();
}

export function acceptRegistration()
{
    // create a new user
    clickCancelRegister();
}
resetRegistrationInputs();