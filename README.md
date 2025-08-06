# 🚀 Tubitak AI Assistant App - PoC

This project consists of a backend (Node.js) and a frontend (Vite). Below is a guide on how to start and build both
parts of the application.

## 📁 Project Structure

```
root/
│
├── backend/        # Node.js backend code (entry: server.js)
├── frontend/       # Vite frontend app
├── package.json    # Contains scripts and dependencies
└── ...
```

## 🧱 Installation
```shell
npm install
```
This installs dependencies listed in the root package.json.

## 📦 Available Scripts

Run these commands from the root directory.

```shell
npm run be:start
```

Starts the Node.js backend using server.js.

## 💻 Run Frontend in Dev Mode

```shell
npm run fe:build
```
Builds the production version of the frontend using Vite.

## 👀 Preview Built Frontend

```shell
npm run fe:preview
```
Previews the built frontend as it would appear in production.

## 🛠️ Requirements
Make sure you have the following installed:
- Node.js (v16+ recommended)
- npm or yarn

## 📄 Notes
- The backend starts from backend/server.js.
- The frontend is located in the frontend/ directory and is managed using Vite.
- Ensure environment variables or configs (if any) are set up properly before running.
