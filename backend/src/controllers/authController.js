const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const userModel = require('../models/userModel');
const { createHttpError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existing = await userModel.findByEmail(email);

    if (existing) {
      throw createHttpError(409, 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    let user;
    try {
      user = await userModel.createUser({ name, email, passwordHash });
    } catch (err) {
      if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
        throw createHttpError(409, 'An account with this email already exists.');
      }
      throw err;
    }
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created.',
      data: {
        token,
        user: userModel.publicUser(user)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
      throw createHttpError(401, 'Invalid email or password.');
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      throw createHttpError(401, 'Invalid email or password.');
    }

    const publicUser = userModel.publicUser(user);
    const token = signToken(publicUser);

    res.json({
      success: true,
      message: 'Logged in.',
      data: {
        token,
        user: publicUser
      }
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({
    success: true,
    data: {
      user: userModel.publicUser(req.user)
    }
  });
}

module.exports = {
  register,
  login,
  me
};
