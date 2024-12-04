document.addEventListener('DOMContentLoaded', function() {
    console.log('Project Modal JS Loaded');
    
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    const addInitialTaskBtn = document.querySelector('#newProjectForm .add-initial-task-btn');
    const projectForm = document.getElementById('newProjectForm');

    if (!saveProjectBtn || !cancelProjectBtn || !addInitialTaskBtn || !projectForm) {
        console.error('One or more buttons not found!');
        return;
    }
    
    saveProjectBtn.addEventListener('click', async function() {
        try {
            console.log('Project save button clicked');
            
            // Get user data from session storage
            const user = JSON.parse(sessionStorage.getItem('user'));
            
            const projectData = {
                project_title: document.getElementById('projectTitle').value,
                project_description: document.getElementById('projectDescription').value,
                project_start_date: document.getElementById('startDate').value,
                project_end_date: document.getElementById('endDate').value,
                project_status: document.getElementById('status').value,
                user_id_: user.id
            };
            
            console.log('Sending project data:', projectData);

            const response = await fetch('http://localhost:4000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Project saved successfully:', result);

            // Refresh projects display
            await fetchAndDisplayProjects();
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('project-staticBackdrop'));
            modal.hide();
            projectForm.reset();

        } catch (error) {
            console.error('Error saving project:', error);
            alert('Error saving project. Please try again.');
        }
    });

    cancelProjectBtn.addEventListener('click', function() {
        console.log('Project cancel button clicked');
        projectForm.reset();
    });

    addInitialTaskBtn.addEventListener('click', function() {
        console.log('Add Initial Task button clicked in project modal');
        alert('Add Initial Task feature coming soon!');
    });
});

// Function to fetch and display projects
async function fetchAndDisplayProjects() {
    try {
        const response = await fetch('http://localhost:4000/api/projects');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const projects = await response.json();
        console.log('Fetched projects:', projects);

        // Get the container where projects should be displayed
        const projectContainer = document.getElementById('projectContainer');
        if (!projectContainer) {
            console.error('Project container not found');
            return;
        }

        projectContainer.innerHTML = ''; // Clear existing projects

        // Create and append project cards
        projects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectContainer.appendChild(projectCard);
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

// Function to create a project card
function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'col-4 card d-flex card-bg mb-3';
    projectCard.setAttribute('data-project-id', project.project_id_);

    // Format the dates to be more readable
    const startDate = new Date(project.project_start_date).toLocaleDateString();
    const endDate = new Date(project.project_end_date).toLocaleDateString();

    projectCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center my-0">
            ${project.project_title}
            <span class="badge ${project.project_status === 'active' ? 'bg-success' : 'bg-secondary'}">
                ${project.project_status}
            </span>
        </div>
        <div class="card-body">
            <ul class="card-text mt-0">
                <li>Start Date: <span>${startDate}</span></li>
                <li>End Date: <span>${endDate}</span></li>
                <li>Status: <span>${project.project_status}</span></li>
            </ul>
            <div class="d-flex gap-2">
                <button type="button" class="card-btn-group project-btn-edit">Edit</button>
                <button type="button" class="card-btn-group project-btn-delete">Delete</button>
                <button type="button" class="card-btn-group project-btn-tasks">Tasks</button>
            </div>
            <div class="d-flex align-items-end gap-5">
                <div class="col-auto project-card-description">
                    <p class="card-description-text">${project.project_description || ''}</p>
                </div>
            </div>
        </div>
    `;

    return projectCard;
}

// Make sure to call fetchAndDisplayProjects when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayProjects);

// Update the event listener to use project-specific class
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('project-btn-delete')) {
        const projectCard = e.target.closest('.card');
        const projectId = projectCard.getAttribute('data-project-id');
        console.log('Delete button clicked for project ID:', projectId);

        if (!projectId) {
            console.error('No project ID found on card');
            alert('Error: Could not identify project to delete');
            return;
        }

        if (confirm('Are you sure you want to delete this project?')) {
            fetch(`http://localhost:4000/projects/${projectId}`, {
                method: 'DELETE'
            })
            .then(response => {
                console.log('Delete response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Delete successful:', data);
                projectCard.remove();
            })
            .catch(err => {
                console.error('Error deleting project:', err);
                alert(`Error deleting project: ${err.message}`);
            });
        }
    }
});

document.getElementById('addProjectForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get user ID from session storage
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user.id) {
        alert('Please log in to create projects');
        return;
    }

    const formData = {
        project_title: document.getElementById('projectTitle').value,
        project_description: document.getElementById('projectDescription').value,
        project_due_date: document.getElementById('projectDueDate').value,
        project_priority: document.getElementById('projectPriority').value,
        user_id_: user.id  // Add user ID to the project data
    };

    try {
        const response = await fetch('http://localhost:4000/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        // ... rest of your code
    } catch (error) {
        console.error('Error:', error);
    }
});