import { cheatCodes } from "./cheats";
import { getLevelState, LevelMode } from "./main";
import { playerStats } from "./playerManager";
import { getTranslation } from "./translate";

const messagesContainer = document.getElementById('messages');
const inputField = document.querySelector('input[type="text"]');
const inputElement = document.getElementById('myInput');
const sendButton = document.getElementById('sendButton');
const chatBox = document.getElementById('chatBox');
const toggleSizeButton = document.getElementById('toggleSizeButton');
const toggleIcon = document.getElementById('toggleIcon');
let lastSender = "";

function resetInputFieldValue()
{
    inputField.value = '';
}

window.onload = function() {
    resetInputFieldValue();
};

function openChat()
{
    chatBox.classList.remove('shrunk');
    chatBox.classList.remove('hide-elements');
    chatBox.classList.add('expanded');
    toggleIcon.src = 'icons/shrink.png';
}

function closeChat()
{
    chatBox.classList.remove('expanded');
    chatBox.classList.add('shrunk');
    toggleIcon.src = 'icons/grow.png';

    setTimeout(function() {
        chatBox.classList.add('hide-elements');
    }, 400);
}

export function tryCloseChat()
{
    if (chatBox.classList.contains('expanded'))
        closeChat();
}

document.addEventListener("DOMContentLoaded", function() {

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
            closeChat();
        } else {
            openChat();
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
            return false;
        }
    }
}

const contextMenuChat = document.getElementById('chatContextMenu');
const addFriendButton = document.getElementById('addFriendButton');

contextMenuChat.addEventListener('mouseleave', () => {
    closeNameContextMenu();
});
contextMenuChat.addEventListener('click', () => {
    closeNameContextMenu();
});
let currentName = "";
function openNameContextMenu(name, nameHeader)
{
    if (contextMenuChat.style.display === 'flex')
    {
        contextMenuChat.style.display = 'none';
    }
    else
    {
        const rect = nameHeader.getBoundingClientRect();
        if (playerStats.friends.includes(name))
            addFriendButton.innerText = getTranslation('removeFriendButton');
        else
            addFriendButton.innerText = getTranslation('addFriendButton');
        contextMenuChat.style.display = 'flex';
        contextMenuChat.style.top = (rect.bottom) + 'px'; // 10px below the first element
        contextMenuChat.style.left = rect.left + 'px';
        currentName = name;
    }
}

function closeNameContextMenu()
{
    contextMenuChat.style.display = 'none';
}

function nameIsInDatabase(name)
{
    // checks the database for the name
    // returns true if the name is found,
    // returns false if not.
    return true;
}

function createMessageElement(name, messageText) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    if (name != lastSender)
    {
        const nameHeader = document.createElement('div');
        nameHeader.classList.add('message-name');
        nameHeader.textContent = name.length > 0 ? name + getTranslation(':') : name;
        messageContainer.appendChild(nameHeader);
        if (name != playerStats.nickname && name != getTranslation('guest') && nameIsInDatabase(name))
        {
            nameHeader.addEventListener("click", function() {
                openNameContextMenu(name, nameHeader);
              });
        }
    }

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
}

function getPlayerName()
{
    messageCount = Math.floor(Math.random() * 3);
    let name = "";

    /* Bloc a supprimer, c'est juste pour des tests */
    if (messageCount % 3 === 0)
    {
        if (playerStats.isRegistered)
            name = playerStats.nickname;
        else
            name = getTranslation('guest');
    }
    else if (messageCount % 3 === 1)
        name = "Other";

    /*
        Logique pour avoir le nom du joueur.
    */

    return name;
}

export function sendSystemMessage(message)
{
    const newMessage = createMessageElement("", message);
    newMessage.classList.add('message-middle');
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    lastSender = "";
}

/* 
    Les messages systemes seront envoyes avec sendSystemMessage()
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
        lastSender = playerName;
    }
    inputElement.value = '';
    inputElement.focus();
}