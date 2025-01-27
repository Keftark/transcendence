import { sendSystemMessage } from "./chat.js";
import { editPlayerStats } from "./playerManager.js";
import { clickCancelSignIn } from "./signIn.js";

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
            const errorResult = await response.json();
            console.error('Login failed:', errorResult.message);
            alert(errorResult.message);
        } else {
            const result = await response.json();
            // console.log(result.message);
            editPlayerStats(result.user);
            clickCancelSignIn(true);
        }

    } catch (error) {
        console.error('Error during login:', error);
    }
}

export async function registerUser(nameValue, firstNameValue, lastNameValue, emailValue, passwordValue)
{
    const data = {
        name: nameValue,
        first_name: firstNameValue,
        last_name: lastNameValue,
        email: emailValue,
        password: passwordValue
    };
    // console.log(data);
    try
    {
        const response = await fetch('/register', {
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
            console.trace('Logged-in user:', userData);
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
        // console.log("Trying to get the user name");
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

export async function uploadAvatar(username, url_picture)
{
    const data = new FormData();
    data.append('username', username);
    data.append('url', url_picture);
    // console.log("Token: ", getCSRFToken());
    // console.log(data);

    try {
        const response = await fetch(`/uploadavatar/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken() // Ensure CSRF protection
            },
            body: data
        });

        // Check if the response is OK (status 200-299)
        if (!response.ok) {
            const errorResult = await response.json();  // Parse the error message in JSON
            alert(errorResult.message);  // Display the error message to the user
        } else {
            const result = await response.json();  // Parse the success response in JSON
            // console.log(result);
        }

    } catch (error) {
        console.error('Error during upload:', error);
    }
}

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
            console.error(userData.error);
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
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
        // console.log("user data: " + JSON.stringify(userData));
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

export async function getBlockedList() {
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
                // throw new Error('Bad Request (400): The request was invalid or missing parameters.');
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