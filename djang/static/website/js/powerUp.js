import { showBoostedBall } from "./ball.js";
import { getPlayerNbr } from "./levelLocal.js";
import { boostPlayer, showBoostPlayer } from "./playerMovement.js";

const boostBarUILeft = document.getElementById('boostBarUILeft');
const bonusBarLeft = document.getElementById('boostBarFillLeft');
const pressTextLeft = document.getElementById('pressBoostTextLeft');
const boostBarUIRight = document.getElementById('boostBarUIRight');
const bonusBarRight = document.getElementById('boostBarFillRight');
const pressTextRight = document.getElementById('pressBoostTextRight');

let fillAmountLeft = 0;
let isReadyLeft = false;
let doOnceLeft = false;
let fillAmountRight = 0;
let isReadyRight = false;
let doOnceRight = false;

let p1OldAmount = 0; 
let p2OldAmount = 0; 
let p3OldAmount = 0; 
let p4OldAmount = 0; 

export function setPowerBarsPlayers(p1Amount, p2Amount, p3Amount = null, p4Amount = null)
{
    if (p1Amount === p1OldAmount && p2Amount === p2OldAmount)
        return;
    if (p3Amount !== null && p1Amount === p1OldAmount && p2Amount === p2OldAmount && p3Amount === p3OldAmount && p4Amount === p4OldAmount)
        return;
    const playerNbr = getPlayerNbr();
    // console.log("Player nbr: " + playerNbr);
    if (playerNbr === 0)
    {
        // console.log("P1 changes its state: " + p1Amount);
        p1OldAmount = p1Amount;
        setPowerBarLeft(p1Amount);
    }
    else if (playerNbr === 1)
    {
        // console.log("P2 changes its state: " + p2Amount);
        p2OldAmount = p2Amount;
        setPowerBarRight(p2Amount);
    }
    else if (playerNbr === 2)
    {
        // console.log("P3 changes its state: " + p3Amount);
        p3OldAmount = p3Amount;
        setPowerBarLeft(p3Amount);
    }
    else if (playerNbr === 3)
    {
        // console.log("P4 changes its state: " + p4Amount);
        p4OldAmount = p4Amount;
        setPowerBarRight(p4Amount);
    }
}

export function resetPowerBarLeft()
{
    boostBarUILeft.classList.remove('ready');
    doOnceLeft = isReadyLeft = false;
    fillAmountLeft = 0;
    pressTextLeft.style.display = 'none';
    updateBarLeft();
}

export function fillPowerBarLeft(amount)
{
    fillAmountLeft += amount;
    updateBarLeft();
}

function setPowerBarLeft(amount)
{
    if (amount === fillAmountLeft)
        return;
    fillAmountLeft = amount;
    updateBarLeft();
}

function updateBarLeft()
{
    if (fillAmountLeft >= 100)
    {
        fillAmountLeft = 100;
        isReadyLeft = true;
        if (!doOnceLeft)
        {
            pressTextLeft.style.display = 'flex';
            doOnceLeft = true;
            makeGlowLeft();
        }
    }
    bonusBarLeft.style.width = "calc(" + fillAmountLeft + "% - 4px)";
}

function makeGlowLeft()
{
    if (isReadyLeft)
    {
        boostBarUILeft.classList.toggle('ready');
        setTimeout(() => {
            makeGlowLeft();
        }, 400);
    }
    else
        pressTextLeft.style.display = 'none';
}

export function isBoostReadyLeft()
{
    return isReadyLeft;
}

export function showBoostBarLeft()
{
    boostBarUILeft.style.display = 'flex';
}

export function hideBoostBarLeft()
{
    boostBarUILeft.style.display = 'none';
}

export function resetPowerBarRight()
{
    boostBarUIRight.classList.remove('ready');
    doOnceRight = isReadyRight = false;
    fillAmountRight = 0;
    pressTextRight.style.display = 'none';
    updateBarRight();
}

export function fillPowerBarRight(amount)
{
    fillAmountRight += amount;
    updateBarRight();
}

function setPowerBarRight(amount)
{
    if (amount === fillAmountRight)
        return;
    fillAmountRight = amount;
    updateBarRight();
}

function updateBarRight()
{
    if (fillAmountRight >= 100)
    {
        fillAmountRight = 100;
        isReadyRight = true;
        if (!doOnceRight)
        {
            pressTextRight.style.display = 'flex';
            doOnceRight = true;
            makeGlowRight();
        }
    }
    bonusBarRight.style.width = "calc(" + fillAmountRight + "% - 4px)";
}

function makeGlowRight()
{
    if (isReadyRight)
    {
        boostBarUIRight.classList.toggle('ready');
        setTimeout(() => {
            makeGlowRight();
        }, 400);
    }
    else
        pressTextRight.style.display = 'none';
}

export function isBoostReadyRight()
{
    return isReadyRight;
}

export function showBoostBarRight()
{
    boostBarUIRight.style.display = 'flex';
}

export function hideBoostBarRight()
{
    boostBarUIRight.style.display = 'none';
}

export function resetBoostBar()
{
    resetPowerBarLeft();
    resetPowerBarRight();
}

export function useBoost(playerNbr = 0)
{
    setTimeout(() => {
        if (playerNbr === 0)
            resetPowerBarLeft();
        else if (playerNbr === 1)
            resetPowerBarRight();
        else if (playerNbr === 2)
            resetPowerBarLeft();
        else if (playerNbr === 3)
            resetPowerBarRight();
    }, 20);
    boostPlayer(playerNbr);
}

let oldP1Boosted = false;
let oldP2Boosted = false;
let oldBallBoosted = false;
export function checkPowerUpState(p1Boosted, p2Boosted, ballBoosted)
{
    if (p1Boosted != oldP1Boosted)
    {
        if (p1Boosted && !oldP1Boosted)
        {
            showBoostPlayer(0, true);
            // on montre le boost du joueur 1
        }
        else if (!p1Boosted && oldP1Boosted)
        {
            showBoostPlayer(0, false);
            // on cache le boost du joueur 1
        }
        oldP1Boosted = p1Boosted;
    }
    if (p2Boosted != oldP2Boosted)
    {
        if (p2Boosted && !oldP2Boosted)
        {
            showBoostPlayer(1, true);
            // on montre le boost du joueur 2
        }
        else if (!p2Boosted && oldP2Boosted)
        {
            showBoostPlayer(1, false);
            // on cache le boost du joueur 2
        }
        oldP2Boosted = p2Boosted;
    }
    if (ballBoosted != oldBallBoosted)
    {
        if (ballBoosted && !oldBallBoosted)
        {
            showBoostedBall(true);
        }
        else if (!ballBoosted && oldBallBoosted)
        {
            showBoostedBall(false);
        }
        oldBallBoosted = ballBoosted;
    }
}

resetPowerBarLeft();
resetPowerBarRight();