const scoreRight = document.getElementById('score-right');
const scoreLeft = document.getElementById('score-left');
const playernameRight = document.getElementById('playername-right');
const playernameLeft = document.getElementById('playername-left');
let player1Score = 0;
let player2Score = 0;

function animateScoreChange(scoreElement, newScore) {
    // Step 1: Add the 'fall-down' class to animate the old score down
    scoreElement.classList.add('fall-down');

    // Step 2: After the fall animation completes (300ms), update the score and move the new score up
    setTimeout(() => {
        // Update the score text and prepare it below the original position
        scoreElement.innerText = newScore;

        // Trigger reflow so the class change is recognized
        requestAnimationFrame(() => {
            // Step 3: Now add 'rise-up' to smoothly move the new score into place
            scoreElement.classList.remove('fall-down');
            scoreElement.classList.add('rise-up');
        });

        // Step 4: After the rise-up animation completes, reset the classes
        setTimeout(() => {
            scoreElement.classList.remove('rise-up');
        }, 500); // Match the duration of the 'rise-up' animation
    }, 500); // Match the duration of the 'fall-down' animation
}

export function addScore(playerNbr)
{
    if (playerNbr === 1)
    {
        player2Score += 1;
        animateScoreChange(scoreRight, player2Score);
    }
    else if (playerNbr === 2)
    {
        player1Score += 1;
        animateScoreChange(scoreLeft, player1Score);
    }
}

export function setScores(player1score, player2score)
{
    player1Score = player1score;
    player2Score = player2score;
    scoreLeft.innerText = `${player1Score}`;
    scoreRight.innerText = `${player2Score}`;
}

export function setVisibleScore(boolean)
{
    scoreRight.style.display = boolean === true ? 'block' : 'none';
    scoreLeft.style.display = boolean === true ? 'block' : 'none';
    playernameRight.style.display = boolean === true ? 'block' : 'none';
    playernameLeft.style.display = boolean === true ? 'block' : 'none';
}