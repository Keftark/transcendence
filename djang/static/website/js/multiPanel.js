import { getUserById } from "./apiFunctions.js";
import { id_players, passInfosPlayersToLevelMulti } from "./levelLocal.js";
import { addDisableButtonEffect, removeDisableButtonEffect } from "./main.js";
import { clickPlayGame, setSelectedMode, showModeChoice } from "./modesSelection.js";
import { playerStats } from "./playerManager.js";
import { socketExitLobby, socketNotReadyToDuel, socketReadyToDuel } from "./sockets.js";
import { getTranslation } from "./translate.js";
import { LevelMode } from "./variables.js";

const player1Multi = document.getElementById('player1Multi');
const player2Multi = document.getElementById('player2Multi');
const player3Multi = document.getElementById('player3Multi');
const player4Multi = document.getElementById('player4Multi');
const player1NameText = document.getElementById('player1NameMulti');
const player2NameText = document.getElementById('player2NameMulti');
const player3NameText = document.getElementById('player3NameMulti');
const player4NameText = document.getElementById('player4NameMulti');
const player1Img = document.getElementById('player1ImgMulti');
const player2Img = document.getElementById('player2ImgMulti');
const player3Img = document.getElementById('player3ImgMulti');
const player4Img = document.getElementById('player4ImgMulti');
const player1ReadyButton = document.getElementById('ready1MultiButton');
const player2ReadyButton = document.getElementById('ready2MultiButton');
const player3ReadyButton = document.getElementById('ready3MultiButton');
const player4ReadyButton = document.getElementById('ready4MultiButton');
const animDiv = document.getElementById('vsImg');
const baseImgPath = "static/icons/playerNoImg.webp";

document.getElementById('leaveMultiButton').addEventListener('click', () => {
    closeMultiPanel();
});

player1ReadyButton.addEventListener('click', () => {
    clickReadyMulti(1);
});
player2ReadyButton.addEventListener('click', () => {
    clickReadyMulti(2);
});
player3ReadyButton.addEventListener('click', () => {
    clickReadyMulti(3);
});
player4ReadyButton.addEventListener('click', () => {
    clickReadyMulti(4);
});

let idP1 = -1;
let idP2 = -1;
let idP3 = -1;
let idP4 = -1;
let player1IsReady = false;
let player2IsReady = false;
let player3IsReady = false;
let player4IsReady = false;

export function closeMultiPanel()
{
    // double chargement de la page de retour pour le joueur qui quitte
    // mettre un message indiquant que l'autre joueur a quitte
    setSelectedMode(LevelMode.MENU);
    document.getElementById('waitingMatch').style.display = "none";
    socketExitLobby("2v2_classic");
    showModeChoice();
}

function resetMultiPanel()
{
    player4Multi.classList.remove('selectedPlayer');
    player3Multi.classList.remove('selectedPlayer');
    player2Multi.classList.remove('selectedPlayer');
    player1Multi.classList.remove('selectedPlayer');
    player4IsReady = player3IsReady = player2IsReady = player1IsReady = false;
    player1ReadyButton.classList.remove('active');
    player2ReadyButton.classList.remove('active');
    player3ReadyButton.classList.remove('active');
    player4ReadyButton.classList.remove('active');
    player1Img.src = baseImgPath;
    player2Img.src = baseImgPath;
    player3Img.src = baseImgPath;
    player4Img.src = baseImgPath;
    player2NameText.innerText = getTranslation('player2Name');
    removeDisableButtonEffect(player1ReadyButton);
    removeDisableButtonEffect(player2ReadyButton);
    removeDisableButtonEffect(player3ReadyButton);
    removeDisableButtonEffect(player4ReadyButton);
    // addDisableButtonEffect(startButtonDuel);
    // reset all the fields/settings
}

export function onCloseMulti()
{
    idP4 = idP3 = idP3 = idP4 = -1;
    resetMultiPanel();

    // document.getElementById('duelPanel').style.display = 'none'; // inutile ??
    animDiv.classList.remove('vsAnim');
    animDiv.style.display = 'none';
}

function fillInfosPlayer(playerNbr, playerInfos) {
    return new Promise((resolve, reject) => {
        getUserById(playerInfos)
            .then(playerProfile => {
                // This will resolve the promise when playerProfile is retrieved
                if (playerNbr === 1) {
                    player1NameText.innerText = playerProfile.username;
                    // mettre la photo de profil
                } else if (playerNbr === 2) {
                    player2NameText.innerText = playerProfile.username;
                    // mettre la photo de profil
                } else if (playerNbr === 3) {
                    player3NameText.innerText = playerProfile.username;
                    // mettre la photo de profil
                } else if (playerNbr === 4) {
                    player4NameText.innerText = playerProfile.username;
                    // mettre la photo de profil
                }
                resolve();
            })
            .catch(error => {
                console.error("Error fetching user profile:", error);
                reject(error); // Reject if an error occurs
            });
    });
}


