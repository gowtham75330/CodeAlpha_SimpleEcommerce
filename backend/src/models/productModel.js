const { query } = require('../config/db');

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    imageUrl: row.image_url,
    stock: Number(row.stock),
    createdAt: row.created_at
  };
}

async function listProducts({ search, category } = {}) {
  const clauses = [];
  const params = [];

  if (search) {
    clauses.push('(name LIKE ? OR description LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like);
  }

  if (category && category !== 'all') {
    clauses.push('category = ?');
    params.push(category);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await query(
    `SELECT id, name, description, price, category, image_url, stock, created_at
     FROM products
     ${where}
     ORDER BY name ASC`,
    params
  );
  return rows.map(mapProduct);
}

async function findById(id) {
  const rows = await query(
    `SELECT id, name, description, price, category, image_url, stock, created_at
     FROM products
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] ? mapProduct(rows[0]) : null;
}

async function listCategories() {
  const rows = await query(
    'SELECT DISTINCT category FROM products ORDER BY category ASC'
  );
  return rows.map((row) => row.category);
}

module.exports = {
  mapProduct,
  listProducts,
  findById,
  listCategories
};
