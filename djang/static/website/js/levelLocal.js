import * as THREE from '../node_modules/.vite/deps/three.js';
import { animateCamera, resetCamera } from './cameranim.js';
import { animatePlayers, resetBoostedStatus, setPlayerController, setupPlayerMovement, stopBoostPlayers } from './playerMovement.js';
import { createBall } from './ball.js';
import { ScreenShake } from './screenShake.js';
import { setScores, addScore, setVisibleScore } from './scoreManager.js';
import { createLights, createPlayers, setVisibilityRightWall, addLightPlayerReady, setTextures } from './objects.js';
import { getLevelState, isAnOnlineMode, setLevelState } from './main.js';
import { unloadScene } from './unloadScene.js';
import { addGameStickers, removeGameStickers, setAccessAllDuelsInChat, tryCloseChat } from './chat.js';
import { addMatchToHistory, getPlayerName, playerStats } from './playerManager.js';
import { getTranslation } from './translate.js';
import { createSpaceLevel } from './levelSpace.js';
import { createVolcanoLevel } from './levelVolcano.js';
import { createCaveLevel } from './levelCave.js';
import { getRawMatchTime, isGamePaused, pauseStopWatch, resetStopwatch, resumeStopWatch, setStopWatch, startStopwatch, stopStopwatch } from './timer.js';
import { closeGameMenu, setHeaderVisibility } from './menu.js';
import { getRules } from './rules.js';
import { ArenaType, LevelMode, PlayerStatus, VictoryType } from './variables.js';
import { callVictoryScreen } from './victory.js';
import { isBoostReadyLeft, isBoostReadyRight, resetBoostBar, useBoost } from './powerUp.js';
import { createDeathSphere } from './deathSphere.js';
import { Sparks } from './sparks.js';
import { socketSendPlayerReady, setMatchAlreadyStarted } from './sockets.js';
import { getUserById, getUserPaddleSkin, setUserStatus } from './apiFunctions.js';
import { getTournamentPlayers, setWinner } from './tournament.js';

const gameMenuPanel = document.getElementById('gameMenuPanel');
const inputChat = document.getElementById('inputChat');
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

export let id_players = [-1, -1, -1, -1];

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
let updateBallLightFunction = null;
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
let playerProfile1 = null;
let playerProfile2 = null;
let playerProfile3 = null;
let playerProfile4 = null;
let teamName = "";

export function getCamera()
{
    return camera;
}

export function getRenderer()
{
    return renderer;
}

export function getPlayerNbr()
{
    return playersId.indexOf(playerStats.id);
}

export function setPlayersIds(player1Id, player2Id, player3Id = 0, player4Id = 0)
{
    playersId[0] = player1Id;
    playersId[1] = player2Id;
    playersId[2] = player3Id;
    playersId[3] = player4Id;
}

export function getPlayerPosition(playerNbr)
{
    if (playerNbr === 1)
        return player1.position;
    else if (playerNbr === 2)
        return player2.position;
    else if (playerNbr === 3)
        return player3.position;
    else if (playerNbr === 4)
        return player4.position;
}

export function animateBoostPlayers()
{
    animatePlayers(player1, player2);
}

export function getPlayerSideById(playerId)
{
    return playersId.indexOf(playerId);
}

export function doUpdateBallLight()
{
    updateBallLightFunction();
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
        camera.fov = 5 * Math.atan((cameraRatioWidth / camera.aspect) / (2 * camera.position.z)) * (180 / Math.PI);
    } else {
        camera.fov = 5 * Math.atan((cameraRatioHeigth / camera.aspect) / (1.5 * camera.position.z)) * (180 / Math.PI);
    }
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

export function getPlayer(playerNbr)
{
    return playerNbr === 0 ? player1 : player2;
}

let player1Ready = false;
let player2Ready = false;
let player3Ready = false;
let player4Ready = false;
 
export function addReadyPlayer(playerNbr)
{
    if (playerNbr === 1 && player1Ready === false)
    {
        // console.log("1");
        player1Ready = true;
        addLightPlayerReady(player1, true);
    }
    else if (playerNbr === 2 && player2Ready === false)
    {
        // console.log("2");
        player2Ready = true;
        addLightPlayerReady(player2, true);
    }
    else if (playerNbr === 3 && player3Ready === false)
    {
        // console.log("3");
        player3Ready = true;
        addLightPlayerReady(player3, true);
    }
    else if (playerNbr === 4 && player4Ready === false)
    {
        // console.log("4");
        player4Ready = true;
        addLightPlayerReady(player4, true);
    }
}

