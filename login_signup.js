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
        } else {
            document.getElementById("loginMessage").style.display = "block";
            document.getElementById("loginMessage").innerText = data.message || "Something went wrong!";
        }
    } catch (error) {
        console.error('Error:', error);
        signUpMessage.textContent = 'Something went wrong';
        signUpMessage.style.color = 'red';
        signUpMessage.style.display = 'block';
    }
});
