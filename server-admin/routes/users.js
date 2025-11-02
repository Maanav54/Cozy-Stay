const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');
const protect = require('../middleware/protect');

router.use(protect);

router.get('/', controller.listUsers);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
