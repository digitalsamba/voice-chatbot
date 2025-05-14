#!/bin/sh

# Set default values for environment variables if not provided
VITE_HOST=${VITE_HOST:-"0.0.0.0"}
VITE_ALLOWED_HOST=${VITE_ALLOWED_HOST:-"localhost"}
VITE_ALLOW_ORIGIN=${VITE_ALLOW_ORIGIN:-"true"}
VITE_FORCE_DEV_SERVER=${VITE_FORCE_DEV_SERVER:-"true"}

# Export the variables so they're available to the Node process
export VITE_HOST
export VITE_ALLOWED_HOST
export VITE_ALLOW_ORIGIN
export VITE_FORCE_DEV_SERVER

# Start the application
npm run dev -- --host $VITE_HOST