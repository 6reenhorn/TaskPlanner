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
    console.log('DOM Content Loaded'); // Debug log
    
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    
    if (!saveTaskBtn || !cancelTaskBtn) {
        console.error('Save or Cancel Task Button not found!');
        return;
    }
    
    // Save task functionality
    saveTaskBtn.addEventListener('click', async function() {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            console.log('User data:', user);

            const taskData = {
                task_title: document.getElementById('taskTitle').value,
                task_description: document.getElementById('description').value,
                task_due_date: document.getElementById('dueDate').value,
                task_priority: document.getElementById('priority').value,
                user_id_: user.id
            };
            console.log('Sending task data:', taskData);

            const response = await fetch('http://localhost:4000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Server response:', result);

            // Success handling
            const modal = bootstrap.Modal.getInstance(document.getElementById('task-staticBackdrop'));
            modal.hide();
            document.getElementById('newTaskForm').reset();

            // Fetch and display tasks after saving
            await fetchAndDisplayTasks();

        } catch (error) {
            console.error('Detailed error:', error);
            alert('Error saving task: ' + error.message);
        }
    });

    // Cancel button uses Bootstrap's data-bs-dismiss="modal"
    // No additional JavaScript needed for cancel
});

// Function to fetch and display tasks
async function fetchAndDisplayTasks() {
    try {
        const response = await fetch('http://localhost:4000/api/tasks');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        console.log('Fetched tasks:', tasks);

        // Update main task container
        const taskContainer = document.getElementById('taskContainer');
        taskContainer.innerHTML = ''; // Clear existing tasks

        // Create and append task cards
        tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            taskContainer.appendChild(taskCard);
        });

        // Update upcoming tasks
        updateUpcomingTasks(tasks);

    } catch (error) {
        console.error('Error fetching and displaying tasks:', error);
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
                <button type="button" class="card-btn-group task-btn-edit" onclick="alert('Edit feature coming soon!')">Edit</button>
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
        const response = await fetch(`${BASE_URL}/tasks`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tasks = await response.json();
        console.log('Fetched tasks:', tasks);

        // Clear existing tasks
        const taskContainer = document.getElementById('taskContainer');
        taskContainer.innerHTML = '';

        // Create task cards
        tasks.forEach(task => createTaskCard(task));

    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Function to delete a task
async function deleteTask(taskId) {
    try {
        const response = await fetch(`http://localhost:4000/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Task deleted successfully');
        await fetchAndDisplayTasks(); // This will update both main tasks and upcoming tasks
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Add event listener to delete buttons
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('task-btn-delete')) {
        const taskCard = event.target.closest('.card');
        const taskId = taskCard.getAttribute('data-task-id');
        deleteTask(taskId);
    }
});

// Function to filter and display today's tasks
function updateUpcomingTasks(tasks) {
    const upcomingTasksContainer = document.querySelector('.upcoming-task .row.my-1');
    
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

    let visibleIndex = 0;

    tasks.forEach(task => {
        const taskDueDate = new Date(task.task_due_date);
        taskDueDate.setHours(23, 59, 59, 0); // Set to end of the due date

        // Check if task is due within next 2 days
        if (taskDueDate >= today && taskDueDate <= twoDaysFromNow) {
            const taskRow = createTaskRow(task, visibleIndex);
            upcomingTasksContainer.appendChild(taskRow);
            visibleIndex++;
        }
    });
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