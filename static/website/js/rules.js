import { endMatch } from "./levelLocal.js";
import { addDisableButtonEffect, removeDisableButtonEffect } from "./main.js";
import { clickPlayGame, showModeChoice } from "./modesSelection.js";
import { getCurrentView, navigateTo } from "./pages.js";
import { playerStats } from "./playerManager.js";
import { endOfMatch } from "./scoreManager.js";
import { goTournamentMenu } from "./tournament.js";
import { ArenaType } from "./variables.js";

document.getElementById('buttonCancelRules').addEventListener('click', clickCancelRules);
document.getElementById('rulesArenaTypeCave').classList.add('applyBorder');
document.getElementById('rulesArenaTypeCave').addEventListener('click', () => {
    selectArena(0);
});
document.getElementById('rulesArenaTypeSpace').addEventListener('click', () => {
    selectArena(1);
});
document.getElementById('rulesIsPrivateToggle').addEventListener('click', () => {
    togglePrivate();
});
document.getElementById('choosePaddleButton').addEventListener('click', () => {
    clickChoosePaddleButton();
});

const nbrPointsInput = document.getElementById('rulesPointsInput');
const timerInput = document.getElementById('rulesTimerInput');
const buttonStart = document.getElementById('buttonAcceptRules');
const nbrOfPlayersField = document.getElementById('rulesMaxPlayers');
const nbrOfPlayersInput = document.getElementById('rulesMaxPlayersInput');
const arenas = document.getElementById('arenas').querySelectorAll('.arena');
const togglePrivateImg = document.getElementById('imgIsPrivate');
const togglePrivateDiv = document.getElementById('rulesIsPrivate');
const choosePaddlePanel = document.getElementById('choosePaddlePanel');

timerInput.addEventListener("input", () => {
    endEditInputFieldRules();
});

nbrPointsInput.addEventListener("input", () => {
    endEditInputFieldRules();
});

nbrOfPlayersInput.addEventListener("input", () => {
    endEditInputFieldRules();
});

nbrPointsInput.addEventListener("focus", function() {
    nbrPointsInput.select();
});
timerInput.addEventListener("focus", function() {
    timerInput.select();
});
nbrOfPlayersField.addEventListener("focus", function() {
    nbrOfPlayersField.select();
});
nbrOfPlayersInput.addEventListener("focus", function() {
    nbrOfPlayersInput.select();
});

let selectedArena = 0;
let playerDuelId = "";
let isTournament = false;
let isPrivate = false;

buttonStart.addEventListener('click', () => {
    if (isTournament && !isNbrPlayersEven())
        return;
    clickPlayGame();
});

let rules =
{
    pointsToWin: 3,
    arena: ArenaType.CAVE,
    maxTime: 0,
    nbrPlayers: 0,
    isPrivate: false,
}

function isNbrPlayersEven()
{
    const nbr = Number(nbrOfPlayersInput.value);
    return !isNaN(nbr) && Number.isInteger(nbr) && nbr != 0 && nbr % 2 === 0;
}

export function setDefaultRules()
{
    rules.pointsToWin = 3;
    rules.arena = ArenaType.CAVE; // faire un random ?
    rules.maxTime = 0;
    rules.nbrPlayers = 0;
    rules.isPrivate = false;
}

export function selectArena(arenaIndex)
{
    if (selectedArena != arenaIndex)
    {
        arenas[selectedArena].classList.remove('applyBorder');
        selectedArena = arenaIndex;
        const child = arenas[arenaIndex];
        child.classList.add('applyBorder');
    }
}

export function setCustomRules()
{
    rules.pointsToWin = nbrPointsInput.value === '' ? nbrPointsInput.placeholder : nbrPointsInput.value;
    rules.arena = selectedArena;
    rules.maxTime = timerInput.value === '' ? timerInput.placeholder : timerInput.value;
    rules.nbrPlayers = nbrOfPlayersInput.value === '' ? nbrOfPlayersInput.placeholder : nbrOfPlayersInput.value;
    rules.isPrivate = isPrivate;
}

export function resetInputfieldsRules()
{
    document.getElementById('choosePaddleImg').src = `static/images/paddle1Img.png`;
    arenas[selectedArena].classList.remove('applyBorder');
    arenas[0].classList.add('applyBorder');
    nbrPointsInput.value = '3';
    selectedArena = 0;
    timerInput.value = '0';
    nbrOfPlayersInput.value = '0';
    if (isPrivate)
    {
        isPrivate = false;
        togglePrivateImg.src = 'static/icons/unchecked.png';
    }
}

export function getRules()
{
    return rules;
}

export function checkPoints(p1score, p2score)
{
    if (p1score >= rules.pointsToWin || p2score >= rules.pointsToWin)
    {
        endMatch(p1score, p2score);
    }
}

export function checkTimer(timer)
{
    if (rules.maxTime > 0 && timer <= 0)
        endOfMatch();
}

export function openRules(fromTournament = null)
{
    navigateTo('rules', fromTournament);
}

 // if from 2v2, the parameter should be "2v2"
export function onOpenRules(fromTournament)
{
    isTournament = fromTournament === null ? false : true;
    nbrOfPlayersField.style.display = fromTournament === "t" ? 'flex' : 'none';
    togglePrivateDiv.style.display = fromTournament === null ? 'none' : 'flex';
    playerDuelId = playerStats.id;
    nbrPointsInput.select();
    endEditInputFieldRules();
}

export function clickCancelRules()
{
    if (isTournament)
        goTournamentMenu();
    else
        showModeChoice();
}

export function onCloseRules()
{
    playerDuelId = "";
    resetInputfieldsRules();
}

export function endEditInputFieldRules()
{
    // mettre un message de warning disant qu'on ne peut pas tout mettre a zero ?
    if (((timerInput.value === '0' || timerInput.value === '') && nbrPointsInput.value === '0')
        || (isTournament && !isNbrPlayersEven()))
        addDisableButtonEffect(buttonStart);
    else
        removeDisableButtonEffect(buttonStart);
}

function togglePrivate()
{
    isPrivate = !isPrivate;
    togglePrivateImg.src = isPrivate ? 'static/icons/checked.png' : 'static/icons/unchecked.png';
}

function clickChoosePaddleButton()
{
    paddleChoiceIsOpen = true;
    choosePaddlePanel.style.display = "flex";
    document.getElementById('choosePaddleList').children[0].focus();
    setTimeout(() => {
        choosePaddlePanel.classList.add("appearing");
    }, 100);
}
document.getElementById('choosePaddle1Button').addEventListener('click', () => {
    choosePaddleSkin(1);
});
document.getElementById('choosePaddle2Button').addEventListener('click', () => {
    choosePaddleSkin(2);
});

let paddleChoiceIsOpen = false;

export function isPaddleChoiceOpen()
{
    return paddleChoiceIsOpen;
}

export function closePaddleChoice()
{
    paddleChoiceIsOpen = false;
    const currentView = getCurrentView();
    if (currentView === 'rules')
        document.getElementById('choosePaddleButton').focus();
    choosePaddlePanel.classList.remove("appearing");
    setTimeout(() => {
        choosePaddlePanel.style.display = "none";
    }, 100);
}

function choosePaddleSkin(nbr)
{
    document.getElementById('choosePaddleImg').src = `static/images/paddle${nbr}Img.png`;
    playerStats.currentPaddleSkin = nbr;
    // envoyer nbr au serveur lors d'un match online
    // genre setPaddleSkin(nbr, playerId);
    closePaddleChoice();
}