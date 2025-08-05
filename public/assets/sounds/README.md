# Sound Assets for DeepFake Defense

This directory should contain the following audio files for the game:

## Required Sound Files

### Sound Effects
- `shoot.mp3` - Sound when player shoots
- `hit.mp3` - Sound when correctly hitting fake content
- `miss.mp3` - Sound when missing or hitting real content
- `game-over.mp3` - Sound when game ends

### Background Music
- `background.mp3` - Main background music for the game

## Audio Specifications

### Sound Effects
- Format: MP3
- Sample Rate: 44.1 kHz
- Bit Depth: 16-bit
- Duration: 0.5-2 seconds
- Volume: -12 to -6 dB

### Background Music
- Format: MP3
- Sample Rate: 44.1 kHz
- Bit Depth: 16-bit
- Duration: 2-3 minutes (looped)
- Volume: -18 to -12 dB
- Genre: Cyberpunk/Electronic

## Recommended Sources

You can find free audio assets from:
- [Freesound.org](https://freesound.org/)
- [OpenGameArt.org](https://opengameart.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [Pixabay](https://pixabay.com/music/)

## Alternative: Generate Audio

If you don't have audio files, the game will work without them. The AudioManager class includes fallback handling for missing audio files.

## File Structure
```
assets/sounds/
├── shoot.mp3
├── hit.mp3
├── miss.mp3
├── game-over.mp3
├── background.mp3
└── README.md
``` 