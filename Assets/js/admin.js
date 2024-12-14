let userDataArray = []; // Store user data for slideshow
let currentUserIndex = 0; // Track the current user index

document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('#sidebar-wrapper .list-group-item');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor click behavior
            const targetId = this.getAttribute('href'); // Get the target section ID
            const targetSection = document.querySelector(targetId); // Find the target section

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' }); // Scroll to the section smoothly
            }
        });
    });
}); 

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar-wrapper');
    const pageContent = document.getElementById('page-content-wrapper');

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('active'); // Toggle the sidebar's active class
        pageContent.classList.toggle('active'); // Toggle the page content's active class
    });

    // Fetch user data and populate user cards
    async function fetchUsers() {
        try {
            const response = await fetch('http://localhost:4000/api/auth/users'); // Adjust the endpoint as necessary
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const users = await response.json();
            displayUserCards(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Display user cards dynamically
    function displayUserCards(users) {
        const userCardsContainer = document.querySelector('.user-cards-container');
        userCardsContainer.innerHTML = ''; // Clear existing content

        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.innerHTML = `
                <h5>${user.username}</h5>
                <p>Full Name: ${user.first_name} ${user.last_name}</p>
                <p>ID: ${user.user_id_}</p>
                <p>Email: ${user.user_email}</p>
                <button class="btn btn-primary open-user" data-user-id="${user.user_id_}">Open</button>
            `;
            userCardsContainer.appendChild(userCard);
        });

        // Add event listeners to the "Open" buttons
        const openButtons = document.querySelectorAll('.open-user');
        openButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-user-id');
                fetchUserData(userId); // Fetch user data when button is clicked
            });
        });
    }

    // Call fetchUsers to load user data on page load
    fetchUsers();

    // Add event listener for the logout button
    const logoutButton = document.querySelector('.logout-button');
    logoutButton.addEventListener('click', () => {
        // Clear session storage or any user data if necessary
        sessionStorage.removeItem('user'); // Remove user data from session storage
        // Redirect to the login page
        window.location.href = 'login.html'; // Adjust the path if necessary
    });
});

// Function to show the selected section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.admin-main-pages');
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('active'); // Show the selected section
        } else {
            section.classList.remove('active'); // Hide other sections
        }
    });
}

// Set the initial section to Employee Management
showSection('employeeManagement');

// Add click event listeners to the sidebar links
const links = document.querySelectorAll('#sidebar-wrapper .list-group-item');
links.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default anchor click behavior
        const targetId = this.getAttribute('href').substring(1); // Get the target section ID
        showSection(targetId); // Show the selected section
    });
});

// Fetch user data for the specific user
async function fetchUserData(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/auth/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        displayUserData(userData); // Display the user data

        // Fetch user tasks
        await fetchUserTasks(userId); // Fetch tasks for the user

        // Fetch projects for the specific user
        await fetchUserProjects(userId); // Fetch projects for the user

        // Fetch project-task assignments for the specific user
        await fetchUserProjectTaskAssignments(userId); // Fetch project-task assignments for the user

        // Fetch user collaborations for the specific user
        await fetchUserCollaborations(userId); // Fetch collaborations for the user

        // Fetch user task assignments for the specific user
        await fetchUserTaskAssignments(userId); // Fetch task assignments for the user

        // Fetch unified checklist items for the specific user
        await fetchUserUnifiedChecklist(userId); // Fetch unified checklist items for the user
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Fetch user tasks for the specific user
async function fetchUserTasks(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/auth/tasks/user/${userId}`); // Adjust the endpoint as necessary
        if (!response.ok) {
            throw new Error('Failed to fetch user tasks');
        }
        const tasks = await response.json();
        displayUserTasks(tasks); // Display the tasks in a table
    } catch (error) {
        console.error('Error fetching user tasks:', error);
    }
}

// Fetch projects for the specific user
async function fetchUserProjects(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/auth/projects/user/${userId}`); // Adjust the endpoint as necessary
        if (!response.ok) {
            throw new Error('Failed to fetch user projects');
        }
        const projects = await response.json();
        displayUserProjects(projects); // Display the projects
    } catch (error) {
        console.error('Error fetching user projects:', error);
    }
}

// Fetch project-task assignments for the specific user
async function fetchUserProjectTaskAssignments(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/auth/project_task_assignments/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch project-task assignments');
        }
        const assignments = await response.json();
        displayUserProjectTaskAssignments(assignments); // Display the assignments
    } catch (error) {
        console.error('Error fetching user project-task assignments:', error);
    }
}

// Fetch user collaborations for the specific user
async function fetchUserCollaborations(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/auth/collaborations/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user collaborations');
        }
        const collaborations = await response.json();
        displayUserCollaborations(collaborations); // Display the collaborations
    } catch (error) {
        console.error('Error fetching user collaborations:', error);
    }
}

// Fetch user task assignments for the specific user
async function fetchUserTaskAssignments(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/auth/task_assignments/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user task assignments');
        }
        const taskAssignments = await response.json();
        displayUserTaskAssignments(taskAssignments); // Display the task assignments
    } catch (error) {
        console.error('Error fetching user task assignments:', error);
    }
}

