import * as THREE from '../node_modules/.vite/deps/three.js';
import { animateCamera, resetCamera } from './cameranim.js';
import { resetBoostedStatus, setupPlayerMovement, stopBoostPlayers } from './playerMovement.js';
import { createBall } from './ball.js';
import { ScreenShake } from './screenShake.js';
import { setScores, addScore, setVisibleScore } from './scoreManager.js';
import { updatePlayerModel, createLights, createPlayers, setVisibilityRightWall } from './objects.js';
import { getLevelState, isAnOnlineMode, setLevelState } from './main.js';
import { unloadScene } from './unloadScene.js';
import { removeMainEvents } from './eventsListener.js';
import { setAccessAllDuelsInChat, tryCloseChat } from './chat.js';
import { addMatchToHistory, getPlayerName, playerStats } from './playerManager.js';
import { getTranslation } from './translate.js';
import { createSpaceLevel } from './levelSpace.js';
import { createCaveLevel } from './levelCave.js';
import { getMatchTime, isGamePaused, pauseStopWatch, resetStopwatch, resumeStopWatch, setStopWatch, startStopwatch, stopStopwatch } from './timer.js';
import { closeGameMenu, isSettingsOpen, setHeaderVisibility } from './menu.js';
import { getRules } from './rules.js';
import { ArenaType, LevelMode, PlayerStatus, VictoryType } from './variables.js';
import { callVictoryScreen } from './victory.js';
import { isBoostReadyLeft, isBoostReadyRight, resetBoostBar, useBoost } from './powerUp.js';
import { createDeathSphere } from './deathSphere.js';
import { Sparks } from './sparks.js';
import { sendPlayerReady } from './sockets.js';
import { getUserById } from './apiFunctions.js';

const gameMenuPanel = document.getElementById('gameMenuPanel');
const myInput = document.getElementById('inputChat');
export const PLAYER_RADIUS = 1;
export const PLAYER_HEIGHT = 12;
export let finalHeight = PLAYER_HEIGHT;
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

var scene;
let animationId = null;
let renderer;
let resetFunction;
export let reinitLevelFunction = null;
let pressSpaceFunction = null;
let pressBoostFunction = null;
let player1, player2, player3, player4;
let camera = null;
let screenShake = null;
const pressPlayDiv = document.getElementById('pressPlayDiv');
const playDiv = document.getElementById('play');
let changeBallSizeFunction = null;
let changeBallSpeedFunction = null;
const controlsP1 = document.getElementById('controlsP1');
const controlsLeftImg = document.getElementById('controlsP1LocalImg');
const controlsRightImg = document.getElementById('controlsP2LocalImg');
const controlsP2 = document.getElementById('controlsP2');
const player1Name = document.getElementById('playername-left');
const player2Name = document.getElementById('playername-right');
let currentLevelMode;
let isCameraAnimationComplete = false;
let cameraRatioWidth = 0;
let cameraRatioHeigth = 0;
export let isInGame = false;
let animateLevelFunction = null;
export let gameEnded = false;
let deathSphere = null;
let deathSphereGrew = false;
let scaleSphere = 0;
let sparks;
let cameraZoomSpeed = 2; // Set the zoom speed

let playersId = [0, 0, 0, 0];
let playerProfile1;
let playerProfile2;

export function setPlayersIds(player1Id, player2Id)
{
    playersId[0] = player1Id;
    playersId[1] = player2Id;
    playersId[2] = 0;
    playersId[3] = 0;
}

export function getPlayerSideById(playerId)
{
    // console.log("List: ");
    // console.log("0: " + playersId[0]);
    // console.log("1: " + playersId[1]);
    // console.log("2: " + playersId[2]);
    // console.log("3: " + playersId[3]);
    // console.log(" ");
    // console.log("Get player id: " + playerId);
    // console.log("Index: " + playersId.indexOf(playerId));
    return playersId.indexOf(playerId);
}

