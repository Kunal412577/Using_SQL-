// Google Sign-In API Integration
function handleCredentialResponse(response) {
    try {
        const data = parseJwt(response.credential);
        
        // Store user data in localStorage
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userPicture', data.picture);
        
        // Show success message
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = 'Login successful!';
        loginMessage.style.color = 'green';
        loginMessage.style.display = 'block';

        // Show user info
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');
        userInfo.style.display = 'block';
        userName.textContent = data.name;

        console.log("✅ Google Login Successful");
        console.log("Name:", data.name);
        console.log("Email:", data.email);
        console.log("Profile Image:", data.picture);

        // Redirect to main page after successful login
        setTimeout(() => {
            window.location.href = 'main_page.html';
        }, 1500);

    } catch (error) {
        console.error("❌ Error parsing Google token:", error);
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = 'Google Sign-In failed. Please try again.';
        loginMessage.style.color = 'red';
        loginMessage.style.display = 'block';
    }
}

// Function to decode JWT token payload
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
    );
    return JSON.parse(jsonPayload);
}

// Initialize Google Sign-In
document.addEventListener('DOMContentLoaded', function() {
    // Check if the Google Sign-In script is loaded
    if (typeof google !== 'undefined') {
        console.log('Google Sign-In script loaded successfully');
    } else {
        console.error('Google Sign-In script failed to load');
    }
}); 