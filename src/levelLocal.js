import * as THREE from 'three';
import { animateCamera, getCameraActiveState, resetCamera } from './cameranim.js';
import { setupPlayerMovement } from './playerMovement.js';
import { createBall } from './ball.js';
import { ScreenShake } from './screenShake.js';
import { setScores, addScore, setVisibleScore } from './scoreManager.js';
import { createLights, createPlayers, setVisibilityRightWall } from './objects.js';
import { setLevelState } from './main.js';
import { unloadScene } from './unloadScene.js';
import { removeMainEvents, showCursor } from './eventsListener.js';
import { sendSystemMessage, tryCloseChat } from './chat.js';
import { addMatchToHistory, playerStats } from './playerManager.js';
import { getTranslation } from './translate.js';
import { createSpaceLevel } from './levelSpace.js';
import { createCaveLevel } from './levelCave.js';
import { getMatchTime, isGamePaused, pauseStopWatch, resetStopwatch, resumeStopWatch, setStopWatch, startStopwatch, stopStopwatch } from './timer.js';
import { setHeaderVisibility } from './menu.js';
import { getRules } from './rules.js';
import { ArenaType, LevelMode } from './variables.js';
import { callVictoryScreen } from './victory.js';

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
export let pressEscapeInGame = null;
let pressSpaceFunction = null;
let player1, player2;
let camera = null;
let screenShake = null;
const pressPlayDiv = document.getElementById('pressPlayDiv');
const playDiv = document.getElementById('play');
let changeBallSizeFunction = null;
let changeBallSpeedFunction = null;
let player1KeysLocal = document.getElementById('controlsP1LocalImg');
let player2KeysLocal = document.getElementById('controlsP2LocalImg');
let playerKeysAdventure = document.getElementById('controlsAdventureImg');
let currentLevelMode;
let isCameraAnimationComplete = false;
let cameraRatioWidth = 0;
let cameraRatioHeigth = 0;
export let isInGame = false;

function onWindowResize() {
    if (!isCameraAnimationComplete)
        return;
    // Update the camera's aspect ratio to match the new window size
    camera.aspect = window.innerWidth / window.innerHeight;
    
    // Optionally: Adjust camera's position based on window size
    if (window.innerWidth > window.innerHeight) {
        camera.position.z = cameraRatioWidth / camera.aspect * 2.5; // For wider windows, move the camera further
    } else {
        camera.position.z = cameraRatioHeigth / camera.aspect * 3.5; // For taller windows, move the camera further back
    }
    
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
    currentLevelMode = LevelMode.MENU;
    unloadScene(scene, renderer, animationId);
    resetFunction(true);
}

export function eventsListener(event)
{
    if (pressSpaceFunction === null)
        return;
    pressSpaceFunction(event);
}

function setOrthographicCamera()
{
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
    return camera;
}

function setPerspectiveCamera()
{
    let camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
    return camera;
}

export function setCameraType()
{
    const rotation = camera.rotation;
    const position = camera.position;
    camera = playerStats.cameraOrthographic === true ? setOrthographicCamera() : setPerspectiveCamera();
    camera.position.set(position.x, position.y, position.z);
    camera.rotation.set(rotation.x, rotation.y, rotation.z);
}

export function setUpCamera()
{
    let newCamera = playerStats.cameraOrthographic === true ? setOrthographicCamera() : setPerspectiveCamera();

    if (currentLevelMode === LevelMode.LOCAL)
    {
        newCamera.position.z = 50;
    }
    else if (currentLevelMode === LevelMode.ADVENTURE)
    {
        newCamera.position.set(50, 0, 30);
    }
    return newCamera;
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
    if (currentLevelMode === LevelMode.ADVENTURE)
        document.getElementById('playername-right').innerText = getTranslation('botName');
    else
    {
        document.getElementById('playername-left').innerText = playerStats.isRegistered ? playerStats.nickname : getTranslation('playernameleft');
    }
}

export function setUpLevel(scene)
{
    const textureLoader = new THREE.TextureLoader();
    document.getElementById('menuPanel').style.display = 'block';
    showKeys();
    [player1, player2] = createPlayers(scene, textureLoader);
    createLights(scene);
    resetPlayersPositions();
    if (getRules().arena === ArenaType.SPACE)
        createSpaceLevel(scene, textureLoader);
    else if (getRules().arena === ArenaType.CAVE)
        createCaveLevel(scene, textureLoader);
}