export function updateSparksFunction()
{
    sparks.updateSparks();
}

export function spawnSparksFunction(newPosition, count)
{
    sparks.spawnSparks(newPosition, count);
}

function onWindowResize() {
    if (!isCameraAnimationComplete)
        return;
    camera.aspect = window.innerWidth / window.innerHeight;
    
    if (window.innerWidth > window.innerHeight) {
        camera.position.z = cameraRatioWidth / camera.aspect * 2.5;
    } else {
        camera.position.z = cameraRatioHeigth / camera.aspect * 3.5;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

export function getPlayer(playerNbr)
{
    return playerNbr === 0 ? player1 : player2;
}

function hideInGameUI()
{
    controlsP1.style.display = 'none';
    controlsP2.style.display = 'none';
}

export function unloadLevel()
{
    if (!scene)
        return;
    sparks = null;
    currentLevelMode = LevelMode.MENU;
    hideInGameUI();
    resetBoostBar();
    resetBoostedStatus();
    unloadScene(scene, renderer, animationId);
    resetFunction(true);
    isInGame = false;
    setAccessAllDuelsInChat(true);
    playerStats.status = PlayerStatus.ONLINE;
    playerStats.playerController = 1;
    playerProfile1 = null;
    playerProfile2 = null;

    window.removeEventListener('wheel', camZoomEvent);
}

export function gameEventsListener(event)
{
    if (pressSpaceFunction === null)
        return;

    if (document.activeElement != myInput)
    {
        pressSpaceFunction(event);
        pressBoostFunction(event);
    }
    // pressArrowsMenu(event);
}

function pressArrowsMenu(event)
{
    if (!gameMenuPanel.classList.contains('show') || !isSettingsOpen())
        return;
    const focusableElements = document.querySelectorAll('button.gameMenuButton');
    const focusable = Array.prototype.slice.call(focusableElements);
    const currentIndex = focusable.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % focusable.length;
        focusable[nextIndex].focus();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
        focusable[prevIndex].focus();
    }
}

function resetZoomCamera(camera)
{
    if (camera instanceof THREE.OrthographicCamera) {
        const aspect = window.innerWidth / window.innerHeight;
        const cameraSize = 50;
    
        camera.left = -cameraSize * aspect;
        camera.right = cameraSize * aspect;
        camera.top = cameraSize;
        camera.bottom = -cameraSize;
        camera.updateProjectionMatrix();
        return;
    }
    camera.fov = 75;
    camera.updateProjectionMatrix();
}

function setOrthographicCamera()
{
    const aspect = window.innerWidth / window.innerHeight;
    const cameraSize = 50;

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

    if (currentLevelMode === LevelMode.ADVENTURE)
    {
        newCamera.position.set(50, 0, 30);
    }
    else
    {
        newCamera.position.z = 50;
    }
    return newCamera;
}

export function setUpScene()
{
    currentLevelMode = parseInt(localStorage.getItem('levelMode'));
    scene = new THREE.Scene();
    camera = setUpCamera();
    renderer = new THREE.WebGLRenderer();
    renderer.useLegacyLights = true;
    renderer.gammaFactor = 2.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(renderer.domElement);
    document.getElementById('reinitLevelButton').style.display = isAnOnlineMode(currentLevelMode) ? 'none' : 'block';
    document.getElementById('profileButton').style.display = playerStats.isRegistered ? 'block' : 'none';
}

function showInGameUI()
{
    let controlsSrc;
    if (currentLevelMode === LevelMode.ADVENTURE)
    {
        controlsSrc = 'static/images/controlsAdventure.png';
    }
    else// if (currentLevelMode === LevelMode.LOCAL)
    {
        controlsSrc = 'static/images/controlsP1Local.png';
    }
    if (currentLevelMode === LevelMode.LOCAL)
    {
        controlsP1.style.display = 'flex';
        controlsLeftImg.src = 'static/images/controlsP1Local.png';
        controlsP2.style.display = 'flex';
        controlsRightImg.src = 'static/images/controlsP2Local.png';
    }
    else if (playerStats.playerController === 0 || playerStats.playerController === 1 || playerStats.playerController === 3)
    {
        controlsP1.style.display = 'flex';
        controlsLeftImg.src = controlsSrc;
        controlsP2.style.display = 'none';
    }
    else
    {
        controlsP2.style.display = 'flex';
        controlsRightImg.src = controlsSrc;
        controlsP1.style.display = 'none';
    }
}

export function setPlayerRightName()
{
    if (currentLevelMode === LevelMode.ADVENTURE)
        player2Name.innerText = getTranslation('botName');
    else
        player2Name.innerText = getTranslation('playernameright');
}

export async function passInfosPlayersToLevel(idP1, idP2)
{
    playerProfile1 = await getUserById(idP1);
    playerProfile2 = await getUserById(idP2);
}

function setPlayerNames()
{
    if (isAnOnlineMode(currentLevelMode))
    {
        player1Name.innerText = playerProfile1.username;
        player2Name.innerText = playerProfile2.username;
    }
    else
    {
        setPlayerRightName();
        player1Name.innerText = getPlayerName();
    }
}

export function setUpLevel(scene)
{
    const arenaType = getRules().arena;
    const textureLoader = new THREE.TextureLoader();
    gameMenuPanel.style.display = 'block';
    showInGameUI();
    [player1, player2, player3, player4] = createPlayers(scene, textureLoader);
    // updatePlayerModel(player1);
    createLights(scene, arenaType);
    resetPlayersPositions();
    if (arenaType === ArenaType.SPACE)
        animateLevelFunction = createSpaceLevel(scene, textureLoader);
    else if (arenaType === ArenaType.CAVE)
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
    if (getLevelState() === LevelMode.MULTI)
    {
        player1.position.set(BOUNDARY.X_MIN, (BOUNDARY.Y_MAX - BOUNDARY.Y_MIN) / 4, 0);
        player2.position.set(BOUNDARY.X_MAX, (BOUNDARY.Y_MAX - BOUNDARY.Y_MIN) / 4, 0);
        player3.position.set(BOUNDARY.X_MIN, 0 - (BOUNDARY.Y_MAX - BOUNDARY.Y_MIN) / 4, 0);
        player4.position.set(BOUNDARY.X_MAX, 0 - (BOUNDARY.Y_MAX - BOUNDARY.Y_MIN) / 4, 0);
        return;
    }
    player1.position.set(BOUNDARY.X_MIN, 0, 0);
    // player1.position.set(0, 0, 0);
    player1.rotation.y = Math.PI / 6;
    player2.position.set(BOUNDARY.X_MAX, 0, 0);
}

export let playerSize = PLAYER_HEIGHT;

export function changePlayersSize(newHeight)
{
    if (isNaN(newHeight))
        newHeight = 1;
    finalHeight = PLAYER_HEIGHT * parseFloat(newHeight);
    playerSize = finalHeight;
    const newGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, finalHeight, 8, 1, false);
    const newBoostGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS + 0.1, PLAYER_RADIUS + 0.1, finalHeight + 0.1, 8, 1, false);
    player1.geometry.dispose();
    player1.geometry = newGeometry;
    player2.geometry.dispose();
    player2.geometry = newGeometry;
    player1.children[0].geometry.dispose();
    player1.children[0].geometry = newBoostGeometry;
    player2.children[0].geometry.dispose();
    player2.children[0].geometry = newBoostGeometry;
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
    pressPlayDiv.style.display = 'flex';
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

