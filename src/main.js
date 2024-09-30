import * as THREE from 'three';
import { animateCamera, resetCamera } from './cameranim.js';
import { setupPlayerMovement } from './playerMovement.js';
import { createBall } from './ball.js';
import { ScreenShake } from './screenShake.js';
import { setScores, addScore, setVisibleScore } from './scoreManager.js';
import { closeMenu, closeProfile, closeSettings, mainMenu, openMenu, openProfile, openSettings, setNewColor } from './menu.js';
import { createLights, createPlayers, drawBackground, drawLine, createWalls } from './objects.js';
import { initTranslation, changeLanguage } from './translate.js';

const PLAYER_RADIUS = 1;
const PLAYER_HEIGHT = 10;
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const BOUNDARY =
{
  Y_MIN: -25,
  Y_MAX: 25,
  X_MIN: -40,
  X_MAX: 40
}

const ballStats = 
{
    BALL_RADIUS: 0.8,
    MOVE_SPEED: 0.7
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
document.body.appendChild(renderer.domElement);

const {player1, player2} = createPlayers(scene, PLAYER_RADIUS, PLAYER_HEIGHT);
createLights(scene);
resetPlayersPositions();
createWalls(scene);
drawBackground(scene);
// drawLine(scene, BOUNDARY);

const { updatePlayers } = setupPlayerMovement(player1, player2, BOUNDARY.Y_MIN, BOUNDARY.Y_MAX, ballStats.MOVE_SPEED);
const { ball, updateBall, resetBall } = createBall(scene, ballStats, BOUNDARY, resetScreen);

camera.position.z = 50;

const screenShake = new ScreenShake(camera);
const pressPlayDiv = document.getElementById('pressplay');
const playDiv = document.getElementById('play');
setScores(0, 0);
setNewColor();
initTranslation();
window.changeLanguage = changeLanguage;

let animationId = null;
let isCameraAnimationComplete = false;
let isBallMoving = false;
let first = false;
let toggleReset = false;

function resetScreen(playerNbr)
{
    screenShake.start(0.5, 200);
    addScore(playerNbr);
    resetGame(false);
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

function resetPlayersPositions()
{
    player1.position.set(BOUNDARY.X_MIN, 0, 0);
    player2.position.set(BOUNDARY.X_MAX, 0, 0);
}

function resetGame(resetCam, time)
{
    resetAnim();
    hidePlayMessage();
    resetPlayersPositions();
    setVisibleScore(false);
    first = false;
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

function animate(time)
{
    if (!isCameraAnimationComplete)
    {
        animateCamera(time, camera, setVisiblePlay);
        if (camera.position.y < 0.3)
        {
            isCameraAnimationComplete = true;
            setVisiblePlay();
        }
    }
    else
    {
        screenShake.update();
        if (isBallMoving) updateBall(ball, player1, player2);
        updatePlayers();
    }
    renderer.render(scene, camera);
    if (!toggleReset)
        animationId = requestAnimationFrame(animate);
    else
        resetGame(true);
}

function resetAnim()
{
    if (animationId)
    {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function hidePlayMessage()
{
    pressPlayDiv.style.display = 'none';
    pressPlayDiv.style.opacity = '0';
    playDiv.style.display = 'none';
    playDiv.style.opacity = '0';
}

document.addEventListener('keydown', (event) => {
    if (!isBallMoving && event.key === ' ' && isCameraAnimationComplete)
    {
        isBallMoving = true;
        hidePlayMessage();
    }
    if (event.key === 'Escape')
    {
        resetGame(true);
        resetScreen(0);
        animate();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden)
        resetAnim();
    else
        if (!animationId) animate();
});

document.getElementById('menuPanel').addEventListener('mouseenter', () => {
    openMenu();
});

document.getElementById('menuPanel').addEventListener('mouseleave', () => {
    closeMenu();
});

document.getElementById('profileButton').addEventListener('click', () => {
    openProfile();
});

document.getElementById('closeProfileButton').addEventListener('click', () => {
    closeProfile();
});

document.getElementById('settingsButton').addEventListener('click', () => {
    openSettings();
});

document.getElementById('closeSettingsButton').addEventListener('click', () => {
    closeSettings();
});

document.getElementById('mainButton').addEventListener('click', () => {
    mainMenu();
});


animate();
