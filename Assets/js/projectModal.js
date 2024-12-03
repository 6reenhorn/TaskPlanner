//
// Display Input Project
//
document.getElementById('saveProjectBtn').addEventListener('click', function () {
    // Capture the form data
    const projectTitle = document.getElementById('projectTitle').value.trim();
    const startDate = document.getElementById('startDate').value.trim();
    const endDate = document.getElementById('endDate').value.trim();
    const status = document.getElementById('status').value.trim();
    const description = document.getElementById('description').value.trim();

    // Validate the form data
    if (!taskTitle || !dueDate || !priority) {
        alert('Please fill out all required fields.');
        return;
    }

    // Create a new project card
    const projectCard = document.createElement('div');
    projectCard.className = 'col-4 card d-flex card-bg mb-3';
    projectCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center my-0">
            ${projectTitle}
            <form action="">
                <input type="checkbox" id="task-completion" name="task-completion" value="Finished">
            </form>
        </div>
        <div class="card-body">
            <ul class="card-text mt-0">
                <li>Start Date: <span>${startDate}</span></li>
                <li>End Date: <span>${endDate}</span></li>
                <li>Status: <span>${status}</span></li>
            </ul>
            <div class="project-card-description mt-0">
                <p class="project-description-text">${description}</p>
            </div>
            <div class="d-flex gap-3 mt-3 justify-content-between">
                <button type="button" class="card-btn-group project-btn-edit">Edit</button>
                <button type="button" class="card-btn-group project-btn-delete">Delete</button>
                <button type="button" class="card-btn-group project-btn-comment">Comment</button>
                <button type="button" class="card-btn-group project-btn-view-details">View Details</button>
            </div>
        </div>
    `;

    // Add functionality to Edit, Delete, and Comment buttons
    const deleteButton = projectCard.querySelector('.project-btn-delete');
    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            projectCard.remove();
        }
    });

    const editButton = projectCard.querySelector('.project-btn-edit');
    editButton.addEventListener('click', () => {
        alert('Edit functionality not implemented yet!');
    });

    const commentButton = projectCard.querySelector('.project-btn-comment');
    commentButton.addEventListener('click', () => {
        alert('Comment functionality not implemented yet!');
    });

    const viewDetailsButton = projectCard.querySelector('.project-btn-view-details');
    viewDetailsButton.addEventListener('click', () => {
        alert('View Details functionality not implemented yet!');
    });

    // Append the new task card to the project container
    document.getElementById('projectContainer').appendChild(projectCard);

    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('project-staticBackdrop'));
    modal.hide();

    // Reset the form
    document.getElementById('newProjectForm').reset();
});