const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// In-memory storage for custom media
let customMedia = {
    real: [],
    fake: []
};

// Load default media data
let realMedia = [];
let fakeMedia = [];

// Initialize media data
async function initializeMedia() {
    try {
        const realMediaPath = path.join(__dirname, '../../public/data/real-media.json');
        const fakeMediaPath = path.join(__dirname, '../../public/data/fake-media.json');
        
        const realData = await fs.readFile(realMediaPath, 'utf8');
        const fakeData = await fs.readFile(fakeMediaPath, 'utf8');
        
        realMedia = JSON.parse(realData);
        fakeMedia = JSON.parse(fakeData);
        
        console.log(`Loaded ${realMedia.length} real media items and ${fakeMedia.length} fake media items`);
    } catch (error) {
        console.error('Error loading media data:', error);
        // Fallback to empty arrays
        realMedia = [];
        fakeMedia = [];
    }
}

// Initialize on startup
initializeMedia();

// Get all media (real and fake)
router.get('/', (req, res) => {
    try {
        const { type, category, limit } = req.query;
        
        let allMedia = [
            ...realMedia.map(item => ({ ...item, source: 'default', isCustom: false })),
            ...fakeMedia.map(item => ({ ...item, source: 'default', isCustom: false })),
            ...customMedia.real.map(item => ({ ...item, source: 'custom', isCustom: true })),
            ...customMedia.fake.map(item => ({ ...item, source: 'custom', isCustom: true }))
        ];
        
        // Filter by type
        if (type) {
            allMedia = allMedia.filter(item => item.type === type);
        }
        
        // Filter by category
        if (category) {
            allMedia = allMedia.filter(item => item.category === category);
        }
        
        // Apply limit
        if (limit) {
            allMedia = allMedia.slice(0, parseInt(limit));
        }
        
        res.json({
            media: allMedia,
            total: allMedia.length,
            stats: {
                real: realMedia.length + customMedia.real.length,
                fake: fakeMedia.length + customMedia.fake.length,
                custom: customMedia.real.length + customMedia.fake.length
            }
        });
        
    } catch (error) {
        console.error('Error getting media:', error);
        res.status(500).json({
            error: 'Failed to retrieve media'
        });
    }
});

// Get random media item
router.get('/random', (req, res) => {
    try {
        const { type, isFake } = req.query;
        
        let mediaPool = [];
        
        if (isFake === 'true') {
            mediaPool = [...fakeMedia, ...customMedia.fake];
        } else if (isFake === 'false') {
            mediaPool = [...realMedia, ...customMedia.real];
        } else {
            // Random selection between real and fake
            const allReal = [...realMedia, ...customMedia.real];
            const allFake = [...fakeMedia, ...customMedia.fake];
            mediaPool = Math.random() < 0.5 ? allReal : allFake;
        }
        
        // Filter by type if specified
        if (type) {
            mediaPool = mediaPool.filter(item => item.type === type);
        }
        
        if (mediaPool.length === 0) {
            return res.status(404).json({
                error: 'No media found matching criteria'
            });
        }
        
        const randomIndex = Math.floor(Math.random() * mediaPool.length);
        const randomMedia = mediaPool[randomIndex];
        
        res.json({
            media: randomMedia,
            isFake: fakeMedia.includes(randomMedia) || customMedia.fake.includes(randomMedia)
        });
        
    } catch (error) {
        console.error('Error getting random media:', error);
        res.status(500).json({
            error: 'Failed to retrieve random media'
        });
    }
});

// Get media by type
router.get('/type/:type', (req, res) => {
    try {
        const { type } = req.params;
        const { isFake } = req.query;
        
        let mediaPool = [];
        
        if (isFake === 'true') {
            mediaPool = [...fakeMedia, ...customMedia.fake];
        } else if (isFake === 'false') {
            mediaPool = [...realMedia, ...customMedia.real];
        } else {
            mediaPool = [...realMedia, ...fakeMedia, ...customMedia.real, ...customMedia.fake];
        }
        
        const filteredMedia = mediaPool.filter(item => item.type === type);
        
        res.json({
            media: filteredMedia,
            total: filteredMedia.length,
            type
        });
        
    } catch (error) {
        console.error('Error getting media by type:', error);
        res.status(500).json({
            error: 'Failed to retrieve media by type'
        });
    }
});

// Get media categories
router.get('/categories', (req, res) => {
    try {
        const allMedia = [
            ...realMedia,
            ...fakeMedia,
            ...customMedia.real,
            ...customMedia.fake
        ];
        
        const categories = [...new Set(allMedia.map(item => item.category).filter(Boolean))];
        
        res.json({
            categories,
            total: categories.length
        });
        
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({
            error: 'Failed to retrieve categories'
        });
    }
});

// Add custom media
router.post('/custom', (req, res) => {
    try {
        const { type, content, author, description, source, url, category, isFake, fakeIndicators } = req.body;
        
        // Validation
        if (!type || !content) {
            return res.status(400).json({
                error: 'Missing required fields: type, content'
            });
        }
        
        if (!['image', 'quote', 'video'].includes(type)) {
            return res.status(400).json({
                error: 'Invalid media type. Must be image, quote, or video'
            });
        }
        
        if (typeof isFake !== 'boolean') {
            return res.status(400).json({
                error: 'isFake field is required and must be a boolean'
            });
        }
        
        // Create new media item
        const newMedia = {
            id: Date.now() + Math.random(),
            type,
            content: content.trim(),
            author: author ? author.trim() : null,
            description: description ? description.trim() : null,
            source: source ? source.trim() : 'Custom',
            url: url ? url.trim() : null,
            category: category ? category.trim() : 'custom',
            fakeIndicators: fakeIndicators || [],
            dateAdded: new Date().toISOString()
        };
        
        // Add to appropriate collection
        if (isFake) {
            customMedia.fake.push(newMedia);
        } else {
            customMedia.real.push(newMedia);
        }
        
        res.status(201).json({
            message: 'Custom media added successfully',
            media: newMedia,
            isFake
        });
        
    } catch (error) {
        console.error('Error adding custom media:', error);
        res.status(500).json({
            error: 'Failed to add custom media'
        });
    }
});

