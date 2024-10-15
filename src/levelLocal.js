import { animateCamera, resetCamera } from './cameranim.js';
import { setupPlayerMovement } from './playerMovement.js';
import { createBall } from './ball.js';
import { ScreenShake } from './screenShake.js';
import { setScores, addScore, setVisibleScore } from './scoreManager.js';
import { createLights, createPlayers, drawBackground, drawLine, createWalls, setVisibilityRightWall } from './objects.js';
import { setLevelState, LevelMode, getLevelState } from './main.js';
import { unloadScene } from './unloadScene.js';
import { removeMainEvents, showCursor } from './eventsListener.js';
import { sendSystemMessage, tryCloseChat } from './chat.js';
import { playerStats } from './playerManager.js';
import { getTranslation } from './translate.js';

export const playerBaseHeight = 12;
export const PLAYER_RADIUS = 1;
export const PLAYER_HEIGHT = playerBaseHeight;
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
export const BOUNDARY =
{
  Y_MIN: -25,
  Y_MAX: 25,
  X_MIN: -40,
  X_MAX: 40
}

export function isVictory(match)
{
    return (match.scorePlayer > match.scoreOpponent);
}

export function CreateMatchScore(newScorePlayer, newScoreOpponent)
{
    return {scorePlayer:newScorePlayer, scoreOpponent:newScoreOpponent};
}

export let balle;

export const ballBaseRadius = 0.8;
export const ballBaseSpeed = 0.7;

export let ballStats = 
{
    BALL_RADIUS: ballBaseRadius,
    MOVE_SPEED: ballBaseSpeed
}

var scene;
let animationId;
let renderer;
let resetFunction;
let pressEscapeFunction = null;
let pressSpaceFunction = null;
let player1, player2;
let camera = null;
let screenShake = null;
let pressPlayDiv = null;
let playDiv = null;
let changeBallSizeFunction = null;
let changeBallSpeedFunction = null;
let player1KeysLocal = document.getElementById('controlsP1LocalImg');
let player2KeysLocal = document.getElementById('controlsP2LocalImg');
let playerKeysAdventure = document.getElementById('controlsAdventureImg');

export function getBallStats()
{
    return ballStats;
}

export function setBallStats(newRadius, newSpeed)
{
    ballStats.BALL_RADIUS = newRadius;
    ballStats.MOVE_SPEED = newSpeed;
}

export function unloadLevel()
{
    unloadScene(scene, renderer, animationId);
    resetFunction(true);
}

export function eventsListener(event)
{
    if (pressEscapeFunction === null)
        return;
    pressSpaceFunction(event);
    pressEscapeFunction(event);
}

export function setUpCamera()
{
    let camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
    if (getLevelState() === LevelMode.LOCAL)
    {
        camera.position.z = 50;
    }
    else if (getLevelState() === LevelMode.ADVENTURE)
    {
        camera.position.set(50, 0, 30);
    }
    return camera;
}

export function setUpScene()
{
    scene = new THREE.Scene();
    camera = setUpCamera();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(renderer.domElement);
}

function showKeys()
{
    if (getLevelState() === LevelMode.LOCAL)
    {
        player1KeysLocal.style.display = 'block';
        player2KeysLocal.style.display = 'block';
    }
    else if (getLevelState() === LevelMode.ADVENTURE)
        playerKeysAdventure.style.display = 'block';
}

function setPlayerNames()
{
    if (getLevelState() === LevelMode.LOCAL)
        return;
    if (getLevelState() === LevelMode.ADVENTURE)
        document.getElementById('playername-right').innerText = getTranslation('botName');
    else
        document.getElementById('playername-left').innerText = playerStats.isRegistered ? playerStats.nickname : getTranslation('playernameleft');
}

export function setUpLevel(scene)
{
    document.getElementById('menuPanel').style.display = 'block';
    showKeys();
    [player1, player2] = createPlayers(scene);
    createLights(scene);
    resetPlayersPositions();
    createWalls(scene);
    drawBackground(scene);
}

export function changeBallSizeInstance(newSize)
{
    changeBallSizeFunction(newSize);
}

export function changeBallSpeedInstance(newSize)
{
    changeBallSpeedFunction(newSize);
}

function setUpConsts()
{
    if (screenShake != null)
        return;
    screenShake = new ScreenShake(camera);
    pressPlayDiv = document.getElementById('pressplay');
    playDiv = document.getElementById('play');
}
  
