const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

// @route   POST /api/auth/register
// @desc    Create a new user and return a JWT
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return res.status(400).json({ message: 'Username must be 3-20 characters' });
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      return res
        .status(400)
        .json({ message: 'Username can only contain lowercase letters, numbers, and underscores' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(409).json({ message: 'That username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username: cleanUsername, password: hashedPassword });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Verify credentials and return a JWT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // password has `select: false` in the schema, so it must be explicitly requested
    const user = await User.findOne({ username: cleanUsername }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Return the currently authenticated user
router.get('/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

module.exports = router;