// Fetch unified checklist items for the specific user
async function fetchUserUnifiedChecklist(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/auth/unified_checklist/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user unified checklist');
        }
        const checklistItems = await response.json();
        displayUserUnifiedChecklist(checklistItems); // Display the checklist items
    } catch (error) {
        console.error('Error fetching user unified checklist:', error);
    }
}

// Display user data in a table format
function displayUserData(userData) {
    const userTablesContainer = document.getElementById('userTablesContainer');
    userTablesContainer.innerHTML = ''; // Clear existing content

    const userTable = document.createElement('table');
    userTable.className = 'table table-bordered';
    userTable.innerHTML = `
        <thead>
            <tr>
                <th>Actions</th>
                <th>user_id_</th>
                <th>first_name</th>
                <th>last_name</th>
                <th>username</th>
                <th>user_email</th>
                <th>user_password</th>
                <th>user_role</th>
                <th>profile_picture</th>
                <th>created_at</th>
                <th>deleted_at</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <button class="btn btn-warning edit-user" data-user-id="${userData.user_id_}">Edit</button>
                    <button class="btn btn-danger delete-user" data-user-id="${userData.user_id_}">Delete</button>
                </td>
                <td>${userData.user_id_}</td>
                <td>${userData.first_name}</td>
                <td>${userData.last_name}</td>
                <td>${userData.username}</td>
                <td>${userData.user_email}</td>
                <td>${userData.user_password}</td>
                <td>${userData.user_role}</td>
                <td><img src="${userData.profile_picture || './Assets/img/default.jpg'}" alt="Profile" width="50"></td>
                <td>${userData.created_at}</td>
                <td>${userData.deleted_at || 'NULL'}</td>
            </tr>
        </tbody>
    `;

    userTablesContainer.appendChild(userTable);
}

// Display user tasks in a table format
function displayUserTasks(tasks) {
    const userTablesContainer = document.getElementById('userTablesContainer');

    const taskTable = document.createElement('table');
    taskTable.className = 'table table-bordered task-table';
    taskTable.innerHTML = `
        <thead>
            <tr>
                <th>Actions</th>
                <th>task_id_</th>
                <th>task_title</th>
                <th>task_comment</th>
                <th>task_description</th>
                <th>task_due_date</th>
                <th>task_status</th>
                <th>task_priority</th>
                <th>created_at</th>
            </tr>
        </thead>
        <tbody>
            ${tasks.map(task => `
                <tr>
                    <td>
                        <button class="btn btn-warning edit-task" data-task-id="${task.task_id_}">Edit</button>
                        <button class="btn btn-danger delete-task" data-task-id="${task.task_id_}">Delete</button>
                    </td>
                    <td>${task.task_id_}</td>
                    <td>${task.task_title}</td>
                    <td>${task.task_comment || 'NULL'}</td>
                    <td>${task.task_description}</td>
                    <td>${task.task_due_date}</td>
                    <td>${task.task_status}</td>
                    <td>${task.task_priority}</td>
                    <td>${task.created_at}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    userTablesContainer.appendChild(taskTable);

    // Add event listeners for Edit and Delete buttons
    const editTaskButtons = taskTable.querySelectorAll('.edit-task');
    const deleteTaskButtons = taskTable.querySelectorAll('.delete-task');

    editTaskButtons.forEach(button => {
        button.addEventListener('click', () => {
            const taskId = button.getAttribute('data-task-id');
            // Implement edit functionality here
            console.log(`Edit task with ID: ${taskId}`);
        });
    });

    deleteTaskButtons.forEach(button => {
        button.addEventListener('click', () => {
            const taskId = button.getAttribute('data-task-id');
            // Implement delete functionality here
            console.log(`Delete task with ID: ${taskId}`);
        });
    });
}

// Display user projects in a table format
function displayUserProjects(projects) {
    const userTablesContainer = document.getElementById('userTablesContainer');

    const projectTable = document.createElement('table');
    projectTable.className = 'table table-bordered project-table';
    projectTable.innerHTML = `
        <thead>
            <tr>
                <th>Actions</th>
                <th>project_id_</th>
                <th>project_title</th>
                <th>project_comment</th>
                <th>project_description</th>
                <th>project_start_date</th>
                <th>project_end_date</th>
                <th>project_status</th>
                <th>created_at</th>
            </tr>
        </thead>
        <tbody>
            ${projects.map(project => `
                <tr>
                    <td>
                        <button class="btn btn-warning edit-project" data-project-id="${project.project_id_}">Edit</button>
                        <button class="btn btn-danger delete-project" data-project-id="${project.project_id_}">Delete</button>
                    </td>
                    <td>${project.project_id_}</td>
                    <td>${project.project_title}</td>
                    <td>${project.project_comment || 'NULL'}</td>
                    <td>${project.project_description || 'NULL'}</td>
                    <td>${project.project_start_date || 'NULL'}</td>
                    <td>${project.project_end_date || 'NULL'}</td>
                    <td>${project.project_status || 'NULL'}</td>
                    <td>${project.created_at}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    userTablesContainer.appendChild(projectTable);

    // Add event listeners for Edit and Delete buttons
    const editProjectButtons = projectTable.querySelectorAll('.edit-project');
    const deleteProjectButtons = projectTable.querySelectorAll('.delete-project');

    editProjectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-project-id');
            // Implement edit functionality here
            console.log(`Edit project with ID: ${projectId}`);
        });
    });

    deleteProjectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-project-id');
            // Implement delete functionality here
            console.log(`Delete project with ID: ${projectId}`);
        });
    });
}

