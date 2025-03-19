document.addEventListener("DOMContentLoaded", function () {
    const loginLink = document.getElementById("loginLink");
    const signUpLink = document.getElementById("signuplink");
    const logoutLink = document.getElementById("logoutLink");
    const profileIcon = document.getElementById("profileIcon");
    const userEmailTooltip = document.getElementById("userEmailTooltip");

    const userEmail = localStorage.getItem("userEmail");

    if (userEmail) {
        loginLink.style.display = "none";
        signUpLink.style.display = "none";
        logoutLink.style.display = "inline-block";
        userEmailTooltip.textContent = userEmail;
    }

    profileIcon.addEventListener("mouseenter", function () {
        if (userEmail) {
            userEmailTooltip.style.display = "block";
        }
    });

    profileIcon.addEventListener("mouseleave", function () {
        userEmailTooltip.style.display = "none";
    });

    logoutLink.addEventListener("click", function () {
        localStorage.removeItem("userEmail");
        window.location.reload();
    });
});