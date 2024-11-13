export function startFPSCounter()
{
    let lastTime = performance.now();  // Track the last frame's time
    let frameCount = 0;                // Number of frames rendered
    let fpsInterval = 1000;            // Time between FPS updates (1 second)
  
    function updateFPS()
    {
        const now = performance.now();   // Current time
        const delta = now - lastTime;    // Time since the last frame
    
        frameCount++;                    // Increase the frame count
    
        // If 1 second has passed, update the FPS
        if (delta > fpsInterval)
        {
            const fps = (frameCount / delta) * 1000; // Calculate FPS
            frameCount = 0;                // Reset frame count
            lastTime = now;                // Reset the time
            console.log(`FPS: ${Math.round(fps)}`);  // Print FPS to the console
        }
    
        // Use requestAnimationFrame to keep it going
        requestAnimationFrame(updateFPS);
    }
  
    // Start the FPS counter
    requestAnimationFrame(updateFPS);
  }