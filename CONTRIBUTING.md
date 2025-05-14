# Contributing to Voice Chatbot

Thank you for considering contributing to Voice Chatbot! This document outlines the process for contributing to the project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template to create a new issue
- Describe the bug in detail including steps to reproduce
- Include browser information and console logs if applicable

### Suggesting Enhancements

- Check if the enhancement has already been suggested in the Issues section
- Use the feature request template to create a new issue
- Describe the enhancement and why it would be valuable

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Workflow

1. Set up the development environment as described in the README
2. Make your changes
3. Test your changes locally using `npm run dev`
4. Run linting with `npm run lint`
5. Submit a pull request

## Pull Request Process

1. Update the README.md with details of changes if appropriate
2. Update the documentation if needed
3. The PR will be merged once it's reviewed and approved

## Docker Development

To test your changes with Docker:

```bash
# Build the Docker image
docker build -t voice-chatbot:dev .

# Run the container
docker run -p 3011:3011 --env-file .env voice-chatbot:dev
```

Thank you for contributing!