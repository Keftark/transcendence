import { checkTimer } from "./rules.js";

const display = document.getElementById('timer');
let timerId;
let elapsedTime = 0; // Time in seconds
let isPaused = false;
let isReverse = false;
let baseTimer = 0;

export function setTimeFromServer(timeFromServer)
{
    if (elapsedTime !== timeFromServer)
    {
        elapsedTime = timeFromServer;
        updateDisplay();
    }
}

// Function to format time as HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0)
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    else
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Function to update the stopwatch display
function updateDisplay() {
    display.textContent = formatTime(elapsedTime);
}

export function isGamePaused(){return isPaused;}

// Function to start the stopwatch
export function startStopwatch(timer)
{
    if (!timerId) { // Check if the timer is already running
        timerId = setInterval(() => {
            if (!isPaused)
            {
                elapsedTime = timer > 0 ? elapsedTime - 1 : elapsedTime + 1;
                updateDisplay();
                checkTimer(elapsedTime);
            }
        }, 1000); // Update every second
    }
}

// Function to stop the stopwatch
export function stopStopwatch()
{
    isPaused = false;
    clearInterval(timerId);
    timerId = null; // Reset timerId
}

// Function to reset the stopwatch
export function resetStopwatch()
{
    resumeStopWatch();
    stopStopwatch(); // Stop the timer if it's running
    elapsedTime = baseTimer; // Reset elapsed time
    updateDisplay(); // Update display to show 00:00:00
}

export function pauseStopWatch()
{
    isPaused = true;
}

export function resumeStopWatch()
{
    isPaused = false;
}

export function getMatchTime()
{
    if (baseTimer > 0)
        return formatTime(baseTimer - elapsedTime);
    else
        return formatTime(elapsedTime);
}

export function setStopWatch(timer)
{
    if (timer > 0)
    {
        elapsedTime = baseTimer = timer;
        isReverse = true;
    }
    else
    {
        isReverse = false;
        elapsedTime = baseTimer = 0;
    }
    updateDisplay();
}
