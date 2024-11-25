import { getLevelState } from "./main.js";
import { LevelMode } from "./variables.js";

let cameraAnimationActive = true; // Flag to control camera animation
let startTime; // Track the start time of the animation
const animationDuration = 2000; // Duration of the animation in milliseconds

export function resetCamera(time)
{
    startTime = time;
    cameraAnimationActive = true;
}

export function getCameraActiveState()
{
    return cameraAnimationActive;
}

export function animateCamera(time, camera, callBack)
{
    if (!cameraAnimationActive) return; // Stop animation if the flag is false

    if (!startTime) startTime = time; // Initialize start time

    const elapsed = time - startTime; // Elapsed time
    const t = Math.min(elapsed / animationDuration, 1); // Normalized time

    if (getLevelState() === LevelMode.ADVENTURE)
    {
        const xPos = 65 - (30 * t * t);
        const zPos = 100 - (40 * t * t);
    
        camera.position.x = -xPos;
        camera.position.z = zPos;
        camera.lookAt(0, 0, 0);
        camera.rotation.x = 0;
        camera.rotation.z = -(Math.PI / 2);
        camera.rotation.y = -(Math.PI / 6);
    }
    else
    {
        const yPos = 50 - (50 * t * t);
    
        // Update camera position
        camera.position.y = -yPos;
        camera.lookAt(0, 0, 0);
    }

    // End the animation after the duration
    if (t >= 1)
    {
        cameraAnimationActive = false; // Stop the camera animation
        callBack();
    }
}