// Display user project-task assignments in a table format
function displayUserProjectTaskAssignments(assignments) {
    const userTablesContainer = document.getElementById('userTablesContainer');

    const assignmentTable = document.createElement('table');
    assignmentTable.className = 'table table-bordered assignment-table';
    assignmentTable.innerHTML = `
        <thead>
            <tr>
                <th>Actions</th>
                <th>project_task_id_</th>
                <th>project_id_</th>
                <th>task_id_</th>
                <th>assigned_at</th>
            </tr>
        </thead>
        <tbody>
            ${assignments.map(assignment => `
                <tr>
                    <td>
                        <button class="btn btn-warning edit-assignment" data-assignment-id="${assignment.project_task_id_}">Edit</button>
                        <button class="btn btn-danger delete-assignment" data-assignment-id="${assignment.project_task_id_}">Delete</button>
                    </td>
                    <td>${assignment.project_task_id_}</td>
                    <td>${assignment.project_id_}</td>
                    <td>${assignment.task_id_}</td>
                    <td>${assignment.task_assigned_at}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    userTablesContainer.appendChild(assignmentTable);

    // Add event listeners for Edit and Delete buttons
    const editAssignmentButtons = assignmentTable.querySelectorAll('.edit-assignment');
    const deleteAssignmentButtons = assignmentTable.querySelectorAll('.delete-assignment');

    editAssignmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const assignmentId = button.getAttribute('data-assignment-id');
            // Implement edit functionality here
            console.log(`Edit assignment with ID: ${assignmentId}`);
        });
    });

    deleteAssignmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const assignmentId = button.getAttribute('data-assignment-id');
            // Implement delete functionality here
            console.log(`Delete assignment with ID: ${assignmentId}`);
        });
    });
}

// Display user collaborations in a table format
function displayUserCollaborations(collaborations) {
    const userTablesContainer = document.getElementById('userTablesContainer');
    
    const collaborationTable = document.createElement('table');
    collaborationTable.className = 'table table-bordered collaboration-table';
    collaborationTable.innerHTML = `
        <thead>
            <tr>
                <th>Actions</th>
                <th>project_collaboration_id_</th>
                <th>project_id_</th>
                <th>user_id_</th>
                <th>user_collab_role</th>
                <th>collaboration_name</th>
                <th>collaboration_description</th>
                <th>collaboration_status</th>
                <th>collaboration_end_date</th>
                <th>joined_at</th>
                <th>leave_at</th>
            </tr>
        </thead>
        <tbody>
            ${collaborations.map(collaboration => `
                <tr>
                    <td>
                        <button class="btn btn-warning edit-collaboration" data-collaboration-id="${collaboration.project_collaboration_id_}">Edit</button>
                        <button class="btn btn-danger delete-collaboration" data-collaboration-id="${collaboration.project_collaboration_id_}">Delete</button>
                    </td>
                    <td>${collaboration.project_collaboration_id_}</td>
                    <td>${collaboration.project_id_}</td>
                    <td>${collaboration.user_id_}</td>
                    <td>${collaboration.user_collab_role}</td>
                    <td>${collaboration.collaboration_name}</td>
                    <td>${collaboration.collaboration_description}</td>
                    <td>${collaboration.collaboration_status}</td>
                    <td>${collaboration.collaboration_end_date}</td>
                    <td>${collaboration.joined_at}</td>
                    <td>${collaboration.leave_at}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    userTablesContainer.appendChild(collaborationTable);

    // Add event listeners for Edit and Delete buttons
    const editCollaborationButtons = collaborationTable.querySelectorAll('.edit-collaboration');
    const deleteCollaborationButtons = collaborationTable.querySelectorAll('.delete-collaboration');

    editCollaborationButtons.forEach(button => {
        button.addEventListener('click', () => {
            const collaborationId = button.getAttribute('data-collaboration-id');
            // Implement edit functionality here
            console.log(`Edit collaboration with ID: ${collaborationId}`);
        });
    });

    deleteCollaborationButtons.forEach(button => {
        button.addEventListener('click', () => {
            const collaborationId = button.getAttribute('data-collaboration-id');
            // Implement delete functionality here
            console.log(`Delete collaboration with ID: ${collaborationId}`);
        });
    });
}

