#!/usr/bin/env node
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

// Load config from env or use default matching server-admin/server.js
const MONGO_URI = process.env.MONGO_URI || process.env.ADMIN_DB_URI || 'mongodb://127.0.0.1:27017/hotelmgmt';

// allow overriding via CLI: node seed-admin.js email password
const emailRaw = process.argv[2] || 'loki@gmail.com';
const email = String(emailRaw).trim().toLowerCase();
const password = process.argv[3] || '123456';
const name = process.argv[4] || 'Local Admin';

async function run(){
  try{
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to', MONGO_URI);

    // require model after connecting
    const User = require(path.join('..','models','User'));

    const hashed = await bcrypt.hash(password, 10);
    // Upsert the admin user: create or update password/role
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: { name, password: hashed, role: 'admin' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if(updated){
      console.log('Admin user created/updated:', updated.email);
      console.log('You can now login at http://localhost:4000/login.html with those credentials.');
    } else {
      console.log('Failed to create or update admin user');
    }
    process.exit(0);
  }catch(err){
    console.error('Error seeding admin user:', err);
    process.exit(1);
  }
}

run();
