let cameraAnimationActive = true; // Flag to control camera animation
let startTime; // Track the start time of the animation
const animationDuration = 2000; // Duration of the animation in milliseconds

export function resetCamera(time)
{
    startTime = time;
    cameraAnimationActive = true;
}

export function animateCamera(time, camera, callBack)
{
    if (!cameraAnimationActive) return; // Stop animation if the flag is false

    if (!startTime) startTime = time; // Initialize start time

    const elapsed = time - startTime; // Elapsed time
    const t = Math.min(elapsed / animationDuration, 1); // Normalized time

    // Define the zoom curve (e.g., a quadratic curve for smooth zoom)
    const yPos = 50 - (50 * t * t); // Quadratic easing in, adjust as needed

    // Update camera position
    camera.position.y = yPos; 
    camera.lookAt(0, 0, 0);

    // End the animation after the duration
    if (t >= 1)
    {
        cameraAnimationActive = false; // Stop the camera animation
        callBack();
    }
}