// Display user task assignments in a table format
function displayUserTaskAssignments(taskAssignments) {
    const userTablesContainer = document.getElementById('userTablesContainer');
    
    const taskAssignmentTable = document.createElement('table');
    taskAssignmentTable.className = 'table table-bordered task-assignment-table';
    taskAssignmentTable.innerHTML = `
        <thead>
            <tr>
                <th>Actions</th>
                <th>task_assignment_id_</th>
                <th>task_id_</th>
                <th>assigned_to_</th>
                <th>assigned_by_</th>
                <th>assigned_at</th>
            </tr>
        </thead>
        <tbody>
            ${taskAssignments.map(taskAssignment => `
                <tr>
                    <td>
                        <button class="btn btn-warning edit-task-assignment" data-task-assignment-id="${taskAssignment.task_assignment_id_}">Edit</button>
                        <button class="btn btn-danger delete-task-assignment" data-task-assignment-id="${taskAssignment.task_assignment_id_}">Delete</button>
                    </td>
                    <td>${taskAssignment.task_assignment_id_}</td>
                    <td>${taskAssignment.task_id_}</td>
                    <td>${taskAssignment.assigned_to_}</td>
                    <td>${taskAssignment.assigned_by_}</td>
                    <td>${taskAssignment.assigned_at}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    userTablesContainer.appendChild(taskAssignmentTable);

    // Add event listeners for Edit and Delete buttons
    const editTaskAssignmentButtons = taskAssignmentTable.querySelectorAll('.edit-task-assignment');
    const deleteTaskAssignmentButtons = taskAssignmentTable.querySelectorAll('.delete-task-assignment');

    editTaskAssignmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const taskAssignmentId = button.getAttribute('data-task-assignment-id');
            // Implement edit functionality here
            console.log(`Edit task assignment with ID: ${taskAssignmentId}`);
        });
    });

    deleteTaskAssignmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const taskAssignmentId = button.getAttribute('data-task-assignment-id');
            // Implement delete functionality here
            console.log(`Delete task assignment with ID: ${taskAssignmentId}`);
        });
    });
}

// Display unified checklist items in a table format
function displayUserUnifiedChecklist(checklistItems) {
    const userTablesContainer = document.getElementById('userTablesContainer');
    
    const checklistTable = document.createElement('table');
    checklistTable.className = 'table table-bordered checklist-table';
    checklistTable.innerHTML = `
        <thead>
            <tr>
                <th>Actions</th>
                <th>unified_checklist_id_</th>
                <th>related_id_</th>
                <th>related_type</th>
                <th>item_description</th>
                <th>is_completed</th>
                <th>checked_at</th>
                <th>created_at</th>
            </tr>
        </thead>
        <tbody>
            ${checklistItems.map(item => `
                <tr>
                    <td>
                        <button class="btn btn-warning edit-checklist" data-checklist-id="${item.unified_checklist_id_}">Edit</button>
                        <button class="btn btn-danger delete-checklist" data-checklist-id="${item.unified_checklist_id_}">Delete</button>
                    </td>
                    <td>${item.unified_checklist_id_}</td>
                    <td>${item.related_id_}</td>
                    <td>${item.related_type}</td>
                    <td>${item.item_description}</td>
                    <td>${item.is_completed}</td>
                    <td>${item.checked_at}</td>
                    <td>${item.created_at}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    userTablesContainer.appendChild(checklistTable);

    // Add event listeners for Edit and Delete buttons
    const editChecklistButtons = checklistTable.querySelectorAll('.edit-checklist');
    const deleteChecklistButtons = checklistTable.querySelectorAll('.delete-checklist');

    editChecklistButtons.forEach(button => {
        button.addEventListener('click', () => {
            const checklistId = button.getAttribute('data-checklist-id');
            // Implement edit functionality here
            console.log(`Edit checklist with ID: ${checklistId}`);
        });
    });

    deleteChecklistButtons.forEach(button => {
        button.addEventListener('click', () => {
            const checklistId = button.getAttribute('data-checklist-id');
            // Implement delete functionality here
            console.log(`Delete checklist with ID: ${checklistId}`);
        });
    });
}

async function fetchAllEntities() {
    try {
        // Fetch users
        const usersResponse = await fetch('http://localhost:4000/api/all/users');
        const users = await usersResponse.json();
        if (Array.isArray(users)) {
            console.log(users);
            createTable('Users', users, ['user_id_', 'first_name', 'last_name', 'username', 'user_email', 'user_password', 'user_role', 'created_at'], false, true);
        } else {
            console.error('Invalid users data:', users);
        }

        // Fetch tasks
        const tasksResponse = await fetch('http://localhost:4000/api/all/tasks');
        const tasks = await tasksResponse.json();
        if (Array.isArray(tasks)) {
            console.log('Tasks: ' ,tasks);
            createTable('Tasks', tasks, ['task_id_', 'user_id_', 'task_title', 'task_comment', 'task_description', 'task_due_date', 'task_status', 'task_priority', 'created_at'], true);
        } else {
            console.error('Invalid tasks data:', tasks);
        }

        // Fetch projects
        const projectsResponse = await fetch('http://localhost:4000/api/all/projects');
        const projects = await projectsResponse.json();
        if (Array.isArray(projects)) {
            console.log(projects);
            createTable('Projects', projects, ['project_id_', 'user_id_', 'project_title', 'project_comment', 'project_description', 'project_start_date', 'project_end_date', 'project_status'], false);
        } else {
            console.error('Invalid projects data:', projects);
        }

        // Fetch project_task_assignments
        const projectTaskAssignmentsResponse = await fetch('http://localhost:4000/api/all/project_task_assignment');
        const projectTaskAssignments = await projectTaskAssignmentsResponse.json();
        if (Array.isArray(projectTaskAssignments)) {
            console.log(projectTaskAssignments);
            createTable('Project Task Assignments', projectTaskAssignments, ['project_task_id_', 'project_id_', 'task_id_', 'assigned_at']);
        } else {
            console.error('Invalid project task assignments data:', projectTaskAssignments);
        }

        // Fetch project_collaboration
        const projectCollaborationResponse = await fetch('http://localhost:4000/api/all/project_collaboration');
        const projectCollaboration = await projectCollaborationResponse.json();
        if (Array.isArray(projectCollaboration)) {
            console.log(projectCollaboration);
            createTable('Project Collaboration', projectCollaboration, ['project_collaboration_id_', 'project_id_', 'user_id_', 'user_collab_role', 'collaboration_name', 'collaboration_description', 'collaboration_status', 'collaboration_end_date', 'joined_at', 'leave_at'], false, false, true);
        } else {
            console.error('Invalid project collaboration data:', projectCollaboration);
        }

        // Fetch task_assignments
        const taskAssignmentsResponse = await fetch('http://localhost:4000/api/all/task_assignments');
        const taskAssignments = await taskAssignmentsResponse.json();
        if (Array.isArray(taskAssignments)) {
            console.log(taskAssignments);
            createTable('Task Assignments', taskAssignments, ['task_assignment_id_', 'task_id_', 'assigned_to_', 'assigned_by_', 'assigned_at']);
        } else {
            console.error('Invalid task assignments data:', taskAssignments);
        }

        // Fetch unified_checklist
        const unifiedChecklistResponse = await fetch('http://localhost:4000/api/all/unified_checklist');
        const unifiedChecklist = await unifiedChecklistResponse.json();
        if (Array.isArray(unifiedChecklist)) {
            console.log(unifiedChecklist);
            createTable('Unified Checklist', unifiedChecklist, ['unified_checklist_id_', 'related_id_', 'related_type', 'item_description', 'is_completed', 'checked_at', 'created_at'], false, false, false, true);
        } else {
            console.error('Invalid unified checklist data:', unifiedChecklist);
        }

    } catch (error) {
        console.error('Error fetching entities:', error);
    }
}

