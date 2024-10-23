import * as THREE from 'three';
import { animateCamera, resetCamera } from './cameranim.js';
import { setupPlayerMovement } from './playerMovement.js';
import { createBall } from './ball.js';
import { ScreenShake } from './screenShake.js';
import { setScores, addScore, setVisibleScore } from './scoreManager.js';
import { createLights, createPlayers, drawBackground, createWalls, setVisibilityRightWall, addModels } from './objects.js';
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
let currentLevelMode;
let isCameraAnimationComplete = false;
let cameraRatioWidth = 0;
let cameraRatioHeigth = 0;

function onWindowResize() {
    if (!isCameraAnimationComplete)
        return;
    // Update the camera's aspect ratio to match the new window size
    camera.aspect = window.innerWidth / window.innerHeight;
    
    // Optionally: Adjust camera's position based on window size
    console.log("Base pos: " + camera.position.z);
    if (window.innerWidth > window.innerHeight) {
        camera.position.z = cameraRatioWidth / camera.aspect * 2.5; // For wider windows, move the camera further
    } else {
        camera.position.z = cameraRatioHeigth / camera.aspect * 3.5; // For taller windows, move the camera further back
    }
    console.log("Changed pos: " + camera.position.z);
    
    // Update the camera's projection matrix after changing the aspect ratio
    camera.updateProjectionMatrix();
    
    // Update the renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Listen for the window resize event
window.addEventListener('resize', onWindowResize, false);

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
    // let camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
    const aspect = window.innerWidth / window.innerHeight;
const cameraSize = 50; // Adjust this value to control zoom level

const camera = new THREE.OrthographicCamera(
    -cameraSize * aspect, // left
    cameraSize * aspect,  // right
    cameraSize,           // top
    -cameraSize,          // bottom
    0.1,                  // near clipping plane
    1000                  // far clipping plane
);
    if (currentLevelMode === LevelMode.LOCAL)
    {
        camera.position.z = 50;
    }
    else if (currentLevelMode === LevelMode.ADVENTURE)
    {
        camera.position.set(50, 0, 30);
    }
    return camera;
}

export function setUpScene(levelMode)
{
    currentLevelMode = levelMode;
    scene = new THREE.Scene();
    camera = setUpCamera();
    renderer = new THREE.WebGLRenderer();
    renderer.useLegacyLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(renderer.domElement);
}

function showKeys()
{
    if (currentLevelMode === LevelMode.LOCAL)
    {
        player1KeysLocal.style.display = 'block';
        player2KeysLocal.style.display = 'block';
    }
    else if (currentLevelMode === LevelMode.ADVENTURE)
        playerKeysAdventure.style.display = 'block';
}

function setPlayerNames()
{
    if (currentLevelMode === LevelMode.LOCAL)
        return;
    if (currentLevelMode === LevelMode.ADVENTURE)
        document.getElementById('playername-right').innerText = getTranslation('botName');
    else
        document.getElementById('playername-left').innerText = playerStats.isRegistered ? playerStats.nickname : getTranslation('playernameleft');
}

export function setUpLevel(scene)
{
    const textureLoader = new THREE.TextureLoader();
    document.getElementById('menuPanel').style.display = 'block';
    showKeys();
    [player1, player2] = createPlayers(scene, textureLoader);
    createLights(scene);
    resetPlayersPositions();
    createWalls(scene, textureLoader);
    drawBackground(scene, textureLoader);
    addModels(scene, textureLoader);
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
    pressPlayDiv = document.getElementById('pressPlayDiv');
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
    player1.geometry.dispose();
    player1.geometry = newGeometry;
    player2.geometry.dispose();
    player2.geometry = newGeometry;
}

function resetPlayAnim()
{
    pressPlayDiv.classList.remove('fade-active');
    void playDiv.offsetWidth; // Reset animation
    pressPlayDiv.classList.add('fade-active');
}
 
function setVisiblePlay()
{
    resetPlayAnim();
    playDiv.classList.add('fade-active');
    setVisibleScore(true);
    pressPlayDiv.style.visibility = 'visible';
    pressPlayDiv.style.display = 'block';
}

function hidePlayMessage()
{
    pressPlayDiv.style.display = 'none';
    pressPlayDiv.style.opacity = '0';
}

export function StartLevel(levelMode)
{
    document.getElementById('loading').style.display = 'block';
    showCursor();
    setLevelState(levelMode);
    removeMainEvents();
    setUpScene(levelMode);
    setUpLevel(scene);
    
    const { updatePlayers } = setupPlayerMovement(player1, player2, BOUNDARY.Y_MIN, BOUNDARY.Y_MAX, ballStats.MOVE_SPEED);
    const { ball, updateBall, resetBall, changeBallSize, changeBallSpeed } = createBall(scene, resetScreen);
    balle = ball;
    setUpConsts();
    setScores(0, 0);
    tryCloseChat();
    setPlayerNames();
    
    animationId = null;
    let isBallMoving = false;
    let toggleReset = false;

    changeBallSizeFunction = changeBallSize;
    changeBallSpeedFunction = changeBallSpeed;
    
    function resetScreen(playerNbr)
    {
        screenShake.start(0.7, 400);
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
            if (currentLevelMode === LevelMode.LOCAL && camera.position.y < 0.3)
            {
                isCameraAnimationComplete = true;
                cameraRatioWidth = 1920 / camera.position.z;
                cameraRatioHeigth = 1080 / camera.position.z;
                setVisiblePlay();
            }
            if (currentLevelMode === LevelMode.ADVENTURE && camera.position.z < 60.1)
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
        if (event.key === 'Escape' && (currentLevelMode != LevelMode.MENU && currentLevelMode != LevelMode.MODESELECTION))
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

    setTimeout(() => { // put a loading screen?
        document.getElementById('loading').style.display = 'none';
        animate();
    }, 500);
}

export function endMatch()
{

}