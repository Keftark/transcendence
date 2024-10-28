import { endMatch } from "./levelLocal";
import { clickPlayGame } from "./menu";
import { navigateTo } from "./pages";
import { endOfMatch } from "./scoreManager";
import { ArenaType } from "./variables";

window.selectArena = selectArena;
document.getElementById('buttonCancelRules').addEventListener('click', clickCancelRules);

const nbrPointsInput = document.getElementById('rulesPointsInput');
let selectedArena = 0;
const timerInput = document.getElementById('rulesTimerInput');
const buttonStart = document.getElementById('buttonAcceptRules');
const arenas = document.getElementById('arenas').querySelectorAll('.arena');

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
        arenas[selectedArena].classList.remove('applyBorder');
        selectedArena = arenaIndex;
        const child = arenas[arenaIndex];
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
    arenas[selectedArena].classList.remove('applyBorder');
    arenas[0].classList.add('applyBorder');
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

export function clickCancelRules()
{
    navigateTo('modes');
    resetInputfieldsRules();
}

document.getElementById('rulesArenaTypeCave').classList.add('applyBorder');
