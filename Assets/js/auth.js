document.addEventListener('DOMContentLoaded', function() {
    const authPanel = document.querySelector('.auth-panel');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (!authPanel || !showSignupLink || !showLoginLink || !loginForm || !signupForm) {
        console.error('One or more elements not found:', {
            authPanel: !!authPanel,
            showSignupLink: !!showSignupLink,
            showLoginLink: !!showLoginLink,
            loginForm: !!loginForm,
            signupForm: !!signupForm
        });
        return;
    }

    // Panel flip animation
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        authPanel.classList.add('show-signup');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        authPanel.classList.remove('show-signup');
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:4000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                // Store user data in session storage
                sessionStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'index.html';
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Error logging in. Please try again.');
        }
    });

    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Signup form submitted'); // Debug log

        const username = document.getElementById('signupUsername').value;
        const fullName = document.getElementById('signupFullName').value;
        const [firstName, ...lastNameParts] = fullName.trim().split(' ');
        const lastName = lastNameParts.join(' ');
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        console.log('Form data:', { username, fullName, email }); // Debug log

        try {
            const response = await fetch('http://localhost:4000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    firstName, 
                    lastName, 
                    username, 
                    email, 
                    password 
                })
            });

            console.log('Response status:', response.status); // Debug log
            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (response.ok) {
                alert('Registration successful! Please login.');
                authPanel.classList.remove('show-signup');
                signupForm.reset(); // Clear the form
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('Error registering. Please try again.');
        }
    });

    // Social login handlers
    document.querySelectorAll('.social-login img').forEach(img => {
        img.addEventListener('click', function() {
            const platform = this.alt.toLowerCase();
            alert(`${platform} login coming soon!`);
            // Implement social login here
        });
    });
}); 