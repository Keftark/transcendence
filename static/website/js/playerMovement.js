import { balle, getPlayer } from "./levelLocal.js";
import { getLevelState } from "./main.js";
import { isMenuOpen, isSettingsOpen } from "./menu.js";
import { resetBoostBar } from "./powerUp.js";
import { LevelMode } from "./variables.js";

const inputChat = document.getElementById('inputChat');
const moveSpeed = 300;
let onKeyUpFunction = null;
let onKeyDownFunction = null;
let isBoostedLeft = false;
let isBoostedRight = false;
let botTargetPosition = 0;
const botDelay = 1000;
let rotationBoost = 0;

export function addPlayerMovementKeyDown(event)
{
    onKeyDownFunction(event);
}

export function addPlayerMovementKeyUp(event)
{
    onKeyUpFunction(event);
}

export function boostPlayer(playerNbr)
{
    if (playerNbr === 0)
        isBoostedLeft = true;
    else
        isBoostedRight = true;
    getPlayer(playerNbr).children[0].visible = true;
}

export function stopBoostPlayer(playerNbr)
{
    if (playerNbr === 0)
        isBoostedLeft = false;
    else
        isBoostedRight = false;
    getPlayer(playerNbr).children[0].visible = false;
}

export function stopBoostPlayers()
{
    resetBoostBar();
    isBoostedLeft = isBoostedRight = false;
    getPlayer(0).children[0].visible = getPlayer(1).children[0].visible = false;
}

export function getBoostedStatus(playerNbr)
{
    if (playerNbr === 0)
        return isBoostedLeft;
    else
        return isBoostedRight;
}

export function resetBoostedStatus()
{
    isBoostedLeft = isBoostedRight = false;
}

function animatePlayers(player1, player2)
{
    rotationBoost++;
    if (rotationBoost == 2)
    {
        if (isBoostedLeft)
            player1.children[0].rotation.y = Math.random() * Math.PI * 2;
        if (isBoostedRight)
            player2.children[0].rotation.y = Math.random() * Math.PI * 2;
        rotationBoost = 0;
    }
}

export function setupPlayerMovement(player1, player2, boundYMin, boundYMax)
{
    let moveUp1 = false;
    let moveDown1 = false;
    let moveUp2 = false;
    let moveDown2 = false;
    let isLocal = getLevelState() === LevelMode.LOCAL;
    const boundymax = boundYMax - 7.2;
    const boundymin = boundYMin + 7.2;

    function checkKeys(event, isTrue)
    {
        if (document.activeElement === inputChat || isMenuOpen || isSettingsOpen())
        {
            moveUp1 = false;
            moveDown1 = false;
            moveUp2 = false;
            moveDown2 = false;
            return;
        }
        if (event.key === 'w' && isLocal)
            moveUp1 = isTrue;
        else if (event.key === 's' && isLocal)
            moveDown1 = isTrue;
        else if (event.key === 'ArrowUp' && isLocal)
            moveUp2 = isTrue;
        else if (event.key === 'ArrowDown' && isLocal)
            moveDown2 = isTrue;
        else if (event.key === 'a' && !isLocal)
            moveUp1 = isTrue;
        else if (event.key === 'd' && !isLocal)
            moveDown1 = isTrue;
    }

    onKeyDownFunction = function onKeyDown(event)
    {
        checkKeys(event, true);
    }

    onKeyUpFunction = function onKeyUp(event)
    {
        checkKeys(event, false);
    }
    function lerp(start, end, t) {
        return start + (end - start) * t;
    }

    function checkPlayer1Movements(adjustedSpeed)
    {
        let playerposy = player1.position.y;
        if (isNaN(playerposy))
            playerposy = 0;
        if (moveUp1 && !moveDown1 && playerposy < boundymax)
            player1.position.y = lerp(playerposy, playerposy + adjustedSpeed, 0.1);
        if (moveDown1 && !moveUp1 && playerposy > boundymin)
            player1.position.y = lerp(playerposy, playerposy - adjustedSpeed, 0.1);
    }

    function checkPlayer2Movements(adjustedSpeed)
    {
        let playerposy = player2.position.y;
        if (isNaN(playerposy))
            playerposy = 0;
        if (moveUp2 && !moveDown2 && playerposy < boundymax)
            player2.position.y = lerp(playerposy, playerposy + adjustedSpeed, 0.1);
        else if (moveDown2 && !moveUp2 && playerposy > boundymin)
            player2.position.y = lerp(playerposy, playerposy - adjustedSpeed, 0.1);
    }

    function moveBot()
    {
        if (balle != null)
            botTargetPosition = balle.position.y;
    }

    function checkBotMovements(adjustedSpeed)
    {
        let playerposy = player2.position.y;
        if (isNaN(playerposy))
            playerposy = 0;
        if (playerposy < boundYMax && playerposy > boundYMin)
            player2.position.y = lerp(playerposy, botTargetPosition, 0.013 * adjustedSpeed); // 0.02 = les reflexes du bot. voir pour changer ca en fonction de la difficulte
        if (player2.position.y > boundymax)
            player2.position.y = boundymax;
        else if (player2.position.y < boundymin)
            player2.position.y = boundymin;
    }

    function updatePlayers(deltaTime)
    {
        animatePlayers(player1, player2);
        const adjustedSpeed = moveSpeed * (deltaTime / 1000);
        checkPlayer1Movements(adjustedSpeed);
        if (getLevelState() === LevelMode.ADVENTURE)
            checkBotMovements(adjustedSpeed);
        else if (getLevelState() === LevelMode.LOCAL)
            checkPlayer2Movements(adjustedSpeed);
    }

    document.addEventListener('keydown', addPlayerMovementKeyDown);
    document.addEventListener('keyup', addPlayerMovementKeyUp);

    if (getLevelState() === LevelMode.ADVENTURE)
        setInterval(moveBot, botDelay);
    return { updatePlayers };
}