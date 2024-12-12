// Add event listener for the save button
document.getElementById('saveCollaborationBtn').addEventListener('click', handleSaveCollaboration);

// API configuration
const API_BASE_URL = 'http://localhost:4000';

// Handle save collaboration
async function handleSaveCollaboration() {
    try {
        // Get user from session
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || !user.user_id_) {
            throw new Error('User not logged in');
        }

        const formData = {
            collaboration_name: document.getElementById('collaborationName').value.trim(),
            collaboration_description: document.getElementById('collaborationDescription').value.trim(),
            collaboration_status: document.getElementById('collaborationStatus').value,
            collaboration_end_date: document.getElementById('collaborationEndDate').value,
            project_id_: document.getElementById('projectSelect').value,
            collaborator_email: document.getElementById('collaboratorEmail').value.trim(),
            user_id_: user.user_id_
        };

        // Debug log
        console.log('Sending form data:', formData);

        // Validate required fields
        if (!formData.collaboration_name || !formData.project_id_ || !formData.collaboration_end_date || !formData.collaborator_email) {
            alert('Please fill in all required fields');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/project-collaborations`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        // Log the full response for debugging
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        // Try to parse JSON response if possible
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.log('Response was not JSON:', responseText);
        }

        if (!response.ok) {
            throw new Error(responseData?.error || `Server returned ${response.status}`);
        }

        // Close modal and refresh collaborations
        const modal = bootstrap.Modal.getInstance(document.getElementById('collaboration-staticBackdrop'));
        modal.hide();
        document.getElementById('newCollaborationForm').reset();
        
        await fetchAndDisplayCollaborations();

    } catch (error) {
        console.error('Detailed error:', error);
        alert(`Failed to create collaboration: ${error.message}`);
    }
}

async function createCollaborationCard(collaboration) {
    try {
        // Check for existing card and remove it
        const existingCard = document.querySelector(`[data-collaboration-id="${collaboration.project_collaboration_id_}"]`);
        if (existingCard) {
            existingCard.remove(); // Remove existing card to prevent duplicates
        }

        const card = document.createElement('div');
        card.className = 'col-4 card d-flex card-bg';
        card.setAttribute('data-collaboration-id', collaboration.project_collaboration_id_);

        // Get project details
        let projectTitle = 'No project assigned';
        if (collaboration.project_id_) {
            try {
                const projectResponse = await fetch(`${API_BASE_URL}/api/projects/${collaboration.project_id_}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!projectResponse.ok) {
                    console.warn(`Project not found for ID: ${collaboration.project_id_}`);
                    projectTitle = 'Project not found';
                } else {
                    const project = await projectResponse.json();
                    projectTitle = project.project_title || 'Untitled Project';
                }
            } catch (error) {
                console.error('Error fetching project details:', error);
                projectTitle = 'Error loading project';
            }
        }

        const endDate = new Date(collaboration.collaboration_end_date).toLocaleDateString();

        // Set initial card content
        card.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center my-0">
                <div class="collaboration-card-title">
                    ${collaboration.collaboration_name}
                </div>
                <div class="collaboration-card-date collaboration-card-text ps-5">
                    Status: <span>${collaboration.collaboration_status}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="collaboration-card-text d-flex justify-content-between">
                    <p>End Date: <span>${endDate}</span></p>
                    <p>Member Count: <span>${collaboration.member_count || 0}</span></p>
                </div>
                <div class="row collaboration-task-project-list">
                    <div class="col-6">
                        <div class="collaboration-list-text">Associated Projects:</div>
                        <div class="collaboration-list collaboration-project-list-container">
                            <div class="project-item text-white p-2 small">
                                ${projectTitle}
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="collaboration-list-text">Associated Tasks:</div>
                        <div class="collaboration-list collaboration-tasks-list-container" id="tasks-${collaboration.project_collaboration_id_}">
                            <div class="task-item text-white p-2 mb-1 small">Loading tasks...</div>
                        </div>
                    </div>
                </div>
                <div class="d-flex gap-3 mt-3 justify-content-between">
                    <button type="button" class="card-btn-group" onclick="viewCollaborationDetails(${collaboration.project_collaboration_id_})">View Details</button>
                    <button type="button" class="card-btn-group" onclick="viewTeamOverview(${collaboration.project_collaboration_id_})">Team Overview</button>
                    <button type="button" class="card-btn-group" onclick="handleDeleteCollaboration(${collaboration.project_collaboration_id_})">Delete Collaboration</button>
                </div>
            </div>
        `;

        // Immediately load tasks after card creation
        if (collaboration.project_id_) {
            const tasksContainer = card.querySelector(`#tasks-${collaboration.project_collaboration_id_}`);
            if (tasksContainer) {
                try {
                    const tasksResponse = await fetch(`${API_BASE_URL}/api/project-tasks/${collaboration.project_id_}`, {
                        credentials: 'include'
                    });
                    
                    if (tasksResponse.ok) {
                        const tasks = await tasksResponse.json();
                        if (tasks && tasks.length > 0) {
                            tasksContainer.innerHTML = tasks
                                .map(task => `
                                    <div class="task-item text-white p-2 mb-1 small">
                                        ${task.task_title}
                                    </div>
                                `).join('');
                        } else {
                            tasksContainer.innerHTML = '<div class="task-item text-white p-2 mb-1 small">No tasks assigned</div>';
                        }
                    } else {
                        throw new Error('Failed to fetch tasks');
                    }
                } catch (error) {
                    console.error('Error loading tasks:', error);
                    tasksContainer.innerHTML = '<div class="task-item text-white p-2 mb-1 small">Error loading tasks</div>';
                }
            }
        }

        return card;
    } catch (error) {
        console.error('Error creating collaboration card:', error);
        return null;
    }
}

