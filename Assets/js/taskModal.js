document.getElementById('saveTaskBtn').addEventListener('click', function () {
    // Capture the form data
    const taskTitle = document.getElementById('taskTitle').value.trim();
    const dueDate = document.getElementById('dueDate').value.trim();
    const priority = document.getElementById('priority').value.trim();
    const description = document.getElementById('description').value.trim();

    // Validate the form data
    if (!taskTitle || !dueDate || !priority) {
        alert('Please fill out all required fields.');
        return;
    }

    // Create the task data object
    const taskData = {
        task_title: taskTitle,
        task_comment: 'None',  // You can modify this if you want to include a comment
        task_description: description,
        task_due_date: dueDate,
        task_status: 'In Progress',  // Default task status
        task_priority: priority
    };

    // Send the task data to the server
    fetch('http://localhost:4000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    })
    .then(response => response.text())
    .then(data => {
        console.log('Save response:', data);  // Debug line
        console.log(data);  // Confirmation of successful task creation
        
        // After successful task creation, create and append the task card to the UI
        const taskCard = createTaskCard(taskData);  // Assuming you have a function to create a task card
        document.getElementById('taskContainer').appendChild(taskCard);
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('task-staticBackdrop'));
        modal.hide();

        // Reset the form
        document.getElementById('newTaskForm').reset();
    })
    .catch(err => console.error('Error saving task:', err));
});

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:4000/tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Tasks received:', data);  // Debug line
            if (Array.isArray(data)) {
                data.forEach(task => {
                    const taskCard = createTaskCard(task);
                    document.getElementById('taskContainer').appendChild(taskCard);
                });
            }
        })
        .catch(err => console.error('Error fetching tasks:', err));
});

// Function to create a task card
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = 'col-4 card d-flex card-bg mb-3';
    taskCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center my-0">
            ${task.task_title}
            <form action="">
                <input type="checkbox" id="task-completion" name="task-completion" value="Finished">
            </form>
        </div>
        <div class="card-body">
            <ul class="card-text mt-0">
                <li>Due: <span>${task.task_due_date}</span></li>
                <li>Status: <span>${task.task_status}</span></li>
                <li>Priority: <span>${task.task_priority.charAt(0).toUpperCase() + task.task_priority.slice(1)}</span></li>
            </ul>
            <div class="card-btn-group d-flex gap-2">
                <button type="button" class="card-btn-group task-btn-edit">Edit</button>
                <button type="button" class="card-btn-group task-btn-delete">Delete</button>
                <button type="button" class="card-btn-group task-btn-comment">Comment</button>
            </div>
            <div class="d-flex align-items-end gap-5">
                <div class="col-auto task-card-description">
                    <p class="card-description-text">${task.task_description}</p>
                </div>
                <div class="col-auto profile-logo">
                    <img src="" alt="">
                </div>
            </div>
        </div>
    `;
    return taskCard;
}