export function removeReadyPlayers()
{
    player1Ready = false;
    addLightPlayerReady(player1, false);
    player2Ready = false;
    addLightPlayerReady(player2, false);
    if (player3 === null)
        return;
    player3Ready = false;
    addLightPlayerReady(player3, false);
    player4Ready = false;
    addLightPlayerReady(player4, false);
}

function hideInGameUI()
{
    controlsP1.style.display = 'none';
    controlsP2.style.display = 'none';
}

function resetIdPlayers()
{
    id_players[3] = id_players[2] = id_players[1] = id_players[0] = -1;
}

export function unloadLevel()
{
    if (!scene)
        return;
    setUserStatus("online");
    resetIdPlayers();
    if (isAnOnlineMode(currentLevelMode))
        removeGameStickers();
    sparks = null;
    currentLevelMode = LevelMode.MENU;
    hideInGameUI();
    resetBoostBar();
    resetBoostedStatus();
    unloadScene(scene, renderer, animationId);
    resetFunction(true);
    isInGame = false;
    setAccessAllDuelsInChat(true);
    playerStats.playerController = 1;
    playersId[3] = playersId[2] = playersId[1] = playersId[0] = 0;
    playerProfile4 = playerProfile3 = playerProfile2 = playerProfile1 = null;
    setMatchAlreadyStarted(false);
    window.removeEventListener('wheel', camZoomEvent);
    document.getElementById('bottomGdprDiv').style.display = 'flex';
}

export function gameEventsListener(event)
{
    if (pressSpaceFunction === null || isSpectator())
        return;

    if (document.activeElement != inputChat)
    {
        pressSpaceFunction(event);
        pressBoostFunction(event);
    }
    // pressArrowsMenu(event);
}

// function pressArrowsMenu(event)
// {
//     if (!gameMenuPanel.classList.contains('show') || !isSettingsOpen())
//         return;
//     const focusableElements = document.querySelectorAll('button.gameMenuButton');
//     const focusable = Array.prototype.slice.call(focusableElements);
//     const currentIndex = focusable.indexOf(document.activeElement);
//     if (event.key === 'ArrowDown') {
//         event.preventDefault();
//         const nextIndex = (currentIndex + 1) % focusable.length;
//         focusable[nextIndex].focus();
//     } else if (event.key === 'ArrowUp') {
//         event.preventDefault();
//         const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
//         focusable[prevIndex].focus();
//     }
// }

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
    camera.fov = 85;
    // faire en sorte que ce fov prenne en compte le ratio de l'ecran ? 
    // le reset zoom n'est pas forcement bon, en fonction du ratio de l'ecran
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
    let camera = new THREE.PerspectiveCamera(85, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
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

function setUpScene()
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
}

function setupInterface()
{
    document.getElementById('reinitLevelButton').style.display = isAnOnlineMode(currentLevelMode) || currentLevelMode === LevelMode.TOURNAMENT ? 'none' : 'block';
    document.getElementById('seeTournamentButton').style.display = currentLevelMode === LevelMode.TOURNAMENT ? 'block' : 'none';
    document.getElementById('profileButton').style.display = playerStats.isRegistered ? 'block' : 'none';
    gameMenuPanel.style.display = 'block';
    showInGameUI();
    if (isAnOnlineMode(currentLevelMode) && !isSpectator())
        addGameStickers();
}

function showInGameUI()
{
    if (playerStats.playerController === -1) // laisser les barres visibles ?
    {
        controlsP1.style.display = 'none';
        controlsP2.style.display = 'none';
        return;
    }

    let controlsSrc;
    if (currentLevelMode === LevelMode.ADVENTURE)
    {
        controlsSrc = 'static/images/controlsAdventure.webp';
    }
    else// if (currentLevelMode === LevelMode.LOCAL)
    {
        controlsSrc = 'static/images/controlsP1Local.webp';
    }
    if (currentLevelMode === LevelMode.LOCAL || currentLevelMode === LevelMode.TOURNAMENT)
    {
        controlsP1.style.display = 'flex';
        controlsLeftImg.src = 'static/images/controlsP1Local.webp';
        controlsP2.style.display = 'flex';
        controlsRightImg.src = 'static/images/controlsP2Local.webp';
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
        document.getElementById('pressBoostTextRight').textContent = isAnOnlineMode(currentLevelMode) ? getTranslation('pressBoostTextLeft') : getTranslation('pressBoostTextRight');
    }
}

export function setPlayerRightName()
{
    if (currentLevelMode === LevelMode.ADVENTURE)
        player2Name.innerText = getTranslation('botName');
    else
        player2Name.innerText = getTranslation('player2Name');
}