// Create a flag to track initialization
let isInitialized = false;

window.fetchAndDisplayCollaborations = async function() {
    // Prevent multiple initializations
    if (isInitialized) {
        console.log('Already fetching collaborations, skipping duplicate call');
        return;
    }
    
    isInitialized = true;

    const collaborationsContainer = document.querySelector('.collaboration-card-container .row');
    if (!collaborationsContainer) {
        console.error('Collaborations container not found');
        isInitialized = false;
        return;
    }

    try {
        const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'));
        if (!user || !user.user_id_) {
            throw new Error('User not logged in');
        }

        // Clear existing cards
        collaborationsContainer.innerHTML = '';

        const response = await fetch(`${API_BASE_URL}/api/project-collaborations?userId=${user.user_id_}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'User-ID': user.user_id_
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch collaborations');
        }

        const collaborations = await response.json();
        console.log('Fetched collaborations:', collaborations);

        // Process each collaboration only once
        const processedCollaborations = new Map();
        
        for (const collaboration of collaborations) {
            if (!processedCollaborations.has(collaboration.project_collaboration_id_)) {
                const card = await createCollaborationCard(collaboration);
                if (card) {
                    collaborationsContainer.appendChild(card);
                    processedCollaborations.set(collaboration.project_collaboration_id_, true);
                }
            }
        }

        if (processedCollaborations.size === 0) {
            collaborationsContainer.innerHTML = '<div class="col-12"><p class="text-center">No collaborations found</p></div>';
        }

    } catch (error) {
        console.error('Error fetching collaborations:', error);
        collaborationsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    ${error.message}
                </div>
            </div>
        `;
    } finally {
        // Reset the flag after completion
        isInitialized = false;
    }
};

// Remove all other event listeners first
document.removeEventListener('DOMContentLoaded', fetchAndDisplayCollaborations);

// Add single event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing collaborations');
    const collaborationContainer = document.querySelector('.collaboration-card-container');
    if (collaborationContainer && !isInitialized) {
        fetchAndDisplayCollaborations();
    }
});

// Export function to be used elsewhere if needed
window.refreshCollaborations = async function() {
    if (!isInitialized) {
        await fetchAndDisplayCollaborations();
    }
};

