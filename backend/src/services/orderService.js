const { getConnection } = require('../config/db');
const { createHttpError } = require('../middleware/errorHandler');

function formatShippingAddress(details) {
  return [
    details.fullName,
    details.phone,
    details.address,
    `${details.city}, ${details.state} ${details.postalCode}`
  ].join('\n');
}

async function placeOrder(userId, payload) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const merged = new Map();
    for (const item of payload.items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      merged.set(productId, (merged.get(productId) || 0) + quantity);
    }

    const productIds = [...merged.keys()];
    const placeholders = productIds.map(() => '?').join(', ');
    const [products] = await connection.execute(
      `SELECT id, name, price, stock
       FROM products
       WHERE id IN (${placeholders})
       FOR UPDATE`,
      productIds
    );

    if (products.length !== productIds.length) {
      throw createHttpError(400, 'One or more products in your cart are no longer available.');
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const orderItems = [];
    let total = 0;

    for (const [productId, quantity] of merged.entries()) {
      const product = productMap.get(productId);
      const stock = Number(product.stock);

      if (stock <= 0) {
        throw createHttpError(409, `${product.name} is currently out of stock.`);
      }

      if (quantity > stock) {
        throw createHttpError(
          409,
          `Only ${stock} left in stock for ${product.name}. Please update your cart.`
        );
      }

      const unitPrice = Number(product.price);
      total += unitPrice * quantity;
      orderItems.push({
        productId,
        quantity,
        price: unitPrice
      });
    }

    const shippingAddress = formatShippingAddress(payload);
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (user_id, total_amount, shipping_address, status)
       VALUES (?, ?, ?, 'confirmed')`,
      [userId, total.toFixed(2), shippingAddress]
    );

    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price.toFixed(2)]
      );

      const [stockResult] = await connection.execute(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ? AND stock >= ?`,
        [item.quantity, item.productId, item.quantity]
      );

      if (stockResult.affectedRows !== 1) {
        throw createHttpError(409, 'Stock changed while placing the order. Please try again.');
      }
    }

    await connection.commit();

    return {
      id: orderId,
      userId,
      totalAmount: Number(total.toFixed(2)),
      status: 'confirmed',
      shippingAddress,
      items: orderItems
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  placeOrder
};
