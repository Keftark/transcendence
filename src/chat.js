import { cheatCodes } from "./cheats";
import { isInTheDatabase, searchDatabase } from "./database";
import { getLevelState } from "./main";
import { openProfile, uncheckCameraToggle } from "./menu";
import { playerStats } from "./playerManager";
import { resetInputfieldsRules } from "./rules";
import { getTranslation } from "./translate";
import { LevelMode } from "./variables";

const messagesContainer = document.getElementById('messages');
const inputElement = document.getElementById('inputChat');
const sendButton = document.getElementById('sendButton');
const chatBox = document.getElementById('chatBox');
const toggleSizeButton = document.getElementById('toggleSizeButton');
const toggleIcon = document.getElementById('toggleIcon');
let lastSender = "";

function resetInputFieldValue()
{
    inputElement.value = '';
    resetInputfieldsRules();
    uncheckCameraToggle();
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
    inputElement.focus();
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

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.shiftKey) {
        if (chatBox.classList.contains('expanded')) {
            closeChat();
        } else {
            openChat();
        }
        e.preventDefault();
    }
    if (e.key === '/' && document.activeElement != inputElement)
    {
        e.preventDefault();
        openChat();
        inputElement.value = '/';
    }
});

document.addEventListener("DOMContentLoaded", function() {

    sendButton.addEventListener('click', function() {
        trySendMessage();
    });

    inputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {    
            if (document.activeElement === inputElement)
                sendButton.click();
            else
                inputElement.focus();
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
const seeProfileButton = document.getElementById('seeProfileButton');

contextMenuChat.addEventListener('mouseleave', () => {
    closeNameContextMenu();
});

contextMenuChat.addEventListener('click', () => {
    closeNameContextMenu();
});

addFriendButton.addEventListener('click', () => {
    clickAddRemoveFriend();
});

seeProfileButton.addEventListener('click', () => {
    clickOpenProfile();
});

function clickPlayWith()
{
    // calls the mutiplayer (1vs1) game panel
    // the left player is the caller, the right one is the invited player.
    // on the screen, there is a text 'Waiting for <player>...' until he accepts the invitation.
    // if the player accepts the invitation, he goes on the same panel and its informations are filled.
    // if the player refuses, the panel disappears? or instead of the waiting player text, there is 
}

function clickOpenProfile()
{
    const player = searchDatabase(selectedName);
    if (player === null)
    {
        console.error("error: the player " + selectedName + " doesn't exist");
        return;
    }
    openProfile(player);
}

function removeFriend(friendName)
{
    const index = playerStats.friends.indexOf(friendName);
    playerStats.friends.splice(index, 1);
}

function clickAddRemoveFriend()
{
    if (playerStats.friends.includes(selectedName))
        removeFriend(selectedName);
    else
        playerStats.friends.push(selectedName);
}

function setFriendButtonText()
{
    if (playerStats.friends.includes(selectedName))
        addFriendButton.innerText = getTranslation('removeFriendButton');
    else
        addFriendButton.innerText = getTranslation('addFriendButton');
}

function showFriendButtonIfRegistered()
{
    if (playerStats.isRegistered === false)
    {
        addFriendButton.style.display = 'none';
    }
    else
    {
        addFriendButton.style.display = 'flex';
        setFriendButtonText();
    }
}

let selectedName = "";
function openNameContextMenu(name, nameHeader)
{
    if (contextMenuChat.style.display === 'flex')
    {
        contextMenuChat.style.display = 'none';
    }
    else
    {
        if (isInTheDatabase(name) === false)
            return;
        selectedName = name;
        showFriendButtonIfRegistered();
        contextMenuChat.style.display = 'flex';
        const rect = nameHeader.getBoundingClientRect();
        contextMenuChat.style.top = (rect.bottom) + 'px';
        contextMenuChat.style.left = rect.left + 'px';
    }
}

function closeNameContextMenu()
{
    selectedName = "";
    contextMenuChat.style.display = 'none';
}

function isNotAGuest(name)
{
    return (name != getTranslation('guest'));
}

function isNotThePlayer(name)
{
    return (name != playerStats.nickname);
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
        if (isNotThePlayer(name) && isNotAGuest(name) && isInTheDatabase(name))
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
        name = "ProGamer";

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
        {
            inputElement.focus();
            return;
        }
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