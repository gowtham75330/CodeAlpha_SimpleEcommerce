const { query } = require('../config/db');

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at
  };
}

async function findByEmail(email) {
  const rows = await query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query(
    'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
  const result = await query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  return findById(result.insertId);
}

module.exports = {
  publicUser,
  findByEmail,
  findById,
  createUser
};
