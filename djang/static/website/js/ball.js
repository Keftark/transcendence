import * as THREE from '../node_modules/.vite/deps/three.js';
import { BOUNDARY, playerSize, spawnSparksFunction } from './levelLocal.js';
import { ArenaType, BallStats, LevelMode } from './variables.js';
import { getRules } from './rules.js';
import { fillPowerBarLeft, fillPowerBarRight } from './powerUp.js';
import { getBoostedStatus, stopBoostPlayer } from './playerMovement.js';
import { getLevelState } from './main.js';

const ballBaseStats = BallStats;
let ballSpeedMult = 1.0;
let isBallBoosted = false;
let boostedBallModel;
let currentLevelMode;

let ballPosition =
{
    x: 0,
    y: 0
}

export function setBallPosition(xPos, yPos)
{
    ballPosition.x = isNaN(xPos) ? 0 : xPos;
    ballPosition.y = isNaN(yPos) ? 0 : yPos;
}

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
        return 'static/mat/caveBall.png';
    if (levelType === ArenaType.SPACE)
        return 'static/mat/spaceBall.png';
}

function createBallBoostModel(textureLoader)
{
    const boostTexture = textureLoader.load('static/mat/ballBoost.png');
    boostTexture.colorSpace = THREE.SRGBColorSpace;
    const boostMaterial = new THREE.MeshStandardMaterial({ 
        map:boostTexture,
        transparent: true,
        emissive: new THREE.Color(0xffff00),
        emissiveIntensity: 10,
        opacity: 1
    });
    const boostGeometry = new THREE.SphereGeometry(ballBaseStats.baseRadius + 0.1, 32, 32);
    const model = new THREE.Mesh(boostGeometry, boostMaterial);

    model.visible = false;
    return model;
}

export function showBoostedBall(trueOrFalse)
{
    if (!boostedBallModel)
        return;
    boostedBallModel.visible = trueOrFalse;
    isBallBoosted = trueOrFalse;
}

function getRandomVelocityComponent() {return Math.random() < 0.5 ? ballBaseStats.baseSpeed : -ballBaseStats.baseSpeed;}

