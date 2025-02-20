import { blockUserRequest, deleteFriend, getAccountUser, getAllUserStatuses, getBlockedList, getFriendsList, getUserStatus, unblockUserRequest } from "./apiFunctions.js";
import { askAddFriendFunction, hideMessagesFrom, openNameContextMenu, restoreMessagesFromUser, sendSystemMessage } from "./chat.js";
import { playerStats } from "./playerManager.js";
import { socketRemoveFriend, socketSendFriendAccept, socketSendFriendCancel, socketSendFriendRefuse } from "./sockets.js";
import { getTranslation } from "./translate.js";

const friendsBox = document.getElementById('friendsBox');
const toggleIconFriends = document.getElementById('toggleIconFriends');
const friendsHeaderButton = document.getElementById('friendsHeader');
const friendsList = document.getElementById('friendsList');
const blockedList = document.getElementById('blockedList');
const askBlockUserDiv = document.getElementById('askBlockUserDiv');
const askBlockUserText = document.getElementById('askBlockUserText');
let blockingUser = null;

let isShowingFriends = true;

document.getElementById('buttonAcceptBlockUser').addEventListener('click', () =>
{
    blockUser(blockingUser);
    closeAskBlockUserPanel();
});
document.getElementById('buttonCancelBlockUser').addEventListener('click', () =>
{
    closeAskBlockUserPanel();
});

friendsHeaderButton.addEventListener('click', () =>
{
    isShowingFriends = !isShowingFriends;
    if (isShowingFriends)
        showFriends();
    else
        showBlocked();
});

let loopFunction = null;

function closeAskBlockUserPanel()
{
    blockingUser = null;
    askBlockUserDiv.classList.remove("appearing");
    setTimeout(() => {
        askBlockUserDiv.style.display = 'none';
    }, 100);
}

 // should be friends and not all users! 
 // if each player checks all users if the game is big, it will be costly!
function checkStatusFriends()
{
    getAllUserStatuses()
    .then((data) => {
        for (const child of friendsList.children) {
            const name = child.getAttribute('name');
            const user = data.statuses.find(user => user.user__username === name)
            if (user)
            {
                setPlayerStatusImg(user.status, child.lastChild);
            }
          }
    })
    .catch((error) => {
        console.error("Failed to get user statuses:", error);
    });
}

export function showFriendsBox(isTrue)
{
    friendsBox.style.display = isTrue ? 'flex' : 'none'; 
}

function startCheckingFriendsStatuses()
{
    if (loopFunction === null)
    {
        checkStatusFriends();
        loopFunction = setInterval(checkStatusFriends, 3000);
    }
}

function stopCheckingFriendsStatuses()
{
    if (loopFunction != null)
    {
        clearInterval(loopFunction);
        loopFunction = null;
    }
}

function showFriends()
{
    startCheckingFriendsStatuses();
    friendsHeaderButton.innerText = getTranslation('friendsHeader');
    blockedList.style.display = 'none';
    friendsList.style.display = 'flex';
}

function showBlocked()
{
    stopCheckingFriendsStatuses();
    friendsHeaderButton.innerText = getTranslation('blocked');
    friendsList.style.display = 'none';
    blockedList.style.display = 'flex';
}

function openFriends()
{
    startCheckingFriendsStatuses();
    friendsBox.classList.remove('shrunk');
    friendsBox.classList.remove('hide-elements');
    friendsBox.classList.add('expanded');
    toggleIconFriends.src = 'static/icons/shrink.webp';
}

function closeFriends()
{
    stopCheckingFriendsStatuses();
    friendsBox.classList.remove('expanded');
    friendsBox.classList.add('shrunk');
    toggleIconFriends.src = 'static/icons/friendsIcon.webp';

    setTimeout(function() {
        friendsBox.classList.add('hide-elements');
        // showFriends();
        // isShowingFriends = true;
    }, 400);
}

document.getElementById('toggleSizeButtonFriends').addEventListener('click', function() {
    if (friendsBox.classList.contains('expanded')) {
        closeFriends();
    } else {
        openFriends();
    }
});

function addOffline(object)
{
    object.classList.remove('statusBusy');
    if (!object.classList.contains('statusOffline'))
        object.classList.add('statusOffline');
}

function addBusy(object)
{
    object.classList.remove('statusOffline');
    if (!object.classList.contains('statusBusy'))
        object.classList.add('statusBusy');
}

