import { getCSRFToken, getMatchsLittleData, getUserAvatar, getUserByName } from './apiFunctions.js';
import { clickChoosePaddleButton } from './customizeSkins.js';
import { addMainEvents } from './eventsListener.js';
import { isInGame, reinitLevelFunction, setCameraType, StartLevel } from './levelLocal.js';
import { setLevelState } from './main.js';
import { clickBackButtonMenu, showModeChoice } from './modesSelection.js';
import { getCurrentView, navigateTo } from './pages.js';
import { playerStats } from './playerManager.js';
import { loadScores, removeAllScores } from './scoreManager.js';
import { exitGameSocket } from './sockets.js';
import { setCancelledInMatch } from './tournament.js';
import { changeLanguage, getTranslation } from './translate.js';
import { LevelMode, PlayerStatus } from './variables.js';

const overlayPanel = document.getElementById('overlay');
const profilePanel = document.getElementById('profilePanel');
const settingsPanel = document.getElementById('settingsPanel');
const matchListPanel = document.getElementById('matchListPanel');
const mainPlayButton = document.getElementById('mainPlayButton');
const mainProfileButton = document.getElementById('mainProfileButton');
const mainSettingsButton = document.getElementById('mainSettingsButton');
const mainCustomizeButton = document.getElementById('mainCustomizeButton');
const mainPlayDiv = document.getElementById('mainPlayDiv');
const mainProfileDiv = document.getElementById('mainProfileDiv');
const mainCustomizeDiv = document.getElementById('mainCustomizeDiv');
const mainSettingsDiv = document.getElementById('mainSettingsDiv');
const menuPanel = document.getElementById('gameMenuPanel');
const hoverImage = document.getElementById('homeImg');
const buttonsColors = document.querySelectorAll('.colorize-btn');
const logInButtons = document.getElementById('loginbuttons');
const logOutButtons = document.getElementById('logoutbuttons');
const mainPanel = document.getElementById('mainPanel');
const mainMenuPanel = document.getElementById('mainMenuPanel');
const toggleCameraText = document.getElementById('cameraTypeHeader');
const gameSettingsButton = document.getElementById('settingsButton');
const profilePicture = document.getElementById('profilePicture');
// const fileInput = document.getElementById('fileInput');
const profileButton = document.getElementById('buttonProfile');
const miniNicknameText = document.getElementById('nameMiniProfile');
const miniProfilePicture = document.getElementById('miniProfilePicture');
const firstNameMiniProfile = document.getElementById('firstNameMiniProfile');
const lastNameMiniProfile = document.getElementById('lastNameMiniProfile');
const miniProfilePanel = document.getElementById('miniProfilePanel');
const matchsPlayedMiniProfile = document.getElementById('matchsPlayedMiniProfile');
const winsMiniProfile = document.getElementById('winsMiniProfile');
const matchsPlayedMiniProfileValue = document.getElementById('matchsPlayedMiniProfileValue');
const winsMiniProfileValue = document.getElementById('winsMiniProfileValue');
const closeMiniProfileButton = document.getElementById('closeMiniProfileButton');
const profileStats = document.getElementById('profileStats');
const headerMainProfileButton = document.getElementById('headerMainProfileButton');
const headerMatchsProfileButton = document.getElementById('headerMatchsProfileButton');
const profileInfos = document.getElementById('profileInfos');

const buttonsLanguage = document.querySelectorAll('.language');
const imageSources = {
  mainPlayButton: 'static/images/playImage.webp',
  mainProfileButton: 'static/images/profileImage.webp',
  mainCustomizeButton: 'static/images/customizeImage.webp',
  mainSettingsButton: 'static/images/settingsImage.webp',
};
let currentColorIndex = 0;
let currentLangIndex = 0;
let currentCameraType = 0;
let settingsIsOpen = false;
let profileIsOpen = false;
let oldButton = mainPlayButton;
export let isMenuOpen = false;

document.getElementById('header-title').addEventListener('click', () => {
    navigateTo('home');
});

