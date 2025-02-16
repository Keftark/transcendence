import * as THREE from '../node_modules/.vite/deps/three.js';
import { askAddFriend, deleteFriend, getAccountUser, getIncomingFriendRequests, getOutgoingFriendRequests } from "./apiFunctions.js";
import { cheatCodes } from "./cheats.js";
import { joinDuel, refuseDuel } from "./duelPanel.js";
import { addFriend, addFriendDiv, addFriendRequest, addOutgoingFriendRequest, askBlockUser, checkAndRemoveFriend } from "./friends.js";
import { getCamera, getPlayerPosition, getRenderer, id_players, isInGame } from "./levelLocal.js";
import { openMiniProfile } from "./menu.js";
import { getPlayerName, playerStats } from "./playerManager.js";
import { getRules, resetInputfieldsRules } from "./rules.js";
import { socketRemoveFriend, socketSendFriendInvite, socketSendMessage, socketSendPrivSticker, socketSendPublicSticker, socketSendSalonSticker } from "./sockets.js";
import { getTranslation } from "./translate.js";
import { ArenaType, EmotionType } from "./variables.js";

const messagesContainer = document.getElementById('messages');
const inputElement = document.getElementById('inputChat');
const sendButton = document.getElementById('sendButton');
const chatBox = document.getElementById('chatBox');
const toggleSizeButton = document.getElementById('toggleSizeButton');
const toggleIcon = document.getElementById('toggleIcon');
const overlayChat = document.getElementById('overlayChat');
const stickersList = document.getElementById('stickers-container');
let lastSender = "";
let chatIsOpen = false;
export let chatIsFocused = false;
let selectedName = "";

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
    toggleIcon.src = 'static/icons/shrink.webp';
    if (playerStats.isRegistered)
        inputElement.focus();
    chatIsOpen = true;
    overlayChat.style.display = playerStats.isRegistered ? 'none' : 'flex';
    chatBox.classList.remove('hasNewMessage');
    checkOpenStickersList();
}

function checkOpenStickersList()
{
    if (playerStats.isRegistered)
    {
        setTimeout(() => {
            openStickersList();
        }, 200);
    }
}

function closeChat()
{
    chatIsOpen = false;
    chatBox.classList.remove('expanded');
    chatBox.classList.add('shrunk');
    toggleIcon.src = 'static/icons/chatIcon.webp';

    setTimeout(function() {
        chatBox.classList.add('hide-elements');
        overlayChat.style.display = 'none';
    }, 400);
    closeStickersList();
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
});

