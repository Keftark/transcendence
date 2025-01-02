import { getLoggedInUser, getUserById } from "./apiFunctions.js";
import { deleteDuelInChat } from "./chat.js";
import { passInfosPlayersToLevel } from "./levelLocal.js";
import { addDisableButtonEffect, hasDisabledButtonEffect, removeDisableButtonEffect } from "./main.js";
import { showModeChoice } from "./modesSelection.js";
import { getPlayerName } from "./playerManager.js";
import { clickChoosePaddleButton } from "./rules.js";
import { exitLobby, notReadyToDuel, readyToDuel } from "./sockets.js";
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
// const startButtonDuel = document.getElementById('startDuelButton');
const animDiv = document.getElementById('vsImg');
const baseImgPath = "static/icons/playerNoImg.png";
const choosePaddleButtonPlayer1 = document.getElementById('choosePaddleButtonPlayer1');
const choosePaddleButtonPlayer2 = document.getElementById('choosePaddleButtonPlayer2');

let isOtherConnected = false;
let duelTargetPlayer = "";
let duelSender = "";
let player1IsReady = false;
let player2IsReady = false;

let idP1 = -1;
let idP2 = -1;

player1ReadyButton.addEventListener('click', () => {
    clickReadyDuel(1);
});
player2ReadyButton.addEventListener('click', () => {
    clickReadyDuel(2);
});

choosePaddleButtonPlayer1.addEventListener('click', () => {
    if (!hasDisabledButtonEffect(choosePaddleButtonPlayer1))
        clickChoosePaddleButton(1);
});
choosePaddleButtonPlayer2.addEventListener('click', () => {
    if (!hasDisabledButtonEffect(choosePaddleButtonPlayer2))
        clickChoosePaddleButton(2);
});

document.getElementById('helpRulesDuel').addEventListener('mouseover', () => {
    document.getElementById('helpRulesTextPanel').style.display = 'flex';
});

document.getElementById('helpRulesDuel').addEventListener('mouseout', () => {
    document.getElementById('helpRulesTextPanel').style.display = 'none';
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
    // addDisableButtonEffect(startButtonDuel);
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
    // double chargement de la page de retour pour le joueur qui quitte
    // mettre un message indiquant que l'autre joueur a quitte
    exitLobby(); // fonction pas encore faite
    showModeChoice();
}

export function onOpenDuel()
{
    // fillInfosPlayer(1);
    // document.getElementById('duelPanel').style.display = 'flex'; // inutile ??
    startWaitingForPlayer();
}

export function onCloseDuel()
{
    idP1 = -1;
    idP2 = -1;
    resetDuelPanel();
    document.getElementById('duelPanel').style.display = 'none'; // inutile ??
    animDiv.classList.remove('vsAnim');
    animDiv.style.display = 'none';
    duelSender = duelTargetPlayer = null;
    // check si quelqu'un est connecte a cette page et le remettre sur la precedente
    deleteDuelInChat();
}

function fillInfosPlayer(playerNbr, playerInfos)
{
    const playerProfile = getUserById(playerInfos);
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
    // if (player1ReadyButton.classList.contains('active') && player2ReadyButton.classList.contains('active'))
    //     removeDisableButtonEffect(startButtonDuel);
    // else
    //     addDisableButtonEffect(startButtonDuel);
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

async function displayUIPlayer(player1, player2)
{
    getLoggedInUser().then(user => {
        if (user) {
            if (user.id === player1)
            {
                addDisableButtonEffect(choosePaddleButtonPlayer2);
                addDisableButtonEffect(player2ReadyButton);
            }
            else if (user.id === player2)
            {
                addDisableButtonEffect(player1ReadyButton);
                addDisableButtonEffect(choosePaddleButtonPlayer1);
            }
        } else {
            console.log("No user is currently logged in or an error occurred.");
        }
    });
}

export function setPlayersControllers()
{
    if (idP1 === -1 || idP2 === -1)
    {
        console.error("The players don't have ids.");
        return;
    }
    passInfosPlayersToLevel(idP1, idP2);
}

export function matchFound(player1, player2)
{
    // console.log("Player1: " + player1);
    // console.log("Player2: " + player2);
    idP1 = player1;
    idP2 = player2;
    displayUIPlayer(player1, player2);
    fillInfosPlayer(1, player1);
    fillInfosPlayer(2, player2);
    document.getElementById('waitingMatch').style.display = "none";
    // on met a jour l'interface apres avoir recupere les deux joueurs
}

// addDisableButtonEffect(startButtonDuel);