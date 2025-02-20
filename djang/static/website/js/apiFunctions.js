import { callGameDialog, sendSystemMessage } from "./chat.js";
import { closeProfile } from "./menu.js";
import { editPlayerStats, playerStats } from "./playerManager.js";
import { clickLogOut } from "./registration.js";
import { clickCancelSignIn, invalidCredentials } from "./signIn.js";
import { EmotionType } from "./variables.js";

export function getCSRFToken()
{
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        if (cookie.trim().startsWith('csrftoken='))
            return cookie.trim().split('=')[1];
    }
    return '';
}

export async function logInPlayer(username, password)
{
    const data = new FormData();
    data.append('username', username);
    data.append('password', password);
    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: data,
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok) {
            if (response.status === 400 || response.status === 500)
            {
                invalidCredentials();
                return;
            }
            const errorResult = await response.json();
            console.error('Login failed:', errorResult.message);
        } else {
            const result = await response.json();
            editPlayerStats(result.user);
            clickCancelSignIn(true);
        }

    } catch (error) {
        console.error('Error during login:', error);
    }
}

export async function registerUser(nameValue, firstNameValue, lastNameValue, emailValue, passwordValue) {
    const data = {
        name: nameValue,
        first_name: firstNameValue,
        last_name: lastNameValue,
        email: emailValue,
        password: passwordValue,
        status: "online"
    };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, errors: errorData.errors || ["Unknown error"] };
        }
        const responseData = await response.json();
        if (responseData.success) {
            return { success: true, message: responseData.message };
        }
        return { success: false, errors: responseData.errors || ["Unknown error"] };
    } catch (error) {
        console.error("Error registering user:", error);
        return { success: false, errors: [error.message || "Unknown error"] };  // Ensure we always return an error object
    }
}


export async function logoutUser()
{
    const csrfToken = getCSRFToken();
    if (!csrfToken) {
        console.error('CSRF token not found');
        return;
    }
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        });
        if (!response.ok)
            throw new Error('Failed to log out');
        const data = await response.json();

        if (data.success)
            console.log(data.message);
        else
            console.error(data.error);
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function getLoggedInUser() {
    try {
        const response = await fetch('/current_user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(), // Include CSRF token if needed
            },
            credentials: 'same-origin', // Include session cookie
        });
        if (response.ok) {
            const userData = await response.json();
            // console.trace('Logged-in user:', userData);
            return userData;
        } else if (response.status === 403) {
            // console.log('User is not logged in.');
            return null;
        } else {
            console.error('Error retrieving user:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching logged-in user:', error);
        return null;
    }
}

