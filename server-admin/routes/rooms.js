const express = require('express');
const router = express.Router();
const controller = require('../controllers/roomsController');
const protect = require('../middleware/protect');

// Public: allow GET /admin/rooms to list rooms without requiring a token
router.get('/', controller.listRooms);

// Protect mutating routes (create/update/delete/mark)
router.post('/', protect, controller.createRoom);
router.put('/:id', protect, controller.updateRoom);
router.delete('/:id', protect, controller.deleteRoom);
router.post('/:id/mark-clean', protect, controller.markClean);
router.post('/:id/mark-dirty', protect, controller.markDirty);

module.exports = router;