mainPlayButton.addEventListener('click', () => {
    clickPlay();
});

gameSettingsButton.addEventListener('click', () => {
    gameSettingsButton.blur();
    openSettings();
});

menuPanel.addEventListener('mouseenter', () => {
    openGameMenu();
});

menuPanel.addEventListener('mouseleave', () => {
    closeGameMenu();
});

document.getElementById('profileButton').addEventListener('click', () => {
    openProfile();
});

mainProfileButton.addEventListener('click', () => {
    openProfile();
});

mainCustomizeButton.addEventListener('click', () => {
    clickChoosePaddleButton();
});

document.getElementById('closeProfileButton').addEventListener('click', () => {
    closeProfile();
});

document.getElementById('reinitLevelButton').addEventListener('click', () => {
    document.activeElement.blur();
    reinitLevelFunction();
});

mainSettingsButton.addEventListener('click', () => {
    openSettings();
});

document.getElementById('closeSettingsButton').addEventListener('click', () => {
    closeSettings();
});

document.getElementById('mainButton').addEventListener('click', () => {
    exitGameSocket();
    setCancelledInMatch(true);
    clickBackButtonMenu();
});

document.getElementById('perspectiveButton').addEventListener('click', () => {
    playerStats.cameraOrthographic = false;
    toggleCameraType(0);
});

document.getElementById('orthographicButton').addEventListener('click', () => {
    playerStats.cameraOrthographic = true;
    toggleCameraType(1);
});

profileButton.addEventListener('click', () => {
    openMiniProfile(playerStats.nickname);
});

closeMiniProfileButton.addEventListener('click', () => {
    closeMiniProfile();
});

headerMainProfileButton.addEventListener('click', () => {
    openProfileMainStats();
});

headerMatchsProfileButton.addEventListener('click', () => {
    openProfileMatchStats();
});

document.querySelectorAll('.mainMenuButton').forEach(button => {
  button.addEventListener('mouseover', () => showImage(button.id));
  button.addEventListener('mouseout', hideImage);
  button.addEventListener('focus', () => showImage(button.id));
  button.addEventListener('blur', hideImage);
});

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting the traditional way
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0]; // Get the selected file
    
    if (file) {
        const formData = new FormData();
        formData.append('image', file); // Append file to form data
        // Send file to the server using Fetch API
        fetch('/upload/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken()
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('status').textContent = 'Upload successful!';
            } else {
                document.getElementById('status').textContent = 'Upload failed!';
            }
        })
        .catch(error => {
            document.getElementById('status').textContent = 'Error during upload!';
            console.error('Error:', error);
        });
    } else {
        document.getElementById('status').textContent = 'Please select a file to upload.';
    }
});

// document.getElementById('fileInput').addEventListener('change', function(event)
// {

//     if (event.target.files.length > 0)
//     {
//         const file = event.target.files[0]; // Get the first file
//         console.log(file);
//         if (file) {
//             const imageUrl = URL.createObjectURL(file); // Create a URL for preview
//             console.log("File name: " + file.name);
//             console.log("File path: " + imageUrl);
//             const reader = new FileReader();
    
//             // When the file is successfully read
//             reader.onload = function() {
//                 uploadAvatar(playerStats.nickname, file);
//             };
//             reader.readAsDataURL(file);
//         }

//     }
//     else
//     {
//         console.log("No file selected.");
//     }
// });

// document.getElementById('fileInput').addEventListener('change', function(event) {
//     const file = event.target.files[0];
//     if (file) {
//         console.log("Selected file:", file);

//         // Example: Display the selected image (optional)
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const img = document.createElement('img');
//             img.src = e.target.result;
//             img.style.maxWidth = "200px";
//             img.style.border = "1px solid #ccc";
//             document.body.appendChild(img);
//         };
//         reader.readAsDataURL(file);
//     }
// });

