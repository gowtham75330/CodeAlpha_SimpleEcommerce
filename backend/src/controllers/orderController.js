const orderModel = require('../models/orderModel');
const orderService = require('../services/orderService');
const { createHttpError } = require('../middleware/errorHandler');

async function create(req, res, next) {
  try {
    const order = await orderService.placeOrder(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Order placed.',
      data: { order }
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const orders = await orderModel.listByUser(req.user.id);
    res.json({
      success: true,
      data: { orders }
    });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw createHttpError(400, 'Invalid order id.');
    }

    const order = await orderModel.findByIdForUser(id, req.user.id);
    if (!order) {
      throw createHttpError(404, 'Order not found.');
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  detail
};
