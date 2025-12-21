#!/bin/bash

# Simple deploy script for trainer
# Usage: ./deploy.sh "commit message"

set -e

echo "Building trainer..."
npm run build

echo "Adding dist to git..."
git add dist/

MESSAGE="${1:-build: update trainer dist}"
echo "Committing: $MESSAGE"
git commit -m "$MESSAGE"

echo "Pushing to GitHub..."
git push origin main

echo "Done! Wait 1-2 minutes and check:"
echo "https://andreacebotarev-svg.github.io/englishlessons/trainer/"