document.getElementById('perspectiveButton').classList.add('applyBorderOptions');
document.getElementById('lang1Button').classList.add('applyBorderOptions');
document.getElementById('color1Button').classList.add('applyBorderOptions');

export function openGameMenu()
{
    setTimeout(() => {
        isMenuOpen = true;
        menuPanel.classList.add('show');
    });
}

export function closeGameMenu()
{
    isMenuOpen = false;
    menuPanel.classList.remove('show');
}

export function openOrCloseGameMenu()
{
    menuPanel.classList.toggle('show');
    isMenuOpen = !isMenuOpen;
    if (menuPanel.classList.contains('show'))
    {
        if (playerStats.isRegistered)
            document.getElementById('profileButton').focus();
        else
            gameSettingsButton.focus();
    }
    else
        document.activeElement.blur();
}

export function openMiniProfile(playerName)
{
    getUserByName(playerName)
    .then((target) =>{
        miniNicknameText.textContent = target.username;
        firstNameMiniProfile.textContent = target.first_name;
        lastNameMiniProfile.textContent = target.last_name;
    })
    .catch((error) => {
        console.error("Failed to get user by name:", error);
    });
    getUserAvatar(playerName)
        .then((target) => {
            miniProfilePicture.src = target.avatar_url;
        })
        .catch((error) => {
            console.error("Failed to get user by name:", error);
    });

    getMatchsLittleData(playerName)
    .then((data) =>{
        matchsPlayedMiniProfileValue.innerHTML = data.match_count;
        winsMiniProfileValue.innerHTML = data.wins;
    })
    .catch((error) => {
        console.error("Failed to get user by name:", error);
    });
    // getUserScores(playerName)
    //     .then((target) => {
    //         miniProfilePicture.src = target.avatar;
    //     })
    //     .catch((error) => {
    //         console.error("Failed to get user by name:", error);
    // });

    // ca va dans la requete des scores.
    // matchsPlayedMiniProfileValue.innerHTML = "2";
    // winsMiniProfileValue.innerHTML = "1";

    
    miniProfilePanel.style.display = 'flex';
    setTimeout(() => {
        miniProfilePanel.classList.add('appear');
    }, 100);
}

function closeMiniProfile()
{
    miniProfilePanel.classList.remove('appear');
    setTimeout(() => {
        miniProfilePanel.style.display = 'none';
    }, 100);
}

function openProfileMainStats()
{
    headerMainProfileButton.classList.add('light');
    headerMatchsProfileButton.classList.remove('light');
    profileInfos.style.display = 'flex';
    profileStats.style.display = 'none';
}

function openProfileMatchStats()
{
    headerMatchsProfileButton.classList.add('light');
    headerMainProfileButton.classList.remove('light');
    profileStats.style.display = 'flex';
    profileInfos.style.display = 'none';
}
export function openProfile(player = playerStats)
{
    if (player.isRegistered === false)
        return;
    openProfileMainStats();
    profileIsOpen = true;
    getUserAvatar(player.nickname)
        .then((target) => {
            console.log(target);
            profilePicture.src = target.avatar_url;
        })
        .catch((error) => {
            console.error("Failed to get user by name:", error);
        });
    loadScores(player);
    document.getElementById('nameProfile').innerText = player.nickname;
    document.getElementById('firstNameProfile').innerText = player.firstName;
    document.getElementById('lastNameProfile').innerText = player.lastName;
    document.getElementById('mailProfile').innerText = player.mail;
    overlayPanel.style.display = 'block';
    profilePanel.style.display = 'flex';
    setTimeout(() => {
        profilePanel.classList.add('appear');
    }, 100);
    if (getCurrentView() === 'home')
        oldButton = mainProfileButton;
    document.getElementById('closeProfileButton').focus();
}

function showMatchListProfile()
{
    if (profilePanel.classList.contains('toLeft') === false)
    {
        matchListPanel.style.display = 'flex';
        setTimeout(() => {
            profilePanel.classList.add('toLeft');
            matchListPanel.classList.add('toRight');
        }, 10);
    }
    else
    {
        closeMatchListProfile();
    }
}

