import { changeBallSize } from "./cheats";
import { getLevelState, LevelMode } from "./main";

const messagesContainer = document.getElementById('messages');
const inputField = document.querySelector('input[type="text"]');

const cheatCodes =
{
    "/ballSize" : changeBallSize
}

function resetInputFieldValue()
{
    inputField.value = '';
}

window.onload = function() {
    resetInputFieldValue();
};

document.addEventListener("DOMContentLoaded", function() {
    const inputElement = document.getElementById('myInput');
    const sendButton = document.getElementById('sendButton');
    const chatBox = document.getElementById('chatBox');
    const toggleSizeButton = document.getElementById('toggleSizeButton');
    const toggleIcon = document.getElementById('toggleIcon');

    inputElement.focus();

    sendButton.addEventListener('click', function() {
        trySendMessage(inputElement);
    });

    inputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
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
        // Split the input string into words
    const words = message.trim().split(/\s+/); // Split by spaces and remove extra spaces

    // Check if there are any words
    if (words.length > 0) {
        const firstWord = words[0]; // Get the first word
        const secondWord = words.length > 1 ? words[1] : undefined;
        // Check if the first word is a key in the function dictionary
        resetInputFieldValue();
        if (cheatCodes[firstWord])
        {
            cheatCodes[firstWord](secondWord); // Execute the corresponding function
            return true;
        }
        else
        {
            console.log("Command not found.");
            return false;
        }
    }
}

function createMessageElement()
{
    const newMessage = document.createElement('div');
    newMessage.classList.add('message');
    return newMessage;
}

function sendMessageLeft(message)
{
    newMessage.classList.add('message-left');
}

function sendMessageRight(message)
{
    newMessage.classList.add('message-right');
}

function trySendMessage(inputElement) {
    const messageText = inputElement.value.trim();
    
    if (messageText !== "") {
        if (messageIsACode(messageText))
            return;
        const truncatedMessage = messageText.split(' ').map(word => {
            return word.length > 30 ? word.substring(0, 30) + '...' : word;
        }).join(' ');

        const newMessage = createMessageElement();
        newMessage.textContent = truncatedMessage;
        // ici le code pour mettre le message a gauche si c'est quelqu'un d'autre ou bien a droite.
        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    inputElement.value = '';
    inputElement.focus();
}