export function createBall(scene, callBack)
{
    currentLevelMode = getLevelState();
    isBallBoosted = false;
    ballSpeedMult = 1;
    const textureLoader = new THREE.TextureLoader();
    const ballTexture = textureLoader.load(getBallTexturePath());
    ballTexture.colorSpace = THREE.SRGBColorSpace;
    const ballMaterial = new THREE.MeshStandardMaterial({ 
        map:ballTexture,
        emissive: new THREE.Color(0xff5500),
        emissiveIntensity: 0
    });
    const ballGeometry = new THREE.SphereGeometry(ballBaseStats.baseRadius, 32, 32);
    const ballVelocitySpeedUp = new THREE.Vector3(0.07, 0.07, 0);
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    const boostedBall = createBallBoostModel(textureLoader);
    boostedBallModel = boostedBall;
    ball.add(boostedBall);
    const pointLight = new THREE.PointLight(0xff5500, 0, 0);
    const maxLightIntensity = 100;
    let ballVelocity;
    let intensityIncrement = ballBaseStats.baseIntensityIncrement;
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

    function boostBall()
    {
        ballSpeedMult += 0.5;
        isBallBoosted = true;
        boostedBall.visible = true;
        // mettre un contour a la balle
    }
    
    function unboostBall()
    {
        if (isBallBoosted === false)
            return;
        ballSpeedMult -= 0.5;
        isBallBoosted = false;
        boostedBall.visible = false;
    }

    function checkBoostStatus(isLeft)
    {
        if (isLeft && getBoostedStatus(0) === true) // pour le joueur de gauche uniquement !
        {
            stopBoostPlayer(0);
            boostBall();
        }
        else if (!isLeft && getBoostedStatus(1) === true) // pour le joueur de droite uniquement !
        {
            stopBoostPlayer(1);
            boostBall();
        }
    }

    function resetBall() {
        unboostBall();
        ball.position.set(0, 0, 0);
        pointLight.position.copy(ball.position); // Update light position
        pointLight.intensity = 0; // Reset light intensity
        pointLight.distance = 0;
        ball.material.emissiveIntensity = 0; // Reset emissive intensity
        intensityIncrement = ballBaseStats.baseIntensityIncrement;
        resetVelocity();
    }

    function updateBallLight()
    {
        if (pointLight.intensity < maxLightIntensity) {
            pointLight.intensity = Math.min(maxLightIntensity, pointLight.intensity + 1);
            ball.material.emissiveIntensity = Math.min(maxLightIntensity, ball.material.emissiveIntensity + intensityIncrement - ballBaseStats.baseIntensityIncrement);
            intensityIncrement *= 1.04;
            pointLight.distance += intensityIncrement * 25;
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
        const radius = ballBaseStats.baseRadius;
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

    function isBallHittingPlayer(ballPosY, playerPosY, dividedPlayerSize)
    {
        return (ballPosY >= playerPosY - dividedPlayerSize &&
        ballPosY <= playerPosY + dividedPlayerSize);
    }

    function checkCollisionLeftPaddle(player1)
    {
        const ballPosY = ball.position.y;
        const playerPosY = player1.position.y;
        const dividedPlayerSize = playerSize / 2;
        if (ball.position.x - ballBaseStats.baseRadius <= getXContactPointPaddle(player1) &&
            isBallHittingPlayer(ballPosY, playerPosY, dividedPlayerSize))
                return true;
        return false;
    }

    function checkCollisionRightPaddle(player2)
    {
        // const radius = ballBaseStats.baseRadius;
        const ballPosY = ball.position.y;
        const playerPosY = player2.position.y;
        const dividedPlayerSize = playerSize / 2;
        if (ball.position.x + ballBaseStats.baseRadius >= getXContactPointPaddle(player2) &&
            isBallHittingPlayer(ballPosY, playerPosY, dividedPlayerSize))
                return true;
        return false;
    }

    function updateBoostBars(absVeloX, isLeft)
    {
        if (!isLeft)
        {
            ballVelocity.x = -ballVelocity.x;
            if (currentLevelMode === LevelMode.LOCAL || currentLevelMode === LevelMode.TOURNAMENT)
                fillPowerBarRight(absVeloX * 25);
        }
        else
            fillPowerBarLeft(absVeloX * 25);
    }

    function trySpawnSparks(absVeloX, position)
    {
        if (absVeloX > 1.6) {
            const count = Math.trunc(absVeloX * 15);
            spawnSparksFunction(position, count);
        }
    }

    function bounceBallOnPaddle(isLeft, position, paddle)
    {
        unboostBall();
        updateBallLight();
    
        const paddleCenter = paddle.position.y;
        const paddleHeight = getDimensions(paddle).height;
        const hitPosition = (position.y - paddleCenter) / (paddleHeight / 2); // Normalize to [-1, 1]
        
        ballVelocity.x = -ballVelocity.x;
    
        const bounceAngle = hitPosition * ballBaseStats.maxBounceAngle;
    
        const ballSpeed = Math.hypot(ballVelocity.x, ballVelocity.y);
        ballVelocity.x = ballSpeed * Math.cos(bounceAngle);
        ballVelocity.y = ballSpeed * Math.sin(bounceAngle);
    
        ballVelocity.x = Math.min(ballVelocity.x + ballVelocitySpeedUp.x, ballBaseStats.speedLimit);
        
        const absVeloX = Math.abs(ballVelocity.x);
        updateBoostBars(absVeloX, isLeft);
        trySpawnSparks(absVeloX, position);
        ballVelocity.y += isLeft ? ballVelocitySpeedUp.y : -ballVelocitySpeedUp.y;
        ballLookAt();
        checkBoostStatus(isLeft);
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

    // use this function when a player gets a point | 1 = left 2 = right
    function givePlayerPoint(playerNbr)
    {
        spawnSparksFunction(ball.position, 400);
        callBack(playerNbr, true);
    }

    function setBallPosition(posX, posY)
    {
        // console.log(posX + ", " + posY);
        ball.position.set(posX, posY, 0);
    }

    function moveBall(player1, player2)
    {
        // movement logic
        let modVelocity = new THREE.Vector3(ballVelocity.x, ballVelocity.y, ballVelocity.z);
        modVelocity.x *= ballSpeedMult;
        modVelocity.y *= ballSpeedMult;
        ball.position.add(modVelocity);

        checkCollisionTopBottom(ball.position);
        if (checkCollisionLeftPaddle(player1))
            bounceBallOnPaddle(true, new THREE.Vector3(getXContactPointPaddle(player1), ball.position.y, 0), player1);
        else if (checkCollisionRightPaddle(player2))
            bounceBallOnPaddle(false, new THREE.Vector3(getXContactPointPaddle(player2), ball.position.y, 0), player2);
        else
        {
            const radius = ballBaseStats.baseRadius;
            const ballPosX = ball.position.x;
            if (ballPosX - radius < boundxmin)
                givePlayerPoint(1);
            else if (ballPosX + radius > boundxmax)
                givePlayerPoint(2);
        }

        // other functions (to keep!)
        // setBallPosition(vars x, y from the server);
    }

    function updateBall(player1, player2)
    {
        if (currentLevelMode === LevelMode.LOCAL || currentLevelMode === LevelMode.ADVENTURE || currentLevelMode === LevelMode.TOURNAMENT)
            moveBall(player1, player2);
        else if (currentLevelMode === LevelMode.ONLINE || currentLevelMode === LevelMode.MULTI)
            setBallPosition(ballPosition.x, ballPosition.y);
        pointLight.position.copy(ball.position);
        rotateBall();
    }

    function changeBallSize(newRadius)
    {
        if (isNaN(newRadius))
            newRadius = 1;
        let radius = ballBaseStats.baseRadius * newRadius;
        const newBallGeometry = new THREE.SphereGeometry(radius, 32, 32);
        const newBoostGeometry = new THREE.SphereGeometry(radius + 0.1, 32, 32);
        ball.geometry.dispose();
        boostedBall.geometry.dispose();
        ball.geometry = newBallGeometry;
        boostedBall.geometry = newBoostGeometry;
    }

    function changeBallSpeed(newSpeed)
    { 
        // console.log(newSpeed);
        if (isNaN(newSpeed))
            ballSpeedMult = 1;
        else
            ballSpeedMult = parseFloat(newSpeed);
    }

    resetVelocity();

    return { ball, updateBall, resetBall, changeBallSize, changeBallSpeed, updateBallLight };
}
