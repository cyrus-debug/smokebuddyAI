# Highdeas AI

A React Native mobile app that generates and shares high ideas, powered by AI.

## Features

- 🤖 AI-powered high idea generation
- 🎨 Beautiful psychedelic UI with animated background
- 👁️ Animated psychedelic eye
- 💭 Modal popup for displaying generated ideas
- 👍 Voting system for ideas (That's Deep / Too Trippy)
- 🎯 Go Deeper and Remix functionality
- 🎵 Text-to-speech support for ideas
- 📱 Cross-platform (iOS & Android)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/highdeas-ai.git
cd highdeas-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
highdeas-ai/
├── src/
│   ├── components/
│   │   └── HighIdeaGenerator.tsx    # Main idea generation component
│   ├── services/
│   │   └── elevenlabs.ts            # Text-to-speech service
│   └── App.tsx                      # Root component
├── assets/
│   └── psychedelic-eye.json         # Lottie animation
└── server/                          # Backend server
    └── index.js                     # Express server
```

## Features in Detail

### High Idea Generation
- Tap the "Generate High Idea" button to create a new idea
- Ideas are generated using AI and displayed in a modal popup
- Vote on ideas using "That's Deep" or "Too Trippy" buttons
- Use "Go Deeper" to explore related ideas
- Use "Remix" to generate variations of the current idea

### UI/UX
- Animated psychedelic background using SVG
- Smooth transitions and animations
- Modal popup for idea display
- Intuitive voting system
- Responsive design for all screen sizes

### Text-to-Speech
- Listen to generated ideas using ElevenLabs API
- High-quality, natural-sounding voice synthesis
- Easy-to-use playback controls

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [ElevenLabs](https://elevenlabs.io/)
- [Lottie](https://lottiefiles.com/) 