function friendIsOnline(object)
{
    object.classList.remove('statusOffline');
    object.classList.remove('statusBusy');
}

export function checkAndRemoveFriend(userName)
{
    const childToRemove = friendsList.querySelector(`[name="${userName}"]`);
    if (childToRemove)
        childToRemove.remove();
}

export function removeBlockedUser(userName)
{
    const index = playerStats.blacklist.indexOf(userName);
    playerStats.blacklist.splice(index, 1);
    restoreMessagesFromUser(userName);
    const childToRemove = blockedList.querySelector(`[name="${userName}"]`);
    if (childToRemove)
    {
        childToRemove.remove();
        sendSystemMessage("youUnblockedPlayer", userName, true);
    }
}

export function addBlockedUserDiv(userName)
{
    const newDiv = document.createElement('div');
    newDiv.setAttribute('name', userName);
    newDiv.classList.add('friendDiv');
    const nameHeader = document.createElement('h3');
    nameHeader.textContent = userName;
    nameHeader.style.color = playerStats.colors;
    newDiv.appendChild(nameHeader);

    const removeButton = document.createElement('div');
    removeButton.classList.add('removeBlockedButton');
    removeButton.addEventListener('click', () => {
        unblockUser(userName);
    });
    newDiv.appendChild(removeButton);

    blockedList.appendChild(newDiv);
}

function setPlayerStatusImg(status, divStatus)
{
    if (status === "offline")
        addOffline(divStatus);
    else if (status === "online")
        friendIsOnline(divStatus);
    else if (status === "busy")
        addBusy(divStatus);
}

// check avant si le joueur existe dans la bdd. si non, on n'ajoute rien
export function addFriendDiv(userName)
{
    const newDiv = document.createElement('div');
    newDiv.addEventListener('click', function(event) {
        openNameContextMenu(userName, event.pageX, event.pageY);
    });
    newDiv.setAttribute('name', userName);
    newDiv.classList.add('friendDiv');
    const nameHeader = document.createElement('h3');
    nameHeader.textContent = userName;
    nameHeader.style.color = playerStats.colors;
    newDiv.appendChild(nameHeader);
    const imgStatus = document.createElement('img');
    imgStatus.src = 'static/icons/statusPlayer.webp'
    imgStatus.classList.add('friendStatus');
    newDiv.appendChild(imgStatus);
    friendsList.appendChild(newDiv);
    getUserStatus(userName)
    .then((data) =>
    {
        setPlayerStatusImg(data.status, imgStatus);
    })
}

function acceptFriend(friendDiv, playerName)
{
    askAddFriendFunction(playerName);
    socketSendFriendAccept(playerName);
    // on envoie l'acceptation a l'autre joueur
    friendDiv.remove();
}

function refuseFriend(friendDiv, userName)
{
    socketSendFriendRefuse(friendDiv.getAttribute('name'));
    deleteFriend(userName);
    friendDiv.remove();
}

function cancelRequestFriend(friendDiv, userName)
{
    friendDiv.remove();
    deleteFriend(userName);
    socketSendFriendCancel(userName);
}

export function addOutgoingFriendRequest(toUserName)
{
    const newDiv = document.createElement('div');
    newDiv.setAttribute('name', toUserName);
    newDiv.classList.add('friendDiv');
    newDiv.classList.add('outgoingFriendDiv');
    const nameHeader = document.createElement('h3');
    nameHeader.textContent = getTranslation('requestSent') + toUserName;
    nameHeader.style.color = playerStats.colors;
    newDiv.appendChild(nameHeader);
    const buttonRefuse = document.createElement('button');
    buttonRefuse.classList.add('friendRequestButton');
    const redCrossImg = document.createElement('img');
    redCrossImg.src = '../static/icons/realRedCross.webp';
    redCrossImg.classList.add('redCrossButtonImg');
    buttonRefuse.appendChild(redCrossImg);
    buttonRefuse.addEventListener('click', function() {
        cancelRequestFriend(newDiv, toUserName);
    });
    newDiv.appendChild(buttonRefuse);
    friendsList.insertBefore(newDiv, friendsList.firstChild);
}

