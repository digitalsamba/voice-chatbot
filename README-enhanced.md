# Voice Chatbot

A real-time voice communication application powered by OpenAI's API that enables audio conversations with AI assistants.

## Features

- Real-time audio streaming and processing
- Multiple AI voice options
- Customizable communication styles and personalities
- Visual audio feedback with canvas animations
- Session management with transcription capabilities
- Cross-browser compatibility

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Fastify
- **Real-time Communication**: WebRTC
- **AI Services**: OpenAI API
- **Build Tools**: Vite

## Prerequisites

- Node.js (v16+) and npm installed
- OpenAI API key with access to real-time API features
- Modern web browser with WebRTC support

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/voice-chatbot.git
cd voice-chatbot
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment setup**

Create a `.env` file in the project root with the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3011
NODE_ENV=development
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3011

## Building for Production

```bash
npm run build
```

## Deployment

The application can be deployed using Docker. See the deployment section below.

## Docker Deployment

### Building with Docker

```bash
docker build -t voice-chatbot .
```

### Running with Docker

```bash
docker run -p 3011:3011 --env-file .env voice-chatbot
```

### Using docker-compose

```bash
docker-compose up -d
```

## Project Structure

```
/voice-chatbot
├── client/                # Frontend code
│   ├── assets/            # Static assets
│   ├── components/        # React components
│   │   ├── App.jsx        # Main application component
│   │   ├── CircleAnimation.jsx
│   │   ├── ModelSelection.jsx
│   │   ├── RealTimeConfiguration.jsx
│   │   └── RealTimeSession.jsx
│   ├── utils/             # Utility functions
│   │   └── sessionUtils.js # Session management utilities
│   └── pages/             # Page components
├── server.js              # Main server file
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── package.json           # Project dependencies and scripts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `PORT` | Port the server will listen on | 3011 |
| `NODE_ENV` | Environment mode | development |

## Session Management

The application manages voice chat sessions through WebRTC connections with the following features:

- Dynamic session creation based on user configuration
- Audio visualization with real-time frequency analysis
- Transcription updates via data channels
- Automatic resource cleanup on session termination
- Session limits to prevent API overload (maximum 20 concurrent sessions)

## Audio Processing

The application uses the Web Audio API to:

- Process microphone input
- Analyze audio frequencies for visualization
- Combine audio streams for the output
- Provide a responsive visual representation of audio levels

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the real-time API
- The WebRTC project for the real-time communication capabilities