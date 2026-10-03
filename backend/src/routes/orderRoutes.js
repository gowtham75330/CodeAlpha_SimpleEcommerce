const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.post('/', validateOrder, orderController.create);
router.get('/', orderController.list);
router.get('/:id', orderController.detail);

module.exports = router;
