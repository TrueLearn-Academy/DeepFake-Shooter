const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const leaderboardRoutes = require('./routes/leaderboard');
const mediaRoutes = require('./routes/media');

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "https://api.openai.com"],
            mediaSrc: ["'self'", "data:", "blob:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/media', mediaRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Game configuration endpoint
app.get('/api/config', (req, res) => {
    res.json({
        gameVersion: '1.0.0',
        features: {
            aiExplanations: true,
            leaderboard: true,
            customMedia: true
        },
        settings: {
            maxScoreLength: 20,
            maxLeaderboardEntries: 100,
            rateLimit: {
                requests: 100,
                windowMs: 15 * 60 * 1000
            }
        }
    });
});

// Serve the main game page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'Invalid JSON format'
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            details: err.message
        });
    }
    
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 DeepFake Defense server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    
    if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        console.log(`⚙️  Config: http://localhost:${PORT}/api/config`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app; 