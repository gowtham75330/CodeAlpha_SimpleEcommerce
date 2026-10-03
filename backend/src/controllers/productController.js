const productModel = require('../models/productModel');
const { createHttpError } = require('../middleware/errorHandler');

async function list(req, res, next) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const products = await productModel.listProducts({ search, category });
    const categories = await productModel.listCategories();

    res.json({
      success: true,
      data: {
        products,
        categories
      }
    });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw createHttpError(400, 'Invalid product id.');
    }

    const product = await productModel.findById(id);
    if (!product) {
      throw createHttpError(404, 'Product not found.');
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  detail
};
