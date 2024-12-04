document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
        return;
    }

    const authForms = document.querySelector('.auth-forms');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');

    if (showSignupLink && showLoginLink) {
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            authForms.classList.add('show-signup');
        });

        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            authForms.classList.remove('show-signup');
        });

        // Handle login form submission
        document.querySelector('#loginForm form').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Add your login API call here
            console.log('Login attempt:', { email, password });
            
            // Temporary: simulate successful login
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'index.html';
        });

        // Handle signup form submission
        document.querySelector('#signupForm form').addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;

            // Add your signup API call here
            console.log('Signup attempt:', { username, email, password });
        });
    }
}); 