import { balle } from "./levelLocal";
import { getLevelState, LevelMode } from "./main";

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

const myInput = document.getElementById('myInput');
export function setupPlayerMovement(player1, player2, boundYMin, boundYMax)
{
    let moveUp1 = false;
    let moveDown1 = false;
    let moveUp2 = false;
    let moveDown2 = false;
    let isLocal = getLevelState() === LevelMode.LOCAL;

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
        if (moveUp1 && !moveDown1 && player1.position.y < boundYMax - 5)
            player1.position.y = lerp(player1.position.y, player1.position.y + adjustedSpeed, 0.1);
        if (moveDown1 && !moveUp1 && player1.position.y > boundYMin + 5)
            player1.position.y = lerp(player1.position.y, player1.position.y - adjustedSpeed, 0.1);
    }

    function checkPlayer2Movements(adjustedSpeed)
    {
        if (moveUp2 && !moveDown2 && player2.position.y < boundYMax - 5)
            player2.position.y = lerp(player2.position.y, player2.position.y + adjustedSpeed, 0.1);
        if (moveDown2 && !moveUp2 && player2.position.y > boundYMin + 5)
            player2.position.y = lerp(player2.position.y, player2.position.y - adjustedSpeed, 0.1);
    }

    function checkBotMovements(adjustedSpeed)
    {
        if (player2.position.y < boundYMax && player2.position.y > boundYMin)
            player2.position.y = lerp(player2.position.y, balle.position.y, 0.1 * adjustedSpeed);
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