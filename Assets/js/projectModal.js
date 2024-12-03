document.addEventListener('DOMContentLoaded', function() {
    console.log('Project Modal JS Loaded');
    
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    
    if (!saveProjectBtn) {
        console.error('Save Project Button not found!');
        return;
    }
    
    saveProjectBtn.addEventListener('click', function() {
        console.log('Project save button clicked');
        
        const projectTitle = document.getElementById('projectTitle');
        const projectDescription = document.getElementById('projectDescription');
        const projectStartDate = document.getElementById('projectStartDate');
        const projectEndDate = document.getElementById('projectEndDate');
        const projectStatus = document.getElementById('projectStatus');

        if (!projectTitle || !projectStartDate || !projectEndDate || !projectStatus) {
            console.error('One or more form elements not found');
            return;
        }

        const projectData = {
            project_title: projectTitle.value.trim(),
            project_description: projectDescription?.value.trim() || '',
            project_start_date: projectStartDate.value.trim(),
            project_end_date: projectEndDate.value.trim(),
            project_status: projectStatus.value.trim()
        };

        console.log('Sending project data:', projectData);

        fetch('http://localhost:4000/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Project created:', data);
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('project-staticBackdrop'));
            modal.hide();
            // Refresh the project list without full page reload
            fetchProjects();
            // Clear the form
            document.getElementById('projectForm').reset();
        })
        .catch(err => {
            console.error('Error saving project:', err);
            alert('Error saving project. Please try again.');
        });
    });
});

// Function to fetch and display projects
function fetchProjects() {
    fetch('http://localhost:4000/projects')
        .then(response => response.json())
        .then(projects => {
            console.log('Projects received:', projects);
            // Update your project display logic here
            const projectContainer = document.getElementById('projectContainer');
            if (projectContainer) {
                projectContainer.innerHTML = ''; // Clear existing projects
                projects.forEach(project => {
                    const projectCard = createProjectCard(project);
                    projectContainer.appendChild(projectCard);
                });
            }
        })
        .catch(err => console.error('Error fetching projects:', err));
}

// Initial load of projects
document.addEventListener('DOMContentLoaded', fetchProjects);

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