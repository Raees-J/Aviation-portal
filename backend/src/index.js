const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io setup (for real-time calendar updates)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow connection from Frontend
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Basic Routes
app.get('/', (req, res) => {
  res.send('Aviation Management API is running');
});

// Mock Database interaction (Placeholders)
app.post('/api/bookings', (req, res) => {
  // Logic to handle booking creation
  // 1. Check availability
  // 2. Insert into DB
  // 3. Emit socket event
  const booking = req.body;
  // ... processing ...
  io.emit('new_booking', booking); // Notify all clients
  res.status(201).json({ message: 'Booking created' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
