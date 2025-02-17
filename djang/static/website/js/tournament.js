import { addDisableButtonEffect, removeDisableButtonEffect } from "./main.js";
import { clickPlayGame, showModeChoice } from "./modesSelection.js";
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
const tournamentWinVictory = document.getElementById('tournamentWinVictory');
const tournamentWinVictoryText = document.getElementById('tournamentWinVictoryText');
const closeTournamentVictoryButton = document.getElementById('closeTournamentVictoryButton');
const startMatchTournamentButton = document.getElementById('startMatchTournamentButton');
const cancelMatchTournamentButton = document.getElementById('cancelMatchTournamentButton');
const closeTournamentViewButton = document.getElementById('closeTournamentViewButton');
const confirmBackTournamentButton = document.getElementById('confirmBackTournamentButton');
const cancelBackTournamentButton = document.getElementById('cancelBackTournamentButton');
const askBackTournamentViewPanel = document.getElementById('askBackTournamentViewPanel');


let countPlayers = 0;

let players = [];

let player1Name = "";
let player2Name = "";

export function getTournamentPlayers()
{
    return [player1Name, player2Name];
}

closeTournamentViewButton.addEventListener('click', () => {
    closeTournamentViewPanel();
});

closeTournamentVictoryButton.addEventListener('click', () => {
    closeTournamentView();
});

cancelMatchTournamentButton.addEventListener('click', () => {
    askBackTournamentView();
});

confirmBackTournamentButton.addEventListener('click', () => {
    cancelBackTournamentView();
    backTournamentView();
});

cancelBackTournamentButton.addEventListener('click', () => {
    cancelBackTournamentView();
});

startTournamentButton.addEventListener('click', () => {
    startTournament();
});

startMatchTournamentButton.addEventListener('click', () => {
    startMatchTournament();
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

    if (inputAddPlayer.value === "" || players.map(item => item.toUpperCase()).includes(inputAddPlayer.value.toUpperCase()))
        addDisableButtonEffect(confirmAddPlayerButton);
    else
        removeDisableButtonEffect(confirmAddPlayerButton);
});

let addPlayerIsOpen = false;

function startMatchTournament()
{
    closeTournamentViewPanel();
    clickPlayGame();
}

export function quitTournamentLobby()
{
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
    createTournamentView();
    displayNextMatch();
    startMatchTournamentButton.focus();
}

function deleteEveryone()
{
    while (listplayersDiv.firstChild)
        listplayersDiv.removeChild(listplayersDiv.firstChild);
    players.length = 0;
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

let currentMatch = 
{
    player1: 0,
    player2: 1
};
let currentTier = 0;
let playersInTier = 0;
const tournamentMatchsCanvas = document.getElementById('tournamentMatchsCanvas');

let tiersList = []
function createPlayersTier()
{
    const tierDiv = document.createElement('div');
    tiersList.push(tierDiv);
    tierDiv.classList.add('itemListTournament');
    tournamentMatchsCanvas.appendChild(tierDiv);
    return tierDiv;
}

let lastPlayer;
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
        lastPlayer = childDiv;
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
            const distance = Math.abs(x2 - x1);
            const controlDistance = distance * 0.4;
            const controlX1 = x1 + controlDistance;
            const midpointX = (x1 + x2) / 2;
            const controlX2 = midpointX;
            let controlY1, controlY2;
            if (j % 2 === 0) {
                controlY1 = y1 - 5;
                controlY2 = y2 - 5;
            } else {
                controlY1 = y1 + 5;
                controlY2 = y2 + 5;
            }
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, x2, y2);
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

export function openTournamentView(fromGame = false)
{
    tournamentMatchsCanvas.style.display = 'flex';
    if (fromGame)
    {
        closeTournamentViewButton.style.display = 'flex';
        startMatchTournamentButton.style.display = 'none';
        cancelMatchTournamentButton.style.display = 'none';
        closeTournamentViewButton.focus();
    }
    else
    {
        closeTournamentViewButton.style.display = 'none';
        startMatchTournamentButton.style.display = 'flex';
        cancelMatchTournamentButton.style.display = 'flex';
        startMatchTournamentButton.focus();
    }
    tournamentViewIsOpen = true;
}

