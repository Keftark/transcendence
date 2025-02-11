import { balle, BOUNDARY, getPlayer, finalHeight } from "./levelLocal.js";
import { getLevelState, isAnOnlineMode } from "./main.js";
import { isMenuOpen, isSettingsOpen } from "./menu.js";
import { playerStats } from "./playerManager.js";
import { resetBoostBar } from "./powerUp.js";
import { socketBoostPaddle, socketPlayerDown, socketPlayerDownNot, socketPlayerUp, socketPlayerUpNot } from "./sockets.js";
import { LevelMode } from "./variables.js";

const inputChat = document.getElementById('inputChat');
const moveSpeed = 300;
let onKeyUpFunction = null;
let onKeyDownFunction = null;
let setPlayersPositionsFunction = null;
let isBoostedLeft = false;
let isBoostedRight = false;
let botTargetPosition = 0;
const botDelay = 1000;
let rotationBoost = 0;

export function setPlayerController(id_p1, id_p2, id_p3 = null, id_p4 = null)
{
    if (playerStats.id === id_p1)
        playerStats.playerController = 1;
    else if (playerStats.id === id_p2)
        playerStats.playerController = 2;
    else if (id_p3 != null && playerStats.id === id_p3)
        playerStats.playerController = 3;
    else if (id_p4 != null && playerStats.id === id_p4)
        playerStats.playerController = 4;
}

export function setPlayersPositions(p1Pos, p2Pos)
{
    setPlayersPositionsFunction(p1Pos, p2Pos);
}

export function addPlayerMovementKeyDown(event)
{
    onKeyDownFunction(event);
}

export function addPlayerMovementKeyUp(event)
{
    onKeyUpFunction(event);
}

export function showBoostPlayer(playerNbr, showOrHide)
{
    if (playerNbr === 0)
    {
        isBoostedLeft = showOrHide;
    }
    else
    {
        isBoostedRight = showOrHide;
    }
    getPlayer(playerNbr).children[0].visible = showOrHide;
}

export function boostPlayer(playerNbr)
{
    if (playerNbr === 0)
    {
        socketBoostPaddle(); // WTF!!! it's the same thing
    }
    else
    {
        socketBoostPaddle();
    }
    showBoostPlayer(playerNbr, true);
}

