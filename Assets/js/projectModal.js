document.addEventListener('DOMContentLoaded', function() {
    console.log('Project Modal JS Loaded');
    
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    const addInitialTaskBtn = document.querySelector('.modal-btn'); // Assuming this is the "Add Initial Task" button

    if (!saveProjectBtn || !cancelProjectBtn || !addInitialTaskBtn) {
        console.error('One or more buttons not found!');
        return;
    }
    
    saveProjectBtn.addEventListener('click', function() {
        console.log('Project save button clicked');
        
        const projectTitle = document.getElementById('projectTitle');
        const projectDescription = document.getElementById('projectDescription');
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        const status = document.getElementById('status');

        if (!projectTitle || !startDate || !endDate || !status) {
            console.error('One or more form elements not found');
            return;
        }

        const projectData = {
            project_title: projectTitle.value.trim(),
            project_description: projectDescription?.value.trim() || '',
            project_start_date: startDate.value.trim(),
            project_end_date: endDate.value.trim(),
            project_status: status.value.trim()
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
            const modal = bootstrap.Modal.getInstance(document.getElementById('project-staticBackdrop'));
            modal.hide();
            document.getElementById('newProjectForm').reset();
            fetchProjects();
        })
        .catch(err => {
            console.error('Error saving project:', err);
            alert('Error saving project. Please try again.');
        });
    });

    cancelProjectBtn.addEventListener('click', function() {
        console.log('Project cancel button clicked');
        document.getElementById('newProjectForm').reset();
    });

    addInitialTaskBtn.addEventListener('click', function() {
        console.log('Add Initial Task button clicked');
        alert('Add Initial Task feature coming soon!');
    });
});

// Function to fetch and display projects
function fetchProjects() {
    fetch('http://localhost:4000/projects')
        .then(response => response.json())
        .then(projects => {
            console.log('Projects received:', projects);
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

// Function to create a project card
function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'col-4 card d-flex card-bg mb-3';
    projectCard.setAttribute('data-project-id', project.project_id_);

    projectCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center my-0">
            ${project.project_title}
            <form action="">
                <input type="checkbox" id="project-completion" name="project-completion" value="Finished">
            </form>
        </div>
        <div class="card-body">
            <ul class="card-text mt-0">
                <li>Start: <span>${project.project_start_date}</span></li>
                <li>End: <span>${project.project_end_date}</span></li>
                <li>Status: <span>${project.project_status}</span></li>
            </ul>
            <div class="d-flex align-items-end mb-3">
                <div class="col-auto project-card-description">
                    <p class="card-description-text">${project.project_description || ''}</p>
                </div>
            </div>
            <div class="d-flex gap-2 justify-content-between">
                <button type="button" class="card-btn-group project-btn-edit" onclick="alert('Edit feature coming soon!')">Edit</button>
                <button type="button" class="card-btn-group project-btn-delete">Delete</button>
                <button type="button" class="card-btn-group project-btn-comment" onclick="alert('Comment feature coming soon!')">Comment</button>
                <button type="button" class="card-btn-group project-btn-view" onclick="alert('View Details feature coming soon!')">View Details</button>
            </div>
        </div>
    `;

    return projectCard;
}

// Initial load of projects
document.addEventListener('DOMContentLoaded', fetchProjects);

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