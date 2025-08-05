// Media Management for DeepFake Defense
class MediaManager {
    constructor() {
        this.realMedia = [];
        this.fakeMedia = [];
        this.loadedImages = new Map();
        this.currentIndex = 0;
        
        this.init();
    }
    
    async init() {
        await this.loadMediaData();
        this.preloadImages();
    }
    
    async loadMediaData() {
        try {
            // Load real media data
            const realResponse = await fetch('data/real-media.json');
            this.realMedia = await realResponse.json();
            
            // Load fake media data
            const fakeResponse = await fetch('data/fake-media.json');
            this.fakeMedia = await fakeResponse.json();
            
            console.log(`Loaded ${this.realMedia.length} real media items and ${this.fakeMedia.length} fake media items`);
        } catch (error) {
            console.error('Error loading media data:', error);
            // Fallback to default data
            this.loadDefaultMedia();
        }
    }
    
    loadDefaultMedia() {
        // Default real media
        this.realMedia = [
            {
                type: 'image',
                content: 'Real celebrity photo',
                url: 'https://picsum.photos/200/200?random=1',
                description: 'Authentic photo of a well-known public figure',
                source: 'Verified news source'
            },
            {
                type: 'quote',
                content: 'The only way to do great work is to love what you do.',
                author: 'Steve Jobs',
                description: 'Famous quote from Apple co-founder',
                source: 'Stanford Commencement Speech, 2005'
            },
            {
                type: 'image',
                content: 'Real event photo',
                url: 'https://picsum.photos/200/200?random=2',
                description: 'Photo from a documented public event',
                source: 'Official event photographer'
            },
            {
                type: 'quote',
                content: 'Be the change you wish to see in the world.',
                author: 'Mahatma Gandhi',
                description: 'Well-known inspirational quote',
                source: 'Various historical records'
            },
            {
                type: 'image',
                content: 'Real landscape photo',
                url: 'https://picsum.photos/200/200?random=3',
                description: 'Natural landscape photograph',
                source: 'Professional photographer'
            }
        ];
        
        // Default fake media
        this.fakeMedia = [
            {
                type: 'image',
                content: 'AI-generated face',
                url: 'https://thispersondoesnotexist.com/',
                description: 'Computer-generated human face',
                source: 'StyleGAN AI model',
                fakeIndicators: ['Perfect symmetry', 'Unrealistic features', 'AI artifacts']
            },
            {
                type: 'quote',
                content: 'I never said that technology would solve all our problems.',
                author: 'Albert Einstein',
                description: 'Fabricated quote attributed to Einstein',
                source: 'Misattributed online',
                fakeIndicators: ['No historical record', 'Modern language', 'Misattributed']
            },
            {
                type: 'image',
                content: 'Deepfake video frame',
                url: 'https://picsum.photos/200/200?random=4',
                description: 'AI-manipulated video content',
                source: 'Deepfake technology',
                fakeIndicators: ['Facial inconsistencies', 'Unnatural movements', 'AI artifacts']
            },
            {
                type: 'quote',
                content: 'The internet is just a passing fad.',
                author: 'Bill Gates',
                description: 'Fake quote about the internet',
                source: 'Misattributed',
                fakeIndicators: ['Never said this', 'Contradicts known views', 'No source']
            },
            {
                type: 'image',
                content: 'Synthetic image',
                url: 'https://picsum.photos/200/200?random=5',
                description: 'Computer-generated image',
                source: 'AI image generator',
                fakeIndicators: ['Unrealistic details', 'AI patterns', 'Synthetic appearance']
            }
        ];
    }
    
    preloadImages() {
        // Preload images for better performance
        const allMedia = [...this.realMedia, ...this.fakeMedia];
        
        allMedia.forEach(media => {
            if (media.url && media.type === 'image') {
                this.loadImage(media.url);
            }
        });
    }
    
