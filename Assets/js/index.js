document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const dashboardSection = document.getElementById('dashboard');
    const logoutButton = document.getElementById('logoutButton');

    if (!isLoggedIn) {
        window.location.href = 'login.html'; // Redirect to login if not logged in
    } else {
        // Show the dashboard section
        dashboardSection.classList.add('active');
        
        // Optionally, update the username
        const user = JSON.parse(sessionStorage.getItem('user'));
        document.querySelector('.username').textContent = user.username;
    }

    // Logout functionality
    logoutButton.addEventListener('click', function() {
        sessionStorage.clear(); // Clear session storage
        window.location.href = 'login.html'; // Redirect to login page
    });
}); 