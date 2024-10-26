import { endMatch } from "./levelLocal";
import { clickPlayGame } from "./menu";
import { navigateTo } from "./pages";
import { endOfMatch } from "./scoreManager";
import { ArenaType } from "./variables";

window.selectArena = selectArena;

const nbrPointsInput = document.getElementById('rulesPointsInput');
let selectedArena = 0;
const timerInput = document.getElementById('rulesTimerInput');
const buttonStart = document.getElementById('buttonAcceptRules');

buttonStart.addEventListener('click', () => {
    clickPlayGame();
});

let rules =
{
    pointsToWin: 3,
    arena: ArenaType.CAVE, 
    maxTime: 0,
}

export function setDefaultRules()
{
    rules.pointsToWin = 3;
    rules.arena = ArenaType.CAVE; // faire un random ?
    rules.maxTime = 0;
}

export function selectArena(arenaIndex)
{
    if (selectedArena != arenaIndex)
    {
        document.getElementById('arenas').querySelectorAll('.arena')[selectedArena].classList.remove('applyBorder');
        selectedArena = arenaIndex;
        const child = document.getElementById('arenas').querySelectorAll('.arena')[arenaIndex];
        child.classList.add('applyBorder');
    }
    
}

export function setCustomRules()
{
    rules.pointsToWin = nbrPointsInput.value;
    rules.arena = selectedArena;
    rules.maxTime = timerInput.value;
}

export function resetInputfieldsRules()
{
    nbrPointsInput.value = '3';
    selectedArena = 0;
    timerInput.value = '0';
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

export function openRules()
{
    navigateTo('rules');
}

document.getElementById('rulesArenaTypeCave').classList.add('applyBorder');