function animateDeathSphere()
{
    if (deathSphere != null)
        {
            if (!deathSphereGrew)
            {
                if (scaleSphere < 20)
                    scaleSphere += 1;
                else if (scaleSphere < 25)
                    scaleSphere += 0.75;
                else if (scaleSphere < 28)
                    scaleSphere += 0.5;
                else if (scaleSphere < 30)
                    scaleSphere += 0.4;
                else if (scaleSphere < 32)
                    scaleSphere += 0.3;
                else if (scaleSphere < 35)
                    scaleSphere += 0.2;
                else if (scaleSphere < 36)
                    scaleSphere += 0.05;
                else if (scaleSphere >= 35)
                {
                    deathSphereGrew = true;
                    balle.visible = false;
                }
                deathSphere.scale.set(scaleSphere, scaleSphere, scaleSphere);  
            }
            else
            {
                if (scaleSphere > 0)
                {
                    scaleSphere -= 2;
                    if (scaleSphere < 0)
                        scaleSphere = 0;
                    deathSphere.scale.set(scaleSphere, scaleSphere, scaleSphere);
                }
            }
            deathSphere.children[0].rotation.y += 0.01;
            deathSphere.children[0].rotation.x += 0.01;
            deathSphere.children[1].scale.multiplyScalar(1.08);
        }
}

