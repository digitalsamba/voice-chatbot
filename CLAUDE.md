# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Start the development server
npm run dev

# Build the client and server for production
npm run build

# Start the production server
npm start

# Run linting
npm run lint
```

## Deployment Tasks

The goal is to deploy this application to a public repository and then to a server using Docker and GitHub workflows. The server already has nginx-proxy set up with Let's Encrypt for SSL certificates.

### Project Plan

1. **Prepare Repository for Public Release**
   - [x] Remove any sensitive information from the codebase
   - [x] Create a comprehensive README.md with setup and usage instructions
   - [x] Add LICENSE file
   - [x] Set up .env.example file with required environment variables

2. **Dockerize Application**
   - [x] Create Dockerfile for the application
   - [x] Create docker-compose.yml for local development and testing
   - [x] Create production docker-compose.yml for nginx-proxy integration (docker-compose.prod.yml)
   - [x] Create .dockerignore file
   - [x] Add health check endpoint to the server
   - [x] Validate Docker setup (created validation script)

3. **Set Up GitHub Workflow**
   - [x] Create GitHub Actions workflow file (.github/workflows/deploy.yml)
   - [x] Create deployment script (deploy.sh)
   - [x] Create GitHub issue templates
   - [x] Create CONTRIBUTING.md guide
   - [x] Create GitHub setup guide (GITHUB_SETUP.md)
   - [ ] Add repository secrets for deployment (HOST, USERNAME, SSH_KEY)
   - [ ] Configure GitHub repository to allow workflow actions and package publishing

4. **Server Configuration**
   - [ ] Create deployment directory on server
   - [ ] Copy production docker-compose.yml to server
   - [ ] Set up environment variables file (.env) on server containing OPENAI_API_KEY
   - [ ] Ensure nginx-proxy and letsencrypt-companion are running correctly on server
   - [ ] Test deployment script manually before setting up GitHub workflow

5. **SSL/TLS Integration**
   - [ ] Verify that the container environment variables are correctly set for nginx-proxy integration
   - [ ] Ensure port 80 and 443 are accessible for Let's Encrypt verification
   - [ ] Test certificate issuance manually

6. **Monitoring and Maintenance**
   - [ ] Set up logging with volume mount to host system
   - [ ] Add health check endpoint to the application
   - [ ] Create backup script for logs and any persistent data
   - [ ] Set up monitoring alerts for the server

## Architecture Overview

This project is a voice chatbot application that enables real-time audio conversations with AI using OpenAI's API.

### Server Component

- **server.js**: The main server file using Fastify to handle the backend including:
  - Session token management with OpenAI's API
  - Session termination
  - Prompt generation
  - Environment variable loading (requires OPENAI_API_KEY)
  - Limits concurrent sessions to a maximum of 20

### Client Component

The client is built with React and uses a component-based architecture:

1. **App.jsx**: The main application orchestrator that:
   - Manages application state (view, configuration, session)
   - Controls the flow between model selection, configuration, and session
   - Handles audio context, WebRTC peer connections, and data channels

2. **Core Components**:
   - **ModelSelection.jsx**: UI for selecting the AI model type
   - **RealTimeConfiguration.jsx**: Settings interface for voice type, communication style, etc.
   - **RealTimeSession.jsx**: Active session UI with audio visualization, chat, and controls
   - **CircleAnimation.jsx**: Visual representation of audio levels using canvas

3. **Session Management**:
   - **sessionUtils.js**: Contains utility functions for:
     - Microphone handling and audio stream management
     - WebRTC peer connection setup
     - Communication with OpenAI's API
     - Session termination and cleanup

### Key Technical Aspects

1. **WebRTC Integration**:
   - Uses RTCPeerConnection for establishing real-time audio communication
   - Manages local and remote audio streams
   - Creates data channels for receiving transcription updates

2. **OpenAI API Integration**:
   - Connects to OpenAI's realtime sessions API
   - Supports voice selection and temperature adjustments
   - Handles SDP (Session Description Protocol) exchange

3. **Audio Processing**:
   - Accesses microphone inputs with getUserMedia
   - Uses Web Audio API (AudioContext, analyser nodes)
   - Visualizes audio with canvas-based animations
   - Handles microphone changes and volume controls

4. **Session Lifecycle**:
   - Manages token acquisition and validation
   - Handles session termination and resource cleanup
   - Supports mute/unmute functionality
   - Manages visibility changes (tab switching, etc.)