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

export function setupPlayerMovement(player1, player2, boundYMin, boundYMax)
{
    let moveUp1 = false;
    let moveDown1 = false;
    let moveUp2 = false;
    let moveDown2 = false;

    onKeyDownFunction = function onKeyDown(event)
    {
        if (getLevelState() === LevelMode.LOCAL)
        {
            if (event.key === 'w')
                moveUp1 = true;
            else if (event.key === 's')
                moveDown1 = true;
            else if (event.key === 'ArrowUp')
                moveUp2 = true;
            else if (event.key === 'ArrowDown')
                moveDown2 = true;
        }
    }

    onKeyUpFunction = function onKeyUp(event)
    {
        if (getLevelState() === LevelMode.LOCAL)
        {
            if (event.key === 'w')
                moveUp1 = false;
            else if (event.key === 's')
                moveDown1 = false;
            else if (event.key === 'ArrowUp')
                moveUp2 = false;
            else if (event.key === 'ArrowDown')
                moveDown2 = false;
        }
    }
    function lerp(start, end, t) {
        return start + (end - start) * t;
    }
    function updatePlayers(deltaTime)
    {
        const adjustedSpeed = moveSpeed * (deltaTime / 1000);
        if (moveUp1 && !moveDown1 && player1.position.y < boundYMax - 5)
            player1.position.y = lerp(player1.position.y, player1.position.y + adjustedSpeed, 0.1);
        if (moveDown1 && !moveUp1 && player1.position.y > boundYMin + 5)
            player1.position.y = lerp(player1.position.y, player1.position.y - adjustedSpeed, 0.1);
        if (getLevelState() != LevelMode.LOCAL)
            return;
        if (moveUp2 && !moveDown2 && player2.position.y < boundYMax - 5)
            player2.position.y = lerp(player2.position.y, player2.position.y + adjustedSpeed, 0.1);
        if (moveDown2 && !moveUp2 && player2.position.y > boundYMin + 5)
            player2.position.y = lerp(player2.position.y, player2.position.y - adjustedSpeed, 0.1);
    }

    document.addEventListener('keydown', addPlayerMovementKeyDown);
    document.addEventListener('keyup', addPlayerMovementKeyUp);

    return { updatePlayers };
}