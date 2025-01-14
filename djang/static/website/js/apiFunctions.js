import { editPlayerStats } from "./playerManager.js";
import { clickCancelSignIn } from "./signIn.js";

function getCSRFToken()
{
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        if (cookie.trim().startsWith('csrftoken=')) {
            return cookie.trim().split('=')[1];  // Return the token part of the cookie
        }
    }
    return '';  // Return empty string if no token found
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
                'X-CSRFToken': getCSRFToken() // Ensure CSRF protection
            }
        });

        // Check if the response is OK (status 200-299)
        if (!response.ok) {
            const errorResult = await response.json();  // Parse the error message in JSON
            console.error('Login failed:', errorResult.message);
            alert(errorResult.message);  // Display the error message to the user
        } else {
            const result = await response.json();  // Parse the success response in JSON
            console.log(result.message);
            // console.log('User Data:', result.user);
            editPlayerStats(result.user);
            clickCancelSignIn(true);
            // Handle login success (redirect, show success message, etc.)
        }

    } catch (error) {
        console.error('Error during login:', error);
    }
}

export async function registerUser()
{
    const data = {
        name: inputName.value,
        first_name: inputFirstName.value,
        last_name: inputLastName.value,
        email: inputMail.value,
        password: inputPassword.value,
        confirm_password: inputConfirmPassword.value,
        gdpr_consent: checkboxGdpr.checked,
    };

    try
    {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.success) {
            return true;
        } else {
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

        if (!response.ok) {
            throw new Error('Failed to log out');
        }

        const data = await response.json();

        if (data.success) {
            console.log(data.message);
        } else {
            console.error(data.error);
        }
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
            console.log('User is not logged in.');
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
        // Make a GET request to the Django API endpoint
        const response = await fetch(`/user/${userId}/`);

        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        }

        // Parse the JSON response
        const userData = await response.json();

        if (userData.error) {
            console.error(userData.error);
        }
        // else {
        //     console.log("User Details:", userData);
        // }

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
        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        }
        const userData = await response.json();
        if (userData.error) {
            console.error(userData.error);
        }
        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}

export async function getUserByName(userName) {
    if (!userName) {
        console.error("User ID is required.");
        return;
    }

    try {
        // Make a GET request to the Django API endpoint
        const response = await fetch(`/get-user/${userName}/`);

        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        }

        // Parse the JSON response
        const userData = await response.json();

        if (userData.error) {
            console.error(userData.error);
        }
        console.log("user data: " + userData);
        // else {
        //     console.log("User Details:", userData);
        // }

        return userData;
    } catch (error) {
        console.error("An error occurred while fetching the user details:", error);
    }
}