// Audio Management for DeepFake Defense
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.soundVolume = 0.5;
        this.musicVolume = 0.3;
        this.isMuted = false;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        this.loadSounds();
        this.setupAudioContext();
        this.isInitialized = true;
    }
    
    setupAudioContext() {
        // Create audio context for better audio control
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported, using fallback audio');
        }
    }
    
    loadSounds() {
        // Load sound effects
        this.sounds = {
            shoot: document.getElementById('shoot-sound'),
            hit: document.getElementById('hit-sound'),
            miss: document.getElementById('miss-sound'),
            gameOver: document.getElementById('game-over-sound')
        };
        
        // Load background music
        this.music = document.getElementById('background-music');
        
        // Set initial volumes
        this.updateSoundVolumes();
        this.updateMusicVolume();
        
        // Add error handling for audio loading
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.addEventListener('error', (e) => {
                    console.warn('Failed to load sound:', e.target.src);
                });
            }
        });
        
        if (this.music) {
            this.music.addEventListener('error', (e) => {
                console.warn('Failed to load background music:', e.target.src);
            });
        }
    }
    
    playShootSound() {
        this.playSound('shoot');
    }
    
    playHitSound() {
        this.playSound('hit');
    }
    
    playMissSound() {
        this.playSound('miss');
    }
    
    playGameOverSound() {
        this.playSound('gameOver');
    }
    
    playSound(soundName) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        try {
            // Clone the audio element to allow overlapping sounds
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.soundVolume;
            sound.play().catch(error => {
                console.warn('Failed to play sound:', soundName, error);
            });
        } catch (error) {
            console.warn('Error playing sound:', soundName, error);
        }
    }
    
    playBackgroundMusic() {
        if (this.isMuted || !this.music) return;
        
        try {
            this.music.volume = this.musicVolume;
            // Reset the music to the beginning if it's already playing
            if (!this.music.paused) {
                this.music.currentTime = 0;
            }
            this.music.play().catch(error => {
                console.warn('Failed to play background music:', error);
            });
        } catch (error) {
            console.warn('Error playing background music:', error);
        }
    }
    
    pauseBackgroundMusic() {
        if (this.music) {
            this.music.pause();
        }
    }
    
    resumeBackgroundMusic() {
        if (this.music && !this.isMuted) {
            this.music.play().catch(error => {
                console.warn('Failed to resume background music:', error);
            });
        }
    }
    
    stopBackgroundMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        this.updateSoundVolumes();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateMusicVolume();
    }
    
    updateSoundVolumes() {
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = this.soundVolume;
            }
        });
    }
    
    updateMusicVolume() {
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    }
    
    mute() {
        this.isMuted = true;
        this.updateSoundVolumes();
        this.updateMusicVolume();
    }
    
    unmute() {
        this.isMuted = false;
        this.updateSoundVolumes();
        this.updateMusicVolume();
    }
    
    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }
    
    // Advanced audio features
    playSoundWithPitch(soundName, pitch = 1.0) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.soundVolume;
            sound.playbackRate = pitch;
            sound.play().catch(error => {
                console.warn('Failed to play sound with pitch:', soundName, error);
            });
        } catch (error) {
            console.warn('Error playing sound with pitch:', soundName, error);
        }
    }
    
    playSoundWithDelay(soundName, delay = 0) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        setTimeout(() => {
            this.playSound(soundName);
        }, delay);
    }
    
    createAudioSequence(sounds) {
        let delay = 0;
        sounds.forEach(sound => {
            this.playSoundWithDelay(sound.name, delay);
            delay += sound.delay || 100;
        });
    }
    
    // Spatial audio simulation (for future enhancement)
    playSpatialSound(soundName, x, y, canvasWidth, canvasHeight) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.soundVolume;
            
            // Calculate pan based on x position
            const pan = (x / canvasWidth - 0.5) * 2; // -1 to 1
            sound.style.pan = pan;
            
            sound.play().catch(error => {
                console.warn('Failed to play spatial sound:', soundName, error);
            });
        } catch (error) {
            console.warn('Error playing spatial sound:', soundName, error);
        }
    }
    
    // Audio visualization (for future enhancement)
    getAudioData() {
        if (!this.audioContext || !this.music) return null;
        
        try {
            const analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaElementSource(this.music);
            
            source.connect(analyser);
            analyser.connect(this.audioContext.destination);
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            
            return dataArray;
        } catch (error) {
            console.warn('Error getting audio data:', error);
            return null;
        }
    }
    
    // Preload audio for better performance
    preloadAudio() {
        const audioFiles = [
            'assets/sounds/shoot.mp3',
            'assets/sounds/hit.mp3',
            'assets/sounds/miss.mp3',
            'assets/sounds/game-over.mp3',
            'assets/sounds/background.mp3'
        ];
        
        audioFiles.forEach(url => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = url;
        });
    }
    
    // Audio effects and filters
    applyLowPassFilter(sound, frequency = 1000) {
        if (!this.audioContext) return;
        
        try {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = frequency;
            
            return filter;
        } catch (error) {
            console.warn('Error applying low pass filter:', error);
            return null;
        }
    }
    
    applyReverb(sound, decay = 2.0) {
        if (!this.audioContext) return;
        
        try {
            const convolver = this.audioContext.createConvolver();
            // Create impulse response for reverb effect
            const sampleRate = this.audioContext.sampleRate;
            const length = sampleRate * decay;
            const impulse = this.audioContext.createBuffer(2, length, sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
                }
            }
            
            convolver.buffer = impulse;
            return convolver;
        } catch (error) {
            console.warn('Error applying reverb:', error);
            return null;
        }
    }
    
    // Audio state management
    saveAudioSettings() {
        const settings = {
            soundVolume: this.soundVolume,
            musicVolume: this.musicVolume,
            isMuted: this.isMuted
        };
        
        localStorage.setItem('deepfake-defense-audio-settings', JSON.stringify(settings));
    }
    
    loadAudioSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('deepfake-defense-audio-settings'));
            if (settings) {
                this.soundVolume = settings.soundVolume || 0.5;
                this.musicVolume = settings.musicVolume || 0.3;
                this.isMuted = settings.isMuted || false;
                
                this.updateSoundVolumes();
                this.updateMusicVolume();
            }
        } catch (error) {
            console.warn('Error loading audio settings:', error);
        }
    }
    
    // Audio diagnostics
    getAudioStatus() {
        return {
            isInitialized: this.isInitialized,
            isMuted: this.isMuted,
            soundVolume: this.soundVolume,
            musicVolume: this.musicVolume,
            audioContextState: this.audioContext ? this.audioContext.state : 'not-supported',
            soundsLoaded: Object.keys(this.sounds).length,
            musicLoaded: !!this.music
        };
    }
    
    // Audio cleanup
    cleanup() {
        if (this.music) {
            this.music.pause();
            this.music.src = '';
        }
        
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.pause();
                sound.src = '';
            }
        });
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Create global instance
window.AudioManager = new AudioManager();

// Initialize audio when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.AudioManager) {
        window.AudioManager.loadAudioSettings();
    }
});

// Save audio settings before page unload
window.addEventListener('beforeunload', () => {
    if (window.AudioManager) {
        window.AudioManager.saveAudioSettings();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} 