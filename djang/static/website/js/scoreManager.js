import { getMatchsFullData } from "./apiFunctions.js";
import { endMatch } from "./levelLocal.js";
import { getLevelState, isAnOnlineMode } from "./main.js";
import { getPlayerVictories, playerStats } from "./playerManager.js";
import { checkPoints } from "./rules.js";
import { formatTime } from "./timer.js";
import { LevelMode } from "./variables.js";

const scores = document.getElementById('scores');
const scoreRight = document.getElementById('score-right');
const scoreLeft = document.getElementById('score-left');
const matchListPanel = document.getElementById('matchListPanel');
let player1Score = 0;
let player2Score = 0;

export class MatchResult
{
    constructor(victoryType, playerScore = 0, opponentScore = 0,  opponentName = "", matchTime = 0) {
        this.victoryType = victoryType;
        this.scorePlayer = playerScore;
        this.scoreOpponent = opponentScore;
        this.nameOpponent = opponentName;
        this.matchTime = matchTime;
    }
}

export function getScoreP1()
{
    return player1Score;
}
export function getScoreP2()
{
    return player2Score;
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
    if (!isAnOnlineMode(getLevelState()))
        checkPoints(player1Score, player2Score);
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
    while (matchListPanel.firstChild)
        matchListPanel.removeChild(matchListPanel.firstChild);
}

function getVictoriesRatioText(player = playerStats)
{
    return (getPlayerVictories(player).victories + "/" + getPlayerVictories(player).total
        + " (" + getPlayerVictories(player).percentage + "%)");
}

function getVictoriesText(player = playerStats)
{
    return (getPlayerVictories(player).victories);
}

function getTotalMatchesText(player = playerStats)
{
    return (getPlayerVictories(player).total);
}

// todo : recuperer aussi la liste des matchs 2v2 et faire une difference entre les deux
// todo : entrer la date du match (jour mois annee, pas plus). voir pour le format selon la langue
export function loadScores(player = playerStats)
{
    getMatchsFullData(player.nickname)
        .then((data) =>{
            document.getElementById('victoriesNbr').innerText = data[0].wins;
            document.getElementById('matchesPlayedNbr').innerText = data[0].match_count;
            for (let i = 1; i < data.length; i++)
            {
                const color = playerStats.colors || "white";
                let match = data[i];
                const newContainer = document.createElement('div');
                newContainer.classList.add('score-container');
                const leftContent = document.createElement('div');
                leftContent.style.color = color;
                leftContent.classList.add('score-left');
                leftContent.textContent = match.player_1 + "\n" + match.player_1_score;
                newContainer.appendChild(leftContent);
                const rightContent = document.createElement('div');
                rightContent.style.color = color;
                rightContent.classList.add('score-right');
                rightContent.textContent = match.player_2 + "\n" + match.player_2_score;
                newContainer.appendChild(rightContent);
                if (match.winner === playerStats.nickname)
                    newContainer.style.background = 'linear-gradient(to right, #228822 30%, #006666 70%)';
                else
                    newContainer.style.background = 'linear-gradient(to right, #882222 30%, #006666 70%)';
                const timerContent = document.createElement('p');
                timerContent.classList.add('score-timer');
                timerContent.style.color = color;
                timerContent.textContent = formatTime(match.timer);
                newContainer.appendChild(timerContent);
                const dateContent = document.createElement('p');
                dateContent.classList.add('score-timer2');
                dateContent.style.color = color;
                const locale = playerStats.language === "en" ? "fr-FR" : "en-GB";
                const date = new Date(match.date);
                const formattedDateStr = new Intl.DateTimeFormat(locale, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  }).format(date);
                dateContent.textContent = formattedDateStr;//.replace('T', ' ').replace('Z', '');;
                newContainer.appendChild(dateContent);
                matchListPanel.appendChild(newContainer);
            }
        })
        .catch((error) => {
            console.error("Failed to match data:", error);
        });

    
}

export function endOfMatch(forcedVictory = false)
{
    endMatch(player1Score, player2Score, forcedVictory);
    player1Score = player2Score = 0;
}