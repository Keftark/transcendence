import { getDuelInvitContent } from "./chat.js";
import { setPlayerRightName } from "./levelLocal.js";
import { playerStats } from "./playerManager.js";
import { openGdprPanel } from "./registration.js";

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
	document.getElementById('settingsButton').innerText = translations.settings;
	document.getElementById('mainProfileButton').innerText = translations.profileButton;
	document.getElementById('deleteProfileButton').innerText = translations.deleteProfileText;
	document.getElementById('mainSettingsButton').innerText = translations.settings;
	document.getElementById('mainButton').innerText = translations.mainButton;
	document.getElementById('mainCustomizeButton').innerText = translations.mainCustomizeButton;
	document.getElementById('reinitLevelButton').innerText = translations.reinitLevelButton;
	document.getElementById('seeTournamentButton').innerText = translations.tournamentText;
	document.getElementById('settingsHeader').innerText = translations.settings;
	document.getElementById('colors').innerText = translations.colors;
	document.getElementById('closeProfileButton').innerText = translations.close;
	document.getElementById('closeSettingsButton').innerText = translations.close;
	document.getElementById('language').innerText = translations.language;
	document.getElementById('mainPlayButton').innerText = translations.play;
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
	document.getElementById('registerConfirm').innerText = translations.confirm;
	document.getElementById('registerCancel').innerText = translations.cancel;
	document.getElementById('buttonSignUp').innerText = translations.registerHeader;
	document.getElementById('buttonLogIn').innerText = translations.signInHeader;
	document.getElementById('buttonLogOut').innerText = translations.buttonLogOut;
	document.getElementById('addFriendButton').innerText = translations.addFriendButton;
	document.getElementById('sendMessageButton').innerText = translations.sendMessageButton;
	document.getElementById('sendStickerButton').innerText = translations.sendStickerButton;
	document.getElementById('seeProfileButton').innerText = translations.profileButton;
	document.getElementById('inviteGameButton').innerText = translations.headerDuel;
	document.getElementById('player1NameDuel').innerText = translations.player1Name;
	document.getElementById('player2NameDuel').innerText = translations.player2Name;
	document.getElementById('waitingForPlayer').innerText = translations.waitingForPlayer;
	// document.getElementById('startDuelButton').innerText = translations.start;
	document.getElementById('leaveDuelButton').innerText = translations.leaveDuelButton;
	document.getElementById('loading').innerText = translations.loading;
	document.getElementById('rulesPointsText').innerText = translations.rulesPointsText;
	document.getElementById('rulesArenaText').innerText = translations.rulesArenaText;
	document.getElementById('choosePaddleText').innerText = translations.choosePaddleText;
	document.getElementById('rulesTimerText').innerText = translations.rulesTimerText;
	document.getElementById('rulesMaxPlayersText').innerText = translations.rulesMaxPlayersText;
	document.getElementById('buttonAcceptRules').innerText = translations.start;
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
	document.getElementById('signInConfirm').innerText = translations.confirm;
	document.getElementById('signInCancel').innerText = translations.cancel;
	document.getElementById('signInPassword').innerText = translations.registerPassword;
	document.getElementById('signInName').innerText = translations.registerName;
	document.getElementById('signInHeader').innerText = translations.signInHeader;
	document.getElementById('askSignIn').innerText = translations.signInHeader;
	document.getElementById('askRegister').innerText = translations.registerHeader;
	document.getElementById('askSignInText').innerText = translations.askSignInText;
	document.getElementById('askRegisterText').innerText = translations.askRegisterText;
	document.getElementById('startTournamentButton').innerText = translations.start;
	document.getElementById('startMatchTournamentButton').innerText = translations.start;
	document.getElementById('cancelTournamentLobbyButton').innerText = translations.cancel;
	document.getElementById('cancelMatchTournamentButton').innerText = translations.cancel;
	document.getElementById('closeTournamentViewButton').innerText = translations.close;
	document.getElementById('confirmBackTournamentButton').innerText = translations.confirm;
	document.getElementById('cancelBackTournamentButton').innerText = translations.cancel;
	document.getElementById('addPlayerTournament').innerText = translations.addPlayerTournament;
	document.getElementById('tournamentLobbyHeaderText').innerText = translations.tournamentLobbyHeaderText;
	document.getElementById('tournamentAskBackText').innerText = translations.tournamentAskBackText;
	document.getElementById('modesLocalText').innerText = translations.modesLocalHeader;
	document.getElementById('modesOnlineText').innerText = translations.modesOnlineHeader;
	document.getElementById('2v2Text').innerText = translations.coopText;
	document.getElementById('rulesIsPrivateText').innerText = translations.rulesIsPrivateInput;
	document.getElementById('friendsHeader').innerText = translations.friendsHeader;
	document.getElementById('blockUserButton').innerText = translations.blockUserButton;
	document.getElementById('consent-text').innerHTML = translations.consentText;
	document.getElementById('gdprText').innerHTML = translations.gdpr;
	document.getElementById('gdprBack').innerHTML = translations.backText;
	document.getElementById('waitingMatchText').innerHTML = translations.waitingMatchText;
	document.getElementById('helpRulesTitle').innerHTML = translations.helpRulesTitle;
	document.getElementById('helpRulesText').innerHTML = translations.helpRulesText;
	document.getElementById('buttonSpectate').innerHTML = translations.buttonSpectate;
	document.getElementById('buttonProfile').innerHTML = translations.profileButton;
	document.getElementById('closeMiniProfileButton').innerHTML = translations.close;
	document.getElementById('matchsPlayedMiniProfile').innerHTML = translations.gamesPlayed;
	document.getElementById('matchesPlayed').innerText = translations.gamesPlayed;
	document.getElementById('winsMiniProfile').innerHTML = translations.gamesWon;
	document.getElementById('victories').innerText = translations.gamesWon;
	document.getElementById('confirmAddPlayerButton').innerHTML = translations.addPlayerTournament;
	document.getElementById('cancelAddPlayerButton').innerHTML = translations.cancel;
	document.getElementById('closeTournamentVictoryButton').innerHTML = translations.close;
	document.getElementById('headerMainProfileButton').innerText = translations.headerMainProfileButton;
	document.getElementById('headerMatchsProfileButton').innerText = translations.headerMatchsProfileButton;
	document.getElementById('buttonAcceptDelete').innerText = translations.confirm;
	document.getElementById('buttonCancelDelete').innerText = translations.cancel;
	document.getElementById('buttonAcceptChangePassword').innerText = translations.confirm;
	document.getElementById('buttonCancelChangePassword').innerText = translations.cancel;
	document.getElementById('deleteProfileAskText').innerText = translations.deleteProfileAskText;
	document.getElementById('changePasswordProfileAskText').innerText = translations.changePasswordProfileAskText;
	document.getElementById('customButtonChangePicture').innerText = translations.customButtonChangePicture;
	document.getElementById('changePasswordButton').innerText = translations.changePasswordButton;
	document.getElementById('currentPassword').innerText = translations.currentPassword;
	document.getElementById('newPassword').innerText = translations.newPassword;
	document.getElementById('confirmNewPassword').innerText = translations.confirmNewPassword;
	document.getElementById('buttonAcceptChangeField').innerText = translations.confirm;
	document.getElementById('buttonCancelChangeField').innerText = translations.cancel;
	document.getElementById('viewTournamentHistoryButton').innerText = translations.history;
	document.getElementById('closeTournamentHistoryButton').innerText = translations.close;
	
	
    document.querySelector('.gdpr').addEventListener('click', function(event) {
		event.preventDefault();
        openGdprPanel();
    });	
}

function updateChat()
{
	const messages = document.getElementById('messages');
	const childDivs = messages.querySelectorAll("div");
	childDivs.forEach((childDiv) => {
		if (childDiv.classList.contains('textJoinDuel')) // message de demande de duel
			childDiv.innerText = getDuelInvitContent();
		else if (childDiv.classList.contains('message-middle')) // c'est un message d'un joueur
		{
			const otherVar = childDiv.getAttribute("value");
			const otherKey = childDiv.getAttribute("key");
			const forceOtherVar = childDiv.getAttribute("forcedValue");
			const value = forceOtherVar ? otherVar : getTranslation('defaultValue');

			let otherValue = isNaN(otherVar) ? value : String(otherVar);
			if (otherKey != null)
				childDiv.children[0].innerText = getTranslation(otherKey) + otherValue;
		}
	});
}

export async function changeLanguage(lang)
{
	playerStats.language = lang;
	try
	{
		translations = await fetchTranslations(lang);
		updateHTML(translations);
		updateChat();
  	}
	catch (error)
	{
		console.trace('Error changing language:', error);
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