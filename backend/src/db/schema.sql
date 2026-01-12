-- User Roles Enum
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'student',
    license_details TEXT, -- Could be JSONB for more structure: { type: 'PPL', number: '...' }
    medical_expiry DATE,
    flight_review_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aircraft Table
CREATE TABLE aircraft (
    id SERIAL PRIMARY KEY,
    tail_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    current_tach_time DECIMAL(8, 2) DEFAULT 0.0,
    current_hobbs_time DECIMAL(8, 2) DEFAULT 0.0,
    next_maintenance_hours DECIMAL(8, 2) NOT NULL, -- The Tach time when next 100hr/annual is due
    status VARCHAR(50) DEFAULT 'available', -- 'maintenance', 'available'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedules/Bookings Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Optional, user might fly solo
    aircraft_id INTEGER REFERENCES aircraft(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'completed'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_instructor_role CHECK (instructor_id IS NULL OR instructor_id <> user_id)
);

-- Flight Logs Table (Post-Flight)
CREATE TABLE flight_logs (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    hobbs_start DECIMAL(8, 2) NOT NULL,
    hobbs_end DECIMAL(8, 2) NOT NULL,
    tach_start DECIMAL(8, 2) NOT NULL,
    tach_end DECIMAL(8, 2) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_aircraft_id ON bookings(aircraft_id);
