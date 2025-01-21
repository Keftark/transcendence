import { getBlockedList, getFriendsList } from "./apiFunctions.js";
import { openNameContextMenu, removeFriendFunction, restoreMessagesFromUser, sendSystemMessage } from "./chat.js";
import { playerStats } from "./playerManager.js";
import { getTranslation } from "./translate.js";

const friendsBox = document.getElementById('friendsBox');
const toggleIconFriends = document.getElementById('toggleIconFriends');
const friendsHeaderButton = document.getElementById('friendsHeader');
const friendsList = document.getElementById('friendsList');
const blockedList = document.getElementById('blockedList');

let isShowingFriends = true;


friendsHeaderButton.addEventListener('click', function() {
    isShowingFriends = !isShowingFriends;
    if (isShowingFriends)
        showFriends();
    else
        showBlocked();
});

export function showFriendsBox(isTrue)
{
    friendsBox.style.display = isTrue ? 'flex' : 'none'; 
}

function showFriends()
{
    friendsHeaderButton.innerText = getTranslation('friendsHeader');
    blockedList.style.display = 'none';
    friendsList.style.display = 'flex';
}

function showBlocked()
{
    friendsHeaderButton.innerText = getTranslation('blocked');
    friendsList.style.display = 'none';
    blockedList.style.display = 'flex';
}

function openFriends()
{
    friendsBox.classList.remove('shrunk');
    friendsBox.classList.remove('hide-elements');
    friendsBox.classList.add('expanded');
    toggleIconFriends.src = 'static/icons/shrink.webp';
}

function closeFriends()
{
    friendsBox.classList.remove('expanded');
    friendsBox.classList.add('shrunk');
    toggleIconFriends.src = 'static/icons/friendsIcon.webp';

    setTimeout(function() {
        friendsBox.classList.add('hide-elements');
        showFriends();
        isShowingFriends = true;
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

export function addBlockedUser(userName)
{
    console.log(userName);
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
        removeBlockedUser(userName);
    });
    newDiv.appendChild(removeButton);

    blockedList.appendChild(newDiv);
    removeFriendFunction(userName);
}

function getPlayerStatus(userName)
{
    // on check dans la base de donnees le status du joueur et on retourne 0, 1, 2
    return (0);
}

function setPlayerStatusImg(statusNbr, divStatus)
{
    if (statusNbr === 0)
        addOffline(divStatus);
    else if (statusNbr === 1)
        friendIsOnline(divStatus);
    else if (statusNbr === 2)
        addOffline(divStatus);
}

// check avant si le joueur existe dans la bdd. si non, on n'ajoute rien
export function addFriend(userName)
{
    const newDiv = document.createElement('div');
    newDiv.addEventListener('click', function() {
        openNameContextMenu(userName, newDiv);
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
    let playerStatus = getPlayerStatus();
    setPlayerStatusImg(playerStatus, imgStatus);
    newDiv.appendChild(imgStatus);
    friendsList.appendChild(newDiv);
}

function acceptFriend(friendDiv)
{
    // on enleve la demande dans la bdd
    // on ajoute l'ami dans la bdd
    friendDiv.remove();
}

function refuseFriend(friendDiv)
{
    // on enleve la demande dans la bdd
    friendDiv.remove();
}

export function addFriendRequest(userName)
{
    const newDiv = document.createElement('div');
    newDiv.setAttribute('name', userName);
    newDiv.classList.add('friendDiv');
    newDiv.classList.add('askFriendDiv');
    const nameHeader = document.createElement('h3');
    nameHeader.textContent = userName + getTranslation('wantsfriend');
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
        acceptFriend(newDiv);
    });
    buttonsDiv.appendChild(buttonAccept);
    const buttonRefuse = document.createElement('button');
    buttonRefuse.classList.add('friendRequestButton');
    const redCrossImg = document.createElement('img');
    redCrossImg.src = '../static/icons/realRedCross.webp';
    redCrossImg.classList.add('redCrossButtonImg');
    buttonRefuse.appendChild(redCrossImg);
    buttonRefuse.addEventListener('click', function() {
        refuseFriend(newDiv);
    });
    buttonsDiv.appendChild(buttonRefuse);
    newDiv.appendChild(buttonsDiv);
    friendsList.insertBefore(newDiv, friendsList.firstChild);
}

export function addBlocked(userName)
{
    const newDiv = document.createElement('div');
    newDiv.addEventListener('click', function() {
        openNameContextMenu(userName, newDiv);
    });
    newDiv.setAttribute('name', userName);
    newDiv.classList.add('friendDiv');
    const nameHeader = document.createElement('h3');
    nameHeader.textContent = userName;
    nameHeader.style.color = playerStats.colors;
    newDiv.appendChild(nameHeader);
    blockedList.appendChild(newDiv);
}

export function loadFriends()
{
    return new Promise((resolve, reject) => {
        getFriendsList()
            .then(list => {
                list.forEach(element => {
                    addFriendRequest(element.username);
                });
                resolve(); // Resolve when done
            })
            .catch(error => {
                console.error("Error fetching friends list:", error);
                reject(error); // Reject if an error occurs
            });
    });
}

export function loadBlocks()
{
    return new Promise((resolve, reject) => {
        getBlockedList()
            .then(list => {
                list.forEach(element => {
                    addBlocked(element.username);
                });
                resolve(); // Resolve when done
            })
            .catch(error => {
                console.error("Error fetching friends list:", error);
                reject(error); // Reject if an error occurs
            });
    });
}

closeFriends();