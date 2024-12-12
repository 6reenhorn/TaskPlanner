document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('#sidebar-wrapper .list-group-item');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor click behavior
            const targetId = this.getAttribute('href'); // Get the target section ID
            const targetSection = document.querySelector(targetId); // Find the target section

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' }); // Scroll to the section smoothly
            }
        });
    });
}); 

document.getElementById('toggleSidebar').addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar-wrapper');
    const content = document.getElementById('page-content-wrapper');

    sidebar.classList.toggle('active'); // Toggle sidebar visibility
    content.classList.toggle('collapsed'); // Adjust content margin
});

document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('#sidebar-wrapper .list-group-item');
    const sections = document.querySelectorAll('.admin-main-pages');

    // Function to show the selected section
    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active'); // Show the selected section
            } else {
                section.classList.remove('active'); // Hide other sections
            }
        });
    }

    // Set the initial section to Employee Management
    showSection('employeeManagement');

    // Add click event listeners to the sidebar links
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor click behavior
            const targetId = this.getAttribute('href').substring(1); // Get the target section ID
            showSection(targetId); // Show the selected section
        });
    });
});