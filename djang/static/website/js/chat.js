import { askAddFriend, blockUserRequest, deleteFriend, getAccountUser, getIncomingFriendRequests, getOutgoingFriendRequests } from "./apiFunctions.js";
import { cheatCodes } from "./cheats.js";
import { getDuelTargetPlayer, joinDuel } from "./duelPanel.js";
import { addBlockedUserDiv, addFriend, addFriendDiv, addFriendRequest, addOutgoingFriendRequest, blockUser, checkAndRemoveFriend } from "./friends.js";
import { getPlayerPosition, id_players, isInGame } from "./levelLocal.js";
import { openMiniProfile } from "./menu.js";
import { getPlayerName, playerStats } from "./playerManager.js";
import { getRules, resetInputfieldsRules } from "./rules.js";
import { socketSendMessage, socketSendPrivSticker, socketSendPublicSticker, socketSendSalonSticker } from "./sockets.js";
import { getTranslation } from "./translate.js";
import { ArenaType } from "./variables.js";

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
    // chatBox.classList.add('expanded');
    // closeChat();
});

function messageIsACode(message)
{
    // if (getLevelState() === LevelMode.MENU || getLevelState() === LevelMode.MODESELECTION)
    //     return false;
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

    blockUser(selectedName);
    closeNameContextMenu();
}

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
    console.log("Trying to open the " + selectedName + " profile");
    openMiniProfile(selectedName);
}

export function removeFriendFunction(playerName)
{
    deleteFriend(playerName);
    sendSystemMessage("youDeletedPlayer", playerName, true);
    checkAndRemoveFriend(playerName);
}

export function askAddFriendFunction(playerName)
{
    askAddFriend(playerName)
    .then((response) => {
        console.log("Response: " + response);
        console.log("Status: " + response.status);
        if (response.status == 200) // requete ami
        {
            sendSystemMessage("youSendRequest", playerName, true);
            addOutgoingFriendRequest(playerName);
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
        messageContent.textContent = messageText;
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

function sendMessageMiddle(newMessage)
{
    newMessage.classList.add('message-middle');
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

export function receiveMessage(playerName, message, isASticker, isPrivate = false, toPlayer = "")
{
    // console.log("Receiving message from: " + playerName + ": " + message + ". Sticker: " + isASticker + ". Private: " + isPrivate + ". To player: " + toPlayer);
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
    messagesContainer.appendChild(newMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    lastSender = playerName;
    checkNewMessage();
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
    // le bouton ne sera pas cliquable par l'envoyeur
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
    socketSendSalonSticker(stickerName);
}

function convert3DTo2DScreenSpace(threejsPosition, camera, renderer) {
    // Ensure the position is a THREE.Vector3 object (or convert it)
    if (!(threejsPosition instanceof THREE.Vector3)) {
        throw new Error('The position must be an instance of THREE.Vector3');
    }

    // Project the 3D world position to normalized device coordinates (NDC)
    const vector = threejsPosition.clone().project(camera);

    // Get the screen width and height
    const width = renderer.domElement.width;
    const height = renderer.domElement.height;

    // Convert from NDC to screen space coordinates (in pixels)
    const x = (vector.x * 0.5 + 0.5) * width;  // Convert to 0 to 1 range, then scale to pixel width
    const y = -(vector.y * 0.5 + 0.5) * height; // Invert Y, then scale to pixel height

    return { x, y };
}


export function receiveGameSticker(playerId, stickerName)
{
    console.log("receiving: " + stickerName + " from: " + playerId);
    let stickerPosition;
    if (id_players.p1 === playerStats.id) // le joueur est a gauche
        stickerPosition = convert3DTo2DScreenSpace(getPlayerPosition(1));
    else if (id_players.p2 === playerStats.id) // le joueur est a droite
        stickerPosition = convert3DTo2DScreenSpace(getPlayerPosition(2));
    const imgDiv = document.createElement('img');
    imgDiv.src = `static/stickers/${stickerName}.webp`;
    imgDiv.style.position = 'absolute';
    imgDiv.style.pointerEvents = 'none';
    imgDiv.style.width = '32px';
    imgDiv.style.height = '32px';
    imgDiv.style.left = `${stickerPosition.x - imgDiv.offsetWidth / 2}px`;
    imgDiv.style.top = `${stickerPosition.y - imgDiv.offsetHeight / 2}px`;
    document.body.appendChild(imgDiv);
}

document.getElementById('stickers-container').addEventListener('click', function() {
    document.getElementById('stickers-container').style.display = 'none';
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

// export function addStickersGame()
// {
//     stickersList.classList.remove('centerClass');
//     stickersList.classList.add('centerGameClass');
// }

addStickersFunctions();