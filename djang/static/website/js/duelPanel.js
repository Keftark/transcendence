import { getUserAvatarById, getUserById } from "./apiFunctions.js";
import { deleteDuelInChat } from "./chat.js";
import { id_players, passInfosPlayersToLevel } from "./levelLocal.js";
import { addDisableButtonEffect, removeDisableButtonEffect } from "./main.js";
import { openDuelPanel, setSelectedMode, showModeChoice } from "./modesSelection.js";
import { socketConnectToDuelInvited, socketExitLobby, socketExitLobbyNoMatch, socketNotReadyToDuel, socketReadyToDuel, socketRefuseDuelInvited } from "./sockets.js";
import { getTranslation } from "./translate.js";
import { clickPlayGame } from "./modesSelection.js";
import { LevelMode } from "./variables.js";
import { playerStats } from "./playerManager.js";
import { showMessage } from "./menu.js";

document.getElementById('leaveDuelButton').addEventListener('click', () => {
    closeDuelPanel();
});

const player1Duel = document.getElementById('player1Duel');
const player2Duel = document.getElementById('player2Duel');
const player1NameText = document.getElementById('player1NameDuel');
const player2NameText = document.getElementById('player2NameDuel');
const player1Img = document.getElementById('player1ImgDuel');
const player2Img = document.getElementById('player2ImgDuel');
const player1ReadyButton = document.getElementById('ready1DuelButton');
const player2ReadyButton = document.getElementById('ready2DuelButton');
const animDiv = document.getElementById('vsImg');
const baseImgPath = "static/icons/guestUser.webp";

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
    // console.log("Resetting panel");
    idP2 = idP1 = -1;
    player2Duel.classList.remove('selectedPlayer');
    player1Duel.classList.remove('selectedPlayer');
    player1IsReady = false;
    player2IsReady = false;
    player1ReadyButton.classList.remove('active');
    player2ReadyButton.classList.remove('active');
    player1Img.src = baseImgPath;
    player2Img.src = baseImgPath;
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

export function closeDuelPanel(fromSocket = false)
{
    if (idP1 === -1)  
        socketExitLobbyNoMatch();
    else
        socketExitLobby();
    if (fromSocket)
        showMessage("playerHasQuit");
    resetDuelPanel();
    setSelectedMode(LevelMode.MENU);
    document.getElementById('waitingMatch').style.display = "none";
    showModeChoice();
}

export function onOpenDuel()
{
    startWaitingForPlayer();
}

export function onCloseDuel()
{
    animDiv.classList.remove('vsAnim');
    animDiv.style.display = 'none';
    duelSender = duelTargetPlayer = null;
    // check si quelqu'un est connecte a cette page et le remettre sur la precedente
    deleteDuelInChat();
}

function fillInfosPlayer(playerNbr, playerInfos) {
    return new Promise((resolve, reject) => {
        getUserById(playerInfos)
            .then(playerProfile => {
                // This will resolve the promise when playerProfile is retrieved
                if (playerNbr === 1) {
                    player1NameText.innerText = playerProfile.username;
                    // mettre la photo de profil
                } else {
                    player2NameText.innerText = playerProfile.username;
                    // mettre la photo de profil
                }
                resolve(); // Resolve when done
            })
            .catch(error => {
                console.error("Error fetching user profile:", error);
                reject(error); // Reject if an error occurs
            });
    });
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
            socketReadyToDuel();
        else
            socketNotReadyToDuel();
    }
    else
    {
        if (player2ReadyButton.classList.contains('disabledButtonHover'))
            return;
        player2ReadyButton.classList.toggle('active');
        player2IsReady = !player2IsReady;
        if (player2IsReady)
            socketReadyToDuel();
        else
            socketNotReadyToDuel();
    }
}

export function joinDuel(playerId)
{
    if (playerId === playerStats.id)
        return;
    socketConnectToDuelInvited(playerId);
    openDuelPanel();
    // fillInfosPlayer(2);
    resetVSAnimation();
}

export function refuseDuel(playerId)
{
    if (playerId === playerStats.id)
        return;
    deleteDuelInChat();
    socketRefuseDuelInvited(playerId);
}

export function startWaitingForPlayer()
{
    document.getElementById('waitingMatch').style.display = "grid";
}

async function displayUIPlayer(player1, player2)
{
    if (playerStats.id === player1)
    {
        removeDisableButtonEffect(player1ReadyButton);
        addDisableButtonEffect(player2ReadyButton);
        player1Duel.classList.add('selectedPlayer');
        player1ReadyButton.focus();
    }
    else if (playerStats.id === player2)
    {
        removeDisableButtonEffect(player2ReadyButton);
        addDisableButtonEffect(player1ReadyButton);
        player2Duel.classList.add('selectedPlayer');
        player2ReadyButton.focus();
    }
}

export function setPlayersControllers()
{
    if (idP1 === -1 || idP2 === -1)
    {
        console.error("The players don't have ids.");
        return;
    }
    passInfosPlayersToLevel(idP1, idP2)
    .then(() => {
        clickPlayGame(); // Call after everything is done
    })
    .catch((error) => {
        console.error("Failed to set up players' controllers:", error);
    });
}

export function matchFound(player1, player2)
{
    deleteDuelInChat();
    id_players[0] = idP1 = player1;
    id_players[1] = idP2 = player2;
    displayUIPlayer(player1, player2);

    Promise.all([
        fillInfosPlayer(1, player1),
        fillInfosPlayer(2, player2),
        getUserAvatarById(player1),
        getUserAvatarById(player2)
    ])
    .then(results => {
        const [ , , avatar1, avatar2 ] = results;
        document.getElementById('waitingMatch').style.display = "none";
        player1Img.src = avatar1.avatar_url;
        player2Img.src = avatar2.avatar_url;
        resetVSAnimation();
    })
    .catch(error => {
        console.error("Error in matchFound:", error);
    });
}

// addDisableButtonEffect(startButtonDuel);