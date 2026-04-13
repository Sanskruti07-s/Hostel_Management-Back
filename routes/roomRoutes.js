const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/', roomController.getAllRooms);
router.post('/allocate', roomController.allocateRoom);
router.post('/auto-allocate', roomController.autoAllocateRooms);

module.exports = router;