function createTable(title, data, columns, isTaskTable = false, isUserTable = false, isProjectCollaborationTable = false, isChecklistTable = false) {
    const tablesContainer = document.getElementById('tablesContainer');

    console.log('Columns: ', columns);
    // Create a new table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';

    // Create table header
    const tableHeader = document.createElement('h2');
    tableHeader.style.fontSize = '18px';
    tableHeader.style.marginTop = '15px';
    tableHeader.style.marginBottom = '0';
    tableHeader.textContent = title;
    tableContainer.appendChild(tableHeader);

    // Create a scrollable div for the table
    const scrollableDiv = document.createElement('div');
    scrollableDiv.style.overflowX = 'auto'; // Enable horizontal scrolling
    scrollableDiv.style.width = '100%'; // Set width to 100% of the container

    // Create table
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    table.style.fontSize = '12px'; // Set font size for the table

    // Create table header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Add "+" button for adding a new row
    const addButtonCell = document.createElement('th');
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.style.cursor = 'pointer';
    addButton.className = 'button-add-row';
    addButton.onclick = function() {
        // Functionality to add a new row
        addNewTaskRow(table, columns);
    };
    addButtonCell.appendChild(addButton);
    headerRow.appendChild(addButtonCell);

    // Add "Actions" header
    const actionsHeaderCell = document.createElement('th');
    actionsHeaderCell.textContent = 'Actions';
    headerRow.appendChild(actionsHeaderCell);

    // Add other headers
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()); // Format header
        th.style.fontSize = '12px'; // Set font size for header
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    data.forEach(item => {
        const row = document.createElement('tr');

        // Add "+" button cell (empty for now)
        const emptyCell = document.createElement('td');
        row.appendChild(emptyCell);

        // Add "Edit" and "Delete" buttons
        const actionsCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'button button-edit'; // Apply edit button styles
        editButton.onclick = function() {
            // Functionality to edit the row
            if (isTaskTable) {
                editTaskRow(row, item); // Call the task edit function
            } else if (isUserTable) {
                editUserRow(row, item); // Call the user edit function
            } else if (isProjectCollaborationTable) {
                editProjectCollaborationRow(row, item); // Call the project collaboration edit function
            } else {
                editRow(row, item); // Call the project edit function
            }
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'button button-delete'; // Apply delete button styles
        deleteButton.onclick = function() {
            console.log('Delete button clicked');
            // Functionality to delete the row
            if (isProjectCollaborationTable) {
                deleteRow(row, 'projectCollaboration'); // Call the deleteRow function for project collaboration
            } else if (isTaskTable) {
                deleteRow(row, 'task'); // Call the deleteRow function for tasks
            } else if (isChecklistTable) {
                deleteRow(row, 'checklist'); // Call the deleteRow function for checklists
            } else {
                deleteRow(row, 'project'); // Call the deleteRow function for projects
            }
        };

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell); // Append actions cell

        // Add data cells for each column
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = item[column] !== undefined ? item[column] : 'N/A'; // Handle undefined values
            td.style.fontSize = '12px'; // Set font size for table data
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Append the table to the scrollable div
    scrollableDiv.appendChild(table);
    tableContainer.appendChild(scrollableDiv); // Append scrollable div to the table container
    tablesContainer.appendChild(tableContainer); // Append the table container to the main container
}

// Function to add a new row
function addNewTaskRow(table, columns) {
    const newRow = document.createElement('tr');

    // Create an empty cell for index 0
    const emptyCell = document.createElement('td');
    newRow.appendChild(emptyCell); // Append empty cell for index 0

    // Create a cell for the Save and Cancel buttons at index 1
    const actionCell = document.createElement('td');
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'button button-save'; // Apply save button styles

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'button button-cancel'; // Apply cancel button styles

    // Cancel button functionality
    cancelButton.onclick = function() {
        newRow.remove(); // Remove the new row if cancel is clicked
    };

    // Save button functionality
    saveButton.onclick = function() {
        const newData = {};
        newRow.querySelectorAll('input').forEach((input, index) => {
            newData[columns[index]] = input.value; // Map input values to column names
        });

        // Send data to the backend
        fetch(`http://localhost:4000/api/admin/tasks`, { // Adjust the URL based on your API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData), // Convert data to JSON
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Task added successfully:', data);
            newRow.remove(); // Remove the input row after saving
            // Optionally, refresh the table or add the new row to the table
            createTable('Tasks', data, columns, true); // Refresh the task table with updated data
        })
        .catch(error => {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        });
    };

    // Append buttons to the action cell
    actionCell.appendChild(saveButton);
    actionCell.appendChild(cancelButton);
    newRow.appendChild(actionCell); // Append action cell to the new row

    // Create input fields for each column starting from index 2
    columns.forEach((column, index) => {
        const newCell = document.createElement('td');
        
        // Only create input fields for index 2 and onwards
        if (index >= 2) {
            const input = document.createElement('input');
            input.placeholder = `Enter ${column.replace(/_/g, ' ')}`; // Placeholder text
            input.style.width = '100%'; // Make input fields full width
            newCell.appendChild(input); // Append input to the cell
        }

        newRow.appendChild(newCell); // Append cell to the new row
    });

    table.querySelector('tbody').appendChild(newRow); // Append the new row to the table body
}

// Function to edit a row
function editRow(row, item) {
    const cells = row.getElementsByTagName('td');

    // Change each cell to an input field
    for (let i = 2; i < cells.length; i++) { // Start from index 2 to skip "+" and "Actions" cells
        const cell = cells[i];
        const input = document.createElement('input');
        input.value = cell.textContent; // Set input value to current cell text
        cell.textContent = ''; // Clear the cell
        cell.appendChild(input); // Append the input field to the cell
    }

    // Replace the Edit button with a Save button
    const actionsCell = cells[1]; // Get the actions cell
    actionsCell.innerHTML = ''; // Clear the actions cell

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'button button-edit'; // Apply save button styles
    saveButton.onclick = function() {
        // Save the changes
        const updatedData = {
            user_id_: cells[3].querySelector('input').value, // Assuming you have this in your item
            project_title: cells[4].querySelector('input').value, // Adjust based on your columns
            project_comment: cells[5].querySelector('input').value, // Adjust based on your columns
            project_description: cells[6].querySelector('input').value, // Adjust based on your columns
            project_start_date: cells[7].querySelector('input').value, // Adjust based on your columns
            project_end_date: cells[8].querySelector('input').value, // Adjust based on your columns
            project_status: cells[9].querySelector('input').value, // Adjust based on your columns
        };

        // Construct the URL
        const url = `http://localhost:4000/api/projects/${item.project_id_}`;
        
        // Log the URL to the console
        console.log(`URL: ${url}`);

        // Send the update request to the backend
        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update the table with the new values
            for (let i = 2; i < cells.length; i++) {
                const cell = cells[i];
                const input = cell.querySelector('input');
                if (input) {
                    cell.textContent = input.value; // Set cell text to input value
                }
            }
            // Restore the Edit button
            actionsCell.innerHTML = ''; // Clear the actions cell
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'button button-edit'; // Apply edit button styles
            editButton.onclick = function() {
                editRow(row, item); // Call editRow again if needed
            };
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton); // Re-add the delete button
        })
        .catch(error => {
            console.error('Error updating project:', error);
            alert('Failed to update project. Please try again.');
        });
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'button button-delete'; // Apply cancel button styles
    cancelButton.onclick = function() {
        // Restore original values
        for (let i = 2; i < cells.length; i++) {
            const cell = cells[i];
            cell.textContent = item[columns[i - 2]]; // Restore original value
        }
        // Restore the Edit button
        actionsCell.innerHTML = ''; // Clear the actions cell
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'button button-edit'; // Apply edit button styles
        editButton.onclick = function() {
            editRow(row, item); // Call editRow again if needed
        };
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton); // Re-add the delete button
    };

    actionsCell.appendChild(saveButton);
    actionsCell.appendChild(cancelButton);
}