export function addFriendRequest(fromUserName)
{
    const newDiv = document.createElement('div');
    newDiv.setAttribute('name', fromUserName);
    newDiv.classList.add('friendDiv');
    newDiv.classList.add('askFriendDiv');
    const nameHeader = document.createElement('h3');
    nameHeader.textContent = fromUserName + getTranslation('wantsfriend');
    nameHeader.style.color = playerStats.colors;
    newDiv.appendChild(nameHeader);
    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('friendRequestButtonsDiv');
    const buttonAccept = document.createElement('button');
    buttonAccept.classList.add('friendRequestButton');
    const acceptImg = document.createElement('img');
    acceptImg.src = '../static/icons/accept.webp';
    acceptImg.classList.add('redCrossButtonImg');
    buttonAccept.appendChild(acceptImg);
    buttonAccept.addEventListener('click', function() {
        acceptFriend(newDiv, fromUserName);
    });
    buttonsDiv.appendChild(buttonAccept);
    const buttonRefuse = document.createElement('button');
    buttonRefuse.classList.add('friendRequestButton');
    const redCrossImg = document.createElement('img');
    redCrossImg.src = '../static/icons/realRedCross.webp';
    redCrossImg.classList.add('redCrossButtonImg');
    buttonRefuse.appendChild(redCrossImg);
    buttonRefuse.addEventListener('click', function() {
        refuseFriend(newDiv, fromUserName);
    });
    buttonsDiv.appendChild(buttonRefuse);
    newDiv.appendChild(buttonsDiv);
    friendsList.insertBefore(newDiv, friendsList.firstChild);
}

// export function addBlocked(userName)
// {
//     const newDiv = document.createElement('div');
//     newDiv.addEventListener('click', function(event) {
//         openNameContextMenu(userName, event.pageX, event.pageY);
//     });
//     newDiv.setAttribute('name', userName);
//     newDiv.classList.add('friendDiv');
//     const nameHeader = document.createElement('h3');
//     nameHeader.textContent = userName;
//     nameHeader.style.color = playerStats.colors;
//     newDiv.appendChild(nameHeader);
//     blockedList.appendChild(newDiv);
// }

export function loadFriends()
{
    return new Promise((resolve, reject) => {
        getFriendsList()
            .then(list => {
                list.forEach(element => {
                    addFriendDiv(element.username);
                });
                resolve();
            })
            .catch(error => {
                console.error("Error fetching friends list:", error);
                reject(error);
            });
    });
}

export function loadBlocks()
{
    return new Promise((resolve, reject) => {
        getBlockedList()
            .then(list => {
                list.forEach(element => {
                    addBlockedUserDiv(element.username);
                });
                resolve();
            })
            .catch(error => {
                console.error("Error fetching friends list:", error);
                reject(error);
            });
    });
}

export function deleteAllFriendRequests()
{
    while (friendsList.firstChild)
        friendsList.removeChild(friendsList.firstChild);
    while (blockedList.firstChild)
        blockedList.removeChild(blockedList.firstChild);
}

export function addFriend(playerName)
{
    addFriendDiv(playerName);
    sendSystemMessage("youAddedPlayer", playerName, true);
}

export function askBlockUser(playerName)
{
    blockingUser = playerName;
    askBlockUserText.innerText = getTranslation("askBlockUserText") + playerName + getTranslation("?");
    askBlockUserDiv.classList.add("appearing");
    askBlockUserDiv.style.display = 'flex';
}

export function blockUser(playerName)
{
    let is_friend = false;
    getAccountUser(playerName)
    .then((response) => {
        is_friend = response.is_friend;
    })
    .catch((error) => {
        console.error("Failed to get the friendship relation:", error);
    });
    blockUserRequest(playerName)
    .then((response) => {
        if (response.status === 201) // ajout blocked
        {
            sendSystemMessage("youBlockedPlayer", playerName, true);
            hideMessagesFrom(playerName);
            addBlockedUserDiv(playerName);
            if (is_friend)
                socketRemoveFriend(playerName);
        }
        else if (response.status == 409)
            sendSystemMessage("youAlreadyBlocked", playerName, true);
    })
    .catch((error) => {
        console.error("Failed to get the friendship relation:", error);
    });
}

export function unblockUser(playerName)
{
    unblockUserRequest(playerName)
    .then((response) => {
        if (response.status === 200) // unblocked
        {
            removeBlockedUser(playerName);
        }
    })
    .catch((error) => {
        console.error("Failed to get the friendship relation:", error);
    });
}

closeFriends();