# GitHub Repository Setup Guide

This guide provides step-by-step instructions for setting up the GitHub repository for the Voice Chatbot application.

## Creating the Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Enter "voice-chatbot" as the repository name
4. Add a description: "A real-time voice communication application powered by OpenAI's API"
5. Choose "Public" or "Private" based on your preference
6. Do NOT check "Add a README file" or "Add a license" as we already have these files
7. Click "Create repository"

## Important Files in the Repository

Before pushing to GitHub, make sure these key files are present:

- `README.md`: Project documentation and setup instructions
- `LICENSE`: MIT License file
- `.github/workflows/deploy.yml`: GitHub Actions workflow for CI/CD
- `Dockerfile` and `docker-compose.yml`: Docker configuration files
- `server.js`: Main application server file
- `.env.example`: Example environment variables file

## Setting Up Required Secrets

For deployment with GitHub Actions, you need to add these repository secrets:

1. In your repository, go to "Settings" > "Secrets and variables" > "Actions" > "Environments"
2. Create a "development" environment
3. Click "Add secret" for the development environment and add the following secrets:

   **Required secrets:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DOCKER_HUB_USERNAME`: Your Docker Hub username
   - `DOCKER_HUB_TOKEN`: Your Docker Hub access token (create at Docker Hub→Settings→Security→Access Tokens)
   - `SERVER_HOST`: The hostname of your development server
   - `SERVER_IP`: The IP address of your development server (use this if hostname resolution fails)
   - `SERVER_USER`: The SSH username for your development server
   - `SERVER_KEY`: The SSH private key for authentication (copy the entire content of your private key file)
   - `SSH_PORT`: The SSH port for your server (defaults to 22 if not specified)
   - `DEV_DOMAIN`: Your development domain name (e.g., dev.voice.example.com)
   - `LETSENCRYPT_EMAIL`: Email address for Let's Encrypt certificate notifications

   **Optional secrets:**
   - `PORT`: Custom port (defaults to 3011 if not specified)
   - `DEPLOY_DIR`: Custom deployment directory (defaults to /opt/deployment/voice-chatbot-dev)
   - `DOCKER_NETWORK`: Docker network to connect to (defaults to "proxy")

## Initializing the Local Repository

If this directory is not already a git repository, initialize it:

```bash
cd /path/to/voice-chatbot
git init
git add .
git commit -m "Initial commit"
```

## Connecting to GitHub and Pushing Code

1. Connect your local repository to GitHub:

```bash
git remote add origin https://github.com/yourusername/voice-chatbot.git
```

2. Push your code to GitHub:

```bash
git push -u origin main
```

3. If you're using a different branch name (like "master"), use:

```bash
git push -u origin master
```

## Enabling GitHub Actions

1. In your repository, go to "Actions" tab
2. You'll see the workflow we've defined (.github/workflows/deploy.yml)
3. Click "I understand my workflows, go ahead and enable them"

## Configuring Repository Settings

1. Go to "Settings" > "General"
2. Under "Features", make sure "Issues" is enabled
3. Scroll down to "Packages" and ensure it's enabled if you're using GitHub Container Registry

## Final Setup Check

1. Verify GitHub Actions workflow is set up correctly
2. Check repository secrets are configured
3. Make sure GitHub Container Registry is enabled if needed
4. Verify all files are properly committed and pushed

## Next Steps

After setting up the GitHub repository:

1. Complete the server configuration
2. Test a deployment using the GitHub Actions workflow
3. Set up monitoring and maintenance procedures

For detailed deployment instructions, refer to the deployment documentation.