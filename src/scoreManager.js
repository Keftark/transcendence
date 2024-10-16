import { getPlayerVictories, playerStats } from "./playerManager";
import { getTranslation } from "./translate";

const scores = document.getElementById('scores');
const scoreRight = document.getElementById('score-right');
const scoreLeft = document.getElementById('score-left');
let player1Score = 0;
let player2Score = 0;

export class MatchResult
{
    constructor(playerScore = 0, opponentScore = 0,  opponentName = "") {
      this.scorePlayer = playerScore;
      this.scoreOpponent = opponentScore;
      this.nameOpponent = opponentName;
    }
}

function animateScoreChange(scoreElement, newScore)
{
    scoreElement.classList.add('fall-down');
    setTimeout(() => {
        scoreElement.innerText = newScore;
        requestAnimationFrame(() => {
            scoreElement.classList.remove('fall-down');
            scoreElement.classList.add('rise-up');
        });
        setTimeout(() => {
            scoreElement.classList.remove('rise-up');
        }, 500);
    }, 500);
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
    scores.style.display = boolean === true ? 'block' : 'none';
}

export function removeAllScores()
{
    let parentElement = document.getElementById('matchHistoryContainer');
    while (parentElement.firstChild)
        parentElement.removeChild(parentElement.firstChild);
}

function getVictoriesText(player = playerStats)
{
    return (getPlayerVictories(player).victories + "/" + getPlayerVictories(player).total
        + " (" + getPlayerVictories(player).percentage + "%)");
}

export function loadScores(player = playerStats)
{
    if (player.matches.length > 0)
        document.getElementById('victories').innerText = getVictoriesText(player);
    else
        document.getElementById('victories').innerText = getTranslation('noMatchHistory');

    const scoresContainer = document.getElementById('matchHistoryContainer');
    for (let i = 0; i < player.matches.length; i++)
    {
        let match = player.matches[i];
        const newContainer = document.createElement('div');
        newContainer.classList.add('score-container');
        const leftContent = document.createElement('div');
        leftContent.style.color = playerStats.colors;
        leftContent.classList.add('score-left');
        leftContent.textContent = player.nickname + "\n" + match.scorePlayer;
        newContainer.appendChild(leftContent);
        const rightContent = document.createElement('div');
        rightContent.style.color = playerStats.colors;
        rightContent.classList.add('score-right');
        rightContent.textContent = match.nameOpponent + "\n" + match.scoreOpponent;
        newContainer.appendChild(rightContent);
        if (match.scorePlayer > match.scoreOpponent)
            newContainer.style.background = 'linear-gradient(to right, #228822 30%, #006666 70%)';
        else
            newContainer.style.background = 'linear-gradient(to right, #882222 30%, #006666 70%)';
        scoresContainer.appendChild(newContainer);
    }
}