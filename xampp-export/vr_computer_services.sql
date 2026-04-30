-- VR Computer Services Database Export for XAMPP
-- Generated on: 2026-04-30T10:33:54.390Z

-- Create Database
CREATE DATABASE IF NOT EXISTS vr_computer_services;
USE vr_computer_services;

-- Admin Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Admin Data
INSERT INTO admins (username, password, createdAt, updatedAt) VALUES
  ('administrator', '$2a$10$pcLs8KS00Vb4LVX0Ku0bW.AQIHDmB6o5IQkIbEgD5KzuGVkCdTspO', '2026-04-30 10:30:59', 'NOW()');

-- Engineers Table
CREATE TABLE IF NOT EXISTS engineers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  status ENUM("active", "inactive") DEFAULT "active",
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Engineer Data
INSERT INTO engineers (username, name, mobile, password, status, createdAt, updatedAt) VALUES
  ('vrcs01', 'Engineer 01', '1234567890', '$2a$10$iwg2DYDNBb9q1klWPKfAJeWNRRA89JyEVU8BvHyJMQ4EnRkKeaGwW', 'active', '2026-04-30 10:30:59', 'NOW()'),
  ('vrcs02', 'Engineer 02', '1234567891', '$2a$10$iwg2DYDNBb9q1klWPKfAJeWNRRA89JyEVU8BvHyJMQ4EnRkKeaGwW', 'active', '2026-04-30 10:30:59', 'NOW()'),
  ('vrcs03', 'Engineer 03', '1234567892', '$2a$10$iwg2DYDNBb9q1klWPKfAJeWNRRA89JyEVU8BvHyJMQ4EnRkKeaGwW', 'active', '2026-04-30 10:30:59', 'NOW()'),
  ('vrcs04', 'Engineer 04', '1234567893', '$2a$10$iwg2DYDNBb9q1klWPKfAJeWNRRA89JyEVU8BvHyJMQ4EnRkKeaGwW', 'active', '2026-04-30 10:30:59', 'NOW()'),
  ('vrcs05', 'Engineer 05', '1234567894', '$2a$10$iwg2DYDNBb9q1klWPKfAJeWNRRA89JyEVU8BvHyJMQ4EnRkKeaGwW', 'active', '2026-04-30 10:30:59', 'NOW()'),
  ('VRCS05', 'Engineer 05 (Uppercase)', '1234567895', '$2a$10$iwg2DYDNBb9q1klWPKfAJeWNRRA89JyEVU8BvHyJMQ4EnRkKeaGwW', 'active', '2026-04-30 10:30:59', 'NOW()');

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  engineerId VARCHAR(255) NOT NULL,
  engineerName VARCHAR(255),
  date DATE NOT NULL,
  inTime TIME,
  outTime TIME,
  workingHours VARCHAR(50),
  taskCompleted TEXT,
  location TEXT,
  photoUrl TEXT,
  remarks TEXT,
  currentStatus VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

