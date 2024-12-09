document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const user = sessionStorage.getItem('user');
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Login form submitted');

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username: email, password })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Login response:', data);

            if (data.user) {
                // Store user data in session storage
                sessionStorage.setItem('user', JSON.stringify(data.user));
                console.log('User data stored:', data.user);
                
                // Redirect to main page
                window.location.href = 'index.html';
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Error logging in. Please try again.');
        }
    });

    // Add signup form handler
    const signupForm = document.getElementById('signupForm');
    
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Signup form submitted');

        const username = document.getElementById('signupUsername').value;
        const fullName = document.getElementById('signupFullName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        // Split full name into first and last name
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        try {
            const response = await fetch('http://localhost:4000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    username,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Signup failed');
            }

            const data = await response.json();
            console.log('Signup response:', data);

            alert('Signup successful! Please login.');
            // Switch back to login panel
            authPanel.classList.remove('show-signup');

        } catch (error) {
            console.error('Signup error:', error);
            alert(error.message || 'Error signing up. Please try again.');
        }
    });
});

// Add event listeners for signup and login links
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const authPanel = document.querySelector('.auth-panel');

showSignup.addEventListener('click', function() {
    authPanel.classList.add('show-signup');
});

showLogin.addEventListener('click', function() {
    authPanel.classList.remove('show-signup');
});
