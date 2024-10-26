import { balle } from "./levelLocal";
import { getLevelState } from "./main";
import { LevelMode } from "./variables";

const moveSpeed = 300;
let onKeyUpFunction = null;
let onKeyDownFunction = null;

export function addPlayerMovementKeyDown(event)
{
    onKeyDownFunction(event);
}

export function addPlayerMovementKeyUp(event)
{
    onKeyUpFunction(event);
}

const myInput = document.getElementById('inputChat');
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
        if (document.activeElement === myInput)
            return;
        if (event.key === 'w')
            moveUp1 = isTrue;
        else if (event.key === 's')
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
        if (moveUp1 && !moveDown1 && playerposy < boundymax)
            player1.position.y = lerp(playerposy, playerposy + adjustedSpeed, 0.1);
        if (moveDown1 && !moveUp1 && playerposy > boundymin)
            player1.position.y = lerp(playerposy, playerposy - adjustedSpeed, 0.1);
    }

    function checkPlayer2Movements(adjustedSpeed)
    {
        let playerposy = player2.position.y;
        if (moveUp2 && !moveDown2 && playerposy < boundymax)
            player2.position.y = lerp(playerposy, playerposy + adjustedSpeed, 0.1);
        else if (moveDown2 && !moveUp2 && playerposy > boundymin)
            player2.position.y = lerp(playerposy, playerposy - adjustedSpeed, 0.1);
    }

    function checkBotMovements(adjustedSpeed)
    {
        let playerposy = player2.position.y;
        if (playerposy < boundYMax && playerposy > boundYMin)
            player2.position.y = lerp(playerposy, balle.position.y, 0.02 * adjustedSpeed); // 0.02 = les reflexes du bot. voir pour changer ca en fonction de la difficulte
        if (player2.position.y > boundymax)
            player2.position.y = boundymax;
        else if (player2.position.y < boundymin)
            player2.position.y = boundymin;
    }

    function updatePlayers(deltaTime)
    {
        const adjustedSpeed = moveSpeed * (deltaTime / 1000);
        checkPlayer1Movements(adjustedSpeed);
        if (getLevelState() === LevelMode.ADVENTURE)
            checkBotMovements(adjustedSpeed);
        else if (getLevelState() === LevelMode.LOCAL)
            checkPlayer2Movements(adjustedSpeed);
    }

    document.addEventListener('keydown', addPlayerMovementKeyDown);
    document.addEventListener('keyup', addPlayerMovementKeyUp);

    return { updatePlayers };
}