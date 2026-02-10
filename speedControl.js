/*------------------------------------------------------------------------------
QUICK ACCESS PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.createPlaybackSpeedButtons = function () {
    const playerControls = document.querySelector('.ytp-right-controls'); // Adjust this selector based on your player structure
    if (!playerControls) return;

    // Create playback speed buttons
    const speeds = [0.5, 1.0, 1.5, 2.0];
    speeds.forEach(speed => {
        const button = document.createElement('button');
        button.innerText = `${speed}x`;
        button.style.margin = '0 5px'; // Add some margin for spacing
        button.style.cursor = 'pointer';
        button.title = `Set playback speed to ${speed}x`;

        // Add event listener to change playback speed
        button.addEventListener('click', () => {
            const newSpeed = ImprovedTube.playbackSpeed(speed);
            document.getElementById('currentSpeed').innerText = newSpeed || 'Error';
        });

        playerControls.appendChild(button); // Add button to player controls
    });

    // Display current speed
    const currentSpeedDisplay = document.createElement('span');
    currentSpeedDisplay.id = 'currentSpeed';
    currentSpeedDisplay.innerText = '1.0'; // Default speed
    currentSpeedDisplay.style.marginLeft = '10px';
    playerControls.appendChild(currentSpeedDisplay);
};

/* Call this function when the player is ready */
ImprovedTube.init = function () {
    // Other initialization code...
    this.createPlaybackSpeedButtons(); // Create playback speed buttons
};

// Ensure to call ImprovedTube.init() somewhere in your code after the player is ready
