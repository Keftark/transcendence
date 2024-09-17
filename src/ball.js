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
    // Initialize ball velocity with random components
    let ballVelocity;
    resetVelocity();

    function playerGetPoint(playerNbr)
    {
        ball.position.set(0, 0, 0); // Reset the ball to the center
        resetVelocity();
        callBack(playerNbr);
        // on file un point au joueur concerne. Ca depend du cote ou va la balle.
    }

    function update(ball, player1, player2)
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
            ballVelocity.x = -ballVelocity.x; // Reverse the X direction
            ballVelocity.x += ballVelocitySpeedUp.x;
            ballVelocity.y += ballVelocitySpeedUp.y;
        }

        // Check collision with right paddle
        if (ball.position.x + ballRadius >= player2.position.x - player2.geometry.parameters.radiusTop * 1.5 &&
            ball.position.y >= player2.position.y - player2.geometry.parameters.height / 2 &&
            ball.position.y <= player2.position.y + player2.geometry.parameters.height / 2)
        {
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

    return { ball, update, resetVelocity };
}
