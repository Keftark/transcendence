import { deleteDuelInChat } from "./chat.js";
import { addDisableButtonEffect, removeDisableButtonEffect } from "./main.js";
import { showModeChoice } from "./menu.js";
import { navigateTo } from "./pages.js";
import { getPlayerName, playerStats } from "./playerManager.js";
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
    player1ReadyButton.classList.remove('active');
    player2ReadyButton.classList.remove('active');
    isOtherConnected = false;
    player1Img.src = baseImgPath;
    player2Img.src = baseImgPath;
    waitingPlayer2.innerText = getTranslation('waitingForPlayer');
    player2NameText.innerText = getTranslation('player2Name');
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
    fillInfosPlayer(1);
    document.getElementById('duelPanel').style.display = 'flex'; // inutile ??
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

function fillInfosPlayer(playerNbr)
{
    if (playerNbr === 1)
    {
        player1NameText.innerText = getPlayerName();
        // mettre la photo de profil
    }
    else
    {
        waitingPlayer2.innerText = " ";
        player2NameText.innerText = getPlayerName();
        // mettre la photo de profil
    }
}

export function clickReadyDuel(playerNbr)
{
    if (playerNbr === 1)
        player1ReadyButton.classList.toggle('active');
    else
        player2ReadyButton.classList.toggle('active');
    if (player1ReadyButton.classList.contains('active') && player2ReadyButton.classList.contains('active'))
        removeDisableButtonEffect(startButtonDuel);
    else
        addDisableButtonEffect(startButtonDuel);
}

export function joinDuel()
{
    isOtherConnected = true;
    fillInfosPlayer(2);
    resetVSAnimation();
}

addDisableButtonEffect(startButtonDuel);