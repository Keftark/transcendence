import { cheatCodes } from "./cheats.js";
import { isInTheDatabase, searchDatabase } from "./database.js";
import { getDuelTargetPlayer, joinDuel } from "./duelPanel.js";
import { isInGame } from "./levelLocal.js";
import { openProfile } from "./menu.js";
import { getPlayerName, playerStats } from "./playerManager.js";
import { getRules, resetInputfieldsRules } from "./rules.js";
import { getTranslation } from "./translate.js";
import { ArenaType, LevelMode } from "./variables.js";

const messagesContainer = document.getElementById('messages');
const inputElement = document.getElementById('inputChat');
const sendButton = document.getElementById('sendButton');
const chatBox = document.getElementById('chatBox');
const toggleSizeButton = document.getElementById('toggleSizeButton');
const toggleIcon = document.getElementById('toggleIcon');
const overlayChat = document.getElementById('overlayChat');
let lastSender = "";
let chatIsOpen = true;
export let chatIsFocused = false;

let listDuelsInChat = [];
let chatHistory = [];
let historyIndex = -1;

function resetInputFieldValue()
{
    inputElement.value = '';
    resetInputfieldsRules();
}

window.onload = function() {
    resetInputFieldValue();
};

export function isChatOpen() {return chatIsOpen && document.activeElement === inputElement};

function openChat()
{
    chatBox.classList.remove('shrunk');
    chatBox.classList.remove('hide-elements');
    chatBox.classList.add('expanded');
    toggleIcon.src = 'static/icons/shrink.png';
    inputElement.focus();
    chatIsOpen = true;
    overlayChat.style.display = playerStats.isRegistered ? 'none' : 'flex';
}

function closeChat()
{
    chatIsOpen = false;
    chatBox.classList.remove('expanded');
    chatBox.classList.add('shrunk');
    toggleIcon.src = 'static/icons/grow.png';

    setTimeout(function() {
        chatBox.classList.add('hide-elements');
        overlayChat.style.display = 'none';
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
        if (playerStats.isRegistered)
        {
            openChat();
            inputElement.value = '/';
        }
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
    // if (getLevelState() === LevelMode.MENU || getLevelState() === LevelMode.MODESELECTION)
    //     return false;
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
    return (name != getPlayerName());
}

function createMessageElement(name, messageText) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    if (name != lastSender)
    {
        const nameHeader = document.createElement('div');
        nameHeader.classList.add('message-name');
        nameHeader.textContent = name.length > 0 ? name + getTranslation(':') : name;
        nameHeader.style.color = playerStats.colors;
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
    if (name != '')
        messageContent.style.color = playerStats.colors;
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

function getPlayerNameChat()
{
    messageCount = Math.floor(Math.random() * 3);
    let name = "";

    /* Bloc a supprimer, c'est juste pour des tests */
    if (messageCount % 3 === 0)
    {
        name = getPlayerName();
    }
    else if (messageCount % 3 === 1)
        name = "ProGamer";

    /*
        Logique pour avoir le nom du joueur.
    */

    return name;
}

export function sendSystemMessage(message, otherVar)
{
    let otherValue = isNaN(otherVar) ? 'its default value' : String(otherVar);
    const newMessage = createMessageElement("", getTranslation(message) + otherValue);
    newMessage.classList.add('message-middle');
    newMessage.setAttribute("key", message);
    newMessage.setAttribute("value", otherVar);
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
        if (messageText != chatHistory[chatHistory.length - 1])
            chatHistory.push(messageText);
        historyIndex = -1;
        if (messageIsACode(messageText))
        {
            inputElement.focus();
            return;
        }
        const truncatedMessage = messageText.split(' ').map(word => {
            return word.length > 30 ? word.substring(0, 30) + '...' : word;
        }).join(' ');

        let playerName = getPlayerNameChat();
        const newMessage = createMessageElement(playerName, truncatedMessage);
        sendRandomMessage(newMessage);
        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        lastSender = playerName;
    }
    inputElement.value = '';
    inputElement.focus();
}

export function getDuelInvitContent()
{
    const rules = getRules();
    return getPlayerName() + getTranslation('sendsInvitationDuel') + "\n\n" +
    getTranslation('rulesHeaderText') + "\n" + 
    getTranslation('rulesPointsText') + " " + rules.pointsToWin + "\n" +
    getTranslation('rulesArenaText') + " " + ArenaType[rules.arena] + "\n" +
    getTranslation('rulesTimerText') + " " + rules.maxTime;
}

let divDuel;
export function sendInvitationDuel(sender)
{
    if (getDuelTargetPlayer() != "" && getDuelTargetPlayer() != playerStats.nickname.toUpperCase())
        return;
    const newMessage = document.createElement('div');
    divDuel = newMessage;
    newMessage.setAttribute('sender', sender);
    newMessage.classList.add('joinDuelInChat');
    const invitationText = document.createElement('div');
    invitationText.classList.add('textJoinDuel');
    invitationText.textContent = getDuelInvitContent();
    invitationText.style.color = playerStats.colors;
    newMessage.appendChild(invitationText);
    const invitationButton = document.createElement('div');
    invitationButton.classList.add('buttonJoinDuel');
    invitationButton.classList.add('buttonJoinDuelText');
    invitationButton.textContent = getTranslation('join');
    invitationButton.style.color = playerStats.colors;
    invitationButton.addEventListener('click', () => {
        joinDuel();
      });
    // ajouter la fonction pour rejoindre un duel fait par la personne
    // le bouton ne sera pas clicable par l'envoyeur
    newMessage.appendChild(invitationButton);
    if (isInGame || getDuelTargetPlayer() != playerStats.nickname)
    {
        const overlay = document.createElement('div');
        overlay.classList.add('overlayMessage');
        newMessage.appendChild(overlay);
    }
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    listDuelsInChat.push(newMessage);
}

export function setAccessAllDuelsInChat(access)
{
    for (let i = 0; i < listDuelsInChat.length; i++)
    {
        if (access === true)
        {
            if (listDuelsInChat[i].getAttribute('sender') != playerStats.nickname)
                listDuelsInChat[i].classList.remove('overlayMessage');
        }
        else
            listDuelsInChat[i].classList.add('overlayMessage');
    }
}

export function deleteDuelInChat()
{
    if (divDuel != null)
    {
        const newArray = listDuelsInChat.filter(element => element !== divDuel);
        listDuelsInChat = newArray;
        divDuel.remove();
        divDuel = null;
    }
}

export function checkAccessToChat()
{
    inputElement.disabled = !playerStats.isRegistered;
    overlayChat.style.display = playerStats.isRegistered ? 'none' : 'flex';
}

function handleKeyDownHistory(event)
{
    if (event.key === 'ArrowUp')
    {
        event.preventDefault();
        if (historyIndex < chatHistory.length - 1) {
            historyIndex++;
            inputElement.value = chatHistory[chatHistory.length - 1 - historyIndex];
        }
    }
    else if (event.key === 'ArrowDown')
    {
        event.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            inputElement.value = chatHistory[chatHistory.length - 1 - historyIndex];
        } else if (historyIndex === 0) {
            historyIndex = -1;
            inputElement.value = ''; // Clear input if no further history
        }
    }
}

// Add event listener when input is focused
inputElement.addEventListener('focus', () => {
    chatIsFocused = true;
    inputElement.addEventListener('keydown', handleKeyDownHistory);
});

// Remove event listener when input is blurred (loses focus)
inputElement.addEventListener('blur', () => {
    chatIsFocused = false;
    inputElement.removeEventListener('keydown', handleKeyDownHistory);
});