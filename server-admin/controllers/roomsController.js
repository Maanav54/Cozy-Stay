// Use the shared top-level Room model so admin and user servers operate on the same collection
const Room = require('../models/Room');

exports.listRooms = async (req, res) => {
  try {
    // Return rooms from the shared 'rooms' collection
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markClean = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { status: 'clean' }, { new: true });
    res.json(room);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.markDirty = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { status: 'dirty' }, { new: true });
    res.json(room);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

