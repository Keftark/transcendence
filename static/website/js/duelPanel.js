import { getLoggedInUser, getUserById } from "./apiFunctions.js";
import { deleteDuelInChat } from "./chat.js";
import { addDisableButtonEffect, removeDisableButtonEffect } from "./main.js";
import { showModeChoice } from "./modesSelection.js";
import { getPlayerName } from "./playerManager.js";
import { notReadyToDuel, readyToDuel } from "./sockets.js";
import { getTranslation } from "./translate.js";

document.getElementById('leaveDuelButton').addEventListener('click', () => {
    closeDuelPanel();
});

const player1NameText = document.getElementById('player1NameDuel');
const player2NameText = document.getElementById('player2NameDuel');
const player1Img = document.getElementById('player1ImgDuel');
const player2Img = document.getElementById('player2ImgDuel');
const player1ReadyButton = document.getElementById('ready1DuelButton');
const player2ReadyButton = document.getElementById('ready2DuelButton');
const waitingPlayer2 = document.getElementById('waitingForPlayer');
const startButtonDuel = document.getElementById('startDuelButton');
const animDiv = document.getElementById('vsImg');
const baseImgPath = "static/icons/playerNoImg.png";

let isOtherConnected = false;
let duelTargetPlayer = "";
let duelSender = "";
let player1IsReady = false;
let player2IsReady = false;

player1ReadyButton.addEventListener('click', () => {
    clickReadyDuel(1);
});
player2ReadyButton.addEventListener('click', () => {
    clickReadyDuel(2);
});

export function getDuelTargetPlayer()
{
    return duelTargetPlayer;
}

export function setDuelTargetPlayer(playerNick)
{
    duelTargetPlayer = playerNick;
}

export function getDuelSenderPlayer()
{
    return duelSender;
}

export function setDuelSenderPlayer(playerNick)
{
    duelSender = playerNick;
}

function resetDuelPanel()
{
    player1IsReady = false;
    player2IsReady = false;
    player1ReadyButton.classList.remove('active');
    player2ReadyButton.classList.remove('active');
    isOtherConnected = false;
    player1Img.src = baseImgPath;
    player2Img.src = baseImgPath;
    waitingPlayer2.innerText = getTranslation('waitingForPlayer');
    player2NameText.innerText = getTranslation('player2Name');
    removeDisableButtonEffect(player1ReadyButton);
    removeDisableButtonEffect(player2ReadyButton);
    addDisableButtonEffect(startButtonDuel);
    // reset all the fields/settings
}

function resetVSAnimation()
{
    animDiv.style.display = 'block';
    void animDiv.offsetWidth;
    animDiv.classList.add('vsAnim');
}

export function closeDuelPanel()
{
    showModeChoice();
}

export function onOpenDuel()
{
    // fillInfosPlayer(1);
    document.getElementById('duelPanel').style.display = 'flex'; // inutile ??
    startWaitingForPlayer();
}

export function onCloseDuel()
{
    resetDuelPanel();
    document.getElementById('duelPanel').style.display = 'none'; // inutile ??
    animDiv.classList.remove('vsAnim');
    animDiv.style.display = 'none';
    duelSender = duelTargetPlayer = null;
    // check si quelqu'un est connecte a cette page et le remettre sur la precedente
    deleteDuelInChat();
}

async function fillInfosPlayer(playerNbr, playerInfos)
{
    const playerProfile = await getUserById(playerInfos);
    if (playerNbr === 1)
    {
        player1NameText.innerText = playerProfile.username; // recuperer le nom du joueur avec l'id
        // mettre la photo de profil
    }
    else
    {
        waitingPlayer2.innerText = " ";
        player2NameText.innerText = playerProfile.username;
        // mettre la photo de profil
    }
}

export function updateReadyButtons(p1, p2)
{
    if (p1 != player1IsReady)
    {
        player1IsReady = p1;
        if (player1IsReady)
            player1ReadyButton.classList.add('active');
        else
            player1ReadyButton.classList.remove('active');
    }
    if (p2 != player2IsReady)
    {
        player2IsReady = p2;
        if (player2IsReady)
            player2ReadyButton.classList.add('active');
        else
            player2ReadyButton.classList.remove('active');
    }
}

export function clickReadyDuel(playerNbr)
{
    if (playerNbr === 1)
    {
        if (player1ReadyButton.classList.contains('disabledButtonHover'))
            return;
        player1ReadyButton.classList.toggle('active');
        player1IsReady = !player1IsReady;
        if (player1IsReady)
            readyToDuel();
        else
            notReadyToDuel();
    }
    else
    {
        if (player2ReadyButton.classList.contains('disabledButtonHover'))
            return;
        player2ReadyButton.classList.toggle('active');
        player2IsReady = !player2IsReady;
        if (player2IsReady)
            readyToDuel();
        else
            notReadyToDuel();
    }
    if (player1ReadyButton.classList.contains('active') && player2ReadyButton.classList.contains('active'))
        removeDisableButtonEffect(startButtonDuel);
    else
        addDisableButtonEffect(startButtonDuel);
}

export function joinDuel()
{
    isOtherConnected = true;
    // fillInfosPlayer(2);
    resetVSAnimation();
}

export function startWaitingForPlayer()
{
    document.getElementById('waitingMatch').style.display = "grid";
}

async function lockReadyButtonOtherPlayer(player1, player2)
{
    getLoggedInUser().then(user => {
        if (user) {
            if (user.id === player1)
                addDisableButtonEffect(player2ReadyButton);
            else if (user.id === player2)
                addDisableButtonEffect(player1ReadyButton);
        } else {
            console.log("No user is currently logged in or an error occurred.");
        }
    });

}

export async function matchFound(player1, player2)
{
    console.log("Player1: " + player1);
    console.log("Player2: " + player2);
    lockReadyButtonOtherPlayer(player1, player2);
    document.getElementById('waitingMatch').style.display = "none";
    fillInfosPlayer(1, player1);
    fillInfosPlayer(2, player2);
    // on met a jour l'interface apres avoir recupere les deux joueurs
}

addDisableButtonEffect(startButtonDuel);