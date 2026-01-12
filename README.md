# Aviation Management System

A comprehensive system for managing aircraft bookings, instructor scheduling, and flight logging.

## Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Real-time:** Socket.io Client

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Real-time:** Socket.io

## Project Structure

- `frontend/`: The Next.js application containing the user dashboard and booking interface.
- `backend/`: The Node.js Express server handling API requests and database interactions.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   - Create a PostgreSQL database (e.g., `aviation_db`).
   - Run the SQL script in `src/db/schema.sql` to generate the tables.
4. Configure Environment Variables:
   - Create a `.env` file in `backend/` with:
     ```
     PORT=5000
     DATABASE_URL=postgresql://user:password@localhost:5432/aviation_db
     ```
5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The system uses the following core tables:
- **users**: Stores student, instructor, and admin details.
- **aircraft**: Manages fleet details and maintenance schedules.
- **bookings**: Handles flight scheduling and resource allocation.
- **flight_logs**: Records post-flight data (Hobbs/Tach times).

## Features
- **Dashboard**: View flight status and weather.
- **Real-time Updates**: Calendar updates instantly when bookings are made.
- **Conflict Checking**: Prevents double-booking aircraft or instructors.
