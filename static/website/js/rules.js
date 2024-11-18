import { endMatch } from "./levelLocal.js";
import { addDisableButtonEffect, removeDisableButtonEffect } from "./main.js";
import { clickPlayGame, showModeChoice } from "./menu.js";
import { navigateTo } from "./pages.js";
import { playerStats } from "./playerManager.js";
import { endOfMatch } from "./scoreManager.js";
import { goTournamentMenu } from "./tournament.js";
import { ArenaType } from "./variables.js";

document.getElementById('buttonCancelRules').addEventListener('click', clickCancelRules);

document.getElementById('rulesArenaTypeCave').addEventListener('click', () => {
    selectArena(0);
});
document.getElementById('rulesArenaTypeSpace').addEventListener('click', () => {
    selectArena(1);
});

const nbrPointsInput = document.getElementById('rulesPointsInput');
let selectedArena = 0;
const timerInput = document.getElementById('rulesTimerInput');
const buttonStart = document.getElementById('buttonAcceptRules');
const nbrOfPlayersField = document.getElementById('rulesMaxPlayers');
const nbrOfPlayersInput = document.getElementById('rulesMaxPlayersInput');
const arenas = document.getElementById('arenas').querySelectorAll('.arena');
let playerDuelId = "";
let isTournament = false;

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
}

export function resetInputfieldsRules()
{
    arenas[selectedArena].classList.remove('applyBorder');
    arenas[0].classList.add('applyBorder');
    nbrPointsInput.value = '3';
    selectedArena = 0;
    timerInput.value = '0';
    nbrOfPlayersInput.value = '0';
    addDisableButtonEffect(buttonStart);
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

export function onOpenRules(fromTournament)
{
    isTournament = fromTournament === null ? false : true;
    nbrOfPlayersField.style.display = fromTournament === null ? 'none' : 'flex';
    playerDuelId = playerStats.id;
    nbrPointsInput.select();
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

document.getElementById('rulesArenaTypeCave').classList.add('applyBorder');

timerInput.addEventListener("input", () => {
    endEditInputFieldRules();
});

nbrPointsInput.addEventListener("input", () => {
    endEditInputFieldRules();
});

nbrOfPlayersInput.addEventListener("input", () => {
    endEditInputFieldRules();
});
