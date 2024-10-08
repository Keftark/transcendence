import { changeBallSize, changeBallSpeed, changePaddlesSize, cheatCodes } from "./cheats";
import { getLevelState, LevelMode } from "./main";

const messagesContainer = document.getElementById('messages');
const inputField = document.querySelector('input[type="text"]');
const inputElement = document.getElementById('myInput');

function resetInputFieldValue()
{
    inputField.value = '';
}

window.onload = function() {
    resetInputFieldValue();
};

document.addEventListener("DOMContentLoaded", function() {
    const sendButton = document.getElementById('sendButton');
    const chatBox = document.getElementById('chatBox');
    const toggleSizeButton = document.getElementById('toggleSizeButton');
    const toggleIcon = document.getElementById('toggleIcon');

    sendButton.addEventListener('click', function() {
        trySendMessage();
    });

    inputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (document.activeElement === inputElement)
                sendButton.click();
            else
                inputField.focus();
        }
    });

    toggleSizeButton.addEventListener('click', function() {
        if (chatBox.classList.contains('expanded')) {
            chatBox.classList.remove('expanded');
            chatBox.classList.add('shrunk');
            toggleIcon.src = 'icons/grow.png';

            setTimeout(function() {
                chatBox.classList.add('hide-elements');
            }, 400);
        } else {
            chatBox.classList.remove('shrunk');
            chatBox.classList.remove('hide-elements');
            chatBox.classList.add('expanded');
            toggleIcon.src = 'icons/shrink.png';
        }
    });

    chatBox.classList.add('expanded');
});

function messageIsACode(message)
{
    if (getLevelState() === LevelMode.MENU || getLevelState() === LevelMode.MODESELECTION)
        return false;
    const words = message.trim().split(/\s+/);

    if (words.length > 0) {
        const firstWord = words[0].toUpperCase();
        const secondWord = words.length > 1 ? words[1].toUpperCase() : undefined;
        resetInputFieldValue();
        if (cheatCodes[firstWord])
        {
            cheatCodes[firstWord](secondWord);
            inputElement.blur();
            return true;
        }
        else
        {
            console.log("Command not found.");
            return false;
        }
    }
}

function createMessageElement(name, messageText) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const nameHeader = document.createElement('div');
    nameHeader.classList.add('message-name');
    nameHeader.textContent = name;
    messageContainer.appendChild(nameHeader);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message');
    messageContent.textContent = messageText;
    messageContainer.appendChild(messageContent);

    return messageContainer;
}

function sendMessageLeft(newMessage)
{
    const messageContent = newMessage.querySelector('.message');
    messageContent.classList.add('message-container-left');
    newMessage.classList.add('message-left');
}

function sendMessageRight(newMessage)
{
    const messageContent = newMessage.querySelector('.message');
    messageContent.classList.add('message-container-right');
    newMessage.classList.add('message-right');
}

function sendMessageMiddle(newMessage)
{
    newMessage.classList.add('message-middle');
}

let messageCount = 0;
function sendRandomMessage(newMessage)
{
    if (messageCount % 3 === 0)
        sendMessageRight(newMessage);
    else if (messageCount % 3 === 1)
        sendMessageLeft(newMessage);
    else
        sendMessageMiddle(newMessage);
    messageCount++;
}

function getPlayerName()
{
    let name = "";

    /* Bloc a supprimer, c'est juste pour des tests */
    if (messageCount % 3 === 0)
        name = "Vous :";
    else if (messageCount % 3 === 1)
        name = "Other :";

    /*
        Logique pour avoir le nom du joueur.
        Si le joueur est celui qui ecrit, on met "Vous :" ou "You:", selon la traduction  et on envoie le message sur la droite
    */

    return name;
}

export function sendSystemMessage(message)
{
    const newMessage = createMessageElement("", message);
    newMessage.classList.add('message-middle');
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* 
    Faire en sorte de n'entrer un nom que si c'est un joueur qui ecrit, pas le systeme. Avec createMessageElement()
*/
function trySendMessage() {
    const messageText = inputElement.value.trim();
    
    if (messageText !== "") {
        if (messageIsACode(messageText))
            return;
        const truncatedMessage = messageText.split(' ').map(word => {
            return word.length > 30 ? word.substring(0, 30) + '...' : word;
        }).join(' ');

        let playerName = getPlayerName();
        const newMessage = createMessageElement(playerName, truncatedMessage);
        sendRandomMessage(newMessage);
        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    inputElement.value = '';
    inputElement.focus();
}