const BASE_URL = 'http://localhost:4000/api';

fetch('http://localhost:4000/tasks')
    .then(response => response.json())
    .then(tasks => {
        console.log('Tasks from server:', tasks); // See what we're getting
        tasks.forEach(task => {
            console.log('Task data:', task); // Look at each task's structure
            console.log('Task ID:', task.task_id_); // Specifically check the ID
        });
    })
    .catch(err => console.error('Error fetching tasks:', err));

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
                user_id_: user.id
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
        if (!user || !user.id) {
            console.log('No user found in session');
            return;
        }

        const response = await fetch(`${BASE_URL}/tasks?userId=${user.id}`, {
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
                    if (task.user_id_ === user.id) {
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
            updateUpcomingTasks(tasks.filter(task => task.user_id_ === user.id));
        }

    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayTasks);

// Function to create a task card
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = 'col-4 card d-flex card-bg mb-3';
    taskCard.setAttribute('data-task-id', task.task_id_);
    console.log('Creating card with task ID:', task.task_id_);

    // Format the date to be more readable
    const dueDate = new Date(task.task_due_date).toLocaleDateString();

    taskCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center my-0">
            ${task.task_title}
            <form action="">
                <input type="checkbox" id="task-completion" name="task-completion" value="Finished">
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
    console.log('Setting modal mode:', mode);
    
    const modalElement = document.getElementById('task-staticBackdrop');
    if (!modalElement) {
        console.error('Modal element not found');
        return;
    }

    const modalTitle = modalElement.querySelector('.modal-title');
    const createButton = document.getElementById('createTaskBtn');
    const updateButton = document.getElementById('updateTaskBtn');
    
    if (!modalTitle || !createButton || !updateButton) {
        console.error('Modal elements missing:', {
            title: !!modalTitle,
            createBtn: !!createButton,
            updateBtn: !!updateButton
        });
        return;
    }
    
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
        resetModalToCreateMode();
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
        if (!user || !user.id) {
            console.error('No user found in session');
            return;
        }

        const taskData = {
            task_title: document.getElementById('taskTitle').value.trim(),
            task_description: document.getElementById('description').value.trim(),
            task_due_date: document.getElementById('dueDate').value,
            task_priority: document.getElementById('priority').value,
            user_id_: user.id
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

        // Close modal and refresh tasks
        const modal = bootstrap.Modal.getInstance(document.getElementById('task-staticBackdrop'));
        modal.hide();
        await fetchAndDisplayTasks();

    } catch (error) {
        console.error('Error updating task:', error);
        alert(error.message);
    }
});

// Modify the create task button handler
document.getElementById('createTaskBtn').addEventListener('click', async function(e) {
    e.preventDefault(); // Prevent form submission if any
    console.log('Create button clicked');
    
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || !user.id) {
            console.error('No user found in session');
            return;
        }
        
        const taskData = {
            task_title: document.getElementById('taskTitle').value.trim(),
            task_description: document.getElementById('description').value.trim(),
            task_due_date: document.getElementById('dueDate').value,
            task_priority: document.getElementById('priority').value,
            user_id_: user.id
        };

        console.log('Creating task with data:', taskData);

        const response = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(taskData)
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Failed to create task: ${response.status}`);
        }

        const result = await response.json();
        console.log('Task created:', result);

        const modal = bootstrap.Modal.getInstance(document.getElementById('task-staticBackdrop'));
        modal.hide();
        
        await fetchAndDisplayTasks();
        console.log('Task created successfully');

    } catch (error) {
        console.error('Error creating task:', error);
        alert(error.message);
    }
});

// Add save button click handler for updating task
document.getElementById('saveNewTaskBtn').addEventListener('click', async function() {
    const taskId = this.getAttribute('data-task-id');
    const taskTitle = document.getElementById('taskTitle').value;
    const dueDate = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;
    const description = document.getElementById('description').value;

    if (taskId) {
        // Update existing task
        try {
            const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    task_title: taskTitle,
                    task_due_date: dueDate,
                    task_priority: priority,
                    task_description: description
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Task updated successfully');
            // Refresh tasks
            await fetchAndDisplayTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    } else {
        // Handle new task creation if needed
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('task-staticBackdrop'));
    modal.hide();
});

// Update the activities fetch function
async function fetchActivities() {
    return [];
}

// Create New Task Save Button Handler (for Task Management page)
document.getElementById('saveNewTaskBtn').addEventListener('click', async function() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        
        const taskData = {
            task_title: document.getElementById('taskTitle').value.trim(),
            task_description: document.getElementById('description').value.trim(),
            task_due_date: document.getElementById('dueDate').value,
            task_priority: document.getElementById('priority').value,
            user_id_: user.id
        };

        const response = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Failed to create task');
        }

        // Close the modal using Bootstrap's modal method
        const modal = document.getElementById('task-staticBackdrop');
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.hide();
        } else {
            // Fallback if getInstance doesn't work
            const newModal = new bootstrap.Modal(modal);
            newModal.hide();
        }

        // Refresh task list
        await fetchAndDisplayTasks();

        alert('Task saved successfully!');

    } catch (error) {
        console.error('Error saving task:', error);
        alert(error.message);
    }
});

document.getElementById('createNewTaskBtn').addEventListener('click', function() {
    setModalMode('create');
    const modal = new bootstrap.Modal(document.getElementById('task-staticBackdrop'));
    modal.show();
});

// Cancel button handler
document.getElementById('cancelTaskBtn').addEventListener('click', function() {
    console.log('Cancel button clicked');
    resetModalToCreateMode();
});

// Modal close handler (for X button and clicking outside)
document.getElementById('task-staticBackdrop').addEventListener('hidden.bs.modal', function () {
    console.log('Modal hidden - resetting to create mode');
    resetModalToCreateMode();
});

// Function to reset modal to create mode
function resetModalToCreateMode() {
    const modalTitle = document.querySelector('#task-staticBackdrop .modal-title');
    const createButton = document.getElementById('createTaskBtn');
    const updateButton = document.getElementById('updateTaskBtn');
    
    // Reset form
    document.getElementById('newTaskForm').reset();
    
    // Reset buttons and title
    modalTitle.textContent = 'Add New Task';
    createButton.style.display = 'block';
    updateButton.style.display = 'none';
    updateButton.removeAttribute('data-task-id');
}