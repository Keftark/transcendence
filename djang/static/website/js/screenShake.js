
function resetCameraShake(screenShake)
{
    screenShake.camera.position.set(screenShake.basePositionX, screenShake.basePositionY, screenShake.basePositionZ);
    screenShake.shakeIntensity = 0;
    screenShake.shakeDuration = 0;
    screenShake.shakeOffset.x = 0;
    screenShake.shakeOffset.y = 0;
    screenShake.basePositionX = 0;
    screenShake.basePositionY = 0;
    screenShake.basePositionZ = 0;
    screenShake.started = false;
}

export class ScreenShake
{
    constructor(camera)
    {
        this.camera = camera;
        this.shakeIntensity = 0.5;  // How strong the shake is
        this.shakeDuration = 0;    // How long the shake will last
        this.shakeEndTime = 0;     // When the shake will end
        this.shakeOffset = { x: 0, y: 0 }; // Current shake offset
        this.started = false;
        this.basePositionX;
        this.basePositionY;
        this.basePositionZ;
    }
  
    // Function to start the screen shake effect
    start(intensity, duration)
    {
        this.basePositionX = this.camera.position.x;
        this.basePositionY = this.camera.position.y;
        this.basePositionZ = this.camera.position.z;
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeEndTime = performance.now() + duration;
        this.started = true;
    }
  
    // Update shake effect
    update()
    {
        if (this.started === false)
            return;
        const now = performance.now();
        if (now < this.shakeEndTime)
        {
            // Apply random offset
            this.shakeOffset.x = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeOffset.y = (Math.random() - 0.5) * this.shakeIntensity * 2;
    
            // Apply offset to the camera
            this.camera.position.x += this.shakeOffset.x;
            this.camera.position.y += this.shakeOffset.y;
        }
        else
        {
            resetCameraShake(this);
        }
    }
  }