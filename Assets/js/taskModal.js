const BASE_URL = 'http://localhost:4000/api';

fetch(`${BASE_URL}/tasks`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(tasks => {
        console.log('Tasks from server:', tasks);
        tasks.forEach(task => {
            console.log('Task data:', task);
            console.log('Task ID:', task.task_id_);
        });
    })
    .catch(err => {
        console.error('Error fetching tasks:', err);
        // Handle the error appropriately
    });

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    console.log('Create button exists:', !!document.getElementById('createTaskBtn'));
    console.log('Update button exists:', !!document.getElementById('updateTaskBtn'));
    console.log('Edit buttons exist:', !!document.querySelectorAll('.task-btn-edit').length);
    
    console.log('DOM Content Loaded'); // Debug log
    
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    
    if (!saveTaskBtn || !cancelTaskBtn) {
        console.error('Save or Cancel Task Button not found!');
        return;
    }
    
    // Save task functionality
    saveTaskBtn.addEventListener('click', async function() {
        // Check if form is valid
        const form = document.getElementById('newTaskForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const taskId = this.getAttribute('data-task-id');
        const isEdit = !!taskId;

        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            
            const taskData = {
                task_title: document.getElementById('taskTitle').value,
                task_description: document.getElementById('description').value,
                task_due_date: document.getElementById('dueDate').value,
                task_priority: document.getElementById('priority').value,
                user_id_: user.user_id_
            };

            console.log('Sending request to:', isEdit ? `http://localhost:4000/api/tasks/${taskId}` : 'http://localhost:4000/api/tasks');
            console.log('Request method:', isEdit ? 'PUT' : 'POST');
            console.log('Task data:', taskData);

            const url = isEdit 
                ? `http://localhost:4000/api/tasks/${taskId}`
                : 'http://localhost:4000/api/tasks';

            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(taskData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(isEdit ? 'Task updated successfully:' : 'Task saved successfully:', result);

            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('task-staticBackdrop'));
            modal.hide();
            document.getElementById('newTaskForm').reset();

            // Refresh tasks display
            await fetchAndDisplayTasks();

        } catch (error) {
            console.error(isEdit ? 'Error updating task:' : 'Error saving task:', error);
            alert(isEdit ? 'Error updating task. Please try again.' : 'Error saving task. Please try again.');
        }
    });

    // Cancel button uses Bootstrap's data-bs-dismiss="modal"
    // No additional JavaScript needed for cancel
});

// Function to fetch and display tasks
async function fetchAndDisplayTasks() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || !user.user_id_) {
            console.log('No user found in session');
            return;
        }

        const response = await fetch(`${BASE_URL}/tasks?userId=${user.user_id_}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tasks = await response.json();
        console.log('Fetched tasks:', tasks);

        // Update main task container (Task Management Page)
        const taskContainer = document.getElementById('taskContainer');
        if (taskContainer) {
            taskContainer.innerHTML = ''; // Clear existing tasks

            if (Array.isArray(tasks) && tasks.length > 0) {
                tasks.forEach(task => {
                    if (task.user_id_ === user.user_id_) {
                        const taskCard = createTaskCard(task);
                        taskContainer.appendChild(taskCard);
                    }
                });
            } else {
                taskContainer.innerHTML = '<p class="text-center">No tasks found</p>';
            }
        }

        // Update upcoming tasks in dashboard
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection && dashboardSection.classList.contains('active')) {
            console.log('Updating dashboard upcoming tasks');
            updateUpcomingTasks(tasks.filter(task => task.user_id_ === user.user_id_));
        }

    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayTasks);

// Function to create a task card
function createTaskCard(task) {
    console.log('Task object for card:', task); // Log the entire task object
    const taskCard = document.createElement('div');
    taskCard.className = 'col-4 card d-flex card-bg mb-3';
    taskCard.setAttribute('data-task-id', task.task_id_);
    taskCard.setAttribute('data-checklist-id', task.unified_checklist_id_);
    console.log('Creating card with task ID:', task.task_id_);

    // Format the date to be more readable
    const dueDate = new Date(task.task_due_date).toLocaleDateString();

    taskCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center my-0">
            ${task.task_title}
            <form action="">
                <input type="checkbox" 
                       id="task-completion-${task.task_id_}" 
                       name="task-completion" 
                       value="Completed" 
                       ${task.is_completed ? 'checked disabled' : ''}
                       onchange="handleCheckboxChange(${task.unified_checklist_id_ || 'null'})">
            </form>
        </div>
        <div class="card-body">
            <ul class="card-text mt-0">
                <li>Due: <span>${dueDate}</span></li>
                <li>Status: <span>${task.task_status}</span></li>
                <li>Priority: <span>${task.task_priority}</span></li>
            </ul>
            <div class="card-btn-group d-flex gap-2">
                <button type="button" class="card-btn-group task-btn-edit">Edit</button>
                <button type="button" class="card-btn-group task-btn-delete">Delete</button>
                <button type="button" class="card-btn-group task-btn-comment" onclick="alert('Comment feature coming soon!')">Comment</button>
            </div>
            <div class="d-flex align-items-end gap-5">
                <div class="col-auto task-card-description">
                    <p class="card-description-text">${task.task_description || ''}</p>
                </div>
                <div class="col-auto profile-logo">
                    <img src="" alt="">
                </div>
            </div>
        </div>
    `;

    return taskCard;
}

