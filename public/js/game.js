// DeepFake Defense - Main Game Logic
class DeepFakeDefense {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.gameTime = 0;
        this.startTime = 0;
        
        // Game settings
        this.settings = {
            difficulty: 'normal',
            soundVolume: 50,
            musicVolume: 30,
            fullscreen: false
        };
        
        // Game objects
        this.mediaItems = [];
        this.bullets = [];
        this.particles = [];
        this.defenseLine = null;
        
        // Game mechanics
        this.spawnRate = 2000; // milliseconds
        this.lastSpawn = 0;
        this.mediaSpeed = 1;
        this.bulletSpeed = 8;
        
        // Shooter properties
        this.shooterX = 0;
        this.shooterY = 0;
        this.shooterWidth = 60;
        this.shooterHeight = 40;
        this.shooterSpeed = 5;
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadSettings();
        this.defenseLine = new DefenseLine(this.canvas.width, this.canvas.height);
        this.gameLoop();
    }
    
    setupCanvas() {
        // Set canvas size to window size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Initialize shooter position
        this.shooterX = this.canvas.width / 2 - this.shooterWidth / 2;
        this.shooterY = this.canvas.height - 80;
        
        if (this.defenseLine) {
            this.defenseLine.updateSize(this.canvas.width, this.canvas.height);
        }
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        this.canvas.addEventListener('click', (e) => {
            this.mouse.clicked = true;
            this.handleMouseClick(e);
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.mouse.x = touch.clientX;
            this.mouse.y = touch.clientY;
            this.mouse.clicked = true;
            this.handleMouseClick(e);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.mouse.x = touch.clientX;
            this.mouse.y = touch.clientY;
        });
    }
    
    handleKeyPress(e) {
        if (this.gameState === 'playing') {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.shoot();
                    break;
                case 'KeyQ':
                    this.useDoubt();
                    break;
                case 'Escape':
                    this.pauseGame();
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    this.moveShooter(-1);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    this.moveShooter(1);
                    break;
            }
        }
    }
    
    handleMouseClick(e) {
        if (this.gameState === 'playing') {
            this.shoot();
        }
        this.mouse.clicked = false;
    }
    
    moveShooter(direction) {
        if (this.gameState !== 'playing') return;
        
        const newX = this.shooterX + (direction * this.shooterSpeed);
        
        // Keep shooter within canvas bounds
        if (newX >= 0 && newX <= this.canvas.width - this.shooterWidth) {
            this.shooterX = newX;
        }
    }
    
    updateShooter() {
        // Handle continuous movement for held keys
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.moveShooter(-1);
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.moveShooter(1);
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.combo = 0;
        this.gameTime = 0;
        this.startTime = Date.now();
        this.mediaItems = [];
        this.bullets = [];
        this.particles = [];
        
        // Reset shooter position
        this.shooterX = this.canvas.width / 2 - this.shooterWidth / 2;
        this.shooterY = this.canvas.height - 80;
        
        // Reset game mechanics
        this.spawnRate = 2000;
        this.mediaSpeed = 1;
        this.lastSpawn = Date.now();
        
        // Start background music
        if (window.AudioManager && typeof window.AudioManager.playBackgroundMusic === 'function') {
            window.AudioManager.playBackgroundMusic();
        }
        
        // Update UI
        this.updateUI();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            if (window.AudioManager && typeof window.AudioManager.pauseBackgroundMusic === 'function') {
                window.AudioManager.pauseBackgroundMusic();
            }
            if (window.UI && typeof window.UI.showPauseMenu === 'function') {
                window.UI.showPauseMenu();
            }
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            if (window.AudioManager && typeof window.AudioManager.resumeBackgroundMusic === 'function') {
                window.AudioManager.resumeBackgroundMusic();
            }
            if (window.UI && typeof window.UI.hidePauseMenu === 'function') {
                window.UI.hidePauseMenu();
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        if (window.AudioManager && typeof window.AudioManager.stopBackgroundMusic === 'function') {
            window.AudioManager.stopBackgroundMusic();
        }
        if (window.AudioManager && typeof window.AudioManager.playGameOverSound === 'function') {
            window.AudioManager.playGameOverSound();
        }
        
        // Calculate final stats
        const finalStats = {
            score: this.score,
            level: this.level,
            time: this.formatTime(this.gameTime),
            accuracy: this.calculateAccuracy()
        };
        
        if (window.UI && typeof window.UI.showGameOver === 'function') {
            window.UI.showGameOver(finalStats);
        }
    }
    
    shoot() {
        if (this.gameState !== 'playing') return;
        
        if (window.AudioManager && typeof window.AudioManager.playShootSound === 'function') {
            window.AudioManager.playShootSound();
        }
        
        // Create bullet from shooter position
        const bullet = new Bullet(
            this.shooterX + this.shooterWidth / 2,
            this.shooterY,
            this.bulletSpeed
        );
        this.bullets.push(bullet);
        
        // Check for hits
        this.checkBulletCollisions();
    }
    
    useDoubt() {
        if (this.gameState !== 'playing') return;
        
        // Find the closest media item
        const closestItem = this.findClosestMediaItem();
        if (closestItem && window.AI && typeof window.AI.getExplanation === 'function') {
            window.AI.getExplanation(closestItem)
                .then(explanation => {
                    if (window.UI && typeof window.UI.showDoubtExplanation === 'function') {
                        window.UI.showDoubtExplanation(explanation);
                    }
                })
                .catch(error => {
                    console.error('Error getting AI explanation:', error);
                    if (window.UI && typeof window.UI.showDoubtExplanation === 'function') {
                        window.UI.showDoubtExplanation("AI analysis temporarily unavailable.");
                    }
                });
        }
    }
    
    findClosestMediaItem() {
        if (this.mediaItems.length === 0) return null;
        
        return this.mediaItems.reduce((closest, item) => {
            const closestDistance = Math.abs(closest.y - (this.canvas.height - 100));
            const itemDistance = Math.abs(item.y - (this.canvas.height - 100));
            return itemDistance < closestDistance ? item : closest;
        });
    }
    
    checkBulletCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.mediaItems.length - 1; j >= 0; j--) {
                const mediaItem = this.mediaItems[j];
                
                if (this.isColliding(bullet, mediaItem)) {
                    // Handle collision
                    this.handleCollision(bullet, mediaItem);
                    
                    // Remove bullet and media item
                    this.bullets.splice(i, 1);
                    this.mediaItems.splice(j, 1);
                    break;
                }
            }
        }
    }
    
    isColliding(bullet, mediaItem) {
        const dx = bullet.x - mediaItem.x;
        const dy = bullet.y - mediaItem.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (bullet.radius + mediaItem.radius);
    }
    
    handleCollision(bullet, mediaItem) {
        // Create explosion particles
        this.createExplosion(bullet.x, bullet.y);
        
        if (mediaItem.isFake) {
            // Correct hit
            this.score += 10 + (this.combo * 2);
            this.combo++;
            if (window.AudioManager && typeof window.AudioManager.playHitSound === 'function') {
                window.AudioManager.playHitSound();
            }
            this.createScorePopup(bullet.x, bullet.y, '+10');
        } else {
            // Wrong hit
            this.score = Math.max(0, this.score - 5);
            this.combo = 0;
            if (window.AudioManager && typeof window.AudioManager.playMissSound === 'function') {
                window.AudioManager.playMissSound();
            }
            this.createScorePopup(bullet.x, bullet.y, '-5');
        }
        
        this.updateUI();
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            const particle = new Particle(x, y, '#00ffff');
            this.particles.push(particle);
        }
    }
    
    createScorePopup(x, y, text) {
        const popup = new ScorePopup(x, y, text);
        this.particles.push(popup);
    }
    
    spawnMediaItem() {
        const now = Date.now();
        if (now - this.lastSpawn > this.spawnRate) {
            if (window.MediaManager && typeof window.MediaManager.getRandomMedia === 'function') {
                const mediaItem = window.MediaManager.getRandomMedia();
                mediaItem.x = Math.random() * (this.canvas.width - 200) + 100;
                mediaItem.y = -100;
                mediaItem.speed = this.mediaSpeed;
                this.mediaItems.push(mediaItem);
                this.lastSpawn = now;
            }
        }
    }
    
    updateMediaItems() {
        for (let i = this.mediaItems.length - 1; i >= 0; i--) {
            const item = this.mediaItems[i];
            item.update();
            
            // Check if item passed the defense line
            if (item.y > this.canvas.height + 100) {
                if (item.isFake) {
                    // Fake passed through - lose a life
                    this.lives--;
                    this.combo = 0;
                    if (window.AudioManager && typeof window.AudioManager.playMissSound === 'function') {
                        window.AudioManager.playMissSound();
                    }
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
                
                this.mediaItems.splice(i, 1);
            }
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            
            // Remove bullets that are off screen
            if (bullet.y < -50) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateDifficulty() {
        // Increase difficulty over time
        const timeElapsed = this.gameTime / 1000; // seconds
        const newLevel = Math.floor(timeElapsed / 30) + 1; // New level every 30 seconds
        
        if (newLevel > this.level) {
            this.level = newLevel;
            this.spawnRate = Math.max(500, 2000 - (this.level - 1) * 200);
            this.mediaSpeed = 1 + (this.level - 1) * 0.2;
            this.updateUI();
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = `x${this.combo}`;
        document.getElementById('level').textContent = this.level;
        document.getElementById('timer').textContent = this.formatTime(this.gameTime);
        
        // Update lives display
        const livesContainer = document.getElementById('lives');
        livesContainer.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const life = document.createElement('div');
            life.className = 'life';
            livesContainer.appendChild(life);
        }
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    calculateAccuracy() {
        // This would need to track total shots and hits
        // For now, return a placeholder
        return Math.floor(Math.random() * 40) + 60; // 60-100%
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background grid
        this.drawGrid();
        
        // Draw game objects
        this.defenseLine.draw(this.ctx);
        
        this.mediaItems.forEach(item => item.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        // Draw shooter
        this.drawShooter();
        
        // Draw crosshair
        this.drawCrosshair();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawShooter() {
        // Draw shooter glow
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 15;
        
        // Draw shooter body
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(this.shooterX, this.shooterY, this.shooterWidth, this.shooterHeight);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Draw shooter border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.shooterX, this.shooterY, this.shooterWidth, this.shooterHeight);
        
        // Draw shooter details
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.shooterX + 5, this.shooterY + 5, this.shooterWidth - 10, 5);
        this.ctx.fillRect(this.shooterX + 5, this.shooterY + this.shooterHeight - 10, this.shooterWidth - 10, 5);
        
        // Draw gun barrel
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.shooterX + this.shooterWidth / 2 - 2, this.shooterY - 10, 4, 10);
        
        // Draw shooter label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DEFENDER', this.shooterX + this.shooterWidth / 2, this.shooterY + this.shooterHeight + 15);
    }
    
    drawCrosshair() {
        const centerX = this.shooterX + this.shooterWidth / 2;
        const centerY = this.shooterY - 20;
        
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        // Draw crosshair
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 20, centerY);
        this.ctx.lineTo(centerX + 20, centerY);
        this.ctx.moveTo(centerX, centerY - 20);
        this.ctx.lineTo(centerX, centerY + 20);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            // Update game time
            this.gameTime = Date.now() - this.startTime;
            
            // Update game objects
            this.updateShooter();
            this.spawnMediaItem();
            this.updateMediaItems();
            this.updateBullets();
            this.updateParticles();
            this.updateDifficulty();
            this.checkBulletCollisions();
        }
        
        // Always render
        this.render();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('deepfake-defense-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('deepfake-defense-settings', JSON.stringify(this.settings));
    }
}

// Game Object Classes
class MediaItem {
    constructor(type, content, isFake, imageUrl = null) {
        this.type = type; // 'image', 'quote', 'video'
        this.content = content;
        this.isFake = isFake;
        this.imageUrl = imageUrl;
        this.x = 0;
        this.y = 0;
        this.speed = 1;
        this.radius = 50;
        this.rotation = 0;
        this.scale = 1;
        this.alpha = 1;
        this.image = null;
        
        if (imageUrl) {
            this.loadImage();
        }
    }
    
    loadImage() {
        this.image = new Image();
        this.image.onload = () => {
            // Image loaded successfully
        };
        this.image.onerror = () => {
            // Use fallback content
            this.image = null;
        };
        this.image.src = this.imageUrl;
    }
    
    update() {
        this.y += this.speed;
        this.rotation += 0.02;
        this.scale = 0.8 + Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.alpha;
        
        if (this.image && this.image.complete) {
            // Draw image
            ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            // Draw placeholder
            ctx.fillStyle = this.isFake ? '#ff4444' : '#44ff44';
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.type.toUpperCase(), 0, 0);
        }
        
        // Draw border
        ctx.strokeStyle = this.isFake ? '#ff0000' : '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        
        ctx.restore();
    }
}

class Bullet {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.radius = 3;
        this.trail = [];
    }
    
    update() {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) {
            this.trail.shift();
        }
        
        this.y -= this.speed;
    }
    
    draw(ctx) {
        // Draw trail
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = i / this.trail.length;
            ctx.globalAlpha = alpha;
            ctx.moveTo(this.trail[i].x, this.trail[i].y);
            ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Draw bullet
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.color = color;
        this.life = 60;
        this.maxLife = 60;
        this.size = Math.random() * 5 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class ScorePopup extends Particle {
    constructor(x, y, text) {
        super(x, y, '#ffffff');
        this.text = text;
        this.vy = -2;
        this.size = 0;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = '20px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

class DefenseLine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.y = height - 50;
    }
    
    updateSize(width, height) {
        this.width = width;
        this.height = height;
        this.y = height - 50;
    }
    
    draw(ctx) {
        // Draw defense line
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.width, this.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw warning text
        ctx.fillStyle = '#ff0000';
        ctx.font = '16px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('DEFENSE LINE', this.width / 2, this.y - 10);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new DeepFakeDefense();
}); 