let last = false;
let first = true;
function createTournamentView()
{
    storePlayers();
    storeCurrentMatch();
    last = false;
    first = true;
    playersInTier = countPlayers;
    while (playersInTier > 0)
    {
        let curTierDiv = createPlayersTier();
        for (let i = 0; i < playersInTier; i++)
        {
            createPlayerInTier(curTierDiv, first, i);
        }
        if (last === true)
        {
            openTournamentView();
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

let inAskCancelBack = false;

export function isInAskBackTournamentView()
{
    return inAskCancelBack;
}

export function askBackTournamentView()
{
    inAskCancelBack = true;
    askBackTournamentViewPanel.style.display = 'flex';
    confirmBackTournamentButton.focus();
}

export function cancelBackTournamentView()
{
    inAskCancelBack = false;
    askBackTournamentViewPanel.style.display = 'none';
    startMatchTournamentButton.focus();
}

function resetTournamentView()
{
    isLastMatch = false;
    currentTier = 0;
    playersInTier = 0
    currentMatch.player1 = 0;
    currentMatch.player2 = 1;
    while (canvasList.firstChild)
        canvasList.removeChild(canvasList.firstChild);
    canvasList.length = 0;
    while (tiersList.firstChild)
        tiersList.removeChild(tiersList.firstChild);
    tiersList.length = 0;
    while (tournamentMatchsCanvas.children.length > 1)
        tournamentMatchsCanvas.removeChild(tournamentMatchsCanvas.lastChild);
}

export function backTournamentView()
{
    resetTournamentView();
    closeTournamentViewPanel();
    addPlayerButton.focus();
}

export function closeTournamentViewPanel()
{
    tournamentMatchsCanvas.style.display = 'none';
    tournamentViewIsOpen = false;
}

export function closeTournamentView()
{
    deleteEveryone();
    backTournamentView();
    tournamentWinVictory.style.display = 'none';
}

// function displayLostPlayer(playerName, tier)
// {
//     const children = canvasList[tier].children;
//     for (let i = 0; i < children.length; i++) {
//         if (children[i].getAttribute('data-name') === playerName)
//         {
//             children[i].classList.add('lost');
//         }
//     }
// }

function displayNextMatch()
{
    storeCurrentTier();
    const child = tiersList[currentTier].children;
    child[currentMatch.player1].classList.add('nextMatch');
    child[currentMatch.player2].classList.add('nextMatch');
    player1Name = child[currentMatch.player1].getAttribute('data-name');
    player2Name = child[currentMatch.player2].getAttribute('data-name');
}

function goToNextTier()
{
    currentTier += 1;
    currentMatch.player1 = 0;
    currentMatch.player2 = 1;
    storeCurrentMatch();
}

let isLastMatch = false;
function callVictory()
{
    isLastMatch = true;
    tournamentWinVictoryText.innerText = lastPlayer.getAttribute('data-name') + getTranslation("isVictorious");
    tournamentWinVictory.style.display = 'flex'; 
}

function prepareNextMatch()
{
    if (currentMatch.player2 >= tiersList[currentTier].children.length - 1)
    {
        goToNextTier();
        if (currentTier === tiersList.length - 1)
        {
            callVictory();
            removeStorage();
            return;
        }
    }
    else
    {
        currentMatch.player1+=2;
        currentMatch.player2+=2;
        storeCurrentMatch();
    }
    if (!isLastMatch)
        displayNextMatch();
}

let winnerNbr;
let tournamentViewIsOpen = false;

export function isTournamentViewOpen()
{
    return tournamentViewIsOpen;
}

export function setWinner(p1, p2, s1, s2)
{
    winnerNbr = s1 > s2 ? 1 : 2;
    storeMatchResult(p1, p2, s1, s2);
}

let cancelledInMatch = false;

export function setCancelledInMatch(isTrue)
{
    cancelledInMatch = isTrue;
}

export function endOfTournamentMatch()
{
    if (cancelledInMatch)
    {
        cancelledInMatch = false;
        closeTournamentView();
        return;
    }
    cancelledInMatch = false;
    tournamentMatchsCanvas.style.display = 'flex';
    tournamentViewIsOpen = true;
    const item = tiersList[currentTier].children;
    item[currentMatch.player1].classList.remove('nextMatch');
    item[currentMatch.player2].classList.remove('nextMatch');
    if (winnerNbr === 1)
    {
        item[currentMatch.player2].classList.add('lost');
        if (currentTier + 1 < tiersList.length)
        {
            const child = tiersList[currentTier + 1].children[Math.floor(currentMatch.player2 / 2)];
            const attribute = item[currentMatch.player1].getAttribute('data-name');
            child.setAttribute('data-name', attribute)
            child.textContent = attribute;
        }
    }
    else
    {
        item[currentMatch.player1].classList.add('lost');
        if (currentTier + 1 < tiersList.length)
        {
            const child = tiersList[currentTier + 1].children[Math.floor(currentMatch.player2 / 2)];
            const attribute = item[currentMatch.player2].getAttribute('data-name');
            child.setAttribute('data-name', attribute)
            child.textContent = attribute;
        }
    }

    prepareNextMatch();
    setTimeout(() => {
        startMatchTournamentButton.focus();
    }, 10);
}

function storePlayers()
{
    if (localStorage.getItem('players') === null)
        localStorage.setItem('players', JSON.stringify(players));
}

function storeCurrentTier()
{
    localStorage.setItem('currentTier', currentTier);
}

function storeCurrentMatch()
{
    localStorage.setItem('currentP1', currentMatch.player1);
    localStorage.setItem('currentP2', currentMatch.player2);
}

function storeMatchResult(p1, p2, s1, s2)
{
    let matchs = JSON.parse(localStorage.getItem('matchs')) || [];
    const newMatch = {
        player1: p1,
        player2: p2,
        score1: s1,
        score2: s2
    };
    matchs.push(newMatch);
    localStorage.setItem('matchs', JSON.stringify(matchs));
}

function removeStorage()
{
    localStorage.removeItem('players');
    localStorage.removeItem('currentTier');
    localStorage.removeItem('currentP1');
    localStorage.removeItem('currentP2');
    localStorage.removeItem('matchs');
}