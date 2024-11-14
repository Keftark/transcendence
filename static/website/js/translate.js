import { getDuelInvitContent } from "./chat.js";
import { setPlayerRightName } from "./levelLocal.js";
import { getPlayerVictories, playerStats } from "./playerManager.js";

let translations;

export async function fetchTranslations(lang)
{
	const response = await fetch(`./static/locales/${lang}.json`);
	if (!response.ok)
		throw new Error('Could not fetch translations');
	return response.json();
}

export function updateHTML(translations)
{
	document.getElementById('pressplay').innerText = translations.pressplay;
	document.getElementById('play').innerText = translations.play;
	document.getElementById('play').setAttribute('data-glitch', translations.play);
	setPlayerRightName();
	document.getElementById('profileButton').innerText = translations.profileButton;
	document.getElementById('settingsButton').innerText = translations.settingsButton;
	document.getElementById('mainProfileButton').innerText = translations.profileButton;
	document.getElementById('mainSettingsButton').innerText = translations.settingsButton;
	document.getElementById('mainButton').innerText = translations.mainButton;
	document.getElementById('reinitLevelButton').innerText = translations.reinitLevelButton;
	document.getElementById('settingsHeader').innerText = translations.settings;
	document.getElementById('colors').innerText = translations.colors;
	document.getElementById('closeProfileButton').innerText = translations.close;
	document.getElementById('closeSettingsButton').innerText = translations.close;
	document.getElementById('language').innerText = translations.language;
	document.getElementById('mainPlayButton').innerText = translations.mainPlayButton;
	document.getElementById('modeSelectionText').innerText = translations.modeSelectionText;
	document.getElementById('1vs1').innerText = translations.oneVsOne;
	document.getElementById('modeComputer').innerText = translations.modeComputer;
	document.getElementById('mainMenuText').innerText = translations.mainMenuText;
	document.getElementById('modeBackButton').innerText = translations.backText;
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
	document.getElementById('registerCancel').innerText = translations.cancel;
	document.getElementById('buttonSignUp').innerText = translations.buttonSignUp;
	document.getElementById('buttonLogIn').innerText = translations.buttonLogIn;
	document.getElementById('buttonLogOut').innerText = translations.buttonLogOut;
	document.getElementById('seeMatchesButton').innerText = translations.seeMatchesButton;
	document.getElementById('addFriendButton').innerText = translations.addFriendButton;
	document.getElementById('seeProfileButton').innerText = translations.seeProfileButton;
	document.getElementById('inviteGameButton').innerText = translations.inviteGameButton;
	document.getElementById('player1NameDuel').innerText = translations.player1Name;
	document.getElementById('player2NameDuel').innerText = translations.player2Name;
	document.getElementById('waitingForPlayer').innerText = translations.waitingForPlayer;
	document.getElementById('startDuelButton').innerText = translations.startDuelButton;
	document.getElementById('leaveDuelButton').innerText = translations.leaveDuelButton;
	document.getElementById('loading').innerText = translations.loading;
	document.getElementById('rulesPointsText').innerText = translations.rulesPointsText;
	document.getElementById('rulesArenaText').innerText = translations.rulesArenaText;
	document.getElementById('rulesTimerText').innerText = translations.rulesTimerText;
	document.getElementById('buttonAcceptRules').innerText = translations.buttonAcceptRules;
	document.getElementById('cameraTypeHeader').innerText = playerStats.cameraOrthographic ? translations.cameraTypeHeader + translations.orthographic : translations.cameraTypeHeader + translations.perspective;
	document.getElementById('closeVictoryButton').innerText = translations.mainButton;
	document.getElementById('buttonCancelRules').innerText = translations.cancel;
	document.getElementById('rulesHeaderText').innerText = translations.rulesHeaderText;
	document.getElementById('modesLocalHeader').innerText = translations.modesLocalHeader;
	document.getElementById('modesOnlineHeader').innerText = translations.modesOnlineHeader;
	document.getElementById('modeDuelText').innerText = translations.headerDuel;
	document.getElementById('tournamentText').innerText = translations.tournamentText;
	document.getElementById('pressBoostTextLeft').innerText = translations.pressBoostTextLeft;
	document.getElementById('pressBoostTextRight').innerText = translations.pressBoostTextRight;
	document.getElementById('ready1DuelButton').innerText = translations.ready;
	document.getElementById('ready2DuelButton').innerText = translations.ready;
	document.getElementById('duelHeaderText').innerText = translations.headerDuel;
	document.getElementById('connectToChat').innerText = translations.connectToChat;
	document.getElementById('signInConfirm').innerText = translations.registerConfirm;
	document.getElementById('signInCancel').innerText = translations.cancel;
	document.getElementById('signInPassword').innerText = translations.registerPassword;
	document.getElementById('signInName').innerText = translations.registerName;
	document.getElementById('signInHeader').innerText = translations.signInHeader;
	document.getElementById('askSignIn').innerText = translations.askSignIn;
	document.getElementById('askRegister').innerText = translations.askRegister;
	document.getElementById('askSignInText').innerText = translations.askSignInText;
	document.getElementById('askRegisterText').innerText = translations.askRegisterText;
	
	
}

function updateChat(translations)
{
	const messages = document.getElementById('messages');
	const childDivs = messages.querySelectorAll("div");
	childDivs.forEach((childDiv) => {
		if (childDiv.classList.contains('textJoinDuel')) // message de demande de duel
			childDiv.textContent = getDuelInvitContent();
		else if (childDiv.classList.contains('message-middle')) // c'est un message d'un joueur
		{
			let otherVar = childDiv.getAttribute("value");
			let otherKey = childDiv.getAttribute("key");
			let otherValue = isNaN(otherVar) ? 'its default value' : String(otherVar);
			childDiv.textContent = getTranslation(otherKey) + otherValue;
		}
	});
}

export async function changeLanguage(lang)
{
	try
	{
		translations = await fetchTranslations(lang);
		updateHTML(translations);
		updateChat(translations);
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