import { addDisableButtonEffect, removeDisableButtonEffect } from "./main.js";
import { showModeChoice } from "./modesSelection.js";
import { navigateTo } from "./pages.js";
import { playerStats } from "./playerManager.js";
import { getTranslation } from "./translate.js";

const nbrPlayersTournament = document.getElementById('nbrPlayersTournament');
const listplayersDiv = document.getElementById('listPlayersTournament');
const startTournamentButton = document.getElementById('startTournamentButton');
const addPlayerButton = document.getElementById('addPlayerTournament');
const inputAddPlayer = document.getElementById('inputAddPlayer');
const addPlayerTournamentPanel = document.getElementById('addPlayerTournamentPanel');
const confirmAddPlayerButton = document.getElementById('confirmAddPlayerButton');


let countPlayers = 0;
let tournamentLeader = "";

let players = [];

startTournamentButton.addEventListener('click', () => {
    
    startTournament();
});

document.getElementById('cancelTournamentLobbyButton').addEventListener('click', () => {
    quitTournamentLobby();
});

addPlayerButton.addEventListener('click', () => {
    openAddPlayer();
});

confirmAddPlayerButton.addEventListener('click', () => {
    confirmAddPlayer();
});

document.getElementById('cancelAddPlayerButton').addEventListener('click', () => {
    cancelAddPlayerTournament();
});

inputAddPlayer.addEventListener('input', () => {

    if (inputAddPlayer.value === "" || players.includes(inputAddPlayer.value))
        addDisableButtonEffect(confirmAddPlayerButton);
    else
        removeDisableButtonEffect(confirmAddPlayerButton);
    // check all the players
});

let addPlayerIsOpen = false;

export function quitTournamentLobby()
{
    // clickBackButtonMenu(true);
    showModeChoice();
    deleteEveryone();
}

export function isAddPlayerTournamentIsOpen()
{
    return addPlayerIsOpen;
}

function confirmAddPlayer()
{
    addPlayerToTournament(inputAddPlayer.value);
    cancelAddPlayerTournament();
}

export function cancelAddPlayerTournament()
{
    addPlayerIsOpen = false;
    inputAddPlayer.value = "";
    addPlayerTournamentPanel.style.display = 'none';
    addPlayerButton.focus();
}

function openAddPlayer()
{
    addDisableButtonEffect(confirmAddPlayerButton);
    addPlayerIsOpen = true;
    addPlayerTournamentPanel.style.display = 'flex';
    inputAddPlayer.focus();
}

export function openTournamentLobby()
{
    addDisableButtonEffect(startTournamentButton);
    nbrPlayersTournament.innerText = countPlayers + " " + getTranslation('players');
    navigateTo('tournament-lobby');
}

export function onTournamentLobbyOpen()
{
    addPlayerButton.focus();
    if (playerStats.isRegistered)
        addPlayerToTournament(playerStats.nickname);
}

export function startTournament()
{
    if (startTournamentButton.classList.contains('disabledButtonHover'))
        return;

}

function deleteEveryone()
{
    while (listplayersDiv.firstChild)
        listplayersDiv.removeChild(listplayersDiv.firstChild);
    countPlayers = 0;
}

function isPowerOfTwo(n) {
    if (n <= 1) return false; // Power of 2 must be greater than 0
    return (n & (n - 1)) === 0;
}

function modPlayerCount(nbr)
{
    countPlayers += nbr;
    nbrPlayersTournament.innerText = countPlayers + " " + getTranslation('players');
    if (isPowerOfTwo(countPlayers))
        removeDisableButtonEffect(startTournamentButton);
    else
        addDisableButtonEffect(startTournamentButton);
}

export function addPlayerToTournament(playerName)
{
    players.push(playerName);
    modPlayerCount(1);
    const newPlayer = document.createElement('p');
    newPlayer.setAttribute('playerName', playerName);
    newPlayer.classList.add('playerTournament');
    if (playerName === tournamentLeader)
        newPlayer.classList.add('leaderTournament');
    const newPlayerName = document.createElement('div');
    newPlayerName.classList.add('playerNameTournament');
    newPlayerName.textContent = playerName;
    newPlayer.appendChild(newPlayerName);
    // ne pas afficher le bouton si le joueur qui rejoint n'est pas le leader
    const redCross = document.createElement('button');
    redCross.classList.add('redCrossButton');
    redCross.addEventListener('click', function() {
        redCrossButtonClick(newPlayer, playerName);
    });
    const redCrossImg = document.createElement('img');
    redCrossImg.src = '../static/icons/redCross.webp';
    redCrossImg.classList.add('redCrossButtonImg');
    redCross.appendChild(redCrossImg);
    newPlayer.appendChild(redCross);
    listplayersDiv.appendChild(newPlayer);
}

