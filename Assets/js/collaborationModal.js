// Add event listener for the save button
document.getElementById('saveCollaborationBtn').addEventListener('click', handleSaveCollaboration);

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

        const response = await fetch(`${API_BASE}/project-collaborations`, {
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

function createCollaborationCard(collaboration) {
    const card = document.createElement('div');
    card.className = 'col-4 card d-flex card-bg';
    card.setAttribute('data-collaboration-id', collaboration.project_collaboration_id_);

    const endDate = new Date(collaboration.collaboration_end_date).toLocaleDateString();

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
                <p>
                    End Date: <span>${endDate}</span>
                </p>
                <p>
                    Member Count: <span>${collaboration.member_count || 0}</span>
                </p>
            </div>
            <div class="row collaboration-task-project-list">
                <div class="col-6">
                    <div class="collaboration-list-text">Associated Projects:</div>
                    <div class="collaboration-list collaboration-project-list-container">
                        <div class="project-item text-white p-2 small">
                            ${collaboration.project_title || 'No project assigned'}
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="collaboration-list-text">Associated Tasks:</div>
                    <div class="collaboration-list collaboration-tasks-list-container">
                        ${collaboration.tasks ? collaboration.tasks.map(task => 
                            `<div class="task-item text-white p-2 small">${task.task_title}</div>`
                        ).join('') : '<div class="task-item text-white p-2 mb-1 small">No tasks assigned</div>'}
                    </div>
                </div>
            </div>
            <div class="d-flex gap-3 mt-3 justify-content-between">
                <button type="button" class="card-btn-group">View Details</button>
                <button type="button" class="card-btn-group">Team Overview</button>
                <button type="button" class="card-btn-group">Delete Collaboration</button>
            </div>
        </div>
    `;

    const deleteBtn = card.querySelector('.card-btn-group:last-child');
    deleteBtn.addEventListener('click', () => handleDeleteCollaboration(collaboration.project_collaboration_id_));

    return card;
}

async function fetchAndDisplayCollaborations() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || !user.user_id_) {
            console.error('No user found in session or missing user_id_');
            return;
        }

        console.log('Fetching collaborations for user ID:', user.user_id_);
        const response = await fetch(`${API_BASE}/project-collaborations?userId=${user.user_id_}`);
        
        // Add debug logging
        console.log('Collaboration response status:', response.status);
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        let collaborations;
        try {
            collaborations = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse collaborations:', e);
            return;
        }

        console.log('Parsed collaborations:', collaborations);

        const container = document.querySelector('.collaboration-card-container');
        if (!container) {
            console.error('Collaboration container not found');
            return;
        }

        container.innerHTML = '<div class="row d-flex justify-content-between my-2"></div>';
        const row = container.querySelector('.row');

        if (!Array.isArray(collaborations) || collaborations.length === 0) {
            row.innerHTML = '<div class="col text-center">No collaborations found</div>';
            return;
        }

        for (const collab of collaborations) {
            try {
                const tasksResponse = await fetch(`${API_BASE}/project-tasks/${collab.project_id_}`);
                collab.tasks = tasksResponse.ok ? await tasksResponse.json() : [];
                
                const card = createCollaborationCard(collab);
                row.appendChild(card);
            } catch (error) {
                console.error(`Error processing collaboration ${collab.project_id_}:`, error);
            }
        }
    } catch (error) {
        console.error('Error fetching collaborations:', error);
    }
}

// Function to populate project select dropdown
async function loadUserProjects() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        // Use user.id since that's how it's stored in session
        const response = await fetch(`${API_BASE}/projects?userId=${user.id}`);
        const projects = await response.json();

        const projectSelect = document.getElementById('projectSelect');
        projectSelect.innerHTML = '<option value="">Choose a project...</option>';

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.project_id_;
            option.textContent = project.project_title;
            projectSelect.appendChild(option);
        });

        // Debug log
        console.log('Loaded projects:', projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Call this function when the modal is shown
document.getElementById('collaboration-staticBackdrop').addEventListener('show.bs.modal', function () {
    loadUserProjects();
});

async function handleDeleteCollaboration(collaborationId) {
    try {
        if (!confirm('Are you sure you want to delete this collaboration?')) {
            return;
        }

        const response = await fetch(`${API_BASE}/project-collaborations/${collaborationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete collaboration');
        }

        // Remove the card from the UI
        const card = document.querySelector(`[data-collaboration-id="${collaborationId}"]`);
        if (card) {
            card.remove();
        }

        // Refresh the collaborations display
        await fetchAndDisplayCollaborations();

    } catch (error) {
        console.error('Error deleting collaboration:', error);
        alert('Failed to delete collaboration. Please try again.');
    }
}