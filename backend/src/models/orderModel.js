const { query } = require('../config/db');

function mapOrder(row, items = []) {
  return {
    id: row.id,
    userId: row.user_id,
    totalAmount: Number(row.total_amount),
    shippingAddress: row.shipping_address,
    status: row.status,
    createdAt: row.created_at,
    items
  };
}

function mapItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.product_name,
    quantity: Number(row.quantity),
    price: Number(row.price),
    imageUrl: row.image_url || null
  };
}

async function listByUser(userId) {
  const orders = await query(
    `SELECT id, user_id, total_amount, shipping_address, status, created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  if (!orders.length) {
    return [];
  }

  const orderIds = orders.map((order) => order.id);
  const placeholders = orderIds.map(() => '?').join(', ');
  const items = await query(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
            p.name AS product_name, p.image_url
     FROM order_items oi
     INNER JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id IN (${placeholders})
     ORDER BY oi.id ASC`,
    orderIds
  );

  const itemsByOrder = new Map();
  for (const item of items) {
    const list = itemsByOrder.get(item.order_id) || [];
    list.push(mapItem(item));
    itemsByOrder.set(item.order_id, list);
  }

  return orders.map((order) => mapOrder(order, itemsByOrder.get(order.id) || []));
}

async function findByIdForUser(orderId, userId) {
  const orders = await query(
    `SELECT id, user_id, total_amount, shipping_address, status, created_at
     FROM orders
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [orderId, userId]
  );

  if (!orders.length) {
    return null;
  }

  const items = await query(
    `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
            p.name AS product_name, p.image_url
     FROM order_items oi
     INNER JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC`,
    [orderId]
  );

  return mapOrder(orders[0], items.map(mapItem));
}

module.exports = {
  listByUser,
  findByIdForUser
};