// Fetch tasks and update UI
async function fetchTasks() {
    try {
        const response = await fetch(`${BASE_URL}/tasks`, {
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tasks = await response.json();
        console.log('Fetched tasks:', tasks);
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

// Function to delete a task
async function deleteTask(taskId) {
    try {
        console.log('Deleting task with ID:', taskId);

        const response = await fetch(`http://localhost:4000/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        console.log('Delete response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Task deleted successfully');
        await fetchAndDisplayTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
    }
}

// Add event listener to delete buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('task-btn-delete')) {
        const taskCard = e.target.closest('.card');
        const taskId = taskCard.getAttribute('data-task-id');
        const taskTitle = taskCard.querySelector('.card-header').textContent.trim();

        if (confirm(`Are you sure you want to delete the task "${taskTitle}"?`)) {
            deleteTask(taskId);
        }
    }
});

// Function to filter and display today's tasks
function updateUpcomingTasks(tasks) {
    console.log('Updating upcoming tasks with:', tasks);
    
    // Update selector to match your HTML structure
    const upcomingTasksContainer = document.querySelector('.upcoming-task .row.my-1.d-flex.align-items-center.mb-2');
    if (!upcomingTasksContainer) {
        console.error('Upcoming tasks container not found');
        return;
    }
    
    // Clear existing timers
    const existingRows = upcomingTasksContainer.querySelectorAll('[data-task-id]');
    existingRows.forEach(row => {
        if (row._timer) {
            clearInterval(row._timer);
        }
    });
    
    upcomingTasksContainer.innerHTML = '';

    // Get today's date and date 2 days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    console.log('Filtering tasks between:', today, 'and', twoDaysFromNow);

    let visibleIndex = 0;
    let upcomingTasksFound = false;

    tasks.forEach(task => {
        const taskDueDate = new Date(task.task_due_date);
        taskDueDate.setHours(23, 59, 59, 0); // Set to end of the due date

        console.log('Checking task:', task.task_title, 'due date:', taskDueDate);

        // Check if task is due within next 2 days
        if (taskDueDate >= today && taskDueDate <= twoDaysFromNow) {
            console.log('Task is upcoming:', task.task_title);
            const taskRow = createTaskRow(task, visibleIndex);
            upcomingTasksContainer.appendChild(taskRow);
            visibleIndex++;
            upcomingTasksFound = true;
        }
    });

    if (!upcomingTasksFound) {
        console.log('No upcoming tasks found');
        upcomingTasksContainer.innerHTML = `
            <div class="col-12 text-center">
                <p>No upcoming tasks</p>
            </div>
        `;
    }
}

function createTaskRow(task, visibleIndex) {
    console.log('Creating task row for:', task);
    
    const taskRow = document.createElement('div');
    taskRow.className = 'row my-1 d-flex align-items-center';
    taskRow.setAttribute('data-task-id', task.task_id_);
    taskRow.style.fontSize = '14px';
    taskRow.style.padding = '0 5px';

    function updateRemainingTime() {
        const now = new Date();
        const createdAt = new Date(task.created_at);
        const dueDate = new Date(task.task_due_date);
        dueDate.setHours(23, 59, 59, 0); // Set to end of the due date
        
        const diffTime = dueDate - now;
        
        if (diffTime <= 0) {
            return 'Task overdue';
        }

        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

        // Show how long ago the task was created
        const timeSinceCreation = Math.floor((now - createdAt) / (1000 * 60)); // minutes
        const creationInfo = timeSinceCreation < 60 
            ? `Created ${timeSinceCreation}m ago` 
            : `Created ${Math.floor(timeSinceCreation / 60)}h ${timeSinceCreation % 60}m ago`;

        let timeRemaining = '';
        if (days > 0) {
            timeRemaining = `${days}d ${hours}h ${minutes}m ${seconds}s until due`;
        } else {
            timeRemaining = `${hours}h ${minutes}m ${seconds}s until due`;
        }

        return `${creationInfo} | ${timeRemaining}`;
    }

    taskRow.innerHTML = `
        <div class="col-1 px-1 text-end">
            ${visibleIndex + 1}.
        </div>
        <div class="col-3 px-1 text-start">
            ${task.task_title}
        </div>
        <div class="col-4 remaining-time px-1">
            ${updateRemainingTime()}
        </div>
        <div class="col-3 px-1 text-end">
            <button type="button" class="upper-btn btn btn-sm" style="font-size: 10px; padding: 1px 4px;">
                <i class="fas fa-edit"></i> Edit
            </button>
        </div>
        <div class="col-1 text-center">
            <input type="checkbox" class="form-check-input" id="task-${task.task_id_}" name="task-completion">
        </div>
    `;

    const timeElement = taskRow.querySelector('.remaining-time');
    const timer = setInterval(() => {
        timeElement.textContent = updateRemainingTime();
    }, 1000);

    taskRow._timer = timer;

    return taskRow;
}

function createActivityRow(activity, index) {
    const activityRow = document.createElement('div');
    activityRow.className = 'row my-2 align-items-center mb-2 recent-activity-text';
    
    // Format the timestamp safely
    let formattedTimestamp = 'N/A';
    try {
        if (activity.activity_log_timestamp) {
            formattedTimestamp = new Date(activity.activity_log_timestamp).toLocaleString();
        }
    } catch (err) {
        console.error('Error formatting timestamp:', err);
    }

    activityRow.innerHTML = `
        <div class="col-6">
            <span>${index + 1}.</span> ${activity.task_title || 'Unknown Task'}
        </div>
        <div class="col-6">
            <span>(${activity.activity_log_action || 'Unknown Action'})</span>
            <small class="text-muted">${formattedTimestamp}</small>
        </div>
    `;

    // Debug log to see what data we're receiving
    console.log('Activity data:', {
        title: activity.task_title,
        action: activity.activity_log_action,
        timestamp: activity.activity_log_timestamp
    });

    return activityRow;
}

function updateRecentActivity(activities) {
    console.log('Updating activities:', activities); // Debug log
    const recentActivityContainer = document.querySelector('.recent-activity');
    
    if (!recentActivityContainer) {
        console.error('Could not find recent activity container');
        return;
    }

    // Clear existing content
    recentActivityContainer.innerHTML = '';

    // Add new activity rows
    activities.forEach((activity, index) => {
        const activityRow = createActivityRow(activity, index);
        recentActivityContainer.appendChild(activityRow);
    });
}

// When a task is added, update the recent activity
function addTask(taskData) {
    fetch('http://localhost:4000/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Task added:', data);
        updateRecentActivity(data.recentActivities); // Update recent activity
    })
    .catch(err => console.error('Error adding task:', err));
}

function fetchRecentActivities() {
    console.log('Fetching activities...');
    fetch(`${BASE_URL}/activities`)
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(activities => {
            console.log('Received activities:', activities);
            if (activities && activities.length > 0) {
                updateRecentActivity(activities);
            } else {
                console.log('No activities found');
            }
        })
        .catch(err => {
            console.error('Error fetching activities:', err);
        });
}

// Call this function when the page loads or after adding a task
document.addEventListener('DOMContentLoaded', fetchRecentActivities);

// Function to set modal mode (create or edit)
function setModalMode(mode, taskData = null) {
    const modalTitle = document.querySelector('#task-staticBackdrop .modal-title');
    const createButton = document.getElementById('createTaskBtn');
    const updateButton = document.getElementById('updateTaskBtn');
    
    if (mode === 'edit') {
        modalTitle.textContent = 'Edit Task';
        createButton.style.display = 'none';
        updateButton.style.display = 'block';
        
        // Fill form with existing task data
        document.getElementById('taskTitle').value = taskData.task_title;
        document.getElementById('dueDate').value = taskData.task_due_date;
        document.getElementById('priority').value = taskData.task_priority;
        document.getElementById('description').value = taskData.task_description || '';
        
        // Store task ID for update
        updateButton.setAttribute('data-task-id', taskData.task_id_);
    } else {
        modalTitle.textContent = 'Add New Task';
        createButton.style.display = 'block';
        updateButton.style.display = 'none';
        document.getElementById('newTaskForm').reset();
        updateButton.removeAttribute('data-task-id');
    }
}

// Edit button click handler
document.addEventListener('click', function(e) {
    const editButton = e.target.closest('.task-btn-edit');
    if (!editButton) return;
    
    console.log('Edit button clicked');
    const taskCard = editButton.closest('.card');
    if (!taskCard) {
        console.error('No task card found');
        return;
    }
    
    const taskId = taskCard.getAttribute('data-task-id');
    console.log('Task ID:', taskId);
    
    // Get task data from the card
    const taskData = {
        task_id_: taskId,
        task_title: taskCard.querySelector('.card-header').textContent.trim(),
        task_due_date: new Date(taskCard.querySelector('li:first-child span').textContent).toISOString().split('T')[0],
        task_priority: taskCard.querySelector('li:last-child span').textContent.toLowerCase(),
        task_description: taskCard.querySelector('.card-description-text')?.textContent.trim() || ''
    };

    console.log('Edit task data:', taskData);
    
    // Update the modal with task data
    document.getElementById('taskTitle').value = taskData.task_title;
    document.getElementById('dueDate').value = taskData.task_due_date;
    document.getElementById('priority').value = taskData.task_priority;
    document.getElementById('description').value = taskData.task_description;
    
    // Show update button, hide create button
    document.getElementById('createTaskBtn').style.display = 'none';
    const updateButton = document.getElementById('updateTaskBtn');
    updateButton.style.display = 'block';
    updateButton.setAttribute('data-task-id', taskId);
    
    // Update modal title
    document.querySelector('#task-staticBackdrop .modal-title').textContent = 'Edit Task';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('task-staticBackdrop'));
    modal.show();
});

// Update task button handler
document.getElementById('updateTaskBtn').addEventListener('click', async function() {
    try {
        const taskId = this.getAttribute('data-task-id');
        if (!taskId) {
            console.error('No task ID found');
            return;
        }

        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || !user.user_id_) {
            console.error('No user found in session');
            return;
        }

        const taskData = {
            task_title: document.getElementById('taskTitle').value.trim(),
            task_description: document.getElementById('description').value.trim(),
            task_due_date: document.getElementById('dueDate').value,
            task_priority: document.getElementById('priority').value,
            user_id_: user.user_id_
        };

        console.log('Updating task:', taskData);

        const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update task: ${response.status}`);
        }

        const result = await response.json();
        console.log('Task updated successfully:', result);

        // Refresh tasks
        await fetchAndDisplayTasks();

    } catch (error) {
        console.error('Error updating task:', error);
        alert(error.message);
    } finally {
        // Close modal and reset to create mode
        const modalElement = document.getElementById('task-staticBackdrop');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        resetModalToCreateMode();
    }
});

// Standalone task creation function for the task management modal
async function handleStandaloneTaskCreation(taskData) {
    try {
        // Debug logs
        console.log('Task data before sending:', taskData);
        console.log('Request body:', JSON.stringify({ 
            task_title: taskData.task_title,
            task_description: taskData.task_description,
            task_due_date: taskData.task_due_date,
            task_priority: taskData.task_priority,
            user_id_: taskData.user_id_
        }));

        const response = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(taskData) // Send taskData directly
        });

        console.log('Response status:', response.status);
        
        // Log the actual response body for debugging
        const responseText = await response.text();
        console.log('Response body:', responseText);

        // Parse the response only if it's JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Server response: ${responseText}`);
        }

        if (!response.ok) {
            throw new Error(responseData.error || 'Failed to create task');
        }

        return responseData;
    } catch (error) {
        console.error('Detailed error:', error);
        throw error;
    }
}