function resetPlayersPositions()
{
    player1.position.set(BOUNDARY.X_MIN, 0, 0);
    player2.position.set(BOUNDARY.X_MAX, 0, 0);
}


export function changePlayersSize(newHeight)
{
    if (isNaN(newHeight))
        newHeight = playerBaseHeight;
    const newGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, newHeight, 8, 1, false);
    player1.geometry.dispose(); // Dispose of the old geometry to free up memory
    player1.geometry = newGeometry;
    player2.geometry.dispose(); // Dispose of the old geometry to free up memory
    player2.geometry = newGeometry;
}
 
function setVisiblePlay()
{
    pressPlayDiv.classList.remove('fade-active');
    playDiv.classList.remove('fade-active');
    void playDiv.offsetWidth; // Reset animation
    pressPlayDiv.classList.add('fade-active');
    playDiv.classList.add('fade-active');
    setVisibleScore(true);
    pressPlayDiv.style.visibility = 'visible';
    pressPlayDiv.style.display = 'block'; 
    playDiv.style.visibility = 'visible';
    playDiv.style.display = 'block'; 
}

function hidePlayMessage()
{
    pressPlayDiv.style.display = 'none';
    pressPlayDiv.style.opacity = '0';
    playDiv.style.display = 'none';
    playDiv.style.opacity = '0';
}

export function StartLevel(levelMode)
{
    showCursor();
    setLevelState(levelMode);
    removeMainEvents();
    setUpScene();
    
    setUpLevel(scene);
    // drawLine(scene, BOUNDARY);
    
    const { updatePlayers } = setupPlayerMovement(player1, player2, BOUNDARY.Y_MIN, BOUNDARY.Y_MAX, ballStats.MOVE_SPEED);
    const { ball, updateBall, resetBall, changeBallSize, changeBallSpeed } = createBall(scene, resetScreen);
    balle = ball;
    setUpConsts();
    setScores(0, 0);
    tryCloseChat();
    setPlayerNames();
    
    animationId = null;
    let isCameraAnimationComplete = false;
    let isBallMoving = false;
    let toggleReset = false;

    changeBallSizeFunction = changeBallSize;
    changeBallSpeedFunction = changeBallSpeed;
    
    function resetScreen(playerNbr)
    {
        screenShake.start(0.5, 200);
        addScore(playerNbr);
        resetFunction(false);
    }
    
    resetFunction = function resetGame(resetCam, time)
    {
        resetAnim();
        hidePlayMessage();
        resetPlayersPositions();
        setVisibleScore(false);
        toggleReset = false;
        isCameraAnimationComplete = false;
        isBallMoving = false;
        resetBall();
        if (resetCam)
        {
            setScores(0, 0);
            resetCamera(time);
        }
    }
    let lastTimestamp = 0;
    function animate(timestamp)
    {
        const deltaTime = timestamp - lastTimestamp; // Calculate the time since the last frame
        lastTimestamp = timestamp;
        if (!isCameraAnimationComplete)
        {
            animateCamera(timestamp, camera, setVisiblePlay);
            if (getLevelState() === LevelMode.LOCAL && camera.position.y < 0.3)
            {
                isCameraAnimationComplete = true;
                setVisiblePlay();
            }
            if (getLevelState() === LevelMode.ADVENTURE && camera.position.z < 60.1)
            {
                setVisibilityRightWall(false); // remove the wall of player1
                isCameraAnimationComplete = true;
                setVisiblePlay();
            }
        }
        else
        {
            screenShake.update();
            if (isBallMoving) updateBall(ball, player1, player2);
            updatePlayers(deltaTime);
        }
        renderer.render(scene, camera);
        if (!toggleReset)
            animationId = requestAnimationFrame(animate);
        else
            resetFunction(true);
    }
    
    function resetAnim()
    {
        if (animationId)
        {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    const myInput = document.getElementById('myInput');
    pressSpaceFunction = function pressSpaceStart(event)
    {
        if (!isBallMoving && event.key === ' ' && isCameraAnimationComplete && document.activeElement != myInput)
        {
            isBallMoving = true;
            hidePlayMessage();
        }
    }

    pressEscapeFunction = function pressEscapeReinitLevel(event)
    {
        if (event.key === 'Escape' && (getLevelState() != LevelMode.MENU && getLevelState() != LevelMode.MODESELECTION))
        {
            setVisibilityRightWall(true);
            resetFunction(true);
            resetScreen(0);
            animate();
        }
    }
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden)
            resetAnim();
        else
            if (!animationId) animate();
    });

    animate();
}

export function endMatch()
{

}