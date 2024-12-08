const API_BASE = 'http://localhost:4000/api';

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
            const user = JSON.parse(sessionStorage.getItem('user'));
            const pendingTasks = JSON.parse(sessionStorage.getItem('pendingTasks') || '[]');
            
            console.log('Retrieved pending tasks:', pendingTasks); // Debug log

            if (!pendingTasks || pendingTasks.length === 0) {
                const modal = document.getElementById('add-initial-task-staticBackdrop');
                const modalInstance = bootstrap.Modal.show(modal);
                alert('Please add tasks first');
                return;
            }

            // Get project data
            const projectData = {
                project_title: document.getElementById('projectTitle').value.trim(),
                project_description: document.getElementById('projectDescription').value.trim(),
                project_start_date: document.getElementById('startDate').value,
                project_end_date: document.getElementById('endDate').value,
                project_status: 'active',
                user_id_: user.id
            };

            // Save project
            const projectResponse = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(projectData)
            });

            if (!projectResponse.ok) {
                throw new Error('Failed to create project');
            }

            const projectResult = await projectResponse.json();
            const projectId = projectResult.project_id_;

            // Save all pending tasks
            for (const task of pendingTasks) {
                const taskData = {
                    ...task,
                    user_id_: user.id
                };

                const taskResponse = await fetch(`${API_BASE}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(taskData)
                });

                if (!taskResponse.ok) {
                    throw new Error('Failed to create task');
                }

                const taskResult = await taskResponse.json();

                // Create project-task association
                const associationResponse = await fetch(`${API_BASE}/project-tasks`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        project_id_: projectId,
                        task_id_: taskResult.task_id_,
                        task_assigned_at: new Date().toISOString()
                    })
                });

                if (!associationResponse.ok) {
                    const errorText = await associationResponse.text();
                    console.error('Failed to create association:', errorText);
                    throw new Error('Failed to associate task with project');
                }

                const associationResult = await associationResponse.json();
                console.log('Association created:', associationResult);
            }

            // Clear temporary storage
            sessionStorage.removeItem('pendingTasks');
            temporaryTasks = [];

            // Close modal
            const modal = document.getElementById('project-staticBackdrop');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }

            // Refresh displays
            await fetchAndDisplayTasks();
            await fetchAndDisplayProjects();

            alert('Project and tasks saved successfully!');

        } catch (error) {
            console.error('Error saving project and tasks:', error);
            alert(error.message);
        }
    });

    cancelProjectBtn.addEventListener('click', function() {
        console.log('Project cancel button clicked');
        projectForm.reset();
    });

    addInitialTaskBtn.addEventListener('click', function() {
        // First, store the project data
        const projectData = {
            project_title: document.getElementById('projectTitle').value,
            project_description: document.getElementById('projectDescription').value,
            project_start_date: document.getElementById('startDate').value,
            project_end_date: document.getElementById('endDate').value,
            project_status: document.getElementById('status').value
        };

        // Validate project data
        if (!projectData.project_title || !projectData.project_start_date || !projectData.project_end_date) {
            alert('Please fill in all required project fields first');
            return;
        }

        // Store project data temporarily
        sessionStorage.setItem('tempProjectData', JSON.stringify(projectData));
        
        // Open the initial task modal
        const initialTaskModal = new bootstrap.Modal(document.getElementById('add-initial-task-staticBackdrop'));
        initialTaskModal.show();
    });

    // Store tasks temporarily
    let temporaryTasks = [];

    // Add Task Button Handler (just adds to container)
    document.getElementById('addTaskBtn').addEventListener('click', function() {
        const taskTitle = document.getElementById('initialTaskTitle').value.trim();
        const description = document.getElementById('initialDescription').value.trim();
        const dueDate = document.getElementById('initialDueDate').value;
        const priority = document.getElementById('initialPriority').value;

        if (!taskTitle || !dueDate || !priority) {
            alert('Please fill in all required fields');
            return;
        }

        // Add to temporary array
        temporaryTasks.push({
            task_title: taskTitle,
            task_description: description,
            task_due_date: dueDate,
            task_priority: priority
        });

        // Add to visual container
        const taskContainer = document.querySelector('.task-added-container');
        const taskElement = document.createElement('div');
        taskElement.className = 'added-task-item mb-2 p-2 border rounded';
        taskElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <strong>${taskTitle}</strong>
                <button type="button" class="btn-close" aria-label="Remove task"></button>
            </div>
            <div>Due: ${dueDate}</div>
            <div>Priority: ${priority}</div>
        `;

        // Add remove functionality
        taskElement.querySelector('.btn-close').addEventListener('click', function() {
            const index = Array.from(taskContainer.children).indexOf(taskElement);
            temporaryTasks.splice(index, 1);
            taskElement.remove();
        });

        taskContainer.appendChild(taskElement);

        // Clear form
        document.getElementById('addInitialTaskForm').reset();
    });

    // Initial Task Modal Save Button Handler
    document.getElementById('saveInitialTaskBtn').addEventListener('click', function() {
        if (temporaryTasks.length === 0) {
            alert('Please add at least one task before saving');
            return;
        }

        console.log('Temporary tasks before saving:', temporaryTasks); // Debug log

        // Store tasks in sessionStorage for later use
        sessionStorage.setItem('pendingTasks', JSON.stringify(temporaryTasks));
        
        console.log('Tasks stored in session:', sessionStorage.getItem('pendingTasks')); // Debug log

        // Close the initial task modal
        const modal = document.getElementById('add-initial-task-staticBackdrop');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.hide();
        }
    });

    // Choose Task Button Handler
    document.getElementById('chooseTaskBtn').addEventListener('click', async function() {
        try {
            const response = await fetch('http://localhost:4000/api/tasks');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const tasks = await response.json();
            
            // Create and show task selection modal
            const taskSelectionHTML = createTaskSelectionModal(tasks);
            document.body.insertAdjacentHTML('beforeend', taskSelectionHTML);
            
            const selectionModal = new bootstrap.Modal(document.getElementById('taskSelectionModal'));
            selectionModal.show();
            
        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert('Error loading tasks. Please try again.');
        }
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

        // Log each project individually
        projects.forEach(project => {
            console.log('Project details:', {
                id: project.project_id_,
                title: project.project_title,
                description: project.project_description,
                startDate: project.project_start_date,
                endDate: project.project_end_date,
                status: project.project_status
            });
        });

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

// Update the event listener to use the correct API endpoint
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
            deleteProject(projectId);  // Use the existing deleteProject function
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

// Assuming you have a function to handle delete button clicks
async function deleteProject(projectId) {
    try {
        console.log('Delete button clicked for project ID:', projectId);

        const response = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('Delete response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Project deleted successfully');
        // Refresh the project list
        await fetchAndDisplayProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
    }
}

// Function to create initial task card
function createInitialTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'card mb-2';
    card.setAttribute('data-task-id', task.task_id_);

    // Format the date for display
    const dueDate = new Date(task.task_due_date).toLocaleDateString();

    card.innerHTML = `
        <div class="card-body p-2">
            <div class="d-flex justify-content-between align-items-center">
                <h6 class="card-title mb-1">${task.task_title}</h6>
                <button type="button" class="btn-close remove-task" aria-label="Remove"></button>
            </div>
            <div class="card-text small">
                <div>Due: ${dueDate}</div>
                <div>Priority: ${task.task_priority}</div>
                ${task.task_description ? `<div>Description: ${task.task_description}</div>` : ''}
            </div>
        </div>
    `;

    // Add remove functionality
    card.querySelector('.remove-task').addEventListener('click', function() {
        card.remove();
    });

    return card;
}

// Function to create task selection modal
function createTaskSelectionModal(tasks) {
    return `
        <div class="modal fade" id="taskSelectionModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Select Tasks</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="task-list">
                            ${tasks.map(task => `
                                <div class="task-item" data-task-id="${task.task_id_}">
                                    <input type="checkbox" id="task_${task.task_id_}">
                                    <label for="task_${task.task_id_}">${task.task_title}</label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="modal-btn" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="modal-btn" onclick="addSelectedTasks()">Add Selected</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to add selected tasks
window.addSelectedTasks = async function() {
    const selectedTasks = document.querySelectorAll('#taskSelectionModal input[type="checkbox"]:checked');
    const taskContainer = document.querySelector('.task-added-container');
    
    for (const checkbox of selectedTasks) {
        const taskId = checkbox.closest('.task-item').dataset.taskId;
        
        try {
            const response = await fetch(`http://localhost:4000/api/tasks/${taskId}`);
            const task = await response.json();
            
            const taskCard = createInitialTaskCard(task);
            taskContainer.appendChild(taskCard);
        } catch (error) {
            console.error('Error adding selected task:', error);
        }
    }
    
    // Close the selection modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('taskSelectionModal'));
    modal.hide();
    
    // Remove the modal from DOM after hiding
    document.getElementById('taskSelectionModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
};