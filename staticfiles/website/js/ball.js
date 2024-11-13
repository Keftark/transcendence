import * as THREE from '../node_modules/.vite/deps/three.js';
import { ballBaseRadius, ballBaseSpeed, ballStats, BOUNDARY } from './levelLocal.js';
import { Sparks } from './sparks.js';
import { ArenaType } from './variables.js';
import { getRules } from './rules.js';
const speedLimit = 3;
const maxBounceAngle = 75 * Math.PI / 180;
const baseSpeed = 0.75;
const baseIntensityIncrement = 0.005;

function getDimensions(object) {
    const boundingBox = new THREE.Box3().setFromObject(object);
    return {
        width: boundingBox.max.x - boundingBox.min.x,
        height: boundingBox.max.y - boundingBox.min.y,
        depth: boundingBox.max.z - boundingBox.min.z,
    };
}

function getBallTexturePath()
{
    const levelType = getRules().arena;
    if (levelType === ArenaType.CAVE)
        return 'mat/caveBall.png';
    if (levelType === ArenaType.SPACE)
        return 'mat/spaceBall.png';
}

function getRandomVelocityComponent() {return Math.random() < 0.5 ? baseSpeed : -baseSpeed;}

export function createBall(scene, callBack) {
    const textureLoader = new THREE.TextureLoader();
    const ballTexture = textureLoader.load(getBallTexturePath());
    ballTexture.colorSpace = THREE.SRGBColorSpace;
    const ballMaterial = new THREE.MeshStandardMaterial({ 
        map:ballTexture,
        emissive: new THREE.Color(0xff5500),
        emissiveIntensity: 0
    });
    const ballGeometry = new THREE.SphereGeometry(ballStats.BALL_RADIUS, 32, 32);
    const sparks = new Sparks(scene);
    const ballVelocitySpeedUp = new THREE.Vector3(0.07, 0.07, 0);
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    const pointLight = new THREE.PointLight(0xff5500, 0, 0);
    const maxLightIntensity = 30;
    let ballVelocity;
    let intensityIncrement = baseIntensityIncrement;
    const boundxmin = BOUNDARY.X_MIN - 0.8;
    const boundxmax = BOUNDARY.X_MAX + 0.8;

    scene.add(ball);
    pointLight.position.copy(ball.position);
    scene.add(pointLight);

    function resetVelocity() { 
        let rnd1 = getRandomVelocityComponent();
        let rnd2 = getRandomVelocityComponent();
        ballVelocity = new THREE.Vector3(rnd1, rnd2, 0); 
    }

    function resetBall() {
        ball.position.set(0, 0, 0);
        pointLight.position.copy(ball.position); // Update light position
        pointLight.intensity = 0; // Reset light intensity
        pointLight.distance = 0;
        ball.material.emissiveIntensity = 0; // Reset emissive intensity
        intensityIncrement = baseIntensityIncrement;
        resetVelocity();
    }

    function updateBallLight()
    {
        if (pointLight.intensity < maxLightIntensity) {
            pointLight.intensity = Math.min(maxLightIntensity, pointLight.intensity + 1);
            ball.material.emissiveIntensity = Math.min(maxLightIntensity, ball.material.emissiveIntensity + intensityIncrement);
            intensityIncrement *= 1.04;
            pointLight.distance += intensityIncrement * 15;
        }
    }

    function ballLookAt()
    {
        let direction = ballVelocity.clone().normalize();
        // If the ball is moving, use lookAt to orient it
        if (direction.length() > 0) {
            // Calculate the target position (where the ball is heading)
            const targetPosition = ball.position.clone().add(direction);
            targetPosition.z = ball.position.z;
            ball.lookAt(targetPosition); // Make the ball look towards the target position
        }
    }

    function checkCollisionTopBottom(nextPos)
    {
        const radius = ballStats.BALL_RADIUS;
        const posY = nextPos.y;
        if (posY + radius > BOUNDARY.Y_MAX - 1)
        {
            ball.position.set(nextPos.x, BOUNDARY.Y_MAX - 1 - radius);
            ballVelocity.y = -ballVelocity.y;
            ballLookAt();
        }
        else if (posY - radius < BOUNDARY.Y_MIN + 1)
        {
            ball.position.set(nextPos.x, BOUNDARY.Y_MIN + 1 + radius);
            ballVelocity.y = -ballVelocity.y;
            ballLookAt();
        }
    }

    function getXContactPointPaddle(player)
    {
        return player.position.x < 0 ? player.position.x + player.geometry.parameters.radiusTop : player.position.x - player.geometry.parameters.radiusTop;
    }

    function checkCollisionLeftPaddle(player1)
    {
        const radius = ballStats.BALL_RADIUS;
        const ballPosY = ball.position.y;
        const playerPosY = player1.position.y;
        const dividedPlayerSize = player1.geometry.parameters.height / 2;
        if (ball.position.x - radius <= getXContactPointPaddle(player1) &&
            ballPosY >= playerPosY - dividedPlayerSize &&
            ballPosY <= playerPosY + dividedPlayerSize)
            {
                // ball.position.set(getXContactPointPaddle(player1) + radius, ballPosY, 0);
                return true;
            }
        return false;
    }

    function checkCollisionRightPaddle(player2)
    {
        const radius = ballStats.BALL_RADIUS;
        const ballPosY = ball.position.y;
        const playerPosY = player2.position.y;
        const dividedPlayerSize = player2.geometry.parameters.height / 2;
        if (ball.position.x + radius >= getXContactPointPaddle(player2) &&
            ballPosY >= playerPosY - dividedPlayerSize &&
            ballPosY <= playerPosY + dividedPlayerSize)
            {
                // ball.position.set(getXContactPointPaddle(player2) - radius, ballPosY, 0);
                return true;
            }
        return false;
    }
    function bounceBallOnPaddle(isLeft, position, paddle)
    {
        updateBallLight();
    
        const paddleCenter = paddle.position.y;
        const paddleHeight = getDimensions(paddle).height;
        const hitPosition = (position.y - paddleCenter) / (paddleHeight / 2); // Normalize to [-1, 1]
        
        ballVelocity.x = -ballVelocity.x;
    
        const bounceAngle = hitPosition * maxBounceAngle;
    
        const ballSpeed = Math.hypot(ballVelocity.x, ballVelocity.y);
        ballVelocity.x = ballSpeed * Math.cos(bounceAngle);
        ballVelocity.y = ballSpeed * Math.sin(bounceAngle);
    
        ballVelocity.x = Math.min(ballVelocity.x + ballVelocitySpeedUp.x, speedLimit);
        if (!isLeft)
            ballVelocity.x = -ballVelocity.x;
    
        const shouldSpawnSparks = (isLeft && ballVelocity.x > 1.6) || (!isLeft && -ballVelocity.x > 1.6);
        if (shouldSpawnSparks) {
            const count = Math.trunc(Math.abs(ballVelocity.x) * 15);
            sparks.spawnSparks(position, count);
        }
        ballVelocity.y += isLeft ? ballVelocitySpeedUp.y : -ballVelocitySpeedUp.y;
        ballLookAt();
    }
    
    let previousPosition = new THREE.Vector3(ball.position.x, ball.position.y, ball.position.z);
    function rotateBall()
    {
        const direction = new THREE.Vector3();
        direction.subVectors(ball.position, previousPosition).normalize();
        const displacement = previousPosition.distanceTo(ball.position);
        const rotationAxis = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
        ball.rotateOnAxis(rotationAxis, displacement / 5);
        previousPosition.copy(ball.position);
    }

    function updateBall(player1, player2)
    {
        // let nextPos = new THREE.Vector3(ball.position.x + ballVelocity.x, ball.position.y + ballVelocity.y);
        ball.position.add(ballVelocity);

        pointLight.position.copy(ball.position);
        sparks.updateSparks();
        checkCollisionTopBottom(ball.position);
        if (checkCollisionLeftPaddle(player1) === true)
            bounceBallOnPaddle(true, new THREE.Vector3(getXContactPointPaddle(player1), ball.position.y, 0), player1);
        else if (checkCollisionRightPaddle(player2))
            bounceBallOnPaddle(false, new THREE.Vector3(getXContactPointPaddle(player2), ball.position.y, 0), player2);
        else
        {
            const radius = ballStats.BALL_RADIUS;
            const ballPosX = ball.position.x;
            if (ballPosX - radius < boundxmin)
                callBack(1);
            else if (ballPosX + radius > boundxmax)
                callBack(2);
        }
        rotateBall();
    }

    function changeBallSize(newRadius)
    {
        if (isNaN(newRadius))
            newRadius = ballBaseRadius;
        let radius = parseFloat(newRadius);
        ballStats.BALL_RADIUS = radius;
        const newBallGeometry = new THREE.SphereGeometry(radius, 32, 32);
        ball.geometry.dispose();
        ball.geometry = newBallGeometry;
    }

    function changeBallSpeed(newSpeed)
    { 
        if (isNaN(newSpeed))
            newSpeed = ballBaseSpeed;
        ballVelocity.x = ballVelocity.x * parseFloat(newSpeed);
        ballVelocity.y = ballVelocity.y * parseFloat(newSpeed);
    }

    resetVelocity();

    return { ball, updateBall, resetBall, changeBallSize, changeBallSpeed };
}
