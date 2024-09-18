import * as THREE from 'three';
import { animateCamera, resetCamera } from './cameranim.js';
import { setupPlayerMovement } from './playerMovement.js';
import { createBall } from './ball.js';
import { ScreenShake } from './screenShake.js';

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const BOUNDARY = {
  Y_MIN: -25,
  Y_MAX: 25,
  X_MIN: -50,
  X_MAX: 50
};

const PLAYER_RADIUS = 1;
const PLAYER_HEIGHT = 10;
const BALL_RADIUS = 0.5;
const MOVE_SPEED = 0.7;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const cylinderTexture = textureLoader.load('mat/player1.jpg');
const material = new THREE.MeshStandardMaterial({ map: cylinderTexture });
const geometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 8, 1, false);

const player1 = new THREE.Mesh(geometry, material);
const player2 = new THREE.Mesh(geometry, material);

const ambientLight = new THREE.AmbientLight(0x888888);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();

scene.add(ambientLight);
scene.add(directionalLight);
resetPlayersPositions();
scene.add(player1);
scene.add(player2);

const materialLine = new THREE.LineBasicMaterial({ color: 0xffffff });
const points = [
  new THREE.Vector3(BOUNDARY.X_MIN - 2.5, BOUNDARY.Y_MAX, 0),
  new THREE.Vector3(BOUNDARY.X_MAX + 2.5, BOUNDARY.Y_MAX, 0),
  new THREE.Vector3(BOUNDARY.X_MAX + 2.5, BOUNDARY.Y_MIN, 0),
  new THREE.Vector3(BOUNDARY.X_MIN - 2.5, BOUNDARY.Y_MIN, 0),
  new THREE.Vector3(BOUNDARY.X_MIN - 2.5, BOUNDARY.Y_MAX, 0)
];
const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometryLine, materialLine);
scene.add(line);

const { updatePlayers } = setupPlayerMovement(player1, player2, BOUNDARY.Y_MIN, BOUNDARY.Y_MAX, MOVE_SPEED);
const { ball, updateBall, resetBall } = createBall(scene, BALL_RADIUS, BOUNDARY.X_MIN, BOUNDARY.X_MAX, BOUNDARY.Y_MIN, BOUNDARY.Y_MAX, resetScreen);

camera.position.z = 50;

const screenShake = new ScreenShake(camera);
const scoreRight = document.getElementById('score-right');
const scoreLeft = document.getElementById('score-left');
const messageDiv = document.getElementById('message');

let animationId = null;
let isCameraAnimationComplete = false;
let isBallMoving = false;
let first = false;
let toggleReset = false;
let player1Score = 0;
let player2Score = 0;

function resetScreen(playerNbr)
{
    screenShake.start(0.5, 200);
    resetGame(false);
    if (playerNbr === 1)
    {
        player2Score += 1;
        scoreRight.innerText = `${player2Score}`;
    }
    else
    {
        player1Score += 1;
        scoreLeft.innerText = `${player1Score}`;
    }
}

function setVisiblePlay()
{
    if (!first)
    {
        messageDiv.classList.remove('fade-active');
        void messageDiv.offsetWidth; // Reset animation
        messageDiv.classList.add('fade-active');
        first = true;
    }
    else
        messageDiv.style.opacity = '1';
    scoreRight.style.display = 'block';
    scoreLeft.style.display = 'block';
    messageDiv.style.visibility = 'visible';
    messageDiv.style.display = 'block'; 
}

function resetPlayersPositions()
{
    player1.position.set(BOUNDARY.X_MIN, 0, 0);
    player2.position.set(BOUNDARY.X_MAX, 0, 0);
}

function resetGame(resetCam, time)
{
    resetPlayersPositions();
    hidePlayMessage();
    scoreRight.style.display = 'none';
    scoreLeft.style.display = 'none';
    first = false;
    toggleReset = false;
    isCameraAnimationComplete = false;
    isBallMoving = false;
    resetAnim();
    resetBall();
    if (resetCam)
    {
        player1Score = player2Score = 0;
        scoreLeft.innerText = `${player1Score}`;
        scoreRight.innerText = `${player2Score}`;
        resetCamera(time);
    }
    animate();
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
    messageDiv.style.display = 'none';
    messageDiv.style.opacity = '0';
}

document.addEventListener('keydown', (event) => {
    if (!isBallMoving && event.key === ' ' && isCameraAnimationComplete)
    {
        isBallMoving = true;
        hidePlayMessage();
    }
    if (event.key === 'Escape')
        resetGame(true);
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden)
        resetAnim();
    else
        if (!animationId) animate();
});

animate();
