-- Create database if not exists
CREATE DATABASE IF NOT EXISTS cgv_cinema;
USE cgv_cinema;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    running_time INT,
    release_date DATE,
    rank_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS showtimes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    theater_number INT NOT NULL,
    base_price DECIMAL(10,2) DEFAULT 100000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    showtime_id INT NOT NULL,
    seat_number VARCHAR(3) NOT NULL,
    ticket_code VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
);

CREATE TABLE IF NOT EXISTS tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS price_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    rule_type ENUM('day_of_week', 'time_slot', 'seat_type', 'promotion', 'age_group') NOT NULL,
    condition_value TEXT NOT NULL,
    adjustment_type ENUM('percentage', 'fixed') NOT NULL,
    adjustment_value DECIMAL(10,2) NOT NULL,
    priority INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seat_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    row_name CHAR(1) NOT NULL,
    seat_type ENUM('STANDARD', 'DELUXE', 'SWEETBOX') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for movies
INSERT INTO movies (title, genre, running_time, release_date, rank_order) VALUES
('QUỶ NHẬP TRÀNG', 'Horror', 121, '2025-03-07', 1),
('SNOW WHITE', 'Adventure, Family', 108, '2025-03-21', 2),
('YOU ARE THE APPLE OF MY EYE', 'Comedy, Drama, Romance', 102, '2025-03-21', 3),
('THE SNOW QUEEN AND THE PRINCESS', 'Adventure, Animation', 76, '2025-03-28', 4);

-- Insert sample data for showtimes
INSERT INTO showtimes (movie_id, show_date, show_time, theater_number, base_price) VALUES
(1, CURDATE(), '10:00:00', 1, 100000),
(1, CURDATE(), '13:00:00', 1, 100000),
(1, CURDATE(), '16:00:00', 1, 100000),
(1, CURDATE(), '19:00:00', 1, 100000),
(2, CURDATE(), '10:30:00', 2, 100000),
(2, CURDATE(), '13:30:00', 2, 100000),
(2, CURDATE(), '16:30:00', 2, 100000),
(2, CURDATE(), '19:30:00', 2, 100000);

-- Insert sample data for price_rules
INSERT INTO price_rules (name, rule_type, condition_value, adjustment_type, adjustment_value, priority) VALUES
-- Giảm giá theo ngày trong tuần
("C'member Day", 'day_of_week', '1', 'fixed', -45000, 1), -- Thứ 2 giảm 45,000đ cho thành viên
('Culture Day', 'day_of_week', '2', 'fixed', -45000, 1), -- Thứ 3 giảm 45,000đ
('Happy Day', 'day_of_week', '3', 'fixed', -50000, 1), -- Thứ 4 giảm 50,000đ

-- Giá theo loại ghế
('Standard Seat', 'seat_type', 'STANDARD', 'fixed', 0, 2), -- Ghế thường - giá gốc
('Deluxe Seat', 'seat_type', 'DELUXE', 'fixed', 55000, 2), -- Ghế Deluxe tăng 55,000đ
('Sweetbox Seat', 'seat_type', 'SWEETBOX', 'fixed', 110000, 2), -- Ghế Sweetbox tăng 110,000đ

-- Khuyến mãi theo độ tuổi và đối tượng
('U22', 'age_group', '{"max_age": 22}', 'fixed', -45000, 3), -- Dưới 22 tuổi giảm 45,000đ
('Child', 'age_group', '{"max_age": 12}', 'fixed', -10000, 3), -- Dưới 12 tuổi giảm 10,000đ
('Senior', 'age_group', '{"min_age": 62}', 'fixed', -15000, 3), -- Trên 62 tuổi giảm 15,000đ
('Student', 'promotion', '{"days": [1,2,3,4,5]}', 'fixed', -10000, 3); -- Học sinh/sinh viên giảm 10,000đ (thứ 2-6)

-- Insert sample data for seat_types
INSERT INTO seat_types (row_name, seat_type) VALUES
('A', 'STANDARD'),
('B', 'STANDARD'),
('C', 'STANDARD'),
('D', 'STANDARD'),
('E', 'DELUXE'),
('F', 'DELUXE'),
('G', 'SWEETBOX'),
('H', 'SWEETBOX'); 