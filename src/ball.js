import { ballStats, BOUNDARY } from './levelLocal.js';
import { Sparks } from './sparks.js';

export function createBall(scene, callBack) {
    const ballGeometry = new THREE.SphereGeometry(ballStats.BALL_RADIUS, 32, 32);
    const sparks = new Sparks(scene);
    
    // Create material with emissive properties
    const ballMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: new THREE.Color(0xff2200), // Initial emissive color (red)
        emissiveIntensity: 0 // Start with no emissive intensity
    });

    // Create the ball mesh
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // Create and configure the PointLight
    const pointLight = new THREE.PointLight(0xff2200, 0, 0);
    pointLight.position.copy(ball.position);
    scene.add(pointLight);
    const ballVelocitySpeedUp = new THREE.Vector3(0.15, 0.15, 0);

    let ballVelocity;
    function getRandomVelocityComponent() {return Math.random() < 0.5 ? 0.5 : -0.5;}
    function resetVelocity() { 
        let rnd1 = getRandomVelocityComponent();
        let rnd2 = getRandomVelocityComponent();
        ballVelocity = new THREE.Vector3(rnd1, rnd2, 0); 
    }
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
    let intensityIncrement = 0.05; // Amount to increase intensity with each bounce

    function updateBallLight() {
        // Increment emissive intensity and light intensity
        if (pointLight.intensity < maxIntensity) {
            pointLight.intensity = Math.min(maxIntensity, pointLight.intensity + 0.1);
            ball.material.emissiveIntensity = Math.min(maxIntensity, ball.material.emissiveIntensity + intensityIncrement);
            intensityIncrement *= 1.05;
            pointLight.distance += 1;
        }
    }

    function checkCollisionTopBottom(ball)
    {
        const radius = ballStats.BALL_RADIUS;
        const posY = ball.position.y;
        if (posY + radius > BOUNDARY.Y_MAX - 1)
        {
            console.log("top");
            ballVelocity.y = -ballVelocity.y; // Reverse the Y direction
            console.log("ball position y: " + posY);
            console.log("ball radius: " + radius);
            console.log("boundaries: " + BOUNDARY.Y_MIN + ", " + BOUNDARY.Y_MAX);
        }
        else if (posY - radius < BOUNDARY.Y_MIN + 1)
        {
            console.log("bottom");
            ballVelocity.y = -ballVelocity.y; // Reverse the Y direction
            console.log("ball position y: " + posY);
            console.log("ball radius: " + radius);
            console.log("boundaries: " + BOUNDARY.Y_MIN + ", " + BOUNDARY.Y_MAX);
        }
    }

    function getXContactPointPaddle(player)
    {
        return player.position.x < 0 ? player.position.x + player.geometry.parameters.radiusTop * 1.5 : player.position.x - player.geometry.parameters.radiusTop * 1.5;
    }

    function checkCollisionLeftPaddle(ball, player1)
    {
        const radius = ballStats.BALL_RADIUS;
        const dividedPlayerSize = player1.geometry.parameters.height / 2;
        if (ball.position.x - radius <= getXContactPointPaddle(player1) &&
            ball.position.y >= player1.position.y - dividedPlayerSize &&
            ball.position.y <= player1.position.y + dividedPlayerSize)
            {
                console.log("left");
                console.log("ball position x: " + ball.position.x);
                console.log("ball radius: " + radius);
                console.log("ball velocity x: " + ballVelocity.x);
                console.log("boundaries: " + BOUNDARY.X_MIN + ", " + BOUNDARY.X_MAX);
                // ball.position.set(getXContactPointPaddle(player1) + getBallStats().BALL_RADIUS, ball.position.y, 0);
                return true;
            }
        return false;
    }
    function checkCollisionRightPaddle(ball, player2)
    {
        const radius = ballStats.BALL_RADIUS;
        const dividedPlayerSize = player2.geometry.parameters.height / 2;
        if (ball.position.x + radius >= getXContactPointPaddle(player2) &&
            ball.position.y >= player2.position.y - dividedPlayerSize &&
            ball.position.y <= player2.position.y + dividedPlayerSize)
            {
                console.log("right");
                console.log("ball position x: " + ball.position.x);
                console.log("ball radius: " + radius);
                console.log("ball velocity x: " + ballVelocity.x);
                console.log("boundaries: " + BOUNDARY.X_MIN + ", " + BOUNDARY.X_MAX);
                // ball.position.set(getXContactPointPaddle(player2) - getBallStats().BALL_RADIUS, ball.position.y, 0);
                return true;
            }
        return false;
    }

    function bounceBallOnPaddle(isLeft)
    {
        updateBallLight();
        ballVelocity.x = -ballVelocity.x;
        if (isLeft === true)
        {
            if (ballVelocity.x > 5) ballVelocity.x = 5;
            if (ballVelocity.x > 1.1)
            {
                let count = Math.trunc(ballVelocity.x * 15);
                sparks.spawnSparks(ball.position.clone(), count);
            }
            ballVelocity.x += ballVelocitySpeedUp.x;
            ballVelocity.y += ballVelocitySpeedUp.y;
        }
        else
        {
            if (ballVelocity.x < -5) ballVelocity.x = -5;
            if (-ballVelocity.x > 1.1)
            {
                let count = Math.trunc(-ballVelocity.x * 15);
                sparks.spawnSparks(ball.position.clone(), count);
            }
            ballVelocity.x -= ballVelocitySpeedUp.x;
            ballVelocity.y -= ballVelocitySpeedUp.y;
        }
    }

    function updateBall(ball, player1, player2)
    {
        // console.log("update");
        ball.position.add(ballVelocity);
        // console.log("after: " + ball.position.x + ", " + ball.position.y + ", " + ball.position.z);
        pointLight.position.copy(ball.position); // Update light position to follow the ball
        
        sparks.updateSparks();
        checkCollisionTopBottom(ball);
        if (checkCollisionLeftPaddle(ball, player1) === true)
            bounceBallOnPaddle(true);
        else if (checkCollisionRightPaddle(ball, player2))
            bounceBallOnPaddle(false);
        else
        {
            if (ball.position.x - ballStats.BALL_RADIUS < BOUNDARY.X_MIN)
                playerGetPoint(1);
            else if (ball.position.x + ballStats.BALL_RADIUS > BOUNDARY.X_MAX)
                playerGetPoint(2);
        }
    }

    function changeBallSize(newRadius) {
        let radius = parseFloat(newRadius);
        ballStats.BALL_RADIUS = radius;
        const newBallGeometry = new THREE.SphereGeometry(radius, 32, 32);
        ball.geometry.dispose(); // Dispose of the old geometry to free up memory
        ball.geometry = newBallGeometry; // Assign the new geometry to the ball mesh
        // ball.geometry.computeBoundingSphere();
        // ball.geometry.computeBoundingBox();
    }

    function changeBallSpeed(newSpeed)
    {
        ballVelocity.x = ballVelocity.x * parseFloat(newSpeed);
        ballVelocity.y = ballVelocity.y * parseFloat(newSpeed);
    }

    return { ball, updateBall, resetBall, changeBallSize, changeBallSpeed };
}
