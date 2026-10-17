const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // pre-save hook will hash it
    });

    const token = signToken(user._id);
    logger.info(`User registered: ${email}`);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        wardrobeSpaces: user.wardrobeSpaces,
        plan: user.plan,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    logger.error(`Register error: ${err.message}`);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    logger.info(`User logged in: ${email}`);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        wardrobeSpaces: user.wardrobeSpaces,
        plan: user.plan,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      preferences: req.user.preferences,
      wardrobeSpaces: req.user.wardrobeSpaces,
      plan: req.user.plan,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    logger.error(`GetMe error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

// PUT /api/auth/me
async function updateMe(req, res) {
  try {
    const { name, preferences, wardrobeSpaces } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };
    if (wardrobeSpaces) updates.wardrobeSpaces = wardrobeSpaces;

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      preferences: updated.preferences,
      wardrobeSpaces: updated.wardrobeSpaces,
      plan: updated.plan,
    });
  } catch (err) {
    logger.error(`UpdateMe error: ${err.message}`);
    return res.status(500).json({ error: 'Profile update failed.' });
  }
}

module.exports = { register, login, getMe, updateMe };