export function changeBallSizeInstance(newSize)
{
    changeBallSizeFunction(newSize);
}

export function changeBallSpeedInstance(newSpeed)
{
    changeBallSpeedFunction(newSpeed);
}

function setUpConsts()
{
    if (screenShake != null)
        return;
    screenShake = new ScreenShake(camera);
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
    
function resetAnim()
{
    if (animationId)
    {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

export function StartLevel(levelMode)
{
    gameEnded = false;
    isInGame = true;
    setHeaderVisibility(false);
    // resetStopwatch();
    setStopWatch(getRules().maxTime);
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
        if (playerNbr != 0)
        {
            screenShake.start(0.7, 400);
            pauseStopWatch();
        }
        addScore(playerNbr);
        resetFunction(false);
    }
    
    resetFunction = function resetGame(resetCam, time)
    {
        resetAnim();
        toggleReset = false;
        isBallMoving = false;
        if (!gameEnded)
        {
            resetPlayersPositions();
            resetBall();
        }
        if (resetCam)
        {
            isCameraAnimationComplete = false;
            hidePlayMessage();
            setVisibleScore(false);
            setScores(0, 0);
            resetCamera(time);
        }
        else if (isCameraAnimationComplete === true && !gameEnded)
            setVisiblePlay();
    }
    let lastTimestamp = 0;

    function endAnimation()
    {
        cameraRatioWidth = 1920 / camera.position.z;
        cameraRatioHeigth = 1080 / camera.position.z;
        isCameraAnimationComplete = true;
        setVisiblePlay();
        if (currentLevelMode === LevelMode.ADVENTURE)
        {
            setVisibilityRightWall(false); // remove the wall of player1
        }
    }

    function animate(timestamp)
    {
        const deltaTime = timestamp - lastTimestamp; // Calculate the time since the last frame
        lastTimestamp = timestamp;
        if (!isCameraAnimationComplete)
        {
            animateCamera(timestamp, camera, endAnimation);
        }
        else
        {
            screenShake.update();
            if (isBallMoving) updateBall(player1, player2);
            updatePlayers(deltaTime);
        }
        renderer.render(scene, camera);
        if (!toggleReset)
            animationId = requestAnimationFrame(animate);
        else
            resetFunction(true);
    }

    const myInput = document.getElementById('inputChat');
    pressSpaceFunction = function pressSpaceStart(event)
    {
        if (!isBallMoving && event.key === ' ' && isCameraAnimationComplete && document.activeElement != myInput)
        {
            isBallMoving = true;
            if (isGamePaused())
                resumeStopWatch();
            else
            {
                resetStopwatch();
                startStopwatch(getRules().maxTime);
            }
            hidePlayMessage();
        }
    }

    pressEscapeInGame = function pressEscapeReinitLevel()
    {
        setVisibilityRightWall(true);
        resetFunction(true);
        resetStopwatch();
        resetScreen(0);
        animate();
    }
    
    // document.addEventListener('visibilitychange', () => {
    //     if (document.hidden)
    //         resetAnim();
    //     else
    //         if (!animationId) animate();
    // });
    setTimeout(() => { // put a loading screen?
        document.getElementById('loading').style.display = 'none';
        animate();
    }, 500);
}

let gameEnded = false;
export function endMatch(scoreP1, scoreP2)
{
    gameEnded = true;
    const player1Name = document.getElementById('playername-left').innerText;
    const player2Name = document.getElementById('playername-right').innerText;
    addMatchToHistory(scoreP1, scoreP2, player2Name, getMatchTime());
    pressPlayDiv.style.display = 'none';
    stopStopwatch();
    resetAnim();
    setTimeout(() => {
        let winner = '';
        if (scoreP1 > scoreP2)
            winner = player1Name;
        else if (scoreP1 < scoreP2)
            winner = player2Name;
        if (winner != '')
            callVictoryScreen(winner + getTranslation('won'));
        else
            callVictoryScreen(getTranslation('exaequo'));
    }, 1500);
}