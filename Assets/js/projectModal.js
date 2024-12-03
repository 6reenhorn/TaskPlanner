document.getElementById('saveProjectBtn').addEventListener('click', function () {
    // Capture the form data
    const projectTitle = document.getElementById('projectTitle').value.trim();
    const startDate = document.getElementById('startDate').value.trim();
    const endDate = document.getElementById('endDate').value.trim();
    const status = document.getElementById('status').value.trim();
    const description = document.getElementById('projectDescription').value.trim();

    // Validate the form data
    if (!projectTitle || !startDate || !endDate || !status) {
        alert('Please fill out all required fields.');
        return;
    }

    // Create the project data object
    const projectData = {
        project_title: projectTitle,
        project_comment: 'None',  // You can modify this if you want to include a comment
        project_description: description,
        project_start_date: startDate,
        project_end_date: endDate,
        project_status: status
    };

    // Send the project data to the server
    fetch('http://localhost:4000/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    })
    .then(response => response.text())
    .then(data => {
        console.log('Save response:', data);  // Debug line
        console.log(data);  // Confirmation of successful project creation
        
        // After successful project creation, create and append the project card to the UI
        const projectCard = createProjectCard(projectData);  // Assuming you have a function to create a project card
        document.getElementById('projectContainer').appendChild(projectCard);
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('project-staticBackdrop'));
        modal.hide();

        // Reset the form
        document.getElementById('newProjectForm').reset();
    })
    .catch(err => console.error('Error saving project:', err));
});

// Function to create a project card
function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'col-4 card d-flex card-bg mb-3';
    projectCard.dataset.projectId = project.project_id_;  // Make sure to use project_id_

    projectCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center my-0">
            ${project.project_title}
            <form action="">
                <input type="checkbox" id="project-completion" name="project-completion" value="Finished">
            </form>
        </div>
        <div class="card-body">
            <ul class="card-text mt-0">
                <li>Start Date: <span>${project.project_start_date}</span></li>
                <li>End Date: <span>${project.project_end_date}</span></li>
                <li>Status: <span>${project.project_status}</span></li>
            </ul>
            <div class="project-card-description mt-0">
                <p class="project-description-text">${project.project_description}</p>
            </div>
            <div class="d-flex gap-3 mt-3 justify-content-between">
                <button type="button" class="card-btn-group project-btn-edit" onclick="alert('Edit feature coming soon!')">Edit</button>
                <button type="button" class="card-btn-group project-btn-delete">Delete</button>
                <button type="button" class="card-btn-group project-btn-comment" onclick="alert('Comment feature coming soon!')">Comment</button>
                <button type="button" class="card-btn-group project-btn-view-details" onclick="alert('View Details feature coming soon!')">View Details</button>
            </div>
        </div>
    `;
    return projectCard;
}

// Add this to your existing JavaScript where you handle the delete button clicks
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('project-btn-delete')) {
        const projectCard = e.target.closest('.card');
        const projectId = projectCard.dataset.projectId;  // Retrieve the project ID

        if (!projectId) {
            console.error('Project ID is undefined');
            return;
        }

        fetch(`http://localhost:4000/projects/${projectId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete project');
            }
            projectCard.remove();
        })
        .catch(err => console.error('Error deleting project:', err));
    }
});

// Load projects when the page loads
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:4000/projects')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Projects received:', data);  // Debug line
            if (Array.isArray(data)) {
                data.forEach(project => {
                    const projectCard = createProjectCard(project);
                    document.getElementById('projectContainer').appendChild(projectCard);
                });
            }
        })
        .catch(err => console.error('Error fetching projects:', err));
});