// Function to delete a row
function deleteRow(row, type) {
    const id = row.cells[2].textContent.trim(); // Assuming the ID is in the 3rd column (index 2)
    let endpoint = '';

    // Determine which endpoint to hit based on the row type
    if (type === 'project') {
        endpoint = 'projects';
    } else if (type === 'checklist') {
        endpoint = 'checklists';
    } else if (type === 'task') {
        endpoint = 'tasks';
    } else if (type === 'user') {
        endpoint = 'users';
    } else {
        console.error('Unknown row type: ' + type);
        return;
    }
    
    const url = `http://localhost:4000/api/admin/${endpoint}/${id}`; // Construct the correct URL

    console.log('Deleting row of type:', type);
    console.log('URL:', url); // Log the URL for debugging

    if (confirm('Are you sure you want to delete this row?')) {
    // Perform the DELETE request
    fetch(url, {
        method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                console.log(`${type} deleted successfully`);
                row.remove(); // Remove the row from the table after successful deletion
        } else {
            console.error(`Error deleting ${type}: ${response.statusText}`);
        }
        })
        .catch(error => {
            console.error('Error deleting row:', error);
        });
    }
}




// Call the function to fetch and display all entities
fetchAllEntities();

// Define the editTaskRow function first
function editTaskRow(row, item) {
    const cells = row.getElementsByTagName('td');

    // Change each cell to an input field
    for (let i = 2; i < cells.length; i++) {
        const cell = cells[i];
        const input = document.createElement('input');
        input.value = cell.textContent; // Set input value to current cell text
        cell.textContent = ''; // Clear the cell
        cell.appendChild(input); // Append the input field to the cell
    }

    // Replace the Edit button with a Save button
    const actionsCell = cells[1]; // Get the actions cell
    actionsCell.innerHTML = ''; // Clear the actions cell

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'button button-edit'; // Apply save button styles
    saveButton.onclick = function() {
        // Save the changes
        const updatedData = {
            task_id_: cells[2].querySelector('input').value,
            user_id_: cells[3].querySelector('input').value,
            task_title: cells[4].querySelector('input').value,
            task_comment: cells[5].querySelector('input').value,
            task_description: cells[6].querySelector('input').value,
            task_due_date: cells[7].querySelector('input').value,
            task_status: cells[8].querySelector('input').value,
            task_priority: cells[9].querySelector('input').value
        };

        // Send the update request to the backend
        fetch(`http://localhost:4000/api/admin/tasks/${updatedData.task_id_}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update the table with the new values
            for (let i = 2; i < cells.length; i++) {
                const cell = cells[i];
                const input = cell.querySelector('input');
                if (input) {
                    cell.textContent = input.value; // Set cell text to input value
                }
            }
            // Restore the Edit button
            actionsCell.innerHTML = ''; // Clear the actions cell
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'button button-edit'; // Apply edit button styles
            editButton.onclick = function() {
                editTaskRow(row, item); // Call editTaskRow again if needed
            };
            actionsCell.appendChild(editButton);
        })
        .catch(error => {
            console.error('Error updating task:', error);
            alert('Failed to update task. Please try again.');
        });
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'button button-delete'; // Apply cancel button styles
    cancelButton.onclick = function() {
        // Restore original values
        for (let i = 2; i < cells.length; i++) {
            const cell = cells[i];
            cell.textContent = item[columns[i - 2]]; // Restore original value
        }
        // Restore the Edit button
        actionsCell.innerHTML = ''; // Clear the actions cell
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'button button-edit'; // Apply edit button styles
        editButton.onclick = function() {
            editTaskRow(row, item); // Call editTaskRow again if needed
        };
        actionsCell.appendChild(editButton);
    };

    actionsCell.appendChild(saveButton);
    actionsCell.appendChild(cancelButton);
}

function editUserRow(row, item) {
    const cells = row.getElementsByTagName('td');

    // Change each cell to an input field
    for (let i = 2; i < cells.length; i++) { // Adjust based on your columns
        const cell = cells[i];
        const input = document.createElement('input');
        input.value = cell.textContent; // Set input value to current cell text
        cell.textContent = ''; // Clear the cell
        cell.appendChild(input); // Append the input field to the cell
    }

    // Replace the Edit button with a Save button
    const actionsCell = cells[1]; // Get the actions cell
    actionsCell.innerHTML = ''; // Clear the actions cell

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'button button-edit'; // Apply save button styles
    saveButton.onclick = function() {
        // Save the changes
        const updatedData = {
            user_id_: cells[2].querySelector('input').value, // Assuming you have this in your item
            first_name: cells[3].querySelector('input').value,
            last_name: cells[4].querySelector('input').value,
            username: cells[5].querySelector('input').value, // Adjust based on your columns
            user_email: cells[6].querySelector('input').value, // Adjust based on your columns
            user_role: cells[8].querySelector('input').value, // Adjust based on your columns
        };

        // Send the update request to the backend
        fetch(`http://localhost:4000/api/admin/users/${updatedData.user_id_}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update the table with the new values
            for (let i = 2; i < cells.length; i++) {
                const cell = cells[i];
                const input = cell.querySelector('input');
                if (input) {
                    cell.textContent = input.value; // Set cell text to input value
                }
            }
            // Restore the Edit button
            actionsCell.innerHTML = ''; // Clear the actions cell
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'button button-edit'; // Apply edit button styles
            editButton.onclick = function() {
                editUserRow(row, item); // Call editUserRow again if needed
            };
            actionsCell.appendChild(editButton);
        })
        .catch(error => {
            console.error('Error updating user:', error);
            alert('Failed to update user. Please try again.');
        });
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'button button-delete'; // Apply cancel button styles
    cancelButton.onclick = function() {
        // Restore original values
        for (let i = 2; i < cells.length; i++) {
            const cell = cells[i];
            cell.textContent = item[columns[i]]; // Restore original value
        }
        // Restore the Edit button
        actionsCell.innerHTML = ''; // Clear the actions cell
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'button button-edit'; // Apply edit button styles
        editButton.onclick = function() {
            editUserRow(row, item); // Call editUserRow again if needed
        };
        actionsCell.appendChild(editButton);
    };

    actionsCell.appendChild(saveButton);
    actionsCell.appendChild(cancelButton);
}

