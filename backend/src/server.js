import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import responseRoutes from './routes/responseRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Survey API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to Database & Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {                               //DB's connection
    
    await connectDB();
    
    await connectRedis();
    
    // Run Server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
      console.log(` Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();