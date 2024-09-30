import * as THREE from 'three';
import { Sparks } from './sparks.js';

export function createBall(scene, ballStats, BOUNDARIES, callBack) {
    const ballGeometry = new THREE.SphereGeometry(ballStats.BALL_RADIUS, 32, 32);
    const sparks = new Sparks(scene);
    
    // Create material with emissive properties
    const ballMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: new THREE.Color(0xff0000), // Initial emissive color (red)
        emissiveIntensity: 0 // Start with no emissive intensity
    });

    // Create the ball mesh
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // Create and configure the PointLight
    const pointLight = new THREE.PointLight(0xff0000, 0, 100); // Red light, intensity: 0 (starts from 0), distance: 100
    pointLight.position.copy(ball.position);
    scene.add(pointLight);
    const ballVelocitySpeedUp = new THREE.Vector3(0.15, 0.15, 0);

    function getRandomVelocityComponent() {return Math.random() < 0.5 ? 0.5 : -0.5;}
    function resetVelocity() { 
        let rnd1 = getRandomVelocityComponent();
        let rnd2 = getRandomVelocityComponent();
        ballVelocity = new THREE.Vector3(rnd1, rnd2, 0); 
    }
    let ballVelocity;
    resetVelocity();

    function resetBall() {
        ball.position.set(0, 0, 0);
        pointLight.position.copy(ball.position); // Update light position
        pointLight.intensity = 0; // Reset light intensity
        ball.material.emissiveIntensity = 0; // Reset emissive intensity
        resetVelocity();
    }

    function playerGetPoint(playerNbr) {
        resetBall();
        callBack(playerNbr);
    }

    const maxIntensity = 10; // Maximum intensity value
    const intensityIncrement = 0.05; // Amount to increase intensity with each bounce

    function updateBallLight() {
        // Increment emissive intensity and light intensity
        if (pointLight.intensity < maxIntensity) {
            pointLight.intensity = Math.min(maxIntensity, pointLight.intensity + 0.5);
            ball.material.emissiveIntensity = Math.min(maxIntensity, ball.material.emissiveIntensity + intensityIncrement);
        }
    }

    function checkCollisionTopBottom(ball, BOUNDARIES)
    {
        if (ball.position.y + ballStats.BALL_RADIUS > BOUNDARIES.Y_MAX || ball.position.y - ballStats.BALL_RADIUS < BOUNDARIES.Y_MIN)
            ballVelocity.y = -ballVelocity.y; // Reverse the Y direction
    }

    function checkCollisionLeftPaddle(ball, player1)
    {
        if (ball.position.x - ballStats.BALL_RADIUS <= player1.position.x + player1.geometry.parameters.radiusTop * 1.5 &&
            ball.position.y >= player1.position.y - player1.geometry.parameters.height / 2 &&
            ball.position.y <= player1.position.y + player1.geometry.parameters.height / 2)
            return true;
        return false;
    }
    function checkCollisionRightPaddle(ball, player2)
    {
        if (ball.position.x + ballStats.BALL_RADIUS >= player2.position.x - player2.geometry.parameters.radiusTop * 1.5 &&
            ball.position.y >= player2.position.y - player2.geometry.parameters.height / 2 &&
            ball.position.y <= player2.position.y + player2.geometry.parameters.height / 2)
            return true;
        return false;
    }

    function bounceBallOnPaddle(isLeft)
    {
        updateBallLight();
        ballVelocity.x = -ballVelocity.x;
        if (isLeft === true)
        {

            if (ballVelocity.x > 1.5)
            {
                let count = Math.trunc(ballVelocity.x * 10);
                sparks.spawnSparks(ball.position.clone(), count);
            }
            ballVelocity.x += ballVelocitySpeedUp.x;
            ballVelocity.y += ballVelocitySpeedUp.y;
        }
        else
        {
            if (-ballVelocity.x > 1.5)
            {
                let count = Math.trunc(-ballVelocity.x * 10);
                sparks.spawnSparks(ball.position.clone(), count);
            }
            ballVelocity.x -= ballVelocitySpeedUp.x;
            ballVelocity.y -= ballVelocitySpeedUp.y;
        }
    }

    function updateBall(ball, player1, player2) {
        ball.position.add(ballVelocity);
        pointLight.position.copy(ball.position); // Update light position to follow the ball
        
        sparks.updateSparks();
        // Check collision with top and bottom (y-axis bounds)
        checkCollisionTopBottom(ball, BOUNDARIES);
        // Check collision with left paddle
        if (checkCollisionLeftPaddle(ball, player1) === true)
            bounceBallOnPaddle(true);
        else if (checkCollisionRightPaddle(ball, player2))
            bounceBallOnPaddle(false);
        else
        {
            // Check if the ball is out of bounds (game over conditions, if needed)
            if (ball.position.x < BOUNDARIES.X_MIN)
                playerGetPoint(1);
            else if (ball.position.x > BOUNDARIES.X_MAX)
                playerGetPoint(2);
        }

    }

    return { ball, updateBall, resetBall };
}
