
export function openMenu()
{
    const panel = document.getElementById('menuPanel');
    
    if (panel.classList.contains('show') === false) {
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

    overlay.classList.remove('show');
    settingsPanel.classList.remove('show');

    setTimeout(() => {
        overlay.style.display = 'none';
        settingsPanel.style.display = 'none';
    }, 150);
}

export function setNewColor()
{
    const buttons = document.querySelectorAll('.colorize-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedColor = this.getAttribute('data-color');
            const textElements = document.querySelectorAll(' \
                h1, h2, p, #top-text, #menu-label span, #pressplay, #play, #score-left, #score-right, #playername-left, \
                #playername-right, #closeProfileButton, #closeSettingsButton, .menuButton');
            textElements.forEach(element => {
                element.style.color = selectedColor;
            });
        });
    });
}

export function mainMenu()
{
    
}