export function getBallPosition()
{
    // console.log(balle.position);
    return balle.position;
}

function camZoomEvent(event)
{
    if (camera instanceof THREE.OrthographicCamera) {
        const aspect = window.innerWidth / window.innerHeight;
        if (event.deltaY > 0) {
            camera.left -= cameraZoomSpeed * aspect;
            camera.right += cameraZoomSpeed * aspect;
            camera.top += cameraZoomSpeed;
            camera.bottom -= cameraZoomSpeed;
        } else {
            camera.left += cameraZoomSpeed * aspect;
            camera.right -= cameraZoomSpeed * aspect;
            camera.top -= cameraZoomSpeed;
            camera.bottom += cameraZoomSpeed;
        }
        camera.updateProjectionMatrix();
    }
    else if (camera instanceof THREE.PerspectiveCamera)
    {
        if (event.deltaY < 0) {
            camera.fov = Math.max(30, camera.fov - cameraZoomSpeed);
        } else {
            camera.fov = Math.min(100, camera.fov + cameraZoomSpeed);
        }
        camera.updateProjectionMatrix();
    }
    event.preventDefault();
}

export let resetScreenFunction = null;

export function StartLevel(levelMode)
{
    playerStats.status = PlayerStatus.BUSY;
    animationId = null;
    deathSphere = null;
    scaleSphere = 0;
    gameEnded = false;
    isInGame = true;
    setHeaderVisibility(false);
    setStopWatch(getRules().maxTime);
    document.getElementById('loading').style.display = 'block';
    setLevelState(levelMode);
    // removeMainEvents();
    setUpScene();
    setUpLevel(scene);
    sparks = new Sparks(scene);

    const { updatePlayers } = setupPlayerMovement(player1, player2, player3, player4);
    const { ball, updateBall, resetBall, changeBallSize, changeBallSpeed } = createBall(scene, resetScreenFunction);
    balle = ball;
    setUpConsts();
    setScores(0, 0);
    setAccessAllDuelsInChat(false);
    tryCloseChat();
    setPlayerNames();

    let isBallMoving = false;
    let toggleReset = false;
    let canPressSpace = true;
    let lastTimestamp = 0;

    changeBallSizeFunction = changeBallSize;
    changeBallSpeedFunction = changeBallSpeed;

    resetScreenFunction = function resetScreen(playerNbr, fromScoredPoint = false)
    {
        if (playerNbr != 0)
        {
            screenShake.start(0.7, 400);
            pauseStopWatch();
        }
        addScore(playerNbr);
        if (playerNbr != 0)
            resetFunction(false, fromScoredPoint);
    }
    
    resetFunction = function resetGame(resetCam, fromScoredPoint = false, time)
    {
        canPressSpace = false;
        isBallMoving = false;
        closeGameMenu();
        const timer = fromScoredPoint === true ? 1000 : 0;
        setTimeout(() => {
            resetAnim();
            toggleReset = false;
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
                stopBoostPlayers();
            }
            else if (isCameraAnimationComplete === true && !gameEnded)
                setVisiblePlay();
            if (timer != 0)
                animate();
            setTimeout(() => {
                canPressSpace = true;
            }, 500);
        }, timer);
    }

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
            updateSparksFunction();
            if (!gameEnded)
            {
                if (isBallMoving) updateBall(player1, player2);
                updatePlayers(deltaTime);
            }
        }
        if (animateLevelFunction != null)
            animateLevelFunction();
        animateDeathSphere();
        renderer.render(scene, camera);
        if (!toggleReset)
            animationId = requestAnimationFrame(animate);
        else
            resetFunction(true);
    }

    function startGame()
    {
        isBallMoving = true;
        if (isGamePaused())
            resumeStopWatch();
        else
        {
            resetStopwatch();
            startStopwatch(getRules().maxTime);
        }
    }

    pressSpaceFunction = function pressSpaceStart(event)
    {
        if (!canPressSpace)
            return;
        if (!gameMenuPanel.classList.contains('show') && !gameEnded && !isBallMoving && event.key === ' ' && isCameraAnimationComplete)
        {
            if (currentLevelMode === LevelMode.ONLINE)
            {
                isBallMoving = true;
                sendPlayerReady();
            }
            else
            {
                startGame();
            }
            hidePlayMessage();
        }
    }

    pressBoostFunction = function pressBoostFunction(event)
    {
        if (event.key === 'e' && isBoostReadyLeft())
        {
            useBoost(0);
            event.preventDefault();
        }
        else if (event.code === 'ControlRight' && currentLevelMode === LevelMode.LOCAL && isBoostReadyRight())
        {
            useBoost(1);
            event.preventDefault();
        }
    }

    reinitLevelFunction = function reinitLevel()
    {
        setVisibilityRightWall(true);
        resetFunction(true);
        resetStopwatch();
        resetScreen(0);
        animate();
    }

    function addCamZoomEvent()
    {
        window.addEventListener('wheel', 
            camZoomEvent, { passive: false });
        window.addEventListener('mousedown', function(event) {
            if (event.button === 1) {
                resetZoomCamera(camera);
            }
        });
    }
    addCamZoomEvent();
    // document.addEventListener('visibilitychange', () => {
    //     if (document.hidden)
    //         resetAnim();
    //     else
    //         if (!animationId) animate();
    // });
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        animate();
    }, 500);
}