async function loadUserProjects() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || !user.user_id_) {
            throw new Error('User not found or invalid');
        }

        const response = await fetch(`${API_BASE_URL}/api/projects?userId=${user.user_id_}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();
        console.log('Loaded projects:', projects);

        const projectSelect = document.getElementById('projectSelect');
        if (!projectSelect) {
            throw new Error('Project select element not found');
        }

        projectSelect.innerHTML = '<option value="">Choose a project...</option>';

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.project_id_;
            option.textContent = project.project_title;
            projectSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading projects:', error);
        alert('Failed to load projects: ' + error.message);
    }
}

// Initialize modal events
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('collaboration-staticBackdrop');
    if (modal) {
        modal.addEventListener('show.bs.modal', () => {
            console.log('Loading projects for modal...');
            loadUserProjects();
        });
    }
});

async function handleDeleteCollaboration(collaborationId) {
    try {
        const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'));
        if (!user || !user.user_id_) {
            throw new Error('User not logged in');
        }

        // Get collaboration details to check role
        const response = await fetch(`${API_BASE_URL}/api/project-collaborations/${collaborationId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch collaboration details');
        }

        const collaboration = await response.json();
        console.log('Collaboration details:', collaboration);

        // Check if user is admin of this collaboration
        const isAdmin = collaboration.user_id_ === user.user_id_ && 
                       collaboration.user_collab_role === 'admin';

        // Different confirmation messages based on role
        const confirmMessage = isAdmin 
            ? 'Are you sure you want to delete this collaboration for all members?' 
            : 'Are you sure you want to leave this collaboration?';

        if (!confirm(confirmMessage)) {
            return;
        }

        const deleteResponse = await fetch(`${API_BASE_URL}/api/project-collaborations/${collaborationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                user_id_: user.user_id_,
                is_admin: isAdmin
            })
        });

        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(errorData.error || 'Failed to delete collaboration');
        }

        const result = await deleteResponse.json();
        console.log('Delete result:', result);

        alert(result.message);

        // Remove the card from UI
        const card = document.querySelector(`[data-collaboration-id="${collaborationId}"]`);
        if (card) {
            card.remove();
        }

        // Refresh collaborations list if it was a full delete
        if (result.isFullDelete) {
            await fetchAndDisplayCollaborations();
        }

    } catch (error) {
        console.error('Error deleting collaboration:', error);
        alert('Failed to delete collaboration: ' + error.message);
    }
}

// Update the viewCollaborationDetails function in your card
async function viewCollaborationDetails(collaborationId) {
    try {
        // Fetch collaboration details first
        const response = await fetch(`${API_BASE_URL}/api/project-collaborations/${collaborationId}`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch collaboration details');
        }

        const collaboration = await response.json();
        await handleViewCollaborationDetails(collaboration);

    } catch (error) {
        console.error('Error in viewCollaborationDetails:', error);
        alert('Failed to load collaboration details');
    }
}

// Function to handle viewing collaboration details
async function handleViewCollaborationDetails(collaboration) {
    try {
        // Update modal content with collaboration details
        document.getElementById('collaborationTitle').textContent = collaboration.collaboration_name;
        document.getElementById('collaborationEndDate').textContent = `End Date: ${new Date(collaboration.collaboration_end_date).toLocaleDateString()}`;
        document.getElementById('collaborationStatus').textContent = collaboration.collaboration_status;
        
        // Set status badge color
        const statusBadge = document.getElementById('collaborationStatus');
        statusBadge.className = 'badge ' + (collaboration.collaboration_status === 'Active' ? 'bg-success' : 'bg-warning');

        // Fetch team members
        const membersResponse = await fetch(`${API_BASE_URL}/api/project-collaborations/${collaboration.project_collaboration_id_}/members`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!membersResponse.ok) {
            throw new Error(`Failed to fetch team members: ${membersResponse.status}`);
        }
        const members = await membersResponse.json();
        console.log('Team members:', members);

        // Update team members list
        const teamMembersList = document.getElementById('teamMembersList');
        teamMembersList.innerHTML = members.length ? members.map(member => `
            <div class="list-group-item d-flex justify-content-between align-items-center fs-6">
                <div>
                    <strong>${member.username}</strong>
                    <small class="text-muted">${member.user_email}</small>
                </div>
                <span class="badge bg-primary">${member.user_collab_role}</span>
            </div>
        `).join('') : '<div class="list-group-item">No team members found</div>';

        // Fetch project tasks using the correct endpoint
        if (collaboration.project_collaboration_id_) {
            const tasksResponse = await fetch(`${API_BASE_URL}/api/project-collaborations/${collaboration.project_collaboration_id_}/tasks`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!tasksResponse.ok) {
                throw new Error(`Failed to fetch tasks: ${tasksResponse.status}`);
            }
            const tasks = await tasksResponse.json();
            console.log('Project tasks:', tasks);

            // Update tasks grid
            const tasksGrid = document.getElementById('tasksGrid');
            tasksGrid.innerHTML = tasks.length ? tasks.map(task => `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">${task.task_title}</h6>
                            <p class="card-text small">${task.task_description || 'No description'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-${task.task_priority === 'high' ? 'danger' : 'info'}">${task.task_priority}</span>
                                <small class="text-muted">Due: ${new Date(task.task_due_date).toLocaleDateString()}</small>
                            </div>
                            ${task.username ? `
                                <div class="mt-2 text-muted small">
                                    Assigned to: ${task.username}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('') : '<div class="col-12">No tasks available</div>';
        } else {
            document.getElementById('tasksGrid').innerHTML = '<div class="col-12">No project associated with this collaboration</div>';
        }

        // Show the modal
        const collaborationDetailsModal = new bootstrap.Modal(document.getElementById('collaborationDetailsModal'));
        collaborationDetailsModal.show();

    } catch (error) {
        console.error('Error loading collaboration details:', error);
        alert('Failed to load collaboration details: ' + error.message);
    }
}

// Add event listener for task assignment
document.getElementById('assignTaskBtn').addEventListener('click', () => {
    const taskAssignmentModal = new bootstrap.Modal(document.getElementById('taskAssignmentModal'));
    taskAssignmentModal.show();
});

// Add event listener for task assignment confirmation
document.getElementById('confirmAssignTask').addEventListener('click', async () => {
    const taskId = document.getElementById('taskSelect').value;
    const assigneeId = document.getElementById('memberSelect').value;

    if (!taskId || !assigneeId) {
        alert('Please select both a task and a team member');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/team/task-assignments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task_id_: taskId,
                assigned_to_: assigneeId,
                assigned_by_: JSON.parse(sessionStorage.getItem('user')).user_id_
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to assign task');
        }

        alert('Task assigned successfully');
        const taskAssignmentModal = bootstrap.Modal.getInstance(document.getElementById('taskAssignmentModal'));
        taskAssignmentModal.hide();

    } catch (error) {
        console.error('Error assigning task:', error);
        alert(error.message || 'Failed to assign task. Please try again.');
    }
});

// Make functions available globally
window.viewCollaborationDetails = viewCollaborationDetails;
window.handleViewCollaborationDetails = handleViewCollaborationDetails;