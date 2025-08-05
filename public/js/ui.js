// UI Management for DeepFake Defense
class UI {
    constructor() {
        this.currentScreen = 'main-menu';
        this.screens = {};
        this.overlays = {};
        
        this.init();
    }
    
    init() {
        this.setupScreens();
        this.setupEventListeners();
        this.hideLoadingScreen();
    }
    
    setupScreens() {
        // Get all screen elements
        this.screens = {
            'main-menu': document.getElementById('main-menu'),
            'game-screen': document.getElementById('game-screen'),
            'game-over-screen': document.getElementById('game-over-screen'),
            'leaderboard-screen': document.getElementById('leaderboard-screen'),
            'tutorial-screen': document.getElementById('tutorial-screen'),
            'settings-screen': document.getElementById('settings-screen')
        };
        
        // Get overlay elements
        this.overlays = {
            'pause-menu': document.getElementById('pause-menu'),
            'doubt-explanation': document.getElementById('doubt-explanation')
        };
    }
    
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('show-leaderboard').addEventListener('click', () => {
            this.showScreen('leaderboard-screen');
            this.loadLeaderboard();
        });
        
        document.getElementById('show-tutorial').addEventListener('click', () => {
            this.showScreen('tutorial-screen');
        });
        
        document.getElementById('show-settings').addEventListener('click', () => {
            this.showScreen('settings-screen');
            this.loadSettings();
        });
        
