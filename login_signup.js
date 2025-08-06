document.getElementById('Signup').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent page reload

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmpassword').value;
    const signUpMessage = document.getElementById('signUpMessage');

    // Check if passwords match
    if (password !== confirmPassword) {
        signUpMessage.textContent = 'Passwords do not match!';
        signUpMessage.style.color = 'red';
        signUpMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        signUpMessage.textContent = data.message;
        signUpMessage.style.color = data.message.includes('successfully') ? 'green' : 'red';
        signUpMessage.style.display = 'block';
        if (response.ok) {
            alert("Sign-up successful! Redirecting to login...");
            window.location.href = "login_page.html"; // Redirect to login page
        }
    } catch (error) {
        console.error('Error:', error);
        signUpMessage.textContent = 'Something went wrong';
        signUpMessage.style.color = 'red';
        signUpMessage.style.display = 'block';
    }
});

document.getElementById('Login').addEventListener('submit', async function(event) {
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
            window.location.href = "dashboard.html"; // Redirect to dashboard
        }
    } catch (error) {
        console.error('Error:', error);
        loginMessage.textContent = 'Something went wrong';
        loginMessage.style.color = 'red';
        loginMessage.style.display = 'block';
    }
});