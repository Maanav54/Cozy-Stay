# Hotel Management System (Simple Fullstack)

## Overview

This project is a simple Hotel Management System:

- Backend: Node.js + Express + MongoDB (Mongoose)
- Frontend: Static SPA using vanilla HTML/CSS/JS (responsive + animations)
- Auth: JWT-based
- Features: register/login, list rooms, book rooms, view bookings.

## Requirements

- Node.js (v16+ recommended)
- MongoDB running locally on default port (mongodb://127.0.0.1:27017)

## Setup

1. Clone or unzip the project.
2. Install dependencies:
   ```
   npm install
   ```
3. Seed sample rooms (optional):
   ```
   curl -X POST http://localhost:3000/api/rooms/seed
   ```
4. Start server:
   ```
   npm start
   ```
5. Open `http://localhost:3000` in your browser.

## Notes

- JWT secret can be set via `JWT_SECRET` env var.
- MongoDB URI can be set via `MONGO_URI` env var.
- This is a demo-grade app: for production, add input validation, better error handling, admin roles, etc.