export function stopBoostPlayer(playerNbr)
{
    if (playerNbr === 0)
        isBoostedLeft = false;
    else
        isBoostedRight = false;
    showBoostPlayer(playerNbr, false);
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

export function animatePlayers(player1, player2)
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

function setPlayer1Bounds(levelState)
{
    const minY = levelState === LevelMode.MULTI ? 0 : BOUNDARY.Y_MIN;
    let boundsMovement = 
    {
        min: minY, // - 1.5 ?
        max: BOUNDARY.Y_MAX // + 1.5 ?
    }
    return boundsMovement;
}

function setPlayer3Bounds(levelState)
{
    const maxY = levelState === LevelMode.MULTI ? 0 : BOUNDARY.Y_MAX;
    let boundsMovement = 
    {
        min: BOUNDARY.Y_MIN,
        max: maxY
    }
    return boundsMovement;
}

export function setupPlayerMovement(player1, player2, player3, player4)
{
    // if (playerStats.playerController === -1)
    //     return null;
    let moveUp1 = false;
    let moveDown1 = false;
    let moveUp2 = false;
    let moveDown2 = false;
    const levelState = getLevelState();
    let isViewHorizontal = levelState != LevelMode.ADVENTURE;
    let boundsPlayer = [4];
    boundsPlayer[0] = boundsPlayer[1] = setPlayer1Bounds(levelState);
    boundsPlayer[2] = boundsPlayer[3] = setPlayer3Bounds(levelState);
    const boundymax = setPlayer1Bounds(levelState).max;
    const boundymin = setPlayer1Bounds(levelState).min;
    const mode = levelState === LevelMode.ONLINE ? "1v1_classic" : "2v2_clasic";

    function checkKeys(event, isTrue)
    {
        if (playerStats.playerController == -1) // si le joueur est en spectateur, son controller est a -1
            return;
        if (document.activeElement === inputChat || isMenuOpen || isSettingsOpen())
        {
            moveUp1 = false;
            moveDown1 = false;
            moveUp2 = false;
            moveDown2 = false;
            return;
        }
        if (event.key === 'w' && isViewHorizontal)
            moveUp1 = isTrue;
        else if (event.key === 's' && isViewHorizontal)
            moveDown1 = isTrue;
        else if (event.key === 'ArrowUp' && isViewHorizontal)
            moveUp2 = isTrue;
        else if (event.key === 'ArrowDown' && isViewHorizontal)
            moveDown2 = isTrue;
        else if ((event.key === 'a' || event.key === 'ArrowLeft') && !isViewHorizontal)
            moveUp1 = isTrue;
        else if ((event.key === 'd' || event.key === 'ArrowRight') && !isViewHorizontal)
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

    function getPlayer(playerNbr)
    {
        if (playerNbr === 0 || playerNbr === 1)
            return player1;
        if (playerNbr === 2)
            return player2;
        if (playerNbr === 3)
            return player3;
        if (playerNbr === 4)
            return player4;
    }

    setPlayersPositionsFunction = function setPlayerPosition(p1Pos, p2Pos)
    {
        player1.position.y = p1Pos;
        player2.position.y = p2Pos;
    }

    let isUp = false;
    let isDown = false;
    function checkPlayer1Movements(adjustedSpeed)
    {
        const controller = playerStats.playerController;
        const player = getPlayer(controller);
        let playerposy = player.position.y || 0;
        const playerBound = finalHeight / 2;
        if (moveUp1 && !moveDown1)
        {
            if (isAnOnlineMode(levelState) && !isUp)
            {
                if (isDown)
                {
                    isDown = false;
                    socketPlayerDownNot(mode);
                }
                isUp = true;
                socketPlayerUp(mode);
            }
            else
            {
                const newPosition = lerp(playerposy, playerposy + adjustedSpeed, 0.1);
                player.position.y = Math.min(newPosition, boundsPlayer[controller - 1].max - playerBound);    
            }
        }
        else if (moveDown1 && !moveUp1)
        {
            if (isAnOnlineMode(levelState) && !isDown)
            {
                if (isUp)
                {
                    isUp = false;
                    socketPlayerUpNot(mode);
                }
                isDown = true;
                socketPlayerDown(mode);
            }
            else
            {
                const newPosition = lerp(playerposy, playerposy - adjustedSpeed, 0.1);
                player.position.y = Math.max(newPosition, boundsPlayer[controller - 1].min + playerBound);
            }
        }
        else if ((moveUp1 && moveDown1) || (!moveUp1 && !moveDown1))
        {
            if (isUp)
            {
                isUp = false;
                socketPlayerUpNot(mode);
            }
            if (isDown)
            {
                isDown = false;
                socketPlayerDownNot(mode);
            }
        }

    }

    function checkPlayer2Movements(adjustedSpeed)
    {
        let playerposy = player2.position.y || 0;
        const playerBound = finalHeight / 2;
    
        if (moveUp2 && !moveDown2) {
            const newPosition = lerp(playerposy, playerposy + adjustedSpeed, 0.1);
            player2.position.y = Math.min(newPosition, boundsPlayer[1].max - playerBound);
        } else if (moveDown2 && !moveUp2) {
            const newPosition = lerp(playerposy, playerposy - adjustedSpeed, 0.1);
            player2.position.y = Math.max(newPosition, boundsPlayer[1].min + playerBound);
        }
    }

    let botCanMove = false;
    function moveBot()
    {
        botCanMove = !botCanMove;
        if (balle != null)
            botTargetPosition = balle.position.y;
    }

    function checkBotMovements(adjustedSpeed)
    {
        if ((botTargetPosition > player2.position.y - finalHeight / 8 &&
            botTargetPosition < player2.position.y + finalHeight / 8) || !botCanMove)
            return;
    
        let playerposy = player2.position.y || 0;
        const up = balle.position.y >= player2.position.y;
        const playerHalfHeight = finalHeight / 4;
        const playerQuarterHeight = finalHeight / 8;
        const upperLimit = BOUNDARY.Y_MAX - playerHalfHeight;
        const lowerLimit = BOUNDARY.Y_MIN + playerHalfHeight;
    
        if (playerposy > lowerLimit && playerposy < upperLimit)
        {
            const targetPosition = up ? playerposy + adjustedSpeed : playerposy - adjustedSpeed;
            player2.position.y = lerp(playerposy, targetPosition, 0.1);
    
            const clampedPosition = up
                ? Math.min(player2.position.y, upperLimit - playerQuarterHeight)
                : Math.max(player2.position.y, lowerLimit + playerQuarterHeight);
    
            player2.position.y = clampedPosition;
        }
        player2.position.y = Math.max(boundymin, Math.min(player2.position.y, boundymax));
    }

    function updatePlayers(deltaTime)
    {
        animatePlayers(player1, player2);
        if (playerStats.playerController == -1)
            return;
        const adjustedSpeed = moveSpeed * (deltaTime / 1000);
        checkPlayer1Movements(adjustedSpeed);
        if (levelState === LevelMode.ADVENTURE)
            checkBotMovements(adjustedSpeed);
        else if (levelState === LevelMode.LOCAL || levelState === LevelMode.TOURNAMENT)
            checkPlayer2Movements(adjustedSpeed);
        else
        {
            // check players 3 and 4
        }
    }

    document.addEventListener('keydown', addPlayerMovementKeyDown);
    document.addEventListener('keyup', addPlayerMovementKeyUp);

    if (levelState === LevelMode.ADVENTURE)
        setInterval(moveBot, botDelay);
    return { updatePlayers };
}