import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import universityRoutes from './routes/university.js';
import { authenticateToken } from './middleware/auth.js';
import './config/passport.js'; // Adjust path as needed
import passport from 'passport';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // 👈 Specific origin, NOT '*'
  credentials: true,               // 👈 Allow cookies, Authorization headers, etc.
}));
app.use(passport.initialize()); // ✅ Required to use passport
app.use(cookieParser());

// Connect to MongoDB
mongoose
  .connect(`${process.env.MONGODB_URI}/lvlup`)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/university', authenticateToken, universityRoutes);
app.use('/api/admin',authenticateToken, adminRoutes) 

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
