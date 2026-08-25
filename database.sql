DROP DATABASE IF EXISTS boba_calendar;
CREATE DATABASE boba_calendar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE boba_calendar;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_number VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 10,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    start_time INT NOT NULL,
    end_time INT NOT NULL,
    color VARCHAR(20) NOT NULL,
    status ENUM('pending', 'confirmed', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bookings_date (booking_date),
    INDEX idx_bookings_room (room_id)
) ENGINE=InnoDB;

INSERT INTO rooms (name, capacity, description) VALUES
('Переговорная "Боб"', 10, 'Большой зал на 1 этаже'),
('Зал "Нетти"', 6, 'Маленький зал на 2 этаже');