    loadImage(url) {
        if (this.loadedImages.has(url)) {
            return Promise.resolve(this.loadedImages.get(url));
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.loadedImages.set(url, img);
                resolve(img);
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    }
    
    getRandomMedia() {
        // Randomly choose between real and fake media
        const isFake = Math.random() < 0.5;
        const mediaArray = isFake ? this.fakeMedia : this.realMedia;
        
        if (mediaArray.length === 0) {
            return this.createFallbackMedia(isFake);
        }
        
        const randomIndex = Math.floor(Math.random() * mediaArray.length);
        const mediaData = mediaArray[randomIndex];
        
        return new MediaItem(
            mediaData.type,
            mediaData.content,
            isFake,
            mediaData.url
        );
    }
    
    createFallbackMedia(isFake) {
        if (isFake) {
            return new MediaItem(
                'image',
                'AI Generated Content',
                true,
                null
            );
        } else {
            return new MediaItem(
                'image',
                'Real Content',
                false,
                null
            );
        }
    }
    
    getMediaByType(type) {
        const realOfType = this.realMedia.filter(m => m.type === type);
        const fakeOfType = this.fakeMedia.filter(m => m.type === type);
        
        return {
            real: realOfType,
            fake: fakeOfType
        };
    }
    
    getMediaInfo(mediaItem) {
        // Find the media data for this item
        const allMedia = [...this.realMedia, ...this.fakeMedia];
        const mediaData = allMedia.find(m => 
            m.content === mediaItem.content && 
            m.type === mediaItem.type
        );
        
        return mediaData || {
            type: mediaItem.type,
            content: mediaItem.content,
            description: 'Media content',
            source: 'Unknown'
        };
    }
    
    async fetchAIGeneratedImage() {
        try {
            // Try to fetch from ThisPersonDoesNotExist
            const response = await fetch('https://thispersondoesnotexist.com/', {
                mode: 'no-cors' // Note: This won't work due to CORS, but shows the intent
            });
            
            // For demo purposes, return a placeholder
            return 'https://picsum.photos/200/200?random=' + Date.now();
        } catch (error) {
            console.error('Error fetching AI image:', error);
            // Return a placeholder image
            return 'https://picsum.photos/200/200?random=' + Date.now();
        }
    }
    
    async fetchRealImage() {
        try {
            // Use Unsplash API for real images (requires API key)
            // For demo purposes, use Picsum
            return 'https://picsum.photos/200/200?random=' + (Date.now() + 1000);
        } catch (error) {
            console.error('Error fetching real image:', error);
            return 'https://picsum.photos/200/200?random=' + (Date.now() + 1000);
        }
    }
    
    generateFakeQuote() {
        const fakeQuotes = [
            {
                content: "I never said that technology would solve all our problems.",
                author: "Albert Einstein",
                fakeIndicators: ["No historical record", "Modern language", "Misattributed"]
            },
            {
                content: "The internet is just a passing fad.",
                author: "Bill Gates",
                fakeIndicators: ["Never said this", "Contradicts known views", "No source"]
            },
            {
                content: "Social media is the future of communication.",
                author: "Mark Zuckerberg",
                fakeIndicators: ["Taken out of context", "Misquoted", "Fabricated"]
            },
            {
                content: "Artificial intelligence will never replace human creativity.",
                author: "Steve Jobs",
                fakeIndicators: ["Died before AI era", "No record of this quote", "Misattributed"]
            },
            {
                content: "Climate change is not a real concern.",
                author: "Elon Musk",
                fakeIndicators: ["Contradicts public statements", "No source", "Fabricated"]
            }
        ];
        
        return fakeQuotes[Math.floor(Math.random() * fakeQuotes.length)];
    }
    
    generateRealQuote() {
        const realQuotes = [
            {
                content: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                source: "Stanford Commencement Speech, 2005"
            },
            {
                content: "Be the change you wish to see in the world.",
                author: "Mahatma Gandhi",
                source: "Various historical records"
            },
            {
                content: "Life is what happens when you're busy making other plans.",
                author: "John Lennon",
                source: "Beautiful Boy (Darling Boy) song"
            },
            {
                content: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt",
                source: "Various speeches and writings"
            },
            {
                content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill",
                source: "Various speeches"
            }
        ];
        
        return realQuotes[Math.floor(Math.random() * realQuotes.length)];
    }
    
    validateMedia(mediaItem) {
        // Basic validation for media items
        const issues = [];
        
        if (!mediaItem.type) {
            issues.push('Missing media type');
        }
        
        if (!mediaItem.content) {
            issues.push('Missing content');
        }
        
        if (mediaItem.type === 'image' && !mediaItem.url) {
            issues.push('Missing image URL');
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }
    
    getMediaStatistics() {
        return {
            totalReal: this.realMedia.length,
            totalFake: this.fakeMedia.length,
            byType: {
                image: this.getMediaByType('image'),
                quote: this.getMediaByType('quote'),
                video: this.getMediaByType('video')
            }
        };
    }
    
    async addCustomMedia(mediaData, isFake = false) {
        // Validate the media data
        const validation = this.validateMedia(mediaData);
        if (!validation.isValid) {
            throw new Error(`Invalid media data: ${validation.issues.join(', ')}`);
        }
        
        // Add to appropriate array
        if (isFake) {
            this.fakeMedia.push(mediaData);
        } else {
            this.realMedia.push(mediaData);
        }
        
        // Preload image if it's an image type
        if (mediaData.type === 'image' && mediaData.url) {
            await this.loadImage(mediaData.url);
        }
        
        console.log(`Added ${isFake ? 'fake' : 'real'} media: ${mediaData.content}`);
    }
    
    removeMedia(content, isFake = false) {
        const mediaArray = isFake ? this.fakeMedia : this.realMedia;
        const index = mediaArray.findIndex(m => m.content === content);
        
        if (index !== -1) {
            mediaArray.splice(index, 1);
            console.log(`Removed ${isFake ? 'fake' : 'real'} media: ${content}`);
            return true;
        }
        
        return false;
    }
    
    exportMediaData() {
        return {
            real: this.realMedia,
            fake: this.fakeMedia,
            timestamp: new Date().toISOString()
        };
    }
    
    importMediaData(data) {
        if (data.real && Array.isArray(data.real)) {
            this.realMedia = data.real;
        }
        
        if (data.fake && Array.isArray(data.fake)) {
            this.fakeMedia = data.fake;
        }
        
        // Preload images for imported data
        this.preloadImages();
        
        console.log('Media data imported successfully');
    }
}

// Create global instance
window.MediaManager = new MediaManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MediaManager;
} 