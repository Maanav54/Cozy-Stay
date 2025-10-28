Admin & User servers created

What I added

- server-user/
  - server.js            -> Express server for user-facing endpoints (port 3000)
  - routes/rooms.js
  - controllers/roomsController.js
  - models/Room.js

- server-admin/
  - server.js            -> Express server for admin endpoints (port 4000)
  - routes/auth.js       -> /admin/auth/login (POST) returns a JWT
  - routes/rooms.js      -> protected admin room management
  - routes/users.js      -> protected admin user management
  - routes/payments.js   -> protected admin payment history
  - controllers/*         -> example controllers for rooms/users/payments
  - models/*              -> Room, User, Payment models
  - middleware/protect.js -> JWT protect middleware for admin routes

- frontend/admin/
  - index.html
  - app.js               -> Minimal React (CDN) admin UI which logs in and lists rooms

- package.json updated with dev scripts:
  - "dev": "concurrently \"npm run user\" \"npm run admin\""
  - "user": "nodemon server-user/server.js"
  - "admin": "nodemon server-admin/server.js"
  - concurrently added to devDependencies

Quick start (PowerShell)

# Install dependencies
npm install

# Start both servers in development (requires nodemon and concurrently installed from package.json)
npm run dev

# Environment variables (optional)
# - USER_DB_URI (defaults to mongodb://localhost:27017/hotel_user_db)
# - ADMIN_DB_URI (defaults to mongodb://localhost:27017/hotel_admin_db)
# - ADMIN_PORT (defaults to 4000)
# - USER_PORT (defaults to 3000)
# - ADMIN_JWT_SECRET (defaults to 'adminsecret')

Create an admin user to login (example using Mongo shell or a small script):

# Using Node REPL / script (quick example)
node -e "const mongoose=require('mongoose'); const User=require('./server-admin/models/User'); mongoose.connect(process.env.ADMIN_DB_URI||'mongodb://localhost:27017/hotel_admin_db').then(async()=>{ const u=new User({name:'Admin',email:'admin@example.com',password:'password',role:'admin'}); await u.save(); console.log('admin created'); process.exit(); })"

Notes & next steps
- Passwords: this demo stores plaintext for simplicity; in production hash passwords and add registration flows.
- Consider moving shared models to a shared package or use one database with separate collections if desired.
- I can run `npm install` and start the servers here if you want me to (I won't modify your environment without permission).
