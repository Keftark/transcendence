import * as THREE from 'three';
import { animateCamera } from './cameranim.js';
import { setupPlayerMovement } from './playerMovement.js'; // Import the player movement module
import { createBall } from './ball.js'; // Import the ball module
import { startFPSCounter } from './fpsCounter.js';
import { ScreenShake } from './screenShake.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const cylinderTexture = textureLoader.load('mat/player1.jpg');

const boundYMin = -25;
const boundYMax = 25;
const boundXMin = -50;
const boundXMax = 50;

// Create a cylinder geometry
const radiusTop = 1;
const radiusBottom = 1;
const height = 10;
const radialSegments = 8;
const heightSegments = 1;
const openEnded = false;
const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);

// Create a material
const material = new THREE.MeshBasicMaterial({ map: cylinderTexture });

// Create the cylinder mesh
const player1 = new THREE.Mesh(geometry, material);
const player2 = new THREE.Mesh(geometry, material);
var player1Score = 0;
var player2Score = 0;
player1.position.set(boundXMin, 0, 0);
player2.position.set(boundXMax, 0, 0);
// Add the cylinder to the scene
scene.add(player1);
scene.add(player2);

const moveSpeed = 0.7;
const materialLine = new THREE.LineBasicMaterial({ color: 0xffffff });

const points = [];
points.push(new THREE.Vector3(boundXMin - 2.5, boundYMax, 0));
points.push(new THREE.Vector3(boundXMax + 2.5, boundYMax, 0));
points.push(new THREE.Vector3(boundXMax + 2.5, boundYMin, 0));
points.push(new THREE.Vector3(boundXMin - 2.5, boundYMin, 0));
points.push(new THREE.Vector3(boundXMin - 2.5, boundYMax, 0));

const geometryLine = new THREE.BufferGeometry().setFromPoints(points);

const line = new THREE.Line(geometryLine, materialLine);
scene.add(line);

// Set up player movement
const { updatePlayers } = setupPlayerMovement(player1, player2, boundYMin, boundYMax, moveSpeed);

// Create and set up the ball
const ballRadius = 0.5;
const { ball, update: updateBall, resetVelocity: resetBall } = createBall(scene, ballRadius, boundXMin, boundXMax, boundYMin, boundYMax, ResetScreen);

camera.position.z = 50;
let animationId; // Track the animation frame ID
let isCameraAnimationComplete = false; // Track if camera animation is complete
let isBallMoving = false; // Track if ball is moving

// Get the message element
const messageDiv = document.getElementById('message');

const screenShake = new ScreenShake(camera);

hidePlayMessage();
startFPSCounter();

function ResetScreen(playerNbr)
{
    isCameraAnimationComplete = false;
    isBallMoving = false;
    screenShake.start(0.5, 200);
    if (playerNbr === 1)
    {
        player2Score += 1;
        document.getElementById('score-right').innerText = `${player2Score}`;
        // on verifie quel est le joueur a gauche
        // on ajoute un point au joueur 2
    }
    else
    {
        player1Score += 1;
        document.getElementById('score-left').innerText = `${player1Score}`;
        // on verifie quel est le joueur a droite
        // on ajoute un point au joueur 1
    }
}

function setVisiblePlay()
{
    messageDiv.style.opacity = '1';
    messageDiv.style.visibility = 'visible';
    messageDiv.style.display = 'block'; 
}

// Animation loop
function animate(time)
{
    animationId = requestAnimationFrame(animate);
    
    if (!isCameraAnimationComplete)
    {
        // Perform camera animation
        animateCamera(time, camera);
        
        if (camera.position.y < 0.3)
        {
            isCameraAnimationComplete = true;
            setVisiblePlay();
        }
    }
    screenShake.update();
    if (isCameraAnimationComplete && isBallMoving)
        updateBall(ball, player1, player2);
    
    updatePlayers();

    renderer.render(scene, camera);
}

animate();

document.addEventListener('keydown', (event) =>{
    if (!isBallMoving && event.key === ' ' && isCameraAnimationComplete)
    {
        isBallMoving = true;
        hidePlayMessage();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden)
    {
        if (animationId)
        {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    else
    {
        if (!animationId)
            animate();
    }
});

function hidePlayMessage()
{
    messageDiv.style.display = 'none';
}