function messageIsACode(message)
{
    const words = message.trim().split(/\s+/);

    if (words.length > 0) {
        const firstWord = words[0].toUpperCase();
        const secondWord = words.length > 1 ? words[1] : undefined;
        const thirdWord = words.length > 2 ? words.slice(2).join(' ') : undefined;
        resetInputFieldValue();
        if (cheatCodes[firstWord])
        {
            cheatCodes[firstWord](secondWord, thirdWord);
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
const sendMessageButton = document.getElementById('sendMessageButton');
const sendStickerButton = document.getElementById('sendStickerButton');
const addFriendButton = document.getElementById('addFriendButton');
const seeProfileButton = document.getElementById('seeProfileButton');
const blockUserButton = document.getElementById('blockUserButton');

contextMenuChat.addEventListener('mouseleave', () => {
    closeNameContextMenu();
});

sendMessageButton.addEventListener('click', () => {
    sendPrivateMessage();
});

sendStickerButton.addEventListener('click', () => {
    checkOpenStickersList();
    showPrivateStickers();
});

addFriendButton.addEventListener('click', () => {
    clickAddRemoveFriend();
});

seeProfileButton.addEventListener('click', () => {
    clickOpenProfile();
});

blockUserButton.addEventListener('click', () => {
    clickBlockUser();
});

export function displayWelcomeMessage()
{
    sendSystemMessage("welcomeMessage", "");
    sendSystemMessage("typeHelp", "");
}

export function helpFunctionDisplay()
{
    receiveMessage("Help bot", getTranslation('helpBasicCommands'), false);
    receiveMessage("Help bot", getTranslation('helpInGameCommands'), false);
}

function sendPrivateMessage()
{
    if (!chatIsOpen)
        openChat();
    inputElement.value = "/msg " + selectedName + " ";
    inputElement.focus();
    closeNameContextMenu();
}

export function hideMessagesFrom(userName)
{
    Array.from(messagesContainer.children).forEach((child) => {
        if (child.hasAttribute('sender') && child.getAttribute('sender') === userName)
            child.style.display = 'none';
    });
}

export function restoreMessagesFromUser(userName)
{
    Array.from(messagesContainer.children).forEach((child) => {
        if (child.hasAttribute('sender') && child.getAttribute('sender') === userName)
            child.style.display = 'flex';
    });
}

export function clickBlockUser(playerName = "")
{
    if (playerName != "")
        selectedName = playerName;

    askBlockUser(selectedName);
    closeNameContextMenu();
}

function clickOpenProfile()
{
    // console.log("Trying to open the " + selectedName + " profile");
    openMiniProfile(selectedName);
}

export function removeFriendFunction(playerName)
{
    deleteFriend(playerName);
    sendSystemMessage("youDeletedPlayer", playerName, true);
    socketRemoveFriend(playerName);
    checkAndRemoveFriend(playerName);
}

export function askAddFriendFunction(playerName)
{
    askAddFriend(playerName)
    .then((response) => {
        // console.log("Response: " + response);
        // console.log("Status: " + response.status);
        if (response.status == 200) // requete ami
        {
            sendSystemMessage("youSendRequest", playerName, true);
            addOutgoingFriendRequest(playerName);
            socketSendFriendInvite(playerName);
        }
        else if (response.status == 201) // ajout ami
        {
            addFriend(playerName);
            // envoyer un signal a l'autre joueur pour lui dire qu'il a un nouvel ami
            // ensuite on cree le div avec addFriend()
        }
        else if (response.status == 400 && response.has_outgoing_request === true)
            sendSystemMessage("youAlreadySentRequest", playerName, true);
    })
    .catch((error) => {
        console.error("Failed to get the friendship relation:", error);
    });
}

export function addFriendFunction(playerName)
{
    sendSystemMessage("youAddedPlayer", playerName, true);
    addFriendDiv(playerName);
}

function clickAddRemoveFriend()
{

    if (isAFriend)
        removeFriendFunction(selectedName);
    else
        askAddFriendFunction(selectedName);
    closeNameContextMenu();
}

let isAFriend = false;
function setFriendButtonText()
{
    getAccountUser(selectedName)
    .then((response) => {
        // console.log(response);
        if (response.is_friend === true)
        {
            isAFriend = true;
            addFriendButton.innerText = getTranslation('removeFriendButton');
        }
        else
        {
            isAFriend = false;
            addFriendButton.innerText = getTranslation('addFriendButton');
        }
    })
    .catch((error) => {
        console.error("Failed to get the friendship relation:", error);
    });
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

export function openNameContextMenu(name, posX, posY)
{
    personToSendSticker = name;
    if (contextMenuChat.style.display === 'flex')
        contextMenuChat.style.display = 'none';
    else
    {
        selectedName = name;
        showFriendButtonIfRegistered();
        contextMenuChat.style.display = 'flex';
        contextMenuChat.style.top = parseInt(posY + 10) + 'px';
        contextMenuChat.style.left = parseInt(posX - 30) + 'px';
    }
}

function closeNameContextMenu()
{
    selectedName = "";
    contextMenuChat.style.display = 'none';
}

function isNotThePlayer(name)
{
    return (name != getPlayerName());
}

function createMessageElement(name, messageText, isPrivate, isASticker) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    if (!isPrivate && name != "" && name != lastSender)
    {
        const nameHeader = document.createElement('div');
        nameHeader.classList.add('message-name');
        nameHeader.textContent = name.length > 0 ? name + getTranslation(':') : name;
        nameHeader.style.color = playerStats.colors;
        messageContainer.appendChild(nameHeader);
        if (isNotThePlayer(name) && playerStats.isRegistered)
        {
            nameHeader.addEventListener("click", function(event) {
                openNameContextMenu(name, event.pageX, event.pageY);
              });
        }
    }
    const messageContent = document.createElement('div');
    messageContent.classList.add('message');
    if (isASticker)
    {
        messageContainer.style.color = playerStats.colors;
        messageContainer.classList.add('message-container-sticker');
    }
    if (isASticker && !isPrivate)
    {
        // console.trace("this is a sticker");
        const imgContainer = document.createElement('img');
        imgContainer.src = `static/stickers/${messageText}.webp`;
        messageContainer.appendChild(imgContainer);
    }
    else if (!isASticker)
    {
        // console.trace("this is not a sticker");
        messageContent.innerHTML = messageText;
        if (name != '')
            messageContent.style.color = playerStats.colors;
    }
    messageContainer.appendChild(messageContent);

    messageContainer.setAttribute('sender', name);

    return messageContainer;
}

function sendMessageLeft(newMessage, playerName, isASticker, stickerName = "", isPrivate = false)
{
    newMessage.classList.add('message-left');
    if (isPrivate)
        {
            if (isASticker)
            {
                newMessage.lastElementChild.innerHTML = "<b>" + getTranslation("from") + playerName + ":</b> " + newMessage.lastElementChild.textContent;
                const imgContainer = document.createElement('img');
                imgContainer.src = `static/stickers/${stickerName}.webp`;
                newMessage.lastElementChild.appendChild(imgContainer);
            }
            else
            {
                newMessage.lastElementChild.innerHTML = "<b>" + getTranslation("from") + playerName + ":</b> " + newMessage.lastElementChild.textContent;
            }
        }
    let messageContent = newMessage.querySelector('.message');
    if (messageContent === null)
        messageContent = newMessage;
    if (isPrivate)
        messageContent.classList.add('private-message-left');
    if (isASticker)
        return;
    messageContent.classList.add('message-container-left');
}

function sendMessageRight(newMessage, playerName, isASticker, stickerName = "", isPrivate = false)
{
    newMessage.classList.add('message-right');
    if (isPrivate)
    {
        if (isASticker)
        {
            newMessage.lastElementChild.innerHTML = "<b>" + getTranslation("to") + playerName + ":</b> " + newMessage.lastElementChild.textContent;
            const imgContainer = document.createElement('img');
            imgContainer.src = `static/stickers/${stickerName}.webp`;
            newMessage.lastElementChild.appendChild(imgContainer);
        }
        else
        {
            newMessage.lastElementChild.innerHTML = "<b>" + getTranslation("to") + playerName + ":</b> " + newMessage.lastElementChild.textContent;
        }
    }
    let messageContent = newMessage.querySelector('.message');
    if (messageContent === null)
        messageContent = newMessage;
    if (isPrivate)
        messageContent.classList.add('private-message-right');
    if (isASticker)
        return;
    messageContent.classList.add('message-container-right');
}

// let messageCount = 0;
// function sendRandomMessage(newMessage)
// {
//     if (messageCount % 3 === 0)
//         sendMessageRight(newMessage);
//     else if (messageCount % 3 === 1)
//         sendMessageLeft(newMessage);
//     else
//         sendMessageMiddle(newMessage);
// }

// function getPlayerNameChat()
// {
//     messageCount = Math.floor(Math.random() * 3);
//     let name = "";

//     /* Bloc a supprimer, c'est juste pour des tests */
//     if (messageCount % 3 === 0)
//     {
//         name = getPlayerName();
//     }
//     else if (messageCount % 3 === 1)
//         name = "ProGamer";

//     /*
//         Logique pour avoir le nom du joueur.
//     */

//     return name;
// }

export function sendSystemMessage(message, otherVar, forceUseOtherVar = false)
{
    const value = forceUseOtherVar ? otherVar : getTranslation('defaultValue');
    const otherValue = isNaN(otherVar) ? value : String(otherVar);
    const newMessage = createMessageElement("", getTranslation(message) + otherValue);
    newMessage.classList.add('message-middle');
    newMessage.setAttribute("key", message);
    newMessage.setAttribute("value", otherVar);
    newMessage.setAttribute("forcedValue", forceUseOtherVar);
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    lastSender = "";
}

function checkNewMessage()
{
    if (!chatIsOpen && playerStats.isRegistered)
        chatBox.classList.add('hasNewMessage');
}

function appendMessage(message)
{
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

export function receiveMessage(playerName, message, isASticker, isPrivate = false, toPlayer = "")
{
    const newMessage = createMessageElement(playerName, message, isPrivate, isASticker);
    if (playerName === playerStats.nickname)
    {
        if (toPlayer === "")
            sendMessageRight(newMessage, playerName, isASticker, message, isPrivate);
        else
            sendMessageRight(newMessage, toPlayer, isASticker, message, isPrivate);
    }
    else
        sendMessageLeft(newMessage, playerName, isASticker, message, isPrivate);
    lastSender = playerName;
    if (playerName === "Help bot")
    {
        appendMessage(newMessage);
        return;
    }
    else if (playerName != playerStats.nickname)
    {
        getAccountUser(playerName)
        .then((response) => {
            if (response.is_blocked)
                newMessage.style.display = 'none';
            else
                checkNewMessage();
            appendMessage(newMessage);
        })
        .catch((error) => {
            console.error("Failed to get the friendship relation:", error);
        });
    }
    else
    {
        appendMessage(newMessage);
    }
}

/* 
    Les messages systemes seront envoyes avec sendSystemMessage()
*/
function trySendMessage(isASticker = false) {
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

        // let playerName = getPlayerNameChat();
        socketSendMessage(truncatedMessage);
        receiveMessage(playerStats.nickname, truncatedMessage, isASticker);
    }
    inputElement.value = '';
    inputElement.focus();
}

export function getDuelInvitContent()
{
    const rules = getRules();
    const maxTimeText = rules.maxTime === 0 ? getTranslation('noMaxTime') : getTranslation('rulesTimerText') + " " + rules.maxTime;
    return getTranslation('sendsInvitationDuel') + "\n\n" +
    getTranslation('rulesHeaderText') + "\n" + 
    getTranslation('rulesPointsText') + " " + rules.pointsToWin + "\n" +
    getTranslation('rulesArenaText') + " " + ArenaType[rules.arena] + "\n" +
    maxTimeText;
}

let divDuel = null;
export function createInvitationDuel(sender, id = "")
{
    checkNewMessage();
    const newMessage = document.createElement('div');
    divDuel = newMessage;
    newMessage.setAttribute('sender', sender);
    newMessage.classList.add('joinDuelInChat');
    const invitationText = document.createElement('div');
    invitationText.classList.add('textJoinDuel');
    invitationText.textContent = sender + getDuelInvitContent();
    invitationText.style.color = playerStats.colors;
    newMessage.appendChild(invitationText);

    const invitationParentButton = document.createElement('div');
    invitationParentButton.classList.add('buttonJoinDuelParent');
    newMessage.appendChild(invitationParentButton);

    const invitationButton = document.createElement('div');
    invitationButton.classList.add('buttonJoinDuel');
    invitationButton.classList.add('buttonJoinDuelText');
    invitationButton.textContent = getTranslation('join');
    invitationButton.style.color = playerStats.colors;
    invitationButton.addEventListener('click', () => {
        joinDuel(id);
    });
    invitationParentButton.appendChild(invitationButton);
    const invitationCancelButton = document.createElement('div');
    invitationCancelButton.classList.add('buttonCancelDuel');
    invitationCancelButton.classList.add('buttonJoinDuelText');
    invitationCancelButton.textContent = getTranslation('refuse');
    invitationCancelButton.style.color = playerStats.colors;
    invitationCancelButton.addEventListener('click', () => {
        refuseDuel(id);
    });
    invitationParentButton.appendChild(invitationCancelButton);
    if (isInGame || sender === playerStats.nickname) // getDuelTargetPlayer() != playerStats.nickname
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
    if (divDuel === null)
        return;
    const newArray = listDuelsInChat.filter(element => element !== divDuel);
    listDuelsInChat = newArray;
    divDuel.remove();
    divDuel = null;
}

export function checkAccessToChat()
{
    const regis = playerStats.isRegistered;
    inputElement.disabled = !regis;
    overlayChat.style.display = regis || !chatIsOpen ? 'none' : 'flex';
    if (regis)
    {
        getIncomingFriendRequests()
        .then((response) => {
            for (let i = 0; i < response.length; i++) {
                const username = response[i].username; // Get the username of each object
                addFriendRequest(username);
              }
        })
        .catch((error) => {
            console.error("Failed to get the friendship relation:", error);
        });
        getOutgoingFriendRequests()
        .then((response) => {
            for (let i = 0; i < response.length; i++) {
                const username = response[i].username; // Get the username of each object
                addOutgoingFriendRequest(username);
              }
        })
        .catch((error) => {
            console.error("Failed to get the friendship relation:", error);
        });
    }
    if (regis && chatIsOpen)
        openStickersList();
    else
        closeStickersList();
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
            inputElement.value = '';
        }
    }
}

function openStickersList()
{
    let delay = 0;
    Array.from(stickersList.children).forEach((child) => {
        setTimeout(() => {
            child.classList.add('growth');
        }, delay);
        delay += 50;
    });
}

function closeStickersList()
{
    let delay = 0;
    Array.from(stickersList.children).forEach((child) => {
        setTimeout(() => {
            child.classList.remove('growth');
        }, delay);
        delay += 40;
    });
}

inputElement.addEventListener('focus', () => {
    chatIsFocused = true;
    inputElement.addEventListener('keydown', handleKeyDownHistory);
});

inputElement.addEventListener('blur', () => {
    chatIsFocused = false;
    inputElement.removeEventListener('keydown', handleKeyDownHistory);
});

export function sendPubSticker(stickerName)
{
    receiveMessage(playerStats.nickname, stickerName, true);
    socketSendPublicSticker(stickerName);
}

export function sendPrivateSticker(stickerName)
{
    receiveMessage(playerStats.nickname, stickerName, true, true, personToSendSticker);
    socketSendPrivSticker(personToSendSticker, stickerName);
    stickersList.classList.remove('centerClass');
    personToSendSticker = null;
}

let personToSendSticker = null;
function addStickersFunctions()
{
    Array.from(stickersList.children).forEach((child) => {
        child.addEventListener('click', function() {
            if (stickersList.classList.contains('centerClass'))
                sendPrivateSticker(child.getAttribute('data-name'));
            else
                sendPubSticker(child.getAttribute('data-name'));
        });
    });    
}

let gameStickers = null;
export function addGameStickers()
{
    if (gameStickers != null)
        return;
    gameStickers = stickersList.cloneNode(true);
    stickersList.parentElement.appendChild(gameStickers);
    gameStickers.classList.remove('centerClass');
    gameStickers.classList.add('centerGameClass');
    gameStickers.style.display = "flex";
    Array.from(gameStickers.children).forEach((child) => {
        child.classList.add('growth');
        child.addEventListener('click', function() {
            sendGameSticker(child.getAttribute('data-name'));
        });
    });     
}

function sendGameSticker(stickerName)
{
    receiveGameSticker(playerStats.id, stickerName);
    socketSendSalonSticker(stickerName);
}

function convert3DTo2DScreenSpace(threejsPosition, camera, renderer) {
    if (!(threejsPosition instanceof THREE.Vector3)) {
        throw new Error('The position must be an instance of THREE.Vector3');
    }
    const width = renderer.domElement.width;
    let vector = threejsPosition.clone().project(camera);
    if (vector.x < 0)
        vector.x -= 0.05;
    const height = renderer.domElement.height;
    const x = (vector.x * 0.5 + 0.5) * width;
    const y = (0.5 - vector.y * 0.5) * height;

    return { x, y };
}

export function receiveGameSticker(playerId, stickerName)
{
    let stickerPosition;
    if (id_players[0] === playerId)
        stickerPosition = convert3DTo2DScreenSpace(getPlayerPosition(1), getCamera(), getRenderer());
    else if (id_players[1] === playerId)
        stickerPosition = convert3DTo2DScreenSpace(getPlayerPosition(2), getCamera(), getRenderer());
    else if (id_players[2] === playerId)
        stickerPosition = convert3DTo2DScreenSpace(getPlayerPosition(3), getCamera(), getRenderer());
    else if (id_players[3] === playerId)
        stickerPosition = convert3DTo2DScreenSpace(getPlayerPosition(4), getCamera(), getRenderer());
    const imgDiv = document.createElement('img');
    imgDiv.src = `static/stickers/${stickerName}.webp`;
    imgDiv.classList.add('sticker-disappear');
    imgDiv.addEventListener('animationend', () => {
        imgDiv.remove();
    });
    let finalPosX = stickerPosition.x - imgDiv.offsetWidth / 2;
    if (finalPosX < 0)
        finalPosX = 0;
    else if (finalPosX > window.innerWidth - 30)
        finalPosX = window.innerWidth - 50;
    imgDiv.style.left = `${finalPosX}px`;
    imgDiv.style.top = `${stickerPosition.y - imgDiv.offsetHeight / 2}px`;
    document.body.appendChild(imgDiv);
}

stickersList.addEventListener('click', function() {
    if (stickersList.classList.contains('centerClass'))
        stickersList.style.display = 'none';
});

export function removeGameStickers()
{
    if (gameStickers === null)
        return;
    gameStickers.remove();
    gameStickers = null;
}

function showPrivateStickers()
{
    stickersList.classList.add('centerClass');
}

function changeGlowColor(newColor)
{
    document.documentElement.style.setProperty('--glow-color', newColor);
}

export function callGameDialog(gameDialog, emotionType)
{
    switch (emotionType)
    {
        case EmotionType.NORMAL:
            changeGlowColor('#00ffff');
            break;
        case EmotionType.FEAR:
            changeGlowColor('#7777bb');
            break;
        case EmotionType.ANGER:
            changeGlowColor('#ff0000');
            break;
        case EmotionType.SAD:
            changeGlowColor('#008850');
            break;
        case EmotionType.LOVE:
            changeGlowColor('#ff20ff');
            break;
    }
    document.getElementById('dialogText').innerHTML = getTranslation(gameDialog);
    document.getElementById('dialogDiv').classList.add('appear');
    setTimeout(() => {
        document.getElementById('dialogDiv').classList.remove('appear');
    }, 4000);
}

addStickersFunctions();