function closeMatchListProfile()
{
    profilePanel.classList.remove('toLeft');
    matchListPanel.classList.remove('toRight');
    setTimeout(() => {
        matchListPanel.style.display = 'none';
    }, 100);
}

export function closeProfile()
{
    profileIsOpen = false;
    profilePanel.style.display = 'none';
    setTimeout(() => {
        removeAllScores();
        focusOldButton();
        overlayPanel.style.display = 'none';
    }, 100);
}

export function openSettings()
{
    settingsIsOpen = true;
    overlayPanel.style.display = 'block';
    settingsPanel.style.display = 'flex';
    setTimeout(() => {
        settingsPanel.classList.add('appear');
    }, 100);
    if (getCurrentView() === 'home')
        oldButton = mainSettingsButton;
    document.getElementById('closeSettingsButton').focus();
}

export function closeSettings()
{
    settingsIsOpen = false;
    settingsPanel.classList.remove('appear');
    setTimeout(() => {
        settingsPanel.style.display = 'none';
        focusOldButton();
        overlayPanel.style.display = 'none';
    }, 100);
}

function changeOutlineColors(newIndex)
{
    if (currentColorIndex === newIndex)
        return;
    if (currentColorIndex != -1)
        buttonsColors[currentColorIndex].classList.remove('applyBorderOptions');
    currentColorIndex = newIndex;
    buttonsColors[currentColorIndex].classList.add('applyBorderOptions');
}

export function setButtonsColors()
{
    buttonsColors.forEach(button => {
        const color = button.getAttribute('data-color');
        button.style.backgroundColor = color;
        button.addEventListener('click', function() {
            changeOutlineColors(parseInt(this.getAttribute('data-index'), 10));
            changeTextsColor(this.getAttribute('data-color'));
        });
    });
}

export function changeTextsColor(newColor)
{
    const textElements = document.querySelectorAll(' \
        h1, h2, div, h3, p, button, #header-title, #menu-label span, #pressplay, #play, #score-left, #score-right, .score-timer, #playername-left, \
        #playername-right, #inputChat, input, label, #spectateList, .headerProfileButton');
    textElements.forEach(element => {
        element.style.color = newColor;
    });
    playerStats.colors = newColor;
}

function changeOutlineLanguage(newIndex)
{
    if (currentLangIndex === newIndex)
        return;
    if (currentLangIndex != -1)
        buttonsLanguage[currentLangIndex].classList.remove('applyBorderOptions');
    currentLangIndex = newIndex;
    buttonsLanguage[currentLangIndex].classList.add('applyBorderOptions');
}

export function setLanguageButtons()
{
    buttonsLanguage.forEach(button => {
        button.addEventListener('click', function() {
            changeOutlineLanguage(parseInt(this.getAttribute('data-lang'), 10));
            changeLanguage(this.getAttribute('data-language'));
        });
    });
}

function showMainMenu()
{
    setLevelState(LevelMode.MENU);
    mainPanel.style.display = 'flex';
    mainMenuPanel.style.display = 'flex';
    focusOldButton();
    if (playerStats.isRegistered)
        logOutButtons.style.display = 'flex';
    else
        logInButtons.style.display = 'flex';
}

function hideMainMenu()
{
    mainMenuPanel.style.display = 'none';
    logInButtons.style.display = 'none';
    logOutButtons.style.display = 'none';
}

function hideMainPanel()
{
    mainPanel.style.display = 'none';
}

export function clickPlay()
{
    hideMainPanel();
    showModeChoice();
}

export function onPlayGame(mode)
{
    hideMainMenu();
    StartLevel(mode);
}

export function setHeaderVisibility(isVisible)
{
    if (isVisible === true)
    {
        document.getElementById('mainBackground').style.display = 'block';
        document.getElementById('header-title').style.display = 'block';
    }
    else
    {
        document.getElementById('mainBackground').style.display = 'none';
        document.getElementById('header-title').style.display = 'none';
    }
}

