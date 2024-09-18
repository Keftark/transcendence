import * as THREE from 'three';

export function createBall(scene, ballRadius, boundXMin, boundXMax, boundYMin, boundYMax, callBack) {
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);
    const ballVelocitySpeedUp = new THREE.Vector3(0.15, 0.15, 0);

    function getRandomVelocityComponent() {return Math.random() < 0.5 ? 0.5 : -0.5;}
    function resetVelocity()
    { 
        let rnd1 = getRandomVelocityComponent();
        let rnd2 = getRandomVelocityComponent();
        ballVelocity = new THREE.Vector3(rnd1, rnd2, 0); 
    }
    let ballVelocity;
    resetVelocity();

    function resetBall()
    {
        colorStep = 0;
        ball.position.set(0, 0, 0);
        resetVelocity();
        ball.material.color.set(`rgb(255, 255, 255)`);
    }

    function playerGetPoint(playerNbr)
    {
        resetBall();
        callBack(playerNbr);
        // on file un point au joueur concerne. Ca depend du cote ou va la balle.
    }

    let colorStep = 0;
    const totalSteps = 10;
    const colorIncrement = 255 / totalSteps;

    function updateBallColor() {
        if (colorStep >= totalSteps)
            return;
        const redValue = 255;
        const newColor = Math.round(255 - (colorStep * colorIncrement));
        ball.material.color.set(`rgb(${redValue}, ${newColor}, ${newColor})`);
        colorStep++;
    }

    function updateBall(ball, player1, player2)
    {
        ball.position.add(ballVelocity);

        // Check collision with top and bottom (y-axis bounds)
        if (ball.position.y + ballRadius > boundYMax || ball.position.y - ballRadius < boundYMin)
            ballVelocity.y = -ballVelocity.y; // Reverse the Y direction

        // Check collision with left paddle
        if (ball.position.x - ballRadius <= player1.position.x + player1.geometry.parameters.radiusTop * 1.5 &&
            ball.position.y >= player1.position.y - player1.geometry.parameters.height / 2 &&
            ball.position.y <= player1.position.y + player1.geometry.parameters.height / 2)
        {
            updateBallColor();
            ballVelocity.x = -ballVelocity.x; // Reverse the X direction
            ballVelocity.x += ballVelocitySpeedUp.x;
            ballVelocity.y += ballVelocitySpeedUp.y;
        }
        // Check collision with right paddle
        else if (ball.position.x + ballRadius >= player2.position.x - player2.geometry.parameters.radiusTop * 1.5 &&
            ball.position.y >= player2.position.y - player2.geometry.parameters.height / 2 &&
            ball.position.y <= player2.position.y + player2.geometry.parameters.height / 2)
        {
            updateBallColor();
            ballVelocity.x = -ballVelocity.x; // Reverse the X direction
            ballVelocity.x -= ballVelocitySpeedUp.x;
            ballVelocity.y -= ballVelocitySpeedUp.y;
        }

        // Check if the ball is out of bounds (game over conditions, if needed)
        if (ball.position.x < boundXMin)
            playerGetPoint(1);
        else if (ball.position.x > boundXMax)
            playerGetPoint(2);
    }

    return { ball, updateBall, resetBall };
}
