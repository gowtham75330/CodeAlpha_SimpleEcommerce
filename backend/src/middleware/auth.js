const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { query } = require('../config/db');
const { createHttpError } = require('./errorHandler');

function getTokenFromHeader(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

async function authenticate(req, res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      throw createHttpError(401, 'Please log in to continue.');
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw createHttpError(401, 'Your session is invalid or has expired. Please log in again.');
    }

    const users = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
      [payload.id]
    );

    if (!users.length) {
      throw createHttpError(401, 'Account not found. Please log in again.');
    }

    req.user = users[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authenticate
};
