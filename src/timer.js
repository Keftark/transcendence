const display = document.getElementById('timer');
let timerId;
let elapsedTime = 0; // Time in seconds
let isPaused = false;

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
export function startStopwatch()
{
    if (!timerId) { // Check if the timer is already running
        timerId = setInterval(() => {
            if (!isPaused)
            {
                elapsedTime++;
                updateDisplay();
            }
        }, 1000); // Update every second
    }
}

// Function to stop the stopwatch
export function stopStopwatch()
{
    clearInterval(timerId);
    timerId = null; // Reset timerId
}

// Function to reset the stopwatch
export function resetStopwatch()
{
    resumeStopWatch();
    stopStopwatch(); // Stop the timer if it's running
    elapsedTime = 0; // Reset elapsed time
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
    return formatTime(elapsedTime);
}