export function toggleCameraType(cameraType)
{
    if (cameraType === currentCameraType)
        return;
    if (playerStats.cameraOrthographic)
    {
        currentCameraType = 1;
        document.getElementById('perspectiveButton').classList.remove('applyBorderOptions');
        document.getElementById('orthographicButton').classList.add('applyBorderOptions');
        toggleCameraText.innerText = getTranslation('cameraTypeHeader') + getTranslation('orthographic');
    }
    else
    {
        currentCameraType = 0;
        document.getElementById('perspectiveButton').classList.add('applyBorderOptions');
        document.getElementById('orthographicButton').classList.remove('applyBorderOptions');
        toggleCameraText.innerText = getTranslation('cameraTypeHeader') + getTranslation('perspective');
    }
    if (isInGame === true)
        setCameraType();
}

function showImage(buttonId) {
  hoverImage.src = imageSources[buttonId];
  hoverImage.style.opacity = 0.2;
}

function hideImage() {
    hoverImage.style.opacity = 0;
}

export function focusOldButton()
{
    setTimeout(() => {
        if (oldButton != null)
        {
            oldButton.focus();
            oldButton = null;
        }
    }, 0);
}

function resetAnimMainMenu()
{
    mainPlayDiv.style.opacity = 0;
    mainSettingsDiv.style.opacity = 0;
    mainProfileDiv.style.opacity = 0;
    mainCustomizeDiv.style.opacity = 0;
    mainPlayDiv.classList.remove('fadeMainButton');
    mainSettingsDiv.classList.remove('fadeMainButton');
    mainProfileDiv.classList.remove('fadeMainButton');
    mainCustomizeDiv.classList.remove('fadeMainButton');
    void mainPlayDiv.offsetWidth;
    void mainSettingsDiv.offsetWidth;
    void mainCustomizeDiv.offsetWidth;
    void mainProfileDiv.offsetWidth;
    animMainMenu();
}

function animMainMenu()
{
    mainPlayDiv.classList.add('fadeMainButton');
    setTimeout(() => {
        mainProfileDiv.classList.add('fadeMainButton');
    }, 150);
    setTimeout(() => {
        mainCustomizeDiv.classList.add('fadeMainButton');
    }, 300);
    setTimeout(() => {
        mainSettingsDiv.classList.add('fadeMainButton');
    }, 450);
}

export function onMainMenuOpen()
{
    setHeaderVisibility(true);
    showMainMenu();
    addMainEvents();
    mainPlayButton.focus();
    resetAnimMainMenu();
    playerStats.status = PlayerStatus.ONLINE;
}

export function isSettingsOpen()
{
    return settingsIsOpen;
}

export function isProfileOpen()
{
    return profileIsOpen;
}



// add a way to save the image to the DB and check if the format is ok + no sql injection?
// injec sql -> verifier metadata
// fileInput.addEventListener('change', (event) => {
//     const file = event.target.files[0];
//     if (file)
//     {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//         profilePicture.src = e.target.result;
//         // uploadAvatar(playerStats.nickname, e.target.result);
//         };
//         reader.readAsDataURL(file);
//     }
// });

// document.getElementById('profile-form').addEventListener("submit", function(e) {
//     e.preventDefault();  // Prevent the default form submission
    
//     var formData = new FormData(this);  // Create a FormData object to hold the file and form data
//     for (var pair of formData.entries()) {
//         console.log("Pairs: " + pair[0]+ ', ' + pair[1]);
//     }
//     fetch('/uploadavatar/', {
//         method: 'POST',
//         headers: {
//             'X-CSRFToken': getCSRFToken()
//         },
//         body: formData
//     })
//     .then(response => response.json())  // Assuming server responds with JSON
//     .then(data => {
//         console.log("Upload successful", data);
//         // Handle successful upload (e.g., update UI, show a success message)
//     })
//     .catch(error => {
//         console.error("Error uploading file", error);
//     });
// });