document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("Login");
  const loginMessage = document.getElementById("loginMessage");

  if (loginForm) {
      loginForm.addEventListener("submit", async function (event) {
          event.preventDefault();

          const email = document.getElementById("email").value;
          const password = document.getElementById("password").value;

          try {
              const response = await fetch("http://localhost:3000/login", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email, password }),
              });

              const data = await response.json();

              if (response.ok) {
                  localStorage.setItem("userEmail", email);
                  window.location.href = "main_page.html"; // Redirect after login
              } else {
                  loginMessage.textContent = data.message;
                  loginMessage.style.display = "block";
              }
          } catch (error) {
              console.error("Error:", error);
              loginMessage.textContent = "Server error. Please try again later.";
              loginMessage.style.display = "block";
          }
      });
  }
});
