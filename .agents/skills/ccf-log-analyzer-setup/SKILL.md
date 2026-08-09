---
name: ccf-log-analyzer-setup
description: >-
  Use this skill when setting up the local environment, running the Next.js development server,
  performing production builds, running Vitest unit tests locally, or verifying Docker builds for ccf-log-analyzer.
---

# ccf-log-analyzer Local Environment Setup & Verification Guide

This skill provides step-by-step instructions for local environment setup, running local dev servers, executing Vitest unit tests, and verifying Docker container builds for `ccf-log-analyzer`.

---

## 1. Prerequisites
- **Node.js**: v20.0.0 or higher (v24 verified)
- **npm**: v10.0.0 or higher
- **Docker**: Optional (for container testing)

---

## 2. Setup Commands

```bash
# Clone repository & switch branch
git clone https://github.com/kitsystemyou/ccf-log-analyzer.git
cd ccf-log-analyzer
git checkout feat/nextjs-migration

# Install dependencies
npm install
```

---

## 3. Local Execution & Testing Commands

### 3.1 Local Development Server
Start the local development server with hot-reloading:
```bash
npm run dev
# Open http://localhost:3000 in your browser
```

### 3.2 Production Build & Run
Test production builds locally:
```bash
# Build the application
npm run build

# Start the production server
npm start
```

### 3.3 Vitest Unit Testing
Run unit tests for log parsing logic:
```bash
# Run unit tests once
npm test

# Run tests in watch mode during development
npm run test:watch
```

### 3.4 Docker Container Verification
Build and run the multi-stage Docker container locally:
```bash
# Build Docker image
docker build -t ccf-log-analyzer:latest .

# Run Docker container on port 3000
docker run -d -p 3000:3000 --name ccf-app ccf-log-analyzer:latest
```