export function endMatch(scoreP1, scoreP2)
{
    gameEnded = true;
    const player1NameText = player1Name.innerText;
    const player2NameText = player2Name.innerText;
    let scorePlayer;
    let scoreOpponent;
    let opponentName;
    if (player1NameText === playerStats.nickname)
    {
        scorePlayer = scoreP1;
        scoreOpponent = scoreP2;
        opponentName = player2NameText;
    }
    else
    {
        scorePlayer = scoreP2;
        scoreOpponent = scoreP1;
        opponentName = player1NameText;
    }
    addMatchToHistory(scorePlayer, scoreOpponent, opponentName, getMatchTime());
    pressPlayDiv.style.display = 'none';
    stopStopwatch();
    deathSphereGrew = false;
    deathSphere = createDeathSphere();
    scene.add(deathSphere);
    deathSphere.position.set(balle.position.x, balle.position.y, balle.position.z);
    setTimeout(() => {
        let winner = '';
        if (scoreP1 > scoreP2)
            winner = player1NameText;
        else if (scoreP1 < scoreP2)
            winner = player2NameText;
        if (winner != '')
        {
            if (winner === getPlayerName())
                callVictoryScreen(VictoryType.VICTORY);
            else
                callVictoryScreen(VictoryType.DEFEAT);
        }
        else
            callVictoryScreen(VictoryType.EXAEQUO);
    }, 1800);
}