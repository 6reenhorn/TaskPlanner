// Initialize modals
const collaborationDetailsModal = new bootstrap.Modal(document.getElementById('collaborationDetailsModal'));
const taskAssignmentModal = new bootstrap.Modal(document.getElementById('taskAssignmentModal'));

let currentCollaboration = null;

async function showCollaborationDetails(collaborationId) {
    try {
        // Fetch collaboration details
        const response = await fetch(`${API_BASE}/project-collaborations/${collaborationId}/details`);
        if (!response.ok) {
            throw new Error('Failed to fetch collaboration details');
        }

        const data = await response.json();
        currentCollaboration = data;
        
        // Update modal content
        document.getElementById('collaborationTitle').textContent = data.collaboration_name;
        document.getElementById('collaborationEndDate').textContent = `Ends: ${formatDate(data.collaboration_end_date)}`;
        
        // Set status badge color
        const statusBadge = document.getElementById('collaborationStatus');
        statusBadge.textContent = data.collaboration_status;
        statusBadge.className = `badge ${data.collaboration_status === 'active' ? 'bg-success' : 'bg-warning'}`;

        // Populate team members
        await loadTeamMembers(collaborationId);

        // Populate tasks
        await loadTasks(collaborationId);

        // Show modal
        collaborationDetailsModal.show();

    } catch (error) {
        console.error('Error showing collaboration details:', error);
        alert('Failed to load collaboration details');
    }
}

async function loadTeamMembers(collaborationId) {
    try {
        const response = await fetch(`${API_BASE}/project-collaborations/${collaborationId}/members`);
        if (!response.ok) {
            throw new Error('Failed to fetch team members');
        }

        const members = await response.json();
        const membersList = document.getElementById('teamMembersList');
        membersList.innerHTML = '';

        members.forEach(member => {
            membersList.innerHTML += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${member.username}</strong>
                        <small class="text-muted d-block">${member.user_email}</small>
                    </div>
                    <span class="badge bg-primary">${member.user_collab_role}</span>
                </div>
            `;
        });

    } catch (error) {
        console.error('Error loading team members:', error);
        alert('Failed to load team members');
    }
}

async function loadTasks(collaborationId) {
    try {
        const response = await fetch(`${API_BASE}/task-assignments/collaboration/${collaborationId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();
        const tasksGrid = document.getElementById('tasksGrid');
        tasksGrid.innerHTML = '';

        tasks.forEach(task => {
            tasksGrid.innerHTML += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">${task.task_title}</h6>
                            <p class="card-text">
                                <small class="text-muted">Due: ${formatDate(task.due_date)}</small><br>
                                <small>Assigned by: ${task.assigned_by_name}</small><br>
                                <small>Assigned to: ${task.assigned_to_name}</small>
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Failed to load tasks');
    }
}

// Handle Assign Task button click
document.getElementById('assignTaskBtn').addEventListener('click', async () => {
    try {
        // Check if user is admin
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || (user.user_role !== 'admin' && currentCollaboration.user_id_ !== user.user_id_)) {
            alert('Only admins can assign tasks');
            return;
        }

        // Load available tasks
        const tasksResponse = await fetch(`${API_BASE}/tasks/project/${currentCollaboration.project_id_}`);
        if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
        
        const tasks = await tasksResponse.json();
        const taskSelect = document.getElementById('taskSelect');
        taskSelect.innerHTML = '<option value="">Select a task...</option>';
        tasks.forEach(task => {
            taskSelect.innerHTML += `<option value="${task.task_id_}">${task.task_title}</option>`;
        });

        // Load team members for assignment
        const membersResponse = await fetch(`${API_BASE}/project-collaborations/${currentCollaboration.project_collaboration_id_}/members`);
        if (!membersResponse.ok) throw new Error('Failed to fetch members');
        
        const members = await membersResponse.json();
        const memberSelect = document.getElementById('memberSelect');
        memberSelect.innerHTML = '<option value="">Select a member...</option>';
        members.forEach(member => {
            memberSelect.innerHTML += `<option value="${member.user_id_}">${member.username}</option>`;
        });

        taskAssignmentModal.show();

    } catch (error) {
        console.error('Error preparing task assignment:', error);
        alert('Failed to prepare task assignment');
    }
});

// Handle task assignment submission
document.getElementById('confirmAssignTask').addEventListener('click', async () => {
    try {
        const taskId = document.getElementById('taskSelect').value;
        const assignedTo = document.getElementById('memberSelect').value;

        if (!taskId || !assignedTo) {
            alert('Please select both a task and a team member');
            return;
        }

        const user = JSON.parse(sessionStorage.getItem('user'));
        const response = await fetch(`${API_BASE}/task-assignments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_collaboration_id_: currentCollaboration.project_collaboration_id_,
                task_id_: taskId,
                assigned_to_: assignedTo,
                assigned_by_: user.user_id_
            })
        });

        if (!response.ok) {
            throw new Error('Failed to assign task');
        }

        // Close assignment modal and refresh tasks
        taskAssignmentModal.hide();
        await loadTasks(currentCollaboration.project_collaboration_id_);
        alert('Task assigned successfully');

    } catch (error) {
        console.error('Error assigning task:', error);
        alert('Failed to assign task');
    }
});

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export functions for use in other files
export {
    showCollaborationDetails
}; 