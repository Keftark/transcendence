export class ScreenShake
{
    constructor(camera)
    {
        this.camera = camera;
        this.shakeIntensity = 0.5;  // How strong the shake is
        this.shakeDuration = 0;    // How long the shake will last
        this.shakeEndTime = 0;     // When the shake will end
        this.shakeOffset = { x: 0, y: 0 }; // Current shake offset
    }
  
    // Function to start the screen shake effect
    start(intensity, duration)
    {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeEndTime = performance.now() + duration;
    }
  
    // Update shake effect
    update()
    {
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
            // Reset shake values
            this.shakeIntensity = 0;
            this.shakeDuration = 0;
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
            this.camera.position.x = 0;
            this.camera.position.y = 0;
        }
    }
  }