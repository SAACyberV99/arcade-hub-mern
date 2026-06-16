const mongoose = require('mongoose');

const VALID_GAMES = ['snake', 'connect-four', 'tic-tac-toe'];

const ScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    game: {
      type: String,
      required: true,
      enum: VALID_GAMES,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Only one score document per user, per game - "highest score" is enforced in the route
ScoreSchema.index({ user: 1, game: 1 }, { unique: true });

// Useful for fast top-10 lookups per game
ScoreSchema.index({ game: 1, score: -1 });

module.exports = mongoose.model('Score', ScoreSchema);
module.exports.VALID_GAMES = VALID_GAMES;