function redCrossButtonClick(div, name)
{
    players = players.filter(str => str !== name);
    modPlayerCount(-1);
    div.remove();
}

function createCanvas()
{

}

let iteration = 0;
let playersInTier = 0;
const tournamentMatchsCanvas = document.getElementById('tournamentMatchsCanvas');

function createPlayersTier()
{
    const tierDiv = document.createElement('div');
    tierDiv.classList.add('itemListTournament');
    tournamentMatchsCanvas.appendChild(tierDiv);
    return tierDiv;
}

function createPlayerInTier(parentDiv, isFirst, playerNbr)
{
    const childDiv = document.createElement('div');
    childDiv.style.color = playerStats.colors;
    if (isFirst)
    {
        childDiv.setAttribute('data-name', players[playerNbr]);
        childDiv.innerText = players[playerNbr];
    }
    else
    {
        childDiv.innerText = "?";
    }
    childDiv.classList.add('itemTournament');
    parentDiv.appendChild(childDiv);
}

let canvasList = [];
function createCanvasDiv()
{
    const canvasDiv = document.createElement('canvas');
    canvasList.push(canvasDiv);
    canvasDiv.classList.add('tournamentCanvas');
    tournamentMatchsCanvas.appendChild(canvasDiv);
}

function drawOnCanvases() {
    const canvasList = document.querySelectorAll('canvas');
    
    for (let i = 0; i < canvasList.length; i++) {
        const canvas = canvasList[i];
        const prev = canvas.previousElementSibling;
        const next = canvas.nextElementSibling;

        if (!prev || !next) {
            console.warn(`Canvas at index ${i} is missing a previous or next sibling.`);
            continue;
        }

        const prevElementsCount = prev.childElementCount;
        const nextElementsCount = next.childElementCount;

        if (prevElementsCount === 0 || nextElementsCount === 0) {
            console.warn(`Canvas at index ${i} has siblings with no children.`);
            continue;
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#006b6b';
        ctx.lineWidth = 2;

        let nextIndex = 0;

        for (let j = 0; j < prevElementsCount; j++) {
            const nextElement = next.children[nextIndex];
            const rect1 = prev.children[j].getBoundingClientRect();
            const rect2 = nextElement.getBoundingClientRect();

            const y1 = rect1.top + rect1.height / 2;
            const y2 = rect2.top + rect2.height / 2;

            const x1 = rect1.right;
            const x2 = rect2.left;

            const controlX1 = x1 + 30;
            const controlX2 = x2 - 30;
            
            let controlY1, controlY2;
            if (x2 > x1) {
                controlY1 = y1 - 15;
                controlY2 = y2 + 15;
            } else {
                controlY1 = y1 + 15;
                controlY2 = y2 - 15;
            }

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, x2, y2);  // Draw a cubic Bezier curve
            ctx.stroke();

            if ((j + 1) % 2 === 0) {
                nextIndex++;
                if (nextIndex >= nextElementsCount) {
                    nextIndex = 0;
                }
            }
        }
    }
}

// Call the function to draw the curved lines
drawOnCanvases();


let last = false;
let first = true;
function createTournamentView()
{
    // playersInTier = countPlayers;
    playersInTier = 8;
    while (playersInTier > 0)
    {
        let curTierDiv = createPlayersTier();
        for (let i = 0; i < playersInTier; i++)
        {
            createPlayerInTier(curTierDiv, first, i);
        }
        if (last === true)
        {
            drawOnCanvases();
            return;
        }
        createCanvasDiv();
        playersInTier /= 2;
        if (playersInTier === 1)
        {
            last = true;
        }
        first = false;
    }
}

function displayLostPlayer(playerName, tier)
{
    const children = canvasList[tier].children;
    for (let i = 0; i < children.length; i++) {
        if (children[i].getAttribute('data-name') === playerName)
        {

        }
    }
}

createTournamentView();