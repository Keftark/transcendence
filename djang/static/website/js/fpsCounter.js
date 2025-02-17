const fpsCounterDiv = document.getElementById("fpsCounter");

let fpsRequestId = null;
let isRunning = false;

export function startFPSCounter() {
    if (isRunning) return;
    fpsCounterDiv.style.display = 'flex';
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsInterval = 1000;

    function updateFPS() {
        const now = performance.now();
        const delta = now - lastTime;
        frameCount++;
        if (delta > fpsInterval) {
            const fps = (frameCount / delta) * 1000;
            frameCount = 0;
            lastTime = now;
            fpsCounterDiv.innerText = `FPS: ${Math.round(fps)}`;
        }
        fpsRequestId = requestAnimationFrame(updateFPS);
    }

    isRunning = true;
    fpsRequestId = requestAnimationFrame(updateFPS);
}

export function stopFPSCounter() {
    if (!isRunning) return;
    fpsCounterDiv.style.display = 'none';
    cancelAnimationFrame(fpsRequestId);
    isRunning = false;
}
