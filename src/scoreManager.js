import { getPlayerVictories, playerStats } from "./playerManager";
import { getTranslation } from "./translate";

const scoreRight = document.getElementById('score-right');
const scoreLeft = document.getElementById('score-left');
const playernameRight = document.getElementById('playername-right');
const playernameLeft = document.getElementById('playername-left');
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
    scoreRight.style.display = boolean === true ? 'block' : 'none';
    scoreLeft.style.display = boolean === true ? 'block' : 'none';
    playernameRight.style.display = boolean === true ? 'block' : 'none';
    playernameLeft.style.display = boolean === true ? 'block' : 'none';
}

export function removeAllScores()
{
    let parentElement = document.getElementById('matchHistoryContainer');
    while (parentElement.firstChild)
        parentElement.removeChild(parentElement.firstChild);
}

function getVictoriesText()
{
    return (getPlayerVictories().victories + "/" + getPlayerVictories().total
        + " (" + getPlayerVictories().percentage + "%)");
}

export function loadScores()
{
    if (playerStats.matches.length > 0)
        document.getElementById('victories').innerText = getVictoriesText();
    else
        document.getElementById('victories').innerText = getTranslation('noMatchHistory');

    const scoresContainer = document.getElementById('matchHistoryContainer');
    for (let i = 0; i < playerStats.matches.length; i++)
    {
        let match = playerStats.matches[i];
        const newContainer = document.createElement('div');
        newContainer.classList.add('score-container');
        newContainer.style.color = playerStats.colors;
        const headContent = document.createElement('div');
        headContent.classList.add('score-left');
        headContent.textContent = playerStats.nickname + "\n" + match.scorePlayer;
        newContainer.appendChild(headContent);
        const scoreContent = document.createElement('div');
        scoreContent.classList.add('score-right');
        scoreContent.textContent = match.nameOpponent + "\n" + match.scoreOpponent;
        newContainer.appendChild(scoreContent);
        if (match.scorePlayer > match.scoreOpponent)
            newContainer.style.background = 'linear-gradient(to right, #228822 30%, #006666 70%)';
        else
            newContainer.style.background = 'linear-gradient(to right, #882222 30%, #006666 70%)';
        scoresContainer.appendChild(newContainer);
    }
}