// scripts/seed-rooms.js
// Small script to seed example rooms into the MongoDB used by the app.
// Run: node scripts/seed-rooms.js  (or npm run seed-rooms after adding script)

const mongoose = require('mongoose');
const path = require('path');

// load Room model from the project's models folder
const Room = require(path.join(__dirname, '..', 'models', 'Room'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelmgmt';

async function main(){
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  try{
    const count = await Room.countDocuments();
    console.log('Existing rooms count:', count);
    if(count > 0){
      console.log('Rooms already present in DB — no seeding needed. Exiting.');
      process.exit(0);
    }

    const rooms = [
      {
        title: 'Budget Cozy Room',
        type: 'Below Average',
        price: 999,
        total: 5,
        available: 5,
        description: 'A compact room with basic amenities, great for short stays.',
        image: '/images/cozy.jpg'
      },
      {
        title: 'Classic Standard Room',
        type: 'Normal',
        price: 1499,
        total: 8,
        available: 8,
        description: 'Comfortable room with queen bed and free Wi-Fi.',
        image: '/images/normal.jpg'
      },
      {
        title: 'Deluxe City View',
        type: 'Deluxe',
        price: 2499,
        total: 4,
        available: 4,
        description: 'Spacious room with city views and premium amenities.',
        image: '/images/deluxe.jpg'
      },
      {
        title: 'Super Deluxe Suite',
        type: 'Super Deluxe',
        price: 3999,
        total: 2,
        available: 2,
        description: 'Large suite with separate living area and luxury features.',
        image: '/images/super.jpg'
      }
    ];

    const created = await Room.insertMany(rooms);
    console.log('Inserted rooms:', created.map(r=> ({ id: r._id.toString(), title: r.title }) ));
    console.log('Seeding completed successfully.');
  }catch(err){
    console.error('Error while seeding rooms:', err);
  }finally{
    await mongoose.disconnect();
    process.exit(0);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
