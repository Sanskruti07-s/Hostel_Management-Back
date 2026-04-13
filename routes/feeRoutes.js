const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

router.get('/', feeController.getAllFees);
router.get('/student/:id', feeController.getFeeByStudent);
router.post('/pay', feeController.payFee);
router.post('/update-status', feeController.updateFeeStatus);

module.exports = router;
