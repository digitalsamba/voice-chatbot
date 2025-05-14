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

### Option 1: Local Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3011

### Option 2: Docker Development

For a containerized development environment with hot-reloading:

```bash
# Create an .env file with your OPENAI_API_KEY first
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Start the development container
docker-compose -f docker-compose.dev.yml up
```

The application will be available at http://localhost:3011

## Building for Production

```bash
npm run build
```

## Deployment

The application can be deployed using Docker and GitHub Actions for CI/CD automation. See the deployment sections below for details.

## Docker Deployment

### Validating Docker Setup

Before building, you can validate your Docker setup:

```bash
node validate-docker.js
```

### Building with Docker

```bash
docker build -t voice-chatbot .
```

### Running with Docker

```bash
docker run -p 3011:3011 --env-file .env voice-chatbot
```

### Using docker-compose

For development environment:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

For production environment:
```bash
docker-compose up -d
```

### Production Deployment with Nginx Proxy

For production with nginx-proxy:

```bash
# Deploy with the production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## CI/CD with GitHub Actions

This project includes a GitHub Actions workflow for continuous integration and deployment to a development environment:

1. Automatically builds and pushes Docker image to Docker Hub with `dev` and commit SHA tags
2. Deploys to your development server using SSH
3. Sets up all necessary configuration using environment variables
4. Streamlined for reliable builds - no complex build process required

To set up the development CI/CD pipeline:

1. **Server Setup**:
   - Follow the instructions in [SERVER_SETUP.md](SERVER_SETUP.md) to set up your server with nginx-proxy
   - Ensure the nginx-proxy-network exists on your server

2. **GitHub Setup**:
   - Configure your GitHub repository as described in [GITHUB_SETUP.md](GITHUB_SETUP.md)
   - Create a "development" environment in your GitHub repository
   - Add all required repository secrets to the development environment

3. **Deployment**:
   - Push your code to the repository's main branch
   - GitHub Actions will automatically build and deploy the application to your development server
   - Monitor the deployment in the Actions tab of your repository
   - Access your application at your configured development domain (DEV_DOMAIN)

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