        // Game over screen buttons
        document.getElementById('play-again').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showScreen('main-menu');
        });
        
        document.getElementById('submit-score').addEventListener('click', () => {
            this.submitScore();
        });
        
        // Leaderboard screen buttons
        document.getElementById('back-from-leaderboard').addEventListener('click', () => {
            this.showScreen('main-menu');
        });
        
        // Tutorial screen buttons
        document.getElementById('back-from-tutorial').addEventListener('click', () => {
            this.showScreen('main-menu');
        });
        
        // Settings screen buttons
        document.getElementById('back-from-settings').addEventListener('click', () => {
            this.saveSettings();
            this.showScreen('main-menu');
        });
        
        // Pause menu buttons
        document.getElementById('resume-game').addEventListener('click', () => {
            this.hidePauseMenu();
            if (window.game) {
                window.game.resumeGame();
            }
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.hidePauseMenu();
            this.startGame();
        });
        
        document.getElementById('quit-game').addEventListener('click', () => {
            this.hidePauseMenu();
            this.showScreen('main-menu');
        });
        
        // Doubt explanation buttons
        document.getElementById('close-explanation').addEventListener('click', () => {
            this.hideDoubtExplanation();
        });
        
        // Settings controls
        this.setupSettingsControls();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    setupSettingsControls() {
        const soundVolume = document.getElementById('sound-volume');
        const musicVolume = document.getElementById('music-volume');
        const soundValue = document.getElementById('sound-value');
        const musicValue = document.getElementById('music-value');
        
        soundVolume.addEventListener('input', (e) => {
            const value = e.target.value;
            soundValue.textContent = `${value}%`;
            AudioManager.setSoundVolume(value / 100);
        });
        
        musicVolume.addEventListener('input', (e) => {
            const value = e.target.value;
            musicValue.textContent = `${value}%`;
            AudioManager.setMusicVolume(value / 100);
        });
        
        // Fullscreen toggle
        document.getElementById('fullscreen-toggle').addEventListener('change', (e) => {
            this.toggleFullscreen(e.target.checked);
        });
    }
    
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.code) {
            case 'Escape':
                if (this.currentScreen === 'game-screen') {
                    if (window.game && window.game.gameState === 'playing') {
                        window.game.pauseGame();
                    }
                } else {
                    this.showScreen('main-menu');
                }
                break;
        }
    }
    
    showScreen(screenName) {
        // Hide current screen
        if (this.screens[this.currentScreen]) {
            this.screens[this.currentScreen].classList.remove('active');
        }
        
        // Show new screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
        
        // Handle screen-specific actions
        switch (screenName) {
            case 'game-screen':
                this.setupGameScreen();
                break;
            case 'main-menu':
                this.setupMainMenu();
                break;
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 2000);
        }
    }
    
    startGame() {
        this.showScreen('game-screen');
        if (window.game) {
            window.game.startGame();
        }
    }
    
    setupGameScreen() {
        // Initialize game if not already done
        if (!window.game) {
            window.game = new DeepFakeDefense();
        }
    }
    
    setupMainMenu() {
        // Stop any ongoing game
        if (window.game) {
            window.game.gameState = 'menu';
        }
    }
    
    showPauseMenu() {
        this.overlays['pause-menu'].classList.remove('hidden');
    }
    
    hidePauseMenu() {
        this.overlays['pause-menu'].classList.add('hidden');
    }
    
    showDoubtExplanation(explanation) {
        const explanationText = document.getElementById('explanation-text');
        explanationText.textContent = explanation;
        this.overlays['doubt-explanation'].classList.remove('hidden');
        
        // Pause the game
        if (window.game && window.game.gameState === 'playing') {
            window.game.gameState = 'paused';
        }
    }
    
    hideDoubtExplanation() {
        this.overlays['doubt-explanation'].classList.add('hidden');
        
        // Resume the game
        if (window.game && window.game.gameState === 'paused') {
            window.game.gameState = 'playing';
        }
    }
    
    showGameOver(finalStats) {
        // Update final stats
        document.getElementById('final-score').textContent = finalStats.score;
        document.getElementById('final-level').textContent = finalStats.level;
        document.getElementById('final-time').textContent = finalStats.time;
        document.getElementById('final-accuracy').textContent = `${finalStats.accuracy}%`;
        
        // Clear player name input
        document.getElementById('player-name').value = '';
        
        this.showScreen('game-over-screen');
    }
    
    async loadLeaderboard() {
        try {
            console.log('Loading leaderboard...');
            const response = await fetch('/api/leaderboard');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Leaderboard data received:', data);
            
            // Handle both formats: direct array or {leaderboard: [...]}
            const leaderboard = data.leaderboard || data;
            
            const leaderboardList = document.getElementById('leaderboard-list');
            if (!leaderboardList) {
                console.error('Leaderboard list element not found');
                return;
            }
            
            leaderboardList.innerHTML = '';
            
            if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
                console.log('No leaderboard data available');
                this.showLeaderboardError();
                return;
            }
            
            console.log(`Displaying ${leaderboard.length} leaderboard entries`);
            leaderboard.forEach((entry, index) => {
                const entryElement = document.createElement('div');
                entryElement.className = 'leaderboard-entry';
                entryElement.innerHTML = `
                    <span class="rank">#${index + 1}</span>
                    <span class="player-name">${entry.playerName}</span>
                    <span class="score-value">${entry.score}</span>
                `;
                leaderboardList.appendChild(entryElement);
            });
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showLeaderboardError();
        }
    }
    
    showLeaderboardError() {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #888;">
                <p>Unable to load leaderboard</p>
                <p>Please try again later</p>
            </div>
        `;
    }
    
    async submitScore() {
        const playerName = document.getElementById('player-name').value.trim();
        
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
        
        if (!window.game) {
            alert('No game data available');
            return;
        }
        
        try {
            const scoreData = {
                playerName: playerName,
                score: window.game.score,
                level: window.game.level,
                time: window.game.gameTime || 0
            };
            
            const response = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scoreData)
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Score submitted successfully!');
                this.showScreen('main-menu');
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to submit score');
            }
        } catch (error) {
            console.error('Error submitting score:', error);
            alert(`Failed to submit score: ${error.message}`);
        }
    }
    
    loadSettings() {
        const settings = window.game ? window.game.settings : {
            difficulty: 'normal',
            soundVolume: 50,
            musicVolume: 30,
            fullscreen: false
        };
        
        document.getElementById('sound-volume').value = settings.soundVolume;
        document.getElementById('sound-value').textContent = `${settings.soundVolume}%`;
        
        document.getElementById('music-volume').value = settings.musicVolume;
        document.getElementById('music-value').textContent = `${settings.musicVolume}%`;
        
        document.getElementById('difficulty').value = settings.difficulty;
        document.getElementById('fullscreen-toggle').checked = settings.fullscreen;
    }
    
    saveSettings() {
        const settings = {
            difficulty: document.getElementById('difficulty').value,
            soundVolume: parseInt(document.getElementById('sound-volume').value),
            musicVolume: parseInt(document.getElementById('music-volume').value),
            fullscreen: document.getElementById('fullscreen-toggle').checked
        };
        
        if (window.game) {
            window.game.settings = settings;
            window.game.saveSettings();
        }
        
        // Apply settings
        if (window.AudioManager && typeof window.AudioManager.setSoundVolume === 'function') {
            window.AudioManager.setSoundVolume(settings.soundVolume / 100);
        }
        if (window.AudioManager && typeof window.AudioManager.setMusicVolume === 'function') {
            window.AudioManager.setMusicVolume(settings.musicVolume / 100);
        }
        
        if (settings.fullscreen) {
            this.toggleFullscreen(true);
        }
    }
    
    toggleFullscreen(enabled) {
        if (enabled) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#00ffff'};
            color: #000;
            padding: 1rem 2rem;
            border-radius: 5px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showInfo(message) {
        this.showNotification(message, 'info');
    }
    
    // Animation utilities
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    fadeOut(element, duration = 300) {
        let start = null;
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(initialOpacity - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Screen transition effects
    transitionToScreen(fromScreen, toScreen, effect = 'fade') {
        const fromElement = this.screens[fromScreen];
        const toElement = this.screens[toScreen];
        
        if (!fromElement || !toElement) return;
        
        switch (effect) {
            case 'fade':
                this.fadeOut(fromElement, 200);
                setTimeout(() => {
                    this.showScreen(toScreen);
                    this.fadeIn(toElement, 200);
                }, 200);
                break;
                
            case 'slide':
                // Slide transition effect
                fromElement.style.transform = 'translateX(0)';
                toElement.style.transform = 'translateX(100%)';
                toElement.style.display = 'block';
                
                setTimeout(() => {
                    fromElement.style.transform = 'translateX(-100%)';
                    toElement.style.transform = 'translateX(0)';
                }, 50);
                break;
                
            default:
                this.showScreen(toScreen);
                break;
        }
    }
}

// Create global instance
window.UI = new UI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
} 