export function passInfosPlayersToLevel(idP1, idP2)
{
    return Promise.all([getUserById(idP1), getUserById(idP2), getUserPaddleSkin(id_players[0]), getUserPaddleSkin(id_players[1])])
        .then(([profile1, profile2, textureP1, textureP2]) => {
            playerProfile1 = profile1;
            playerProfile2 = profile2;
            setPlayersIds(idP1, idP2);
            setTextures(textureP1, textureP2);
            return setPlayerController(idP1, idP2);
        })
        .catch((error) => {
            console.error("Error in passInfosPlayersToLevel:", error);
            throw error;
        });
}

export function passInfosPlayersToLevelMulti(idP1, idP2, idP3, idP4)
{
    return Promise.all([getUserById(idP1), getUserById(idP2), getUserById(idP3), getUserById(idP4), getUserPaddleSkin(id_players[0]), getUserPaddleSkin(id_players[1]), getUserPaddleSkin(id_players[2]), getUserPaddleSkin(id_players[3])])
        .then(([profile1, profile2, profile3, profile4, textureP1, textureP2, textureP3, textureP4]) => {
            playerProfile1 = profile1;
            playerProfile2 = profile2;
            playerProfile3 = profile3;
            playerProfile4 = profile4;
            setPlayersIds(idP1, idP2, idP3, idP4);
            setTextures(textureP1, textureP2, textureP3, textureP4);
            return setPlayerController(idP1, idP2, idP3, idP4);
        })
        .catch((error) => {
            console.error("Error in passInfosPlayersToLevel:", error);
            throw error;
        });
}

function setSide()
{
    if (playerProfile1 == null || playerProfile1.username === playerStats.nickname || (playerProfile3 !== null && playerProfile3.username === playerStats.nickname))
        isLeftSide = true;
    else
        isLeftSide = false;
}

function setPlayerNames()
{
    setSide();
    if (playerProfile1 == null)
        leftSideName = "Guest player"
    else 
        leftSideName = playerProfile1.username;
    if (currentLevelMode === LevelMode.TOURNAMENT)
    {
        const [player1Tournament, player2Tournament] = getTournamentPlayers();
        player1Name.innerHTML = player1Tournament;
        player2Name.innerHTML = player2Tournament;
    }
    else if (isAnOnlineMode(currentLevelMode))
    {
        if (currentLevelMode === LevelMode.MULTI)
        {
            player1Name.innerHTML = playerProfile1.username + "<br>" + playerProfile3.username;
            player2Name.innerHTML = playerProfile2.username + "<br>" + playerProfile4.username;
        }
        else
        {
            player1Name.innerHTML = playerProfile1.username;
            player2Name.innerHTML = playerProfile2.username;
        }
    }
    else
    {
        setPlayerRightName();
        player1Name.innerHTML = getPlayerName();
    }
    if (playerProfile1 === null)
        teamName = player1Name.innerHTML;
    else if (playerProfile1.username === playerStats.nickname || (playerProfile3 !== null && playerProfile3.username === playerStats.nickname))
        teamName = player1Name.innerHTML;
    else
        teamName = player2Name.innerHTML;
}

function setUpLevel(scene)
{
    const arenaType = getRules().arena;
    const textureLoader = new THREE.TextureLoader();
    [player1, player2, player3, player4] = createPlayers(scene, textureLoader);
    // updatePlayerModel(player1);
    createLights(scene, arenaType);
    resetPlayersPositions();
    if (arenaType === ArenaType.SPACE)
        animateLevelFunction = createSpaceLevel(scene, textureLoader);
    if (arenaType === ArenaType.VOLCANO)
        animateLevelFunction = createVolcanoLevel(scene, textureLoader);
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

function setUpScreenShake()
{
    if (screenShake != null)
        return;
    screenShake = new ScreenShake(camera);
}

export function startScreenShake(duration, strength)
{
    screenShake.start(duration, strength);
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
    player1.rotation.y = Math.PI / 6;
    // player1.position.set(0, 0, 0);
    // player1.rotation.y = Math.PI / 2.5;
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
            camera.fov = Math.min(160, camera.fov + cameraZoomSpeed);
        }
        camera.updateProjectionMatrix();
    }
    event.preventDefault();
}

export function isSpectator()
{
    if (playerStats.playerController === -1)
        return true;
    return false;
}

export let resetScreenFunction = null;

