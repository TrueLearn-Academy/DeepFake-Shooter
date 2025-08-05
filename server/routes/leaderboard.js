const express = require('express');
const router = express.Router();

// In-memory storage for demo purposes
// In production, this would be replaced with a database
let leaderboard = [
    {
        id: 1,
        playerName: 'CYBER_WARRIOR',
        score: 1250,
        level: 8,
        time: 180000, // milliseconds
        date: '2024-01-15T10:30:00.000Z'
    },
    {
        id: 2,
        playerName: 'FAKE_HUNTER',
        score: 980,
        level: 6,
        time: 150000,
        date: '2024-01-14T15:45:00.000Z'
    },
    {
        id: 3,
        playerName: 'AI_DEFENDER',
        score: 750,
        level: 5,
        time: 120000,
        date: '2024-01-13T09:20:00.000Z'
    },
    {
        id: 4,
        playerName: 'TRUTH_SEEKER',
        score: 620,
        level: 4,
        time: 90000,
        date: '2024-01-12T14:15:00.000Z'
    },
    {
        id: 5,
        playerName: 'MEDIA_GUARDIAN',
        score: 480,
        level: 3,
        time: 75000,
        date: '2024-01-11T11:30:00.000Z'
    }
];

let nextId = 6;

// Get leaderboard
router.get('/', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        
        // Sort by score (descending), then by date (newest first)
        const sortedLeaderboard = leaderboard
            .sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return new Date(b.date) - new Date(a.date);
            })
            .slice(offset, offset + limit);
        
        res.json({
            leaderboard: sortedLeaderboard,
            total: leaderboard.length,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({
            error: 'Failed to retrieve leaderboard'
        });
    }
});

// Submit a new score
router.post('/', (req, res) => {
    try {
        const { playerName, score, level, time } = req.body;
        
        // Validation
        if (!playerName || !score || !level) {
            return res.status(400).json({
                error: 'Missing required fields: playerName, score, level'
            });
        }
        
        if (typeof playerName !== 'string' || playerName.trim().length === 0) {
            return res.status(400).json({
                error: 'Player name must be a non-empty string'
            });
        }
        
        if (typeof score !== 'number' || score < 0) {
            return res.status(400).json({
                error: 'Score must be a non-negative number'
            });
        }
        
        if (typeof level !== 'number' || level < 1) {
            return res.status(400).json({
                error: 'Level must be a positive number'
            });
        }
        
        // Sanitize player name
        const sanitizedName = playerName.trim().substring(0, 20);
        
        // Create new score entry
        const newScore = {
            id: nextId++,
            playerName: sanitizedName,
            score: Math.floor(score),
            level: Math.floor(level),
            time: time || 0,
            date: new Date().toISOString()
        };
        
        // Add to leaderboard
        leaderboard.push(newScore);
        
        // Sort leaderboard
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return new Date(b.date) - new Date(a.date);
        });
        
        // Keep only top 100 scores
        if (leaderboard.length > 100) {
            leaderboard = leaderboard.slice(0, 100);
        }
        
        // Find position of new score
        const position = leaderboard.findIndex(entry => entry.id === newScore.id) + 1;
        
        res.status(201).json({
            message: 'Score submitted successfully',
            score: newScore,
            position,
            totalScores: leaderboard.length
        });
        
    } catch (error) {
        console.error('Error submitting score:', error);
        res.status(500).json({
            error: 'Failed to submit score'
        });
    }
});

// Get player's best score
router.get('/player/:playerName', (req, res) => {
    try {
        const { playerName } = req.params;
        
        if (!playerName) {
            return res.status(400).json({
                error: 'Player name is required'
            });
        }
        
        const playerScores = leaderboard
            .filter(entry => entry.playerName.toLowerCase() === playerName.toLowerCase())
            .sort((a, b) => b.score - a.score);
        
        if (playerScores.length === 0) {
            return res.status(404).json({
                error: 'No scores found for this player'
            });
        }
        
        const bestScore = playerScores[0];
        const position = leaderboard.findIndex(entry => entry.id === bestScore.id) + 1;
        
        res.json({
            playerName: bestScore.playerName,
            bestScore: bestScore.score,
            level: bestScore.level,
            time: bestScore.time,
            date: bestScore.date,
            position,
            totalScores: playerScores.length
        });
        
    } catch (error) {
        console.error('Error getting player score:', error);
        res.status(500).json({
            error: 'Failed to retrieve player score'
        });
    }
});

// Get leaderboard statistics
router.get('/stats', (req, res) => {
    try {
        if (leaderboard.length === 0) {
            return res.json({
                totalScores: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                totalPlayers: 0
            });
        }
        
        const scores = leaderboard.map(entry => entry.score);
        const uniquePlayers = new Set(leaderboard.map(entry => entry.playerName));
        
        const stats = {
            totalScores: leaderboard.length,
            averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            totalPlayers: uniquePlayers.size
        };
        
        res.json(stats);
        
    } catch (error) {
        console.error('Error getting leaderboard stats:', error);
        res.status(500).json({
            error: 'Failed to retrieve leaderboard statistics'
        });
    }
});

// Get recent scores
router.get('/recent', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const recentScores = leaderboard
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
        
        res.json({
            recentScores,
            total: recentScores.length
        });
        
    } catch (error) {
        console.error('Error getting recent scores:', error);
        res.status(500).json({
            error: 'Failed to retrieve recent scores'
        });
    }
});

// Delete a score (admin function)
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const scoreId = parseInt(id);
        
        const scoreIndex = leaderboard.findIndex(entry => entry.id === scoreId);
        
        if (scoreIndex === -1) {
            return res.status(404).json({
                error: 'Score not found'
            });
        }
        
        const deletedScore = leaderboard.splice(scoreIndex, 1)[0];
        
        res.json({
            message: 'Score deleted successfully',
            deletedScore
        });
        
    } catch (error) {
        console.error('Error deleting score:', error);
        res.status(500).json({
            error: 'Failed to delete score'
        });
    }
});

// Clear leaderboard (admin function)
router.delete('/', (req, res) => {
    try {
        const count = leaderboard.length;
        leaderboard = [];
        nextId = 1;
        
        res.json({
            message: 'Leaderboard cleared successfully',
            deletedCount: count
        });
        
    } catch (error) {
        console.error('Error clearing leaderboard:', error);
        res.status(500).json({
            error: 'Failed to clear leaderboard'
        });
    }
});

module.exports = router; 