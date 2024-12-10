CREATE TABLE IF NOT EXISTS users (
    user_id_ INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    task_id_ INT AUTO_INCREMENT PRIMARY KEY,
    user_id_ INT,
    task_title VARCHAR(255) NOT NULL,
    task_comment TEXT,
    task_description TEXT,
    task_due_date DATE NOT NULL,
    task_status VARCHAR(50) NOT NULL,
    task_priority VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_) REFERENCES users(user_id_)
);

CREATE TABLE IF NOT EXISTS projects (
    project_id_ INT AUTO_INCREMENT PRIMARY KEY,
    user_id_ INT,
    project_title VARCHAR(255) NOT NULL,
    project_comment TEXT,
    project_description TEXT,
    project_start_date DATE,
    project_end_date DATE,
    project_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_) REFERENCES users(user_id_)
);

CREATE TABLE project_collaboration (
    project_collaboration_id_ INT PRIMARY KEY AUTO_INCREMENT,
    project_id_ INT NOT NULL,
    user_id_ INT NOT NULL,
    user_collab_role VARCHAR(50) NOT NULL,
    collaboration_name VARCHAR(255) NOT NULL,
    collaboration_description TEXT,
    collaboration_status VARCHAR(50) NOT NULL DEFAULT 'active',
    collaboration_end_date DATE NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leave_at TIMESTAMP NULL,
    FOREIGN KEY (project_id_) REFERENCES projects(project_id_) ON DELETE CASCADE,
    FOREIGN KEY (user_id_) REFERENCES users(user_id_) ON DELETE CASCADE,
    INDEX idx_project (project_id_),
    INDEX idx_user (user_id_)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CREATE TABLE IF NOT EXISTS activity_logs (
--     activity_log_id_PK INT AUTO_INCREMENT PRIMARY KEY,
--     administrator_id_FK INT,
--     user_id_FK INT,
--     reference_id_FK INT,
--     reference_type VARCHAR(50) NOT NULL,
--     activity_log_action VARCHAR(255) NOT NULL,
--     activity_log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (administrator_id_FK) REFERENCES users(user_id_),
--     FOREIGN KEY (user_id_FK) REFERENCES users(user_id_)
-- );

