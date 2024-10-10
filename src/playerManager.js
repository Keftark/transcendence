import { changeTextsColor } from "./menu";

let playerStats = 
{
    nickname: "",
    firstName: "",
    lastName: "",
    mail: "",
    language: "",
    colors: ""
}

export function playerManager() 
{
    // player profile
    // load profile pic, matches (win/loss), age (profile created 10/12/2024), skins (paddle, ball and background), exp ?
}

export function askCreateNewPlayer()
{
    // on met un formulaire vide et on laisse le joueur remplir ses infos
    /*
        pseudo
        password
        photo
    */
}

export function createNewPlayer()
{
    // on prend les infos du formulaire et on cree un nouveau joueur dans la base de donnees, puis on le sign-in.
    // on vide et ferme le formulaire
}

export function changeProfilePicture(playerId)
{
    // on laisse le joueur choisir une image parmi une selection ou bien on le laisse upload une photo ?
}

export function changePlayerName(playerId)
{
    // on change le nom dans la base de donnees et sur le profil.
}

export function loadPlayerConfig(playerId)
{
    changeLanguage(playerId.language);
    changeTextsColor(playerId.colors);
}