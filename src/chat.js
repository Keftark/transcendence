import { changeBallSize, changeBallSpeed, changePaddlesSize } from "./cheats";
import { getLevelState, LevelMode } from "./main";

const messagesContainer = document.getElementById('messages');
const inputField = document.querySelector('input[type="text"]');
const inputElement = document.getElementById('myInput');

const cheatCodes =
{
    "/BALLSIZE" : changeBallSize,
    "/BALLSPEED" : changeBallSpeed,
    "/PADDLESIZE" : changePaddlesSize
}

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
        trySendMessage(inputElement);
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
        // Split the input string into words
    const words = message.trim().split(/\s+/); // Split by spaces and remove extra spaces

    // Check if there are any words
    if (words.length > 0) {
        const firstWord = words[0].toUpperCase(); // Get the first word
        const secondWord = words.length > 1 ? words[1].toUpperCase() : undefined;
        // Check if the first word is a key in the function dictionary
        resetInputFieldValue();
        if (cheatCodes[firstWord])
        {
            cheatCodes[firstWord](secondWord); // Execute the corresponding function
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
    // Create a container for the entire message element
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container'); // Add a class for styling

    // Create a header for the name
    const nameHeader = document.createElement('div');
    nameHeader.classList.add('message-name'); // Add a class for styling
    nameHeader.textContent = name; // Set the text content to the name

    // Create a div for the message text
    const messageContent = document.createElement('div');
    messageContent.classList.add('message'); // Add a class for styling
    messageContent.textContent = messageText; // Set the text content to the message

    // Append the name header and message content to the message container
    messageContainer.appendChild(nameHeader);
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

function trySendMessage(inputElement) {
    const messageText = inputElement.value.trim();
    
    if (messageText !== "") {
        if (messageIsACode(messageText))
            return;
        const truncatedMessage = messageText.split(' ').map(word => {
            return word.length > 30 ? word.substring(0, 30) + '...' : word;
        }).join(' ');

        const newMessage = createMessageElement("Vous :", truncatedMessage);
        sendMessageRight(newMessage);
        // ici le code pour mettre le message a gauche si c'est quelqu'un d'autre ou bien a droite.
        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    inputElement.value = '';
    inputElement.focus();
}