// Callback function when user successfully logs in via Google
function handleCredentialResponse(response) {
    try {
        const data = parseJwt(response.credential);
        
        // Show user info on the UI
        document.getElementById("user-name").innerText = data.name;
        document.getElementById("user-info").style.display = "block";

        console.log("✅ Google Login Successful");
        console.log("Name:", data.name);
        console.log("Email:", data.email);
        console.log("Profile Image:", data.picture); // Optional if you want to show image
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
            name: data.name,
            email: data.email,
            picture: data.picture
        }));
        
        // Send the token to your backend for verification and login
        fetch('http://localhost:3000/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: response.credential })
        })
        .then(res => res.json())
        .then(data => {
            // Handle your backend response here
            console.log(data);
            // Redirect to the main page
            window.location.href = 'main_page.html';
        })
        .catch(err => {
            console.error("❌ Backend Error:", err);
            alert("Google Sign-In failed. Please try again.");
        });
        
    } catch (error) {
        console.error("❌ Error parsing Google token:", error);
        alert("Google Sign-In failed. Please try again.");
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
function initGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: "outline", size: "large" }  // Customize button style
    );
}

// Add event listener for regular login form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent page reload
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginMessage = document.getElementById('loginMessage');
            
            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                loginMessage.textContent = data.message;
                loginMessage.style.color = data.message.includes('successful') ? 'green' : 'red';
                loginMessage.style.display = 'block';
                
                if (response.ok) {
                    alert("Login successful! Redirecting to dashboard...");
                    window.location.href = "main_page.html"; // Redirect to main page
                }
            } catch (error) {
                console.error('Error:', error);
                loginMessage.textContent = 'Something went wrong';
                loginMessage.style.color = 'red';
                loginMessage.style.display = 'block';
            }
        });
    }

    // Initialize Google Sign-In
    initGoogleSignIn();
});
