// Collaboration Details Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const collaborationDetailsModal = document.getElementById('collaborationDetailsModal');
    const teamMembersList = document.getElementById('teamMembersList');
    const tasksGrid = document.getElementById('tasksGrid');
    const assignTaskBtn = document.getElementById('assignTaskBtn');
    const taskAssignmentModal = document.getElementById('taskAssignmentModal');
    const taskSelect = document.getElementById('taskSelect');
    const memberSelect = document.getElementById('memberSelect');
    const confirmAssignTaskBtn = document.getElementById('confirmAssignTask');

    let currentCollaborationId = null;
    let currentCollaborationDetails = null;

    // Function to update the modal content with collaboration details
    window.updateCollaborationDetailsModal = async function(collaborationId) {
        try {
            currentCollaborationId = collaborationId;
            const response = await fetch(`http://localhost:4000/api/collaborations/${collaborationId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            currentCollaborationDetails = data;

            // Update modal title
            document.getElementById('collaborationDetailsModalLabel').textContent = 
                `Collaboration Details - ${data.name || 'Unnamed Collaboration'}`;

            // Update team members list
            updateTeamMembersList(data.members || []);

            // Update tasks grid
            updateTasksGrid(data.tasks || []);

            // Show the modal
            const modal = new bootstrap.Modal(collaborationDetailsModal);
            modal.show();
        } catch (error) {
            console.error('Error fetching collaboration details:', error);
            alert('Failed to load collaboration details. Please try again.');
        }
    };

    function updateTeamMembersList(members) {
        teamMembersList.innerHTML = members.map(member => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${member.name || 'Unknown User'}</strong>
                    <small class="text-muted d-block">${member.email || ''}</small>
                </div>
                <span class="badge bg-primary rounded-pill">${member.role || 'Member'}</span>
            </div>
        `).join('');
    }

    function updateTasksGrid(tasks) {
        tasksGrid.innerHTML = tasks.map(task => `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">${task.title}</h6>
                        <p class="card-text small">${task.description || 'No description'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${getStatusColor(task.status)}">${task.status}</span>
                            <small class="text-muted">Due: ${new Date(task.due_date).toLocaleDateString()}</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function getStatusColor(status) {
        const statusColors = {
            'Not Started': 'secondary',
            'In Progress': 'primary',
            'Completed': 'success',
            'Delayed': 'warning',
            'Cancelled': 'danger'
        };
        return statusColors[status] || 'secondary';
    }

    // Task Assignment Modal functionality
    assignTaskBtn?.addEventListener('click', function() {
        if (!currentCollaborationDetails) return;
        
        // Populate task select
        taskSelect.innerHTML = currentCollaborationDetails.available_tasks?.map(task => 
            `<option value="${task.id}">${task.title}</option>`
        ).join('') || '<option value="">No tasks available</option>';

        // Populate member select
        memberSelect.innerHTML = currentCollaborationDetails.members?.map(member => 
            `<option value="${member.id}">${member.name}</option>`
        ).join('') || '<option value="">No members available</option>';

        const modal = new bootstrap.Modal(taskAssignmentModal);
        modal.show();
    });

    confirmAssignTaskBtn?.addEventListener('click', async function() {
        const taskId = taskSelect.value;
        const memberId = memberSelect.value;

        if (!taskId || !memberId) {
            alert('Please select both a task and a team member.');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/collaborations/assign-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    collaboration_id: currentCollaborationId,
                    task_id: taskId,
                    member_id: memberId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Close the assignment modal
            const modal = bootstrap.Modal.getInstance(taskAssignmentModal);
            modal.hide();

            // Refresh the collaboration details
            updateCollaborationDetailsModal(currentCollaborationId);

            alert('Task assigned successfully!');
        } catch (error) {
            console.error('Error assigning task:', error);
            alert('Failed to assign task. Please try again.');
        }
    });
});
