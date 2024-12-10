const API_BASE = 'http://localhost:4000/api';

// Core display functions
function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'col-4 card d-flex card-bg mb-3';
    projectCard.setAttribute('data-project-id', project.project_id_);

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
            <div class="d-flex align-items-end gap-5">
                <div class="col-auto project-card-description">
                    <p class="card-description-text">${project.project_description || ''}</p>
                </div>
            </div>
            <div class="d-flex mt-3 justify-content-between">
                <button type="button" class="card-btn-group project-btn-edit">Edit</button>
                <button type="button" class="card-btn-group project-btn-delete">Delete</button>
                <button type="button" class="card-btn-group project-btn-comment">Comment</button>
                <button type="button" class="card-btn-group project-btn-view-details">View Details</button>
            </div>
        </div>
    `;

    // Add event listener for delete button
    const deleteBtn = projectCard.querySelector('.project-btn-delete');
    deleteBtn.addEventListener('click', () => handleDeleteProject(project.project_id_, projectCard));

    return projectCard;
}

async function fetchAndDisplayProjects() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        console.log('Current user:', user);

        if (!user?.id) {
            throw new Error('User not found');
        }

        const response = await fetch(`${API_BASE}/projects?userId=${user.id}`);
        const projects = await response.json();
        console.log('Fetched projects:', projects);

        const container = document.getElementById('projectContainer');
        console.log('Container element:', container);

        if (!container) {
            throw new Error('Project container not found');
        }

        container.innerHTML = '';

        projects.forEach(project => {
            const card = createProjectCard(project);
            container.appendChild(card);
            console.log('Added card for project:', project.project_title);
        });

        sessionStorage.setItem('projects', JSON.stringify(projects));

    } catch (error) {
        console.error('Error fetching/displaying projects:', error);
    }
}

// Initial load of projects
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing project page');
    fetchAndDisplayProjects();
});

// Add these handler functions
function handleDeleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                fetchAndDisplayProjects(); // Refresh the list
            } else {
                throw new Error('Failed to delete project');
            }
        })
        .catch(error => {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        });
    }
}

function handleEditProject(project) {
    // Add your edit project logic here
    console.log('Edit project:', project);
}

function handleViewProject(project) {
    // Add your view project details logic here
    console.log('View project:', project);
}

function handleProjectComment(project) {
    // Add your project comment logic here
    console.log('Comment on project:', project);
}

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
    
    saveProjectBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        try {
            // Get form data
            const formElements = {
                title: document.getElementById('projectTitle'),
                description: document.getElementById('projectDescription'),
                startDate: document.getElementById('startDate'),
                endDate: document.getElementById('endDate'),
                status: document.getElementById('status')
            };

            // First create the project
            const projectData = {
                project_title: formElements.title.value.trim(),
                project_description: formElements.description.value.trim(),
                project_start_date: formElements.startDate.value,
                project_end_date: formElements.endDate.value,
                project_status: formElements.status.value || 'active',
                user_id_: JSON.parse(sessionStorage.getItem('user'))?.id
            };

            // Create project
            const projectResponse = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(projectData)
            });

            if (!projectResponse.ok) {
                throw new Error('Failed to save project');
            }

            const projectResult = await projectResponse.json();
            const projectId = projectResult.project.project_id_;
            console.log('Created project with ID:', projectId);

            // Get pending tasks from sessionStorage
            const pendingTasks = JSON.parse(sessionStorage.getItem('pendingProjectTasks') || '[]');
            console.log('Pending tasks to associate:', pendingTasks);

            // Create task associations
            for (const task of pendingTasks) {
                console.log('Creating association for task:', task.task_id_);
                
                const associationResponse = await fetch(`${API_BASE}/project-tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        project_id_: projectId,
                        task_id_: task.task_id_
                    })
                });

                if (!associationResponse.ok) {
                    console.error('Failed to associate task:', task.task_id_);
                    continue;
                }

                const associationResult = await associationResponse.json();
                console.log('Task association created:', associationResult);
            }

            // Clear stored tasks
            sessionStorage.removeItem('pendingProjectTasks');

            // Close modal and clean up
            const modal = bootstrap.Modal.getInstance(document.getElementById('project-staticBackdrop'));
            if (modal) {
                modal.hide();
                setTimeout(() => {
                    document.body.classList.remove('modal-open');
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 150);
            }

            // Refresh projects display
            await fetchAndDisplayProjects();

        } catch (error) {
            console.error('Error saving project:', error);
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
    document.getElementById('addTaskBtn')?.addEventListener('click', async function(e) {
        e.stopPropagation();
        
        const taskData = {
            task_title: document.getElementById('initialTaskTitle').value.trim(),
            task_description: document.getElementById('initialDescription').value.trim(),
            task_due_date: document.getElementById('initialDueDate').value,
            task_priority: document.getElementById('initialPriority').value
        };

        if (!taskData.task_title || !taskData.task_due_date) {
            alert('Please fill in all required fields (Title and Due Date)');
            return;
        }

        try {
            await handleInitialTaskCreation(taskData);
            
            // Add to visual container
            const taskContainer = document.querySelector('.task-added-container');
            const taskElement = createInitialTaskCard(taskData);
            taskContainer.appendChild(taskElement);

            // Clear form
            document.getElementById('addInitialTaskForm').reset();
        } catch (error) {
            console.error('Error adding initial task:', error);
            alert('Failed to add initial task');
        }
    });

    // Store for temporary tasks
    let pendingProjectTasks = [];

    // Function to handle saving initial tasks
    document.getElementById('saveInitialTaskBtn').addEventListener('click', function() {
        try {
            const taskContainer = document.querySelector('.task-added-container');
            const taskCards = taskContainer.querySelectorAll('.card');
            
            if (taskCards.length === 0) {
                alert('Please add at least one task before saving');
                return;
            }

            // Store tasks in our temporary array
            pendingProjectTasks = Array.from(taskCards).map(card => ({
                task_id_: card.getAttribute('data-task-id'),
                isExistingTask: true
            }));
            
            console.log('Stored pending tasks:', pendingProjectTasks);
            
            // Close initial task modal
            const initialTaskModal = document.getElementById('add-initial-task-staticBackdrop');
            const bsInitialTaskModal = bootstrap.Modal.getInstance(initialTaskModal);
            if (bsInitialTaskModal) {
                bsInitialTaskModal.hide();
            }

        } catch (error) {
            console.error('Error saving initial tasks:', error);
            alert('Failed to save initial tasks');
        }
    });

    // Function to handle initial task creation for projects
    async function handleInitialTaskCreation(taskData) {
        try {
            // Store in temporary array instead of creating immediately
            const pendingTasks = JSON.parse(sessionStorage.getItem('pendingTasks') || '[]');
            pendingTasks.push(taskData);
            sessionStorage.setItem('pendingTasks', JSON.stringify(pendingTasks));
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    // Initialize Bootstrap modals properly
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize all modals
        const projectModal = document.getElementById('project-staticBackdrop');
        const initialTaskModal = document.getElementById('add-initial-task-staticBackdrop');
        const taskSelectionModal = document.getElementById('taskSelectionModal');

        // Create modal instances
        window.projectModalInstance = new bootstrap.Modal(projectModal);
        window.initialTaskModalInstance = new bootstrap.Modal(initialTaskModal);
        window.taskSelectionModalInstance = new bootstrap.Modal(taskSelectionModal);
    });

    // Initialize modals and button handlers
    document.addEventListener('DOMContentLoaded', function() {
        // Debug log
        console.log('Initializing project modal handlers');

        // Choose Task button handler
        const chooseTaskBtn = document.getElementById('chooseTaskBtn');
        if (chooseTaskBtn) {
            console.log('Choose Task button found');
            
            chooseTaskBtn.addEventListener('click', async function() {
                try {
                    console.log('Choose Task button clicked');
                    // Fetch existing tasks
                    const user = JSON.parse(sessionStorage.getItem('user'));
                    const response = await fetch(`${API_BASE}/tasks?userId=${user.id}`);
                    const tasks = await response.json();
                    
                    // Populate the task selection modal
                    const taskList = document.getElementById('taskList');
                    taskList.innerHTML = ''; // Clear existing list
                    
                    tasks.forEach(task => {
                        const listItem = document.createElement('li');
                        listItem.className = 'list-group-item';
                        listItem.innerHTML = `
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" 
                                       value="${task.task_id_}" 
                                       id="task_${task.task_id_}"
                                       data-task="${encodeURIComponent(JSON.stringify(task))}">
                                <label class="form-check-label" for="task_${task.task_id_}">
                                    ${task.task_title}
                                </label>
                            </div>
                        `;
                        taskList.appendChild(listItem);
                    });

                    // Show the task selection modal
                    const taskSelectionModal = new bootstrap.Modal(document.getElementById('taskSelectionModal'));
                    taskSelectionModal.show();
                } catch (error) {
                    console.error('Error loading tasks:', error);
                    alert('Failed to load tasks');
                }
            });
        } else {
            console.error('Choose Task button not found');
        }
    });

    // Function to load tasks and show modal
    async function loadTasksAndShowModal(modal) {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            if (!user || !user.id) {
                console.error('No user found in session');
                return;
            }

            console.log('Fetching tasks for user:', user.id);
            const response = await fetch(`${BASE_URL}/tasks?userId=${user.id}`);
            const tasks = await response.json();
            
            // Populate task list
            const taskList = document.getElementById('taskList');
            if (!taskList) {
                console.error('Task list element not found');
                return;
            }

            taskList.innerHTML = ''; // Clear existing list
            
            tasks.forEach(task => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" 
                               value="${task.task_id_}" 
                               id="task_${task.task_id_}"
                               data-task="${encodeURIComponent(JSON.stringify(task))}">
                        <label class="form-check-label" for="task_${task.task_id_}">
                            ${task.task_title}
                        </label>
                    </div>
                `;
                taskList.appendChild(listItem);
            });

            // Show the modal
            console.log('Showing task selection modal');
            modal.show();

        } catch (error) {
            console.error('Error in loadTasksAndShowModal:', error);
            alert('Failed to load tasks. Please try again.');
        }
    }

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded'); // Debug log
        
        // Find the Choose Task button
        const chooseTaskBtn = document.getElementById('chooseTaskBtn');
        
        if (chooseTaskBtn) {
            // Add click event listener
            chooseTaskBtn.onclick = function(e) {
                console.log('Choose Task button clicked via onclick'); // Debug log
                e.preventDefault();
                
                const taskSelectionModal = document.getElementById('taskSelectionModal');
                console.log('Task Selection Modal:', taskSelectionModal); // Debug log
                
                if (taskSelectionModal) {
                    const modal = new bootstrap.Modal(taskSelectionModal);
                    modal.show();
                } else {
                    console.error('Task selection modal not found in DOM');
                }
            };
        } else {
            console.error('Choose Task button not found in DOM');
        }
    });

    // Add this new section for the Choose Task button
    const chooseTaskBtn = document.getElementById('chooseTaskBtn');
    if (chooseTaskBtn) {
        chooseTaskBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Choose Task button clicked');

            const taskSelectionModal = document.getElementById('taskSelectionModal');
            if (taskSelectionModal) {
                const modal = new bootstrap.Modal(taskSelectionModal);
                modal.show();
            } else {
                console.error('Task selection modal not found');
            }
        });
    }

    // Call fetchAndDisplayProjects after successful project creation
    saveProjectBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        try {
            // ... your existing save logic ...

            // After successful save
            await fetchAndDisplayProjects(); // Add this line
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('project-staticBackdrop'));
            if (modal) {
                modal.hide();
            }

        } catch (error) {
            console.error('Error saving project:', error);
            alert(error.message);
        }
    });

    // Also call fetchAndDisplayProjects when the page loads
    document.addEventListener('DOMContentLoaded', function() {
        fetchAndDisplayProjects();
    });

    // Add this to fix the modal backdrop issue
    document.addEventListener('DOMContentLoaded', function() {
        // Remove any leftover modal backdrops
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    });

    // Add this function to handle project deletion
    async function handleDeleteProject(projectId, cardElement) {
        try {
            // Show confirmation dialog
            if (!confirm('Are you sure you want to delete this project?')) {
                return;
            }

            const response = await fetch(`${API_BASE}/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }

            // Remove the card from DOM
            cardElement.remove();

            // Update projects in sessionStorage
            const projects = JSON.parse(sessionStorage.getItem('projects') || '[]');
            const updatedProjects = projects.filter(p => p.project_id_ !== projectId);
            sessionStorage.setItem('projects', JSON.stringify(updatedProjects));

            // Show success message
            alert('Project deleted successfully');

        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project: ' + error.message);
        }
    }

    // Initialize project management
    function initializeProjectModal() {
        // Remove any existing listeners by cloning elements
        const saveProjectBtn = document.getElementById('saveProjectBtn');
        if (saveProjectBtn) {
            const newSaveBtn = saveProjectBtn.cloneNode(true);
            saveProjectBtn.parentNode.replaceChild(newSaveBtn, saveProjectBtn);

            // Add single event listener for project creation
            newSaveBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                
                try {
                    const formElements = {
                        titleInput: document.getElementById('projectTitle'),
                        descriptionInput: document.getElementById('projectDescription'),
                        startDateInput: document.getElementById('startDate'),
                        endDateInput: document.getElementById('endDate'),
                        statusInput: document.getElementById('status')
                    };

                    // Validate form elements exist
                    Object.entries(formElements).forEach(([key, element]) => {
                        if (!element) {
                            throw new Error(`${key} element not found`);
                        }
                    });

                    const projectData = {
                        project_title: formElements.titleInput.value.trim(),
                        project_description: formElements.descriptionInput.value.trim(),
                        project_start_date: formElements.startDateInput.value,
                        project_end_date: formElements.endDateInput.value,
                        project_status: formElements.statusInput.value,
                        user_id_: JSON.parse(sessionStorage.getItem('user')).id,
                        tasks: pendingProjectTasks
                    };

                    // Single API call
                    const response = await fetch(`${BASE_URL}/projects`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify(projectData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to create project');
                    }

                    const result = await response.json();
                    console.log('Project created successfully:', result);

                    // Clear temporary tasks
                    pendingProjectTasks = [];
                    
                    // Close modal and clean up
                    const projectModal = document.getElementById('project-staticBackdrop');
                    const bsProjectModal = bootstrap.Modal.getInstance(projectModal);
                    if (bsProjectModal) {
                        bsProjectModal.hide();
                        
                        // Clean up modal artifacts
                        setTimeout(() => {
                            document.body.classList.remove('modal-open');
                            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                            document.body.style.overflow = '';
                            document.body.style.paddingRight = '';
                        }, 150);
                    }

                    // Reset forms
                    document.getElementById('newProjectForm')?.reset();
                    document.querySelector('.task-added-container').innerHTML = '';

                    // Single call to refresh projects
                    await fetchAndDisplayProjects();

                } catch (error) {
                    console.error('Error creating project:', error);
                    alert(error.message || 'Failed to create project');
                }
            });
        }
    }

    // Initialize once when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeProjectModal();
        // Remove any duplicate event listeners for fetchAndDisplayProjects
        document.removeEventListener('DOMContentLoaded', fetchAndDisplayProjects);
    }, { once: true });

    // Remove any other instances of these event listeners
    document.removeEventListener('DOMContentLoaded', fetchAndDisplayProjects);

    // Function to handle the Choose Task button click
    document.getElementById('chooseTaskBtn').addEventListener('click', async function() {
        try {
            // Fetch existing tasks
            const user = JSON.parse(sessionStorage.getItem('user'));
            const response = await fetch(`${API_BASE}/tasks?userId=${user.id}`);
            const tasks = await response.json();
            
            // Populate the task selection modal
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = ''; // Clear existing list
            
            tasks.forEach(task => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" 
                               value="${task.task_id_}" 
                               id="task_${task.task_id_}"
                               data-task="${encodeURIComponent(JSON.stringify(task))}">
                        <label class="form-check-label" for="task_${task.task_id_}">
                            ${task.task_title}
                        </label>
                    </div>
                `;
                taskList.appendChild(listItem);
            });

            // Show the task selection modal
            const taskSelectionModal = new bootstrap.Modal(document.getElementById('taskSelectionModal'));
            taskSelectionModal.show();
        } catch (error) {
            console.error('Error loading tasks:', error);
            alert('Failed to load tasks');
        }
    });

    // Handle Add Selected button click
    document.getElementById('addSelectedTasksBtn').addEventListener('click', async function() {
        try {
            const selectedCheckboxes = document.querySelectorAll('#taskList input[type="checkbox"]:checked');
            const taskContainer = document.querySelector('.task-added-container');
            
            // Store selected tasks temporarily
            const selectedTasks = [];
            
            selectedCheckboxes.forEach(checkbox => {
                const taskData = JSON.parse(decodeURIComponent(checkbox.dataset.task));
                selectedTasks.push(taskData);
                
                // Add task card to UI only
                const taskCard = createTaskCard(taskData);
                taskContainer.appendChild(taskCard);
            });

            // Store tasks for later use when project is created
            sessionStorage.setItem('pendingProjectTasks', JSON.stringify(selectedTasks));

            // Close the selection modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('taskSelectionModal'));
            modal.hide();

        } catch (error) {
            console.error('Error adding selected tasks:', error);
            alert('Failed to add selected tasks');
        }
    });

    // Function to create task card for the added-tasks-container
    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'card mb-2';
        card.setAttribute('data-task-id', task.task_id_);
        
        card.innerHTML = `
            <div class="card-body p-2">
                <div class="d-flex justify-content-between align-items-center">
                    <h6 class="card-title mb-1">${task.task_title}</h6>
                    <button type="button" class="btn-close remove-task" aria-label="Remove"></button>
                </div>
                <div class="card-text small">
                    <div>Due: ${new Date(task.task_due_date).toLocaleDateString()}</div>
                    <div>Priority: ${task.task_priority}</div>
                </div>
            </div>
        `;

        // Add remove functionality
        card.querySelector('.remove-task').addEventListener('click', function() {
            card.remove();
        });

        return card;
    }

    // Add this variable to track current project
    let currentProjectId = null;

    // Modify your save project handler to store the project ID after creation
    saveProjectBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        try {
            // ... existing save logic ...
            const result = await response.json();
            currentProjectId = result.project_id_; // Store the new project ID
            console.log('Created project with ID:', currentProjectId);
            
            // ... rest of save logic ...
        } catch (error) {
            console.error('Error saving project:', error);
        }
    });

    // Add function to fetch associated tasks for a project
    async function fetchProjectTasks(projectId) {
        try {
            const response = await fetch(`${API_BASE}/project-tasks/${projectId}`);
            const tasks = await response.json();
            return tasks;
        } catch (error) {
            console.error('Error fetching project tasks:', error);
            return [];
        }
    }
});