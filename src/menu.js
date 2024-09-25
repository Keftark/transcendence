
export function openMenu()
{
    const panel = document.getElementById('menuPanel');
    
    if (panel.classList.contains('show') === false) {
        panel.style.display = 'block'; // Show the panel first
        setTimeout(() => {
            panel.classList.add('show'); // Add the show class to fade in
        });
    }
}

export function closeMenu()
{
    const panel = document.getElementById('menuPanel');
    
    if (panel.classList.contains('show')) {
        panel.classList.remove('show'); // Remove the show class to fade out
        setTimeout(() => {
            panel.style.display = 'none'; // Hide the panel after fading out
        });
    }
}

export function openProfile()
{
    const profilePanel = document.getElementById('profilePanel');
    const overlay = document.getElementById('overlay');
    
    overlay.style.display = 'block'; // Show the overlay first
    profilePanel.style.display = 'block'; // Show the profile panel

    // Small delay for fade-in effect
    setTimeout(() => {
        overlay.classList.add('show'); // Fade in the overlay
        profilePanel.classList.add('show'); // Fade in the profile panel
    }, 10);
}

export function closeProfile()
{
    const profilePanel = document.getElementById('profilePanel');
    const overlay = document.getElementById('overlay');

    // Fade out the overlay and profile panel
    overlay.classList.remove('show');
    profilePanel.classList.remove('show');

    // Wait for the transition to finish, then hide them
    setTimeout(() => {
        overlay.style.display = 'none';
        profilePanel.style.display = 'none';
    }, 150); // Match the transition duration
}

export function openSettings()
{
    const settingsPanel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('overlay');
    
    overlay.style.display = 'block'; // Show the overlay first
    settingsPanel.style.display = 'block'; // Show the profile panel

    // Small delay for fade-in effect
    setTimeout(() => {
        overlay.classList.add('show'); // Fade in the overlay
        settingsPanel.classList.add('show'); // Fade in the profile panel
    }, 10);
}

export function closeSettings()
{
    const settingsPanel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('overlay');

    // Fade out the overlay and profile panel
    overlay.classList.remove('show');
    settingsPanel.classList.remove('show');

    // Wait for the transition to finish, then hide them
    setTimeout(() => {
        overlay.style.display = 'none';
        settingsPanel.style.display = 'none';
    }, 150); // Match the transition duration
}

export function mainMenu()
{
    
}