function editProjectCollaborationRow(row, item) {
    const cells = row.getElementsByTagName('td');

    // Change each cell to an input field
    for (let i = 2; i < cells.length; i++) { // Adjust based on your columns
        const cell = cells[i];
        const input = document.createElement('input');
        input.value = cell.textContent; // Set input value to current cell text
        cell.textContent = ''; // Clear the cell
        cell.appendChild(input); // Append the input field to the cell
    }

    // Replace the Edit button with a Save button
    const actionsCell = cells[1]; // Get the actions cell
    actionsCell.innerHTML = ''; // Clear the actions cell

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'button button-edit'; // Apply save button styles
    saveButton.onclick = function() {
        // Save the changes
        const updatedData = {
            project_collaboration_id_: cells[2].querySelector('input').value, // Adjust based on your columns
            project_id_: cells[3].querySelector('input').value, // Adjust based on your columns
            user_id_: cells[4].querySelector('input').value, // Adjust based on your columns
            user_collab_role: cells[5].querySelector('input').value, // Adjust based on your columns
            collaboration_name: cells[6].querySelector('input').value, // Adjust based on your columns
            collaboration_description: cells[7].querySelector('input').value, // Adjust based on your columns
            collaboration_status: cells[8].querySelector('input').value, // Adjust based on your columns
            collaboration_end_date: cells[9].querySelector('input').value, // Adjust based on your columns
            joined_at: cells[10].querySelector('input').value, // Adjust based on your columns
            leave_at: cells[11].querySelector('input').value, // Adjust based on your columns
        };

        // Send the update request to the backend
        fetch(`http://localhost:4000/api/admin/project-collaborations/${item.project_collaboration_id_}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update the table with the new values
            for (let i = 2; i < cells.length; i++) {
                const cell = cells[i];
                const input = cell.querySelector('input');
                if (input) {
                    cell.textContent = input.value; // Set cell text to input value
                }
            }
            // Restore the Edit button
            actionsCell.innerHTML = ''; // Clear the actions cell
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'button button-edit'; // Apply edit button styles
            editButton.onclick = function() {
                editProjectCollaborationRow(row, item); // Call editProjectCollaborationRow again if needed
            };
            actionsCell.appendChild(editButton);
        })
        .catch(error => {
            console.error('Error updating project collaboration:', error);
            alert('Failed to update project collaboration. Please try again.');
        });
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'button button-delete'; // Apply cancel button styles
    cancelButton.onclick = function() {
        // Restore original values
        for (let i = 2; i < cells.length; i++) {
            const cell = cells[i];
            cell.textContent = item[columns[i]]; // Restore original value
        }
        // Restore the Edit button
        actionsCell.innerHTML = ''; // Clear the actions cell
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'button button-edit'; // Apply edit button styles
        editButton.onclick = function() {
            editProjectCollaborationRow(row, item); // Call editProjectCollaborationRow again if needed
        };
        actionsCell.appendChild(editButton);
    };

    actionsCell.appendChild(saveButton);
    actionsCell.appendChild(cancelButton);
}

function deleteProjectCollaborationRow(row) {
    const projectCollaborationId = row.cells[2].textContent; 

    if (confirm('Are you sure you want to delete this project collaboration?')) {
        console.log(`Deleting from URL: http://localhost:4000/api/admin/projectCollaborations/${projectCollaborationId}`);
        fetch(`http://localhost:4000/api/admin/projectCollaborations/${projectCollaborationId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Delete response:', data);
            row.remove();
            alert('Project collaboration deleted successfully.');
        })
        .catch(error => {
            console.error('Error deleting project collaboration:', error);
            alert('Failed to delete project collaboration. Please try again.');
        });
    }
}

function deleteTaskRow(row) {
    // Get the task ID from the row (assuming it's in the first column)
    const taskId = row.cells[2].textContent; // Adjust the index based on your table structure

    // Confirm deletion
    if (confirm('Are you sure you want to delete this task?')) {
        // Send a DELETE request to the backend
        fetch(`http://localhost:4000/api/admin/tasks/${taskId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Delete response:', data);
            // Remove the row from the table
            row.remove();
            alert('Task deleted successfully.');
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            alert('Failed to delete task. Please try again.');
        });
    }
}

function deleteProjectRow(row) {
    // Get the project ID from the row (assuming it's in the second column)
    const projectId = row.cells[2].textContent; // Adjust the index based on your table structure

    // Confirm deletion
    if (confirm('Are you sure you want to delete this project?')) {
        // Send a DELETE request to the backend
        fetch(`http://localhost:4000/api/admin/projects/${projectId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Delete response:', data);
            // Remove the row from the table
            row.remove();
            alert('Project deleted successfully.');
        })
        .catch(error => {
            console.error('Error deleting project:', error);
            alert('Failed to delete project. Please try again.');
        });
    }
}

function deleteChecklistRow(row) {
    const checklistId = row.cells[2].textContent;
    
    if (confirm('Are you sure you want to delete this checklist?')) {
        fetch(`http://localhost:4000/api/admin/checklists/${checklistId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Delete response:', data);
            row.remove();
            alert('Checklist deleted successfully.');
        })
        .catch(error => {
            console.error('Error deleting checklist:', error);
            alert('Failed to delete checklist. Please try again.');
        });
    }
}



