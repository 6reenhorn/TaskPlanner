document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = sessionStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Parse user data
    const userData = JSON.parse(user);
    console.log('Logged in user:', userData);
    
    // Update profile information
    document.querySelector('.user-profile-username').textContent = userData.username;
    document.querySelector('.user-profile-fullname').textContent = `${userData.firstName} ${userData.lastName}`;
    document.querySelector('.user-profile-email').textContent = userData.email;

    // Logout functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log('Logout clicked');
            sessionStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // Continue with rest of your initialization code
}); 