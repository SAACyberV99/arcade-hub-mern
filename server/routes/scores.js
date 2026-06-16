const express = require('express');
const Score = require('../models/Score');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const VALID_GAMES = ['snake', 'connect-four', 'tic-tac-toe'];

// @route   GET /api/scores/:game
// @desc    Get the top 10 scores for a given game
router.get('/:game', async (req, res) => {
  try {
    const { game } = req.params;

    if (!VALID_GAMES.includes(game)) {
      return res.status(400).json({ message: `Invalid game. Must be one of: ${VALID_GAMES.join(', ')}` });
    }

    const scores = await Score.find({ game })
      .sort({ score: -1, updatedAt: 1 })
      .limit(10)
      .select('username score updatedAt');

    res.json(scores);
  } catch (err) {
    console.error('Get leaderboard error:', err.message);
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

// @route   POST /api/scores
// @desc    Submit a score. Only kept if it's a new personal best for that game.
// @access  Private
router.post('/', requireAuth, async (req, res) => {
  try {
    const { game, score } = req.body;

    if (!VALID_GAMES.includes(game)) {
      return res.status(400).json({ message: `Invalid game. Must be one of: ${VALID_GAMES.join(', ')}` });
    }

    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
      return res.status(400).json({ message: 'Score must be a non-negative number' });
    }

    const existing = await Score.findOne({ user: req.user.id, game });

    if (!existing) {
      const created = await Score.create({
        user: req.user.id,
        username: req.user.username,
        game,
        score,
      });
      return res.status(201).json(created);
    }

    if (score > existing.score) {
      existing.score = score;
      await existing.save();
      return res.json(existing);
    }

    // Not a new best - return the existing record unchanged
    res.json(existing);
  } catch (err) {
    console.error('Post score error:', err.message);
    res.status(500).json({ message: 'Server error saving score' });
  }
});

module.exports = router;
