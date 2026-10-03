const { createHttpError } = require('./errorHandler');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (!isNonEmptyString(name) || name.trim().length < 2 || name.trim().length > 80) {
    errors.push('Name must be between 2 and 80 characters.');
  }

  if (!isNonEmptyString(email) || email.trim().length > 120 || !isValidEmail(email.trim())) {
    errors.push('Enter a valid email address.');
  }

  if (!isNonEmptyString(password) || password.length < 8 || password.length > 128) {
    errors.push('Password must be between 8 and 128 characters.');
  }

  if (errors.length) {
    return next(createHttpError(400, errors[0]));
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return next(createHttpError(400, 'Email and password are required.'));
  }

  if (email.trim().length > 120 || !isValidEmail(email.trim())) {
    return next(createHttpError(400, 'Enter a valid email address.'));
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

function validateOrder(req, res, next) {
  const body = req.body || {};
  const items = body.items;
  const { fullName, phone, address, city, state, postalCode } = body;

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return next(createHttpError(400, 'Your cart must contain between 1 and 50 items.'));
  }

  for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(productId) || productId <= 0) {
      return next(createHttpError(400, 'Each item must include a valid productId.'));
    }
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      return next(createHttpError(400, 'Each quantity must be a whole number between 1 and 99.'));
    }
  }

  const shippingFields = { fullName, phone, address, city, state, postalCode };
  const limits = { fullName: 100, phone: 20, address: 220, city: 80, state: 80, postalCode: 20 };
  for (const [key, value] of Object.entries(shippingFields)) {
    if (!isNonEmptyString(value) || String(value).trim().length > limits[key]) {
      return next(createHttpError(400, `Please provide a valid ${key} within the allowed length.`));
    }
  }

  if (!/^[0-9+\-\s()]{8,20}$/.test(String(phone).trim())) {
    return next(createHttpError(400, 'Enter a valid phone number.'));
  }

  req.body.fullName = String(fullName).trim();
  req.body.phone = String(phone).trim();
  req.body.address = String(address).trim();
  req.body.city = String(city).trim();
  req.body.state = String(state).trim();
  req.body.postalCode = String(postalCode).trim();
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateOrder
};
