import { getPlayerVictories } from "./playerManager";

let translations;

export async function fetchTranslations(lang)
{
	const response = await fetch(`./locales/${lang}.json`);
	if (!response.ok)
		throw new Error('Could not fetch translations');
	return response.json();
}

export function updateHTML(translations)
{
	document.getElementById('pressplay').innerText = translations.pressplay;
	document.getElementById('play').innerText = translations.play;
	document.getElementById('play').setAttribute('data-glitch', translations.play);
	document.getElementById('playername-left').innerText = translations.playernameleft;
	document.getElementById('playername-right').innerText = translations.playernameright;
	document.getElementById('profileButton').innerText = translations.profileButton;
	document.getElementById('settingsButton').innerText = translations.settingsButton;
	document.getElementById('mainProfileButton').innerText = translations.profileButton;
	document.getElementById('mainSettingsButton').innerText = translations.settingsButton;
	document.getElementById('mainButton').innerText = translations.mainButton;
	document.getElementById('settings').innerText = translations.settings;
	document.getElementById('colors').innerText = translations.colors;
	document.getElementById('closeProfileButton').innerText = translations.close;
	document.getElementById('closeSettingsButton').innerText = translations.close;
	document.getElementById('language').innerText = translations.language;
	document.getElementById('mainPlayButton').innerText = translations.mainPlayButton;
	document.getElementById('modeSelectionText').innerText = translations.modeSelectionText;
	document.getElementById('modeLocal').innerText = translations.modeLocal;
	document.getElementById('modeComputer').innerText = translations.modeComputer;
	document.getElementById('mainMenuText').innerText = translations.mainMenuText;
	document.getElementById('backButton').innerText = translations.backText;
	document.getElementById('registerHeader').innerText = translations.registerHeader;
	document.getElementById('registerName').innerText = translations.registerName;
	document.getElementById('inputName').placeholder = translations.inputName;
	document.getElementById('registerFirstName').innerText = translations.registerFirstName;
	document.getElementById('inputFirstName').placeholder = translations.inputFirstName;
	document.getElementById('registerLastName').innerText = translations.registerLastName;
	document.getElementById('inputLastName').placeholder = translations.inputLastName;
	document.getElementById('registerPassword').innerText = translations.registerPassword;
	document.getElementById('inputMail').placeholder = translations.inputMail;
	document.getElementById('registerMail').innerText = translations.registerMail;
	document.getElementById('inputPassword').placeholder = translations.inputPassword;
	document.getElementById('registerConfirmPassword').innerText = translations.registerConfirmPassword;
	document.getElementById('inputConfirmPassword').placeholder = translations.inputConfirmPassword;
	document.getElementById('registerConfirm').innerText = translations.registerConfirm;
	document.getElementById('registerCancel').innerText = translations.registerCancel;
	document.getElementById('buttonSignIn').innerText = translations.buttonSignIn;
	document.getElementById('buttonLogIn').innerText = translations.buttonLogIn;
	document.getElementById('buttonLogOut').innerText = translations.buttonLogOut;
	document.getElementById('seeMatchesButton').innerText = translations.seeMatchesButton;
	document.getElementById('addFriendButton').innerText = translations.addFriendButton;
	document.getElementById('seeProfileButton').innerText = translations.seeProfileButton;
	document.getElementById('inviteGameButton').innerText = translations.inviteGameButton;
	document.getElementById('player1Name').innerText = translations.player1Name;
	document.getElementById('player2Name').innerText = translations.player2Name;
	document.getElementById('waitingForPlayer').innerText = translations.waitingForPlayer;
	document.getElementById('startDuelButton').innerText = translations.startDuelButton;
	document.getElementById('leaveDuelButton').innerText = translations.leaveDuelButton;
	document.getElementById('loading').innerText = translations.loading;
}

export async function changeLanguage(lang)
{
	try
	{
		translations = await fetchTranslations(lang);
		updateHTML(translations);
  	}
	catch (error)
	{
		console.error('Error changing language:', error);
  	}
}

export async function initTranslation()
{
	await changeLanguage('en');
}

export function getTranslation(key)
{
	return translations[key] !== undefined ? translations[key] : `Translation not found for key: ${key}`;
}