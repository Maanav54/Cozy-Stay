/**
 * Usage:
 *   Put image files in backend/public/images/ (e.g. normal.jpg, below.jpg, deluxe.jpg, super.jpg)
 *   Then run:
 *     node scripts/update-room-images.js
 *
 * The script updates Room.image fields to point to "/images/<filename>" for each room type.
 */
const mongoose = require('mongoose');
const path = require('path');
const Room = require(path.join(__dirname, '..', 'models', 'Room'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelmgmt';

async function run(){
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGO_URI);

  const mapping = {
    'Normal': '/images/normal.jpg',
    'Below Average': '/images/below.jpg',
    'Deluxe': '/images/deluxe.jpg',
    'Super Deluxe': '/images/super.jpg'
  };

  for(const [type, img] of Object.entries(mapping)){
    const res = await Room.updateMany({ type }, { $set: { image: img } });
    console.log(`Updated ${res.matchedCount || res.n || 0} rooms of type ${type} -> ${img}`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

run().catch(err=>{ console.error(err); process.exit(1); });
