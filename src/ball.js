import { ballBaseRadius, ballBaseSpeed, ballStats, BOUNDARY } from './levelLocal.js';
import { Sparks } from './sparks.js';
const speedLimit = 3;
const maxBounceAngle = 75 * Math.PI / 180;

function getDimensions(object) {
    const boundingBox = new THREE.Box3().setFromObject(object);
    return {
        width: boundingBox.max.x - boundingBox.min.x,
        height: boundingBox.max.y - boundingBox.min.y,
        depth: boundingBox.max.z - boundingBox.min.z,
    };
}

export function createBall(scene, callBack) {
    const ballMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: new THREE.Color(0xff2200), // Initial emissive color (red)
        emissiveIntensity: 0 // Start with no emissive intensity
    });
    const ballGeometry = new THREE.SphereGeometry(ballStats.BALL_RADIUS, 32, 32);
    const sparks = new Sparks(scene);
    const ballVelocitySpeedUp = new THREE.Vector3(0.15, 0.15, 0);
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    const pointLight = new THREE.PointLight(0xff2200, 0, 0);
    const maxLightIntensity = 10; // Maximum intensity value
    let ballVelocity;
    let intensityIncrement = 0.05; // Amount to increase intensity with each bounce

    scene.add(ball);
    pointLight.position.copy(ball.position);
    scene.add(pointLight);

    function getRandomVelocityComponent() {return Math.random() < 0.5 ? 0.5 : -0.5;}
    function resetVelocity() { 
        let rnd1 = getRandomVelocityComponent();
        let rnd2 = getRandomVelocityComponent();
        ballVelocity = new THREE.Vector3(rnd1, rnd2, 0); 
    }

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

    function updateBallLight()
    {
        if (pointLight.intensity < maxLightIntensity) {
            pointLight.intensity = Math.min(maxLightIntensity, pointLight.intensity + 0.1);
            ball.material.emissiveIntensity = Math.min(maxLightIntensity, ball.material.emissiveIntensity + intensityIncrement);
            intensityIncrement *= 1.05;
            pointLight.distance += 1;
        }
    }

    function checkCollisionTopBottom(ball)
    {
        const radius = ballStats.BALL_RADIUS;
        const posY = ball.position.y;
        if (posY + radius > BOUNDARY.Y_MAX - 1)
            ballVelocity.y = -ballVelocity.y;
        else if (posY - radius < BOUNDARY.Y_MIN + 1)
            ballVelocity.y = -ballVelocity.y;
    }

    function getXContactPointPaddle(player)
    {
        return player.position.x < 0 ? player.position.x + player.geometry.parameters.radiusTop : player.position.x - player.geometry.parameters.radiusTop;
    }

    function checkCollisionLeftPaddle(ball, player1)
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

    function checkCollisionRightPaddle(ball, player2)
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
    function bounceBallOnPaddle(isLeft, position, paddle) {
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
    
        const shouldSpawnSparks = (isLeft && ballVelocity.x > 1.1) || (!isLeft && -ballVelocity.x > 1.1);
        if (shouldSpawnSparks) {
            const count = Math.trunc(Math.abs(ballVelocity.x) * 15);
            sparks.spawnSparks(position, count);
        }
        ballVelocity.y += isLeft ? ballVelocitySpeedUp.y : -ballVelocitySpeedUp.y;
        console.log(ballVelocity.x + ", " + ballVelocity.y);
    }
    

    function updateBall(ball, player1, player2)
    {
        ball.position.add(ballVelocity);
        pointLight.position.copy(ball.position);
        
        sparks.updateSparks();
        checkCollisionTopBottom(ball);
        if (checkCollisionLeftPaddle(ball, player1) === true)
            bounceBallOnPaddle(true, new THREE.Vector3(getXContactPointPaddle(player1), ball.position.y, 0), player1);
        else if (checkCollisionRightPaddle(ball, player2))
            bounceBallOnPaddle(false, new THREE.Vector3(getXContactPointPaddle(player2), ball.position.y, 0), player2);
        else
        {
            const radius = ballStats.BALL_RADIUS;
            const ballPosX = ball.position.x;
            if (ballPosX - radius < BOUNDARY.X_MIN)
                playerGetPoint(1);
            else if (ballPosX + radius > BOUNDARY.X_MAX)
                playerGetPoint(2);
        }
    }

    function changeBallSize(newRadius) {
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
