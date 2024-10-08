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
	document.getElementById('profile').innerText = translations.profile;
	document.getElementById('name').innerText = translations.name;
	document.getElementById('email').innerText = translations.email;
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