// Update custom media
router.put('/custom/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Find media in custom collections
        let mediaItem = customMedia.real.find(item => item.id == id) || 
                       customMedia.fake.find(item => item.id == id);
        
        if (!mediaItem) {
            return res.status(404).json({
                error: 'Custom media not found'
            });
        }
        
        // Update fields
        Object.keys(updates).forEach(key => {
            if (key !== 'id' && key !== 'dateAdded') {
                mediaItem[key] = updates[key];
            }
        });
        
        res.json({
            message: 'Custom media updated successfully',
            media: mediaItem
        });
        
    } catch (error) {
        console.error('Error updating custom media:', error);
        res.status(500).json({
            error: 'Failed to update custom media'
        });
    }
});

// Delete custom media
router.delete('/custom/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and remove from real custom media
        let mediaIndex = customMedia.real.findIndex(item => item.id == id);
        let isFake = false;
        
        if (mediaIndex === -1) {
            // Check fake custom media
            mediaIndex = customMedia.fake.findIndex(item => item.id == id);
            isFake = true;
        }
        
        if (mediaIndex === -1) {
            return res.status(404).json({
                error: 'Custom media not found'
            });
        }
        
        const deletedMedia = isFake 
            ? customMedia.fake.splice(mediaIndex, 1)[0]
            : customMedia.real.splice(mediaIndex, 1)[0];
        
        res.json({
            message: 'Custom media deleted successfully',
            deletedMedia
        });
        
    } catch (error) {
        console.error('Error deleting custom media:', error);
        res.status(500).json({
            error: 'Failed to delete custom media'
        });
    }
});

// Get custom media
router.get('/custom', (req, res) => {
    try {
        const { isFake } = req.query;
        
        let customMediaItems = [];
        
        if (isFake === 'true') {
            customMediaItems = customMedia.fake;
        } else if (isFake === 'false') {
            customMediaItems = customMedia.real;
        } else {
            customMediaItems = [...customMedia.real, ...customMedia.fake];
        }
        
        res.json({
            customMedia: customMediaItems,
            total: customMediaItems.length,
            stats: {
                real: customMedia.real.length,
                fake: customMedia.fake.length
            }
        });
        
    } catch (error) {
        console.error('Error getting custom media:', error);
        res.status(500).json({
            error: 'Failed to retrieve custom media'
        });
    }
});

// Export media data
router.get('/export', (req, res) => {
    try {
        const exportData = {
            real: [...realMedia, ...customMedia.real],
            fake: [...fakeMedia, ...customMedia.fake],
            custom: {
                real: customMedia.real,
                fake: customMedia.fake
            },
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        res.json(exportData);
        
    } catch (error) {
        console.error('Error exporting media:', error);
        res.status(500).json({
            error: 'Failed to export media data'
        });
    }
});

// Import media data
router.post('/import', (req, res) => {
    try {
        const { real, fake, custom } = req.body;
        
        if (real && Array.isArray(real)) {
            realMedia = real;
        }
        
        if (fake && Array.isArray(fake)) {
            fakeMedia = fake;
        }
        
        if (custom) {
            if (custom.real && Array.isArray(custom.real)) {
                customMedia.real = custom.real;
            }
            if (custom.fake && Array.isArray(custom.fake)) {
                customMedia.fake = custom.fake;
            }
        }
        
        res.json({
            message: 'Media data imported successfully',
            stats: {
                real: realMedia.length + customMedia.real.length,
                fake: fakeMedia.length + customMedia.fake.length,
                custom: customMedia.real.length + customMedia.fake.length
            }
        });
        
    } catch (error) {
        console.error('Error importing media:', error);
        res.status(500).json({
            error: 'Failed to import media data'
        });
    }
});

// Get media statistics
router.get('/stats', (req, res) => {
    try {
        const stats = {
            total: realMedia.length + fakeMedia.length + customMedia.real.length + customMedia.fake.length,
            real: {
                default: realMedia.length,
                custom: customMedia.real.length,
                total: realMedia.length + customMedia.real.length
            },
            fake: {
                default: fakeMedia.length,
                custom: customMedia.fake.length,
                total: fakeMedia.length + customMedia.fake.length
            },
            byType: {
                image: 0,
                quote: 0,
                video: 0
            },
            byCategory: {}
        };
        
        // Count by type
        const allMedia = [
            ...realMedia,
            ...fakeMedia,
            ...customMedia.real,
            ...customMedia.fake
        ];
        
        allMedia.forEach(item => {
            if (item.type) {
                stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
            }
            
            if (item.category) {
                stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
            }
        });
        
        res.json(stats);
        
    } catch (error) {
        console.error('Error getting media stats:', error);
        res.status(500).json({
            error: 'Failed to retrieve media statistics'
        });
    }
});

module.exports = router; 