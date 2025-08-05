# DeepFake Defense 🎮

A web-based game where players identify and shoot AI-generated media before it reaches the defense line.

## 🎯 Game Overview

DeepFake Defense is an educational game that helps players develop critical thinking skills to identify AI-generated content. Players must quickly distinguish between real and fake images, quotes, and videos while defending their digital barrier.

## 🚀 Features

### Core Gameplay
- **Media Identification**: Real vs AI-generated images, quotes, and videos
- **Shooting Mechanics**: Click or press keys to shoot fake content
- **Doubt System**: AI-powered explanations for uncertain cases
- **Progressive Difficulty**: Speed and complexity increase each round
- **Combo Scoring**: Chain correct identifications for bonus points

### AI Integration
- **StyleGAN Faces**: AI-generated human faces from "ThisPersonDoesNotExist"
- **GPT Explanations**: Detailed reasoning for fake/real content
- **Randomized Content**: Shuffled real and fake media each round

### User Experience
- **Cyberpunk UI**: Digital-glitch themed interface
- **Real-time Feedback**: Score, timer, and lives display
- **Leaderboard**: Global high scores
- **Sound Effects**: Immersive audio experience

## 🛠️ Tech Stack

- **Frontend**: HTML5 Canvas, JavaScript (ES6+)
- **AI Services**: OpenAI GPT API, ThisPersonDoesNotExist API
- **Backend**: Node.js with Express
- **Database**: MongoDB for leaderboard
- **Deployment**: Vercel/Netlify ready

## 📁 Project Structure

```
deepfake-defense/
├── public/
│   ├── index.html          # Main game page
│   ├── css/
│   │   ├── style.css       # Main styles
│   │   └── cyberpunk.css   # Cyberpunk theme
│   ├── js/
│   │   ├── game.js         # Core game logic
│   │   ├── media.js        # Media handling
│   │   ├── ai.js           # AI integration
│   │   ├── ui.js           # UI components
│   │   └── audio.js        # Sound management
│   ├── assets/
│   │   ├── images/         # Game assets
│   │   ├── sounds/         # Audio files
│   │   └── fonts/          # Custom fonts
│   └── data/
│       ├── real-media.json # Real content dataset
│       └── fake-media.json # AI-generated content
├── server/
│   ├── server.js           # Express server
│   ├── routes/
│   │   ├── leaderboard.js  # Leaderboard API
│   │   └── media.js        # Media API
│   └── models/
│       └── Score.js        # MongoDB schema
├── package.json
└── README.md
```

## 🎮 How to Play

1. **Start**: Click "Start Game" to begin
2. **Identify**: Watch media items approach your defense line
3. **Shoot**: Click or press SPACE to shoot fake content
4. **Doubt**: Press D for AI explanation on uncertain items
5. **Survive**: Don't let too many fakes pass through!

## 🏆 Scoring System

- **Correct Hit**: +10 points
- **Wrong Shot**: -5 points
- **Doubt Usage**: 0 points (neutral)
- **Combo Bonus**: +2 points per consecutive correct hit
- **Lives**: Start with 3, lose 1 for each fake that passes

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/deepfake-defense.git
cd deepfake-defense
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your OpenAI API key and MongoDB URI
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)

### Game Settings
Edit `public/js/game.js` to customize:
- Game speed and difficulty
- Scoring multipliers
- Media types and sources

## 🎨 Customization

### Adding New Media
1. Add content to `public/data/real-media.json` or `public/data/fake-media.json`
2. Update media validation in `public/js/media.js`

### UI Themes
Modify `public/css/cyberpunk.css` for custom styling

### Sound Effects
Replace audio files in `public/assets/sounds/`

## 🚀 Deployment

### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for GPT API
- ThisPersonDoesNotExist for AI-generated faces
- The open-source community for inspiration

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Email: support@deepfakedefense.com

---

**Play responsibly and help build a more AI-literate world!** 🛡️ 