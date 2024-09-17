const moveSpeed = 0.7;
export function setupPlayerMovement(player1, player2, boundYMin, boundYMax)
{
    let moveUp1 = false;
    let moveDown1 = false;
    let moveUp2 = false;
    let moveDown2 = false;

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    function onKeyDown(event)
    {
        if (event.key === 'w')
            moveUp1 = true;
        if (event.key === 's')
            moveDown1 = true;
        if (event.key === 'ArrowUp')
            moveUp2 = true;
        if (event.key === 'ArrowDown')
            moveDown2 = true;
    }

    function onKeyUp(event)
    {
        if (event.key === 'w')
            moveUp1 = false;
        if (event.key === 's')
            moveDown1 = false;
        if (event.key === 'ArrowUp')
            moveUp2 = false;
        if (event.key === 'ArrowDown')
            moveDown2 = false;
    }

    function updatePlayers()
    {
        if (moveUp1 && player1.position.y < boundYMax - 5)
            player1.position.y += moveSpeed;
        if (moveDown1 && player1.position.y > boundYMin + 5)
            player1.position.y -= moveSpeed;
        if (moveUp2 && player2.position.y < boundYMax - 5)
            player2.position.y += moveSpeed;
        if (moveDown2 && player2.position.y > boundYMin + 5)
            player2.position.y -= moveSpeed;
    }

    return { updatePlayers };
}