// Single event listener for create task button
function initializeTaskModal() {
    const createTaskBtn = document.getElementById('createTaskBtn');
    const updateTaskBtn = document.getElementById('updateTaskBtn');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    const modalElement = document.getElementById('task-staticBackdrop');
    const form = document.getElementById('newTaskForm');

    // Remove any existing listeners
    createTaskBtn?.replaceWith(createTaskBtn.cloneNode(true));
    updateTaskBtn?.replaceWith(updateTaskBtn.cloneNode(true));
    cancelTaskBtn?.replaceWith(cancelTaskBtn.cloneNode(true));

    // Get fresh references after replacing
    const newCreateBtn = document.getElementById('createTaskBtn');
    const newUpdateBtn = document.getElementById('updateTaskBtn');
    const newCancelBtn = document.getElementById('cancelTaskBtn');

    // Single create task listener
    newCreateBtn?.addEventListener('click', async function(e) {
        e.preventDefault();
        this.disabled = true;

        try {
            const formData = {
                task_title: document.getElementById('taskTitle').value.trim(),
                task_description: document.getElementById('description').value.trim(),
                task_due_date: document.getElementById('dueDate').value,
                task_priority: document.getElementById('priority').value,
                user_id_: JSON.parse(sessionStorage.getItem('user'))?.user_id_
            };

            const response = await fetch(`${BASE_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to create task');

            const result = await response.json();
            console.log('Task created:', result);

            // Close modal
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
                // Clean up modal artifacts
                setTimeout(() => {
                    document.body.classList.remove('modal-open');
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 150);
            }

            form.reset();
            await fetchAndDisplayTasks();
            alert('Task created successfully!');

        } catch (error) {
            console.error('Error creating task:', error);
            alert(error.message);
        } finally {
            this.disabled = false;
        }
    });

    // Modal hidden event
    modalElement?.addEventListener('hidden.bs.modal', function() {
        form.reset();
        newCreateBtn.style.display = 'block';
        newUpdateBtn.style.display = 'none';
        newUpdateBtn.removeAttribute('data-task-id');
        this.querySelector('.modal-title').textContent = 'Add New Task';
    });

    // Update task button handler
    newUpdateBtn?.addEventListener('click', async function(e) {
        e.preventDefault();
        this.disabled = true;

        try {
            const taskId = this.getAttribute('data-task-id');
            if (!taskId) throw new Error('No task ID found');

            const formData = {
                task_title: document.getElementById('taskTitle').value.trim(),
                task_description: document.getElementById('description').value.trim(),
                task_due_date: document.getElementById('dueDate').value,
                task_priority: document.getElementById('priority').value,
                user_id_: JSON.parse(sessionStorage.getItem('user'))?.user_id_
            };

            console.log('Updating task:', taskId, formData);

            const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to update task');

            const result = await response.json();
            console.log('Task updated:', result);

            // Close modal
            const modalElement = document.getElementById('task-staticBackdrop');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
                // Clean up modal artifacts
                setTimeout(() => {
                    document.body.classList.remove('modal-open');
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 150);
            }

            // Reset form and refresh tasks
            document.getElementById('newTaskForm').reset();
            await fetchAndDisplayTasks();
            alert('Task updated successfully!');

        } catch (error) {
            console.error('Error updating task:', error);
            alert(error.message);
        } finally {
            this.disabled = false;
        }
    });

    // Edit button click handler (for task cards)
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('task-btn-edit')) return;
        
        const taskCard = e.target.closest('.card');
        if (!taskCard) return;

        const taskId = taskCard.getAttribute('data-task-id');
        console.log('Editing task:', taskId);

        // Get task data from the card
        const taskData = {
            task_id_: taskId,
            task_title: taskCard.querySelector('.card-header').textContent.trim(),
            task_due_date: new Date(taskCard.querySelector('li:first-child span').textContent).toISOString().split('T')[0],
            task_priority: taskCard.querySelector('li:nth-child(3) span').textContent.toLowerCase(),
            task_description: taskCard.querySelector('.card-description-text')?.textContent.trim() || ''
        };

        // Fill modal with task data
        document.getElementById('taskTitle').value = taskData.task_title;
        document.getElementById('dueDate').value = taskData.task_due_date;
        document.getElementById('priority').value = taskData.task_priority;
        document.getElementById('description').value = taskData.task_description;

        // Show update button, hide create button
        document.getElementById('createTaskBtn').style.display = 'none';
        const updateBtn = document.getElementById('updateTaskBtn');
        updateBtn.style.display = 'block';
        updateBtn.setAttribute('data-task-id', taskId);

        // Update modal title
        document.querySelector('#task-staticBackdrop .modal-title').textContent = 'Edit Task';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('task-staticBackdrop'));
        modal.show();
    });
}

// Initialize once when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTaskModal();
    fetchAndDisplayTasks();
}, { once: true });

function resetModalToCreateMode() {
    const modalTitle = document.querySelector('#task-staticBackdrop .modal-title');
    const createButton = document.getElementById('createTaskBtn');
    const updateButton = document.getElementById('updateTaskBtn');
    
    modalTitle.textContent = 'Add New Task';
    createButton.style.display = 'block';
    updateButton.style.display = 'none';
    document.getElementById('newTaskForm').reset();
}

// Add this function near the existing task-related functions
async function completeChecklistItem(checklistId) {
    try {
        console.log('Attempting to complete checklist item:', checklistId);
        
        const response = await fetch('http://localhost:4000/api/checklist/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ checklistId })
        });

        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Complete checklist response:', result);

        if (result.success) {
            // Refresh tasks
            await fetchAndDisplayTasks();
            alert('Task completed successfully!');
        } else {
            alert(result.message || 'Failed to complete task');
        }
    } catch (error) {
        console.error('Error completing checklist item:', error);
        alert('Error completing task. Please try again.');
    }
}

function handleCheckboxChange(checklistId) {
    console.log('Checkbox changed for checklist ID:', checklistId);
    
    // Get the task card element using the checklist ID
    const taskCard = document.querySelector(`[data-checklist-id="${checklistId}"]`);
    
    // Log the task card to see if it's being selected correctly
    console.log('Task card to hide:', taskCard);

    // Call the function to complete the checklist item
    completeChecklistItem(checklistId).then(() => {
        // Hide the task card
        if (taskCard) {
            taskCard.style.display = 'none'; // Forcefully hide the card
            console.log('Task card hidden:', taskCard);
        } else {
            console.error('Task card not found for checklist ID:', checklistId);
        }
    });
}