export function StartLevel(levelMode)
{
    document.getElementById('bottomGdprDiv').style.display = 'none';
    setUserStatus("busy");
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
    setupInterface();
    sparks = new Sparks(scene);
    let isBallMoving = isSpectator() ? true : false;
    let toggleReset = false;
    let canPressSpace = isSpectator() ? false: true;
    let lastTimestamp = 0;

    if (isSpectator())
    {
        isCameraAnimationComplete = true;
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);
        setVisibleScore(true);
    }

    const { updatePlayers } = setupPlayerMovement(player1, player2, player3, player4);

    resetScreenFunction = function resetScreen(playerNbr, fromScoredPoint = false)
    {
        if (isSpectator()) // n'ajoute pas le score ?
        {
            addScore(playerNbr);
            return;
        }
        if (playerNbr != 0)
        {
            screenShake.start(0.7, 400);
            pauseStopWatch();
        }
        addScore(playerNbr);
        if (playerNbr != 0)
            resetFunction(false, fromScoredPoint);
    }

    const { ball, updateBall, resetBall, changeBallSize, changeBallSpeed, updateBallLight } = createBall(scene, resetScreenFunction);
    balle = ball;
    setUpScreenShake();
    setScores(0, 0);
    setAccessAllDuelsInChat(false);
    tryCloseChat();
    setPlayerNames();


    changeBallSizeFunction = changeBallSize;
    changeBallSpeedFunction = changeBallSpeed;
    updateBallLightFunction = updateBallLight;
    
    resetFunction = function resetGame(resetCam, fromScoredPoint = false, time)
    {
        if (isSpectator())
            return;
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
            animateLevelFunction(scene);
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
                socketSendPlayerReady();
            }
            else if (currentLevelMode === LevelMode.MULTI)
            {
                isBallMoving = true;
                socketSendPlayerReady("2v2_classic");
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
        if (event.key === 'e' && playerStats.playerController === 1 && isBoostReadyLeft())
        {
            useBoost(0);
            event.preventDefault();
        }
        else if ((event.key === 'e' && playerStats.playerController === 2 && isBoostReadyRight()) || (event.code === 'ArrowLeft' && (playerStats.playerController === 2 || currentLevelMode === LevelMode.TOURNAMENT) && isBoostReadyRight()))
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
        // resetScreen(0); // remettre ca ??
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

let isLeftSide = false;
let leftSideName = "";

export function endMatch(scoreP1, scoreP2, forcedVictory = false)
{
    gameEnded = true;
    const player1NameText = player1Name.innerHTML;
    const player2NameText = player2Name.innerHTML;
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

    let victoryType;
    let winner = '';
    if (scoreP1 > scoreP2)
        winner = player1NameText;
    else if (scoreP1 < scoreP2)
        winner = player2NameText;
    if (forcedVictory)
        victoryType = VictoryType.VICTORY;
    else if (winner != '')
    {
        // if ((scoreP1 > scoreP2 && isLeftSide) || (scoreP1 < scoreP2 && !isLeftSide))
        //     victoryType = VictoryType.VICTORY;
        // else
        //     victoryType = VictoryType.DEFEAT;

        if (winner === getPlayerName() || (winner === leftSideName && isLeftSide) || (winner !== leftSideName && !isLeftSide))
            victoryType = VictoryType.VICTORY;
        else
            victoryType = VictoryType.DEFEAT;
    }
    else
        victoryType = VictoryType.EXAEQUO;
    
    if (currentLevelMode === LevelMode.TOURNAMENT)
        setWinner(player1NameText, player2NameText, scoreP1, scoreP2);
    if (!isSpectator())
        addMatchToHistory(victoryType, scorePlayer, teamName, scoreOpponent, opponentName, getRawMatchTime());
    pressPlayDiv.style.display = 'none';
    stopStopwatch();
    deathSphereGrew = false;
    deathSphere = createDeathSphere();
    scene.add(deathSphere);
    deathSphere.position.set(balle.position.x, balle.position.y, balle.position.z);
    if (isAnOnlineMode(currentLevelMode))
        return;
    setTimeout(() => {
        let winner = '';
        if (scoreP1 > scoreP2)
            winner = player1NameText;
        else if (scoreP1 < scoreP2)
            winner = player2NameText;
        if (isSpectator())
        {
            callVictoryScreen(VictoryType.VICTORY, winner);
            return;
        }
        if (forcedVictory)
            callVictoryScreen(VictoryType.VICTORY);
        else if (currentLevelMode === LevelMode.TOURNAMENT)
        {
            callVictoryScreen(VictoryType.VICTORY, winner);
        }
        else if (winner != '')
        {
            if (winner === getPlayerName())
                callVictoryScreen(VictoryType.VICTORY, winner);
            else
                callVictoryScreen(VictoryType.DEFEAT, winner); // winner var useless?
        }
        else
            callVictoryScreen(VictoryType.EXAEQUO);
    }, 1800);
}