function resetVSAnimation()
{
    animDiv.style.display = 'block';
    void animDiv.offsetWidth;
    animDiv.classList.add('vsAnim');
}

async function displayUIPlayer(player1, player2, player3, player4)
{
    if (playerStats.id === player1)
    {
        addDisableButtonEffect(player2ReadyButton);
        addDisableButtonEffect(player3ReadyButton);
        addDisableButtonEffect(player4ReadyButton);
        player1Multi.classList.add('selectedPlayer');
        player1ReadyButton.focus();
    }
    else if (playerStats.id === player2)
    {
        addDisableButtonEffect(player1ReadyButton);
        addDisableButtonEffect(player3ReadyButton);
        addDisableButtonEffect(player4ReadyButton);
        player2Multi.classList.add('selectedPlayer');
        player2ReadyButton.focus();
    }
    else if (playerStats.id === player3)
    {
        addDisableButtonEffect(player1ReadyButton);
        addDisableButtonEffect(player2ReadyButton);
        addDisableButtonEffect(player4ReadyButton);
        player3Multi.classList.add('selectedPlayer');
        player3ReadyButton.focus();
    }
    else if (playerStats.id === player4)
    {
        addDisableButtonEffect(player1ReadyButton);
        addDisableButtonEffect(player2ReadyButton);
        addDisableButtonEffect(player3ReadyButton);
        player4Multi.classList.add('selectedPlayer');
        player4ReadyButton.focus();
    }
}

export function matchFoundMulti(player1, player2, player3, player4)
{
    id_players[0] = idP1 = player1;
    id_players[1] = idP2 = player2;
    id_players[2] = idP3 = player3;
    id_players[3] = idP4 = player4;
    displayUIPlayer(player1, player2, player3, player4);
    Promise.all([
        fillInfosPlayer(1, player1),
        fillInfosPlayer(2, player2),
        fillInfosPlayer(3, player3),
        fillInfosPlayer(4, player4), 
        getUserAvatarById(player1),
        getUserAvatarById(player2),
        getUserAvatarById(player3),
        getUserAvatarById(player4)
    ])
    .then(() => {
        const [ , , , , avatar1, avatar2, avatar3, avatar4 ] = results;
        document.getElementById('waitingMatch').style.display = "none";
        player1Img.src = avatar1.avatar_url;
        player2Img.src = avatar2.avatar_url;
        player3Img.src = avatar3.avatar_url;
        player4Img.src = avatar4.avatar_url;
        resetVSAnimation();
    })
    .catch(error => {
        console.error("Error in matchFound:", error);
    });
}

export function setPlayersControllersMulti()
{
    if (idP1 === -1 || idP2 === -1 || idP3 === -1 || idP4 === -1)
    {
        console.error("The players don't have ids.");
        return;
    }
    passInfosPlayersToLevelMulti(idP1, idP2, idP3, idP4)
    .then(() => {
        clickPlayGame(); // Call after everything is done
    })
    .catch((error) => {
        console.error("Failed to set up players' controllers:", error);
    });
}

export function clickReadyMulti(playerNbr)
{
    if (playerNbr === 1)
    {
        if (player1ReadyButton.classList.contains('disabledButtonHover'))
            return;
        player1ReadyButton.classList.toggle('active');
        player1IsReady = !player1IsReady;
        if (player1IsReady)
            socketReadyToDuel("2v2_classic");
        else
            socketNotReadyToDuel("2v2_classic");
    }
    else if (playerNbr === 2)
    {
        if (player2ReadyButton.classList.contains('disabledButtonHover'))
            return;
        player2ReadyButton.classList.toggle('active');
        player2IsReady = !player2IsReady;
        if (player2IsReady)
            socketReadyToDuel("2v2_classic");
        else
            socketNotReadyToDuel("2v2_classic");
    }
    else if (playerNbr === 3)
    {
        if (player3ReadyButton.classList.contains('disabledButtonHover'))
            return;
        player3ReadyButton.classList.toggle('active');
        player3IsReady = !player3IsReady;
        if (player3IsReady)
            socketReadyToDuel("2v2_classic");
        else
            socketNotReadyToDuel("2v2_classic");
    }
    else if (playerNbr === 4)
    {
        if (player4ReadyButton.classList.contains('disabledButtonHover'))
            return;
        player4ReadyButton.classList.toggle('active');
        player4IsReady = !player4IsReady;
        if (player4IsReady)
            socketReadyToDuel("2v2_classic");
        else
            socketNotReadyToDuel("2v2_classic");
    }
}


export function updateReadyButtonsMulti(p1, p2, p3, p4)
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
    if (p3 != player3IsReady)
    {
        player3IsReady = p3;
        if (player3IsReady)
            player3ReadyButton.classList.add('active');
        else
            player3ReadyButton.classList.remove('active');
    }
    if (p4 != player4IsReady)
    {
        player4IsReady = p4;
        if (player4IsReady)
            player4ReadyButton.classList.add('active');
        else
            player4ReadyButton.classList.remove('active');
    }
}