export async function getUserById(userId) {
    if (!userId) {
        console.error("User ID is required.");
        return;
    }
    try {
        const response = await fetch(`/user/${userId}/`);
        if (!response.ok)
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            console.error(userData.error);
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

export async function getUserName(userId) {
    if (!userId) {
        console.error("User ID is required.");
        return;
    }
    try {
        const response = await fetch(`/username/${userId}/`);
        if (!response.ok)
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            console.error(userData.error);
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

export async function getUserAvatar(userName) {
    if (!userName) {
        console.error("User name is required.");
        return;
    }
    try {
        const response = await fetch(`/useravatar/${userName}/`);
        if (!response.ok)
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            console.error(userData.error);
        // console.log("user data: " + JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

export async function getUserAvatarById(id) {
    if (!id) {
        console.error("User name is required.");
        return;
    }
    try {
        const response = await fetch(`/useravatarid/${id}/`);
        if (!response.ok)
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            console.error(userData.error);
        // console.log("user data: " + JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

// export async function uploadAvatar(username, url_picture)
// {
//     const data = new FormData();
//     data.append('username', username);
//     data.append('url', url_picture); //<----- Le probleme vient de la
//     console.log(data);
//     try {
//         const response = await fetch(`/uploadavatar/`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': getCSRFToken() // Ensure CSRF protection
//             },
//             body: data
//         });
//         // Check if the response is OK (status 200-299)
//         if (!response.ok) {
//             const errorResult = await response.json();  // Parse the error message in JSON
//             alert(errorResult.message);  // Display the error message to the user
//         } else {
//             // const result = await response.json();  // Parse the success response in JSON
//             // console.log(result);
//         }

//     } catch (error) {
//         console.log("Aye aye aye")
//         console.error('Error during upload:', error);
//     }
// }

export async function getUserScores(userName) {
    if (!userName) {
        console.error("User name is required.");
        return;
    }
    try {
        const response = await fetch(`/user_scores/${userName}/`);
        if (!response.ok)
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            console.error(userData.error);
        // console.log("user data: " + JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

export async function getUserByName(userName) {
    if (!userName) {
        console.error("User name is required.");
        return;
    }

    try {
        const response = await fetch(`/get-user/${userName}/`);
        if (!response.ok)
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            throw new Error(userData.error);
        return userData;
    } catch (error) {
        throw new Error("An error occurred while fetching the user details:", error);
    }
}

export async function getUserPaddleSkin(userId) {
    if (!userId) {
        console.error("User id is required.");
        return;
    }
    try {
        const response = await fetch(`/user_paddle/${userId}/`);
        if (!response.ok)
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            console.error(userData.error);
        // console.log("Paddle data: " + JSON.stringify(userData));
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

export async function setUserPaddleSkin(userId, newPaddleSkin) {
    if (!userId || !newPaddleSkin) {
        console.error("User id and new paddle skin are required.");
        return;
    }
    try {
        const response = await fetch(`/user_paddle/${userId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                preferredPaddle: newPaddleSkin
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update paddle skin: ${response.status} ${response.statusText}`);
        }

        const updatedUserData = await response.json();

        if (updatedUserData.error) {
            console.error(updatedUserData.error);
        } else {
            return updatedUserData;
        }
    } catch (error) {
        console.error("An error occurred while updating the paddle skin:", error);
    }
}

export async function getUserStatus(username) {
    if (!username) {
        console.error("Username is required.");
        return;
    }
    try {
        const response = await fetch(`/user_status/${username}/`);
        if (!response.ok)
            throw new Error(`Failed to fetch user status: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            console.error(userData.error);
        return userData;
    } catch (error) {
        // console.error("An error occurred while fetching the user details:", error);
        return { success: false, errors: [error.message || "Unknown error"] };
    }
}

export async function setUserStatus(newStatus) {
    if (!playerStats.isRegistered)
        return;
    if (!newStatus) {
        console.error("Username and status are required.");
        return;
    }
    try {
        const response = await fetch(`/user_status/${playerStats.nickname}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                status: newStatus
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update status: ${response.status} ${response.statusText}`);
        }

        const updatedUserData = await response.json();

        if (updatedUserData.error) {
            console.error(updatedUserData.error);
        } else {
            return updatedUserData;
        }
    } catch (error) {
        console.error("An error occurred while updating the status:", error);
    }
}

export async function getAllUserStatuses() {
    try {
        const response = await fetch(`/get_all_statuses`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
            throw new Error(`Failed to fetch user statuses: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        // console.log("User data:\n" + JSON.stringify(userData));
        if (userData.error)
            console.error(userData.error);
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

export async function getFriendsList() {
    try {
        const response = await fetch(`/friends`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            console.error(userData.error);
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

export async function getBlockedList(returnId = false) {
    try {
        const response = await fetch(`/blocked`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        const userData = await response.json();
        if (userData.error)
            console.error(userData.error);
        if (returnId)
            return userData.map(user => user.id);
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

export async function getAccountUser(userName) {
    try {
      // Make a GET request to the retrieve_account view
      const response = await fetch(`/retrieve_account/${userName}`);
      
      // Check if the response is ok (status code 200-299)
      if (!response.ok)
        throw new Error('Network response was not ok');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;  // You can return an error object or null if needed
    }
}

export async function askAddFriend(userName) {
    try {
        const response = await fetch(`/send_friend_request/${userName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
        {
            if (response.status === 400) {
                sendSystemMessage("youAlreadySentRequest", userName, true);
                return response;
            } else
                throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function deleteFriend(userName) {
    try {
        const response = await fetch(`/delete_friend/${userName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
            throw new Error('Network response was not ok');
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function getAddress() {
    try {
        const response = await fetch(`/get_address`);
        if (!response.ok) {
            throw new Error(`Failed to fetch address: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.HOST_ADDRESS) {
            return data.HOST_ADDRESS;
        } else
            console.error("HOST_ADDRESS is missing in the response");
    } catch (error) {
        console.error("An error occurred while fetching the address:", error);
    }
}

export async function getIncomingFriendRequests() {
    try {
        const response = await fetch(`/incoming_friend_requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
            throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function getOutgoingFriendRequests() {
    try {
        const response = await fetch(`/outgoing_friend_requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
            throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function blockUserRequest(userName) {
    try {
        const response = await fetch(`/block_user/${userName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
            throw new Error('Network response was not ok');
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function unblockUserRequest(userName) {
    try {
        const response = await fetch(`/block_user/${userName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
            throw new Error('Network response was not ok');
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function sendMatch(name1, name2, score1, score2, timer)
{
    const winnerPlayer = score1 > score2 ? name1 : name2;
    const data = {
        finished: true,
        started: false,
        status: 1,
        player_1: name1,
        player_1_score: score1,
        player_2: name2,
        player_2_score: score2,
        start_timestamp: 0,
        stop_timestamp: timer,
        winner: winnerPlayer
    };

    // console.log(data);
    try
    {
        const response = await fetch('api/matchs/set_match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data)
        });

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const responseData = await response.json();

        if (responseData.success)
            return true;
        else {
            console.error('Registration error:', responseData.error);
            return false;
        }
    } catch (error) {
        console.error('Error sending data to backend:', error);
        return false;
    }
}

export async function sendMatchMulti(nameTeam1, nameTeam2, score1, nameOpponent1, nameOpponent2, score2, timer)
{
    const winners = score1 > score2 ? [nameTeam1, nameTeam2] : [nameOpponent1, nameOpponent2];
    const data = {
        finished: true,
        started: false,
        status: 1,
        player_1: nameTeam1,
        player_2: nameTeam2,
        team_1_score: score1,
        player_3: nameOpponent1,
        player_4: nameOpponent2,
        team_2_score: score2,
        start_timestamp: 0,
        stop_timestamp: timer,
        winner1: winners[0],
        winner2: winners[1]
    };

    console.log(data);
    try
    {
        const response = await fetch('api/matchs/set_match2v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data)
        });

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const responseData = await response.json();

        if (responseData.success)
            return true;
        else {
            console.error('Registration error:', responseData.error);
            return false;
        }
    } catch (error) {
        console.error('Error sending data to backend:', error);
        return false;
    }
}

export async function getMatchsLittleData(userName) {
    try {
      const response = await fetch(`api/matchs/get_matchs_count/${userName}`);
      
      if (!response.ok)
        throw new Error('Network response was not ok');
      
      const data = await response.json();
    //   console.log(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
}

export async function getMatchsFullData(userName) {
    try {
      const response = await fetch(`api/matchs/history/${userName}`);
      
      if (!response.ok)
        throw new Error('Network response was not ok');
      
      const data = await response.json();
    //   console.log(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
}

export async function getMatchs2v2LittleData(userName) {
    try {
      const response = await fetch(`api/matchs/get_matchs2v2_count/${userName}`);
      
      if (!response.ok)
        throw new Error('Network response was not ok');
      
      const data = await response.json();
    //   console.log(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
}

export async function get2v2MatchsFullData(userName) {
    try {
      const response = await fetch(`api/matchs/history2v2/${userName}`);
      
      if (!response.ok)
        throw new Error('Network response was not ok');
      
      const data = await response.json();
    //   console.log(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
}

export async function deleteAccount() {
    try {
        const response = await fetch(`/user/del_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            }
        });
        if (!response.ok)
        {
            if (response.status === 400) {
                return response;
            } else
                throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        callGameDialog("entityDeleteAccount", EmotionType.SAD);
        clickLogOut(true);
        closeProfile();
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function updateSettingsInDatabase() {
    if (!playerStats.isRegistered)
        return;
    try {
        const response = await fetch(`/update_settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                color: playerStats.colors,
                language: playerStats.language,
                view: Number(playerStats.cameraOrthographic)
            })
        });
        if (!response.ok)
            throw new Error('Network response was not ok');
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const file = document.getElementById('fileInput').files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);
        fetch('/upload/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken()
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success)
            {
                document.getElementById("profilePicture").src = "/media/" + data.url;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});

export async function updatePasswordInDatabase(curPass, newPass, confirmPass) {
    if (!playerStats.isRegistered)
        return;
    try {
        const response = await fetch(`/update_password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                current_password: curPass,
                new_password: newPass,
                new_password2: confirmPass
            })
        });

        const responseData = await response.json();
        if (responseData.success) {
            return { success: true, message: responseData.message };
        }
        return { success: false, errors: responseData.errors || ["Unknown error"] };
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function updateUsernameInDatabase(newUsername) {
    if (!playerStats.isRegistered)
        return;
    try {
        const response = await fetch(`/update_username`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                new_username: newUsername
            })
        });

        const responseData = await response.json();
        if (responseData.success) {
            return { success: true, message: responseData.message };
        }
        return { success: false, errors: responseData.errors || ["Unknown error"] };
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function updateFirstnameInDatabase(newFirstname) {
    if (!playerStats.isRegistered)
        return;
    try {
        const response = await fetch(`/update_firstname`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                new_firstname: newFirstname
            })
        });

        const responseData = await response.json();
        if (responseData.success) {
            return { success: true, message: responseData.message };
        }
        return { success: false, errors: responseData.errors || ["Unknown error"] };
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function updateLastnameInDatabase(newLastname) {
    if (!playerStats.isRegistered)
        return;
    try {
        const response = await fetch(`/update_lastname`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                new_lastname: newLastname
            })
        });

        const responseData = await response.json();
        if (responseData.success) {
            return { success: true, message: responseData.message };
        }
        return { success: false, errors: responseData.errors || ["Unknown error"] };
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function sendTournament(names)
{
    // c'est un test !
    const data = {
        players: names,
        winner: "winner"
    };

    // console.log(data);
    try
    {
        const response = await fetch('api/matchs/get_tournaments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data)
        });

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        const responseData = await response.json();

        if (responseData.success)
            return true;
        else {
            console.error('Registration error:', responseData.error);
            return false;
        }
    } catch (error) {
        console.error('Error sending data to backend:', error);
        return false;
    }
}

// export async function getTournaments()
// {
//     try
//     {
//         const response = await fetch('api/matchs/get_tournaments', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': getCSRFToken(),
//             }
//         });

//         if (!response.ok)
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         const responseData = await response.json();

//         if (responseData.success)
//             return responseData;
//         else {
//             console.error('Registration error:', responseData.error);
//             return null;
//         }
//     } catch (error) {
//         console.error('Error sending data to backend:', error);
//         return null;
//     }
// }