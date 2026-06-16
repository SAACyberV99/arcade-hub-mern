import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const EMPTY = null;
const HUMAN = 'X';
const AI = 'O';

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const POINTS = { WIN: 10, DRAW: 5, LOSS: 0 };

const DIFFICULTIES = ['easy', 'medium', 'hard'];

// ---------- Game logic helpers ----------

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isFull(board) {
  return board.every((cell) => cell !== EMPTY);
}

function getEmptyCells(board) {
  return board.reduce((acc, cell, i) => {
    if (cell === EMPTY) acc.push(i);
    return acc;
  }, []);
}

// Returns { idx, score } - perfect-play minimax for tic-tac-toe.
function minimaxTTT(board, player) {
  const winner = checkWinner(board);
  if (winner === AI) return { idx: null, score: 10 };
  if (winner === HUMAN) return { idx: null, score: -10 };
  if (isFull(board)) return { idx: null, score: 0 };

  const empties = getEmptyCells(board);
  const moves = empties.map((idx) => {
    const nextBoard = [...board];
    nextBoard[idx] = player;
    const result = minimaxTTT(nextBoard, player === AI ? HUMAN : AI);
    return { idx, score: result.score };
  });

  if (player === AI) {
    return moves.reduce((best, move) => (move.score > best.score ? move : best));
  }
  return moves.reduce((best, move) => (move.score < best.score ? move : best));
}

function getAiMove(board, difficulty) {
  const empties = getEmptyCells(board);

  if (difficulty === 'easy') {
    return empties[Math.floor(Math.random() * empties.length)];
  }

  if (difficulty === 'medium') {
    // Half the time play optimally, otherwise play randomly
    if (Math.random() < 0.5) {
      return empties[Math.floor(Math.random() * empties.length)];
    }
    return minimaxTTT(board, AI).idx;
  }

  // hard: perfect play, never loses
  return minimaxTTT(board, AI).idx;
}

// ---------- Component ----------

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(EMPTY));
  const [mode, setMode] = useState('ai'); // 'ai' | 'human'
  const [difficulty, setDifficulty] = useState('medium');
  const [currentPlayer, setCurrentPlayer] = useState(HUMAN);
  const [status, setStatus] = useState('Your turn (X)');
  const [gameOver, setGameOver] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const { user } = useAuth();

  const submitScore = async (score) => {
    if (!user || mode !== 'ai') return;
    try {
      await api.post('/scores', { game: 'tic-tac-toe', score });
      setSaveStatus('Score saved!');
    } catch {
      setSaveStatus('Could not save score');
    }
  };

  const finishGame = (winner) => {
    setGameOver(true);

    if (mode === 'ai') {
      if (winner === HUMAN) {
        setStatus('You win! 🎉');
        submitScore(POINTS.WIN);
      } else if (winner === AI) {
        setStatus('AI wins!');
        submitScore(POINTS.LOSS);
      } else {
        setStatus("It's a draw");
        submitScore(POINTS.DRAW);
      }
    } else if (winner) {
      setStatus(`Player ${winner} wins! 🎉`);
    } else {
      setStatus("It's a draw");
    }
  };

  const resetBoard = (nextMode = mode) => {
    setBoard(Array(9).fill(EMPTY));
    setCurrentPlayer(HUMAN);
    setGameOver(false);
    setSaveStatus('');
    setStatus(nextMode === 'ai' ? 'Your turn (X)' : "Player X's turn");
  };

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    resetBoard(newMode);
  };

  const handleCellClick = (idx) => {
    if (gameOver || board[idx] !== EMPTY) return;
    if (mode === 'ai' && currentPlayer !== HUMAN) return;

    const newBoard = [...board];
    newBoard[idx] = currentPlayer;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner || isFull(newBoard)) {
      finishGame(winner);
      return;
    }

    if (mode === 'human') {
      const next = currentPlayer === HUMAN ? AI : HUMAN;
      setCurrentPlayer(next);
      setStatus(`Player ${next}'s turn`);
    } else {
      setCurrentPlayer(AI);
      setStatus('AI is thinking...');
    }
  };

  // AI's turn
  useEffect(() => {
    if (mode !== 'ai' || currentPlayer !== AI || gameOver) return;

    const timer = setTimeout(() => {
      const idx = getAiMove(board, difficulty);
      if (idx === null || idx === undefined) return;

      const newBoard = [...board];
      newBoard[idx] = AI;
      setBoard(newBoard);

      const winner = checkWinner(newBoard);
      if (winner || isFull(newBoard)) {
        finishGame(winner);
        return;
      }

      setCurrentPlayer(HUMAN);
      setStatus('Your turn (X)');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, mode, board, gameOver, difficulty]);

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="font-pixel text-lg text-neon-pink text-glow-pink">✕ TIC TAC TOE</h1>

      <div className="flex flex-wrap items-center justify-center gap-3 font-pixel text-[9px] sm:text-[10px]">
        <button
          onClick={() => handleModeChange('ai')}
          className={`rounded border-2 px-3 py-2 transition-all ${
            mode === 'ai' ? 'border-neon-pink text-neon-pink shadow-neon-pink' : 'border-white/20 text-white/50'
          }`}
        >
          VS AI
        </button>
        <button
          onClick={() => handleModeChange('human')}
          className={`rounded border-2 px-3 py-2 transition-all ${
            mode === 'human' ? 'border-neon-pink text-neon-pink shadow-neon-pink' : 'border-white/20 text-white/50'
          }`}
        >
          VS FRIEND
        </button>

        {mode === 'ai' &&
          DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`rounded border-2 px-3 py-2 uppercase transition-all ${
                difficulty === d ? 'border-neon-cyan text-neon-cyan shadow-neon-cyan' : 'border-white/20 text-white/50'
              }`}
            >
              {d}
            </button>
          ))}
      </div>

      <p className="font-pixel text-xs text-white/80">{status}</p>

      <div className="grid grid-cols-3 gap-2 rounded-lg border-2 border-neon-pink/40 bg-dark-panel/60 p-3">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            aria-label={`Cell ${idx + 1}`}
            className="flex h-20 w-20 items-center justify-center rounded border border-white/10 bg-black/40 font-pixel text-3xl transition-all hover:border-neon-pink/50 sm:h-24 sm:w-24 sm:text-4xl"
          >
            {cell === 'X' && <span className="text-neon-cyan text-glow-cyan">X</span>}
            {cell === 'O' && <span className="text-neon-pink text-glow-pink">O</span>}
          </button>
        ))}
      </div>

      {gameOver && (
        <div className="flex flex-col items-center gap-3">
          {saveStatus && <p className="text-lg text-white/70">{saveStatus}</p>}
          <button
            onClick={() => resetBoard()}
            className="rounded border-2 border-neon-pink bg-neon-pink/20 px-4 py-2 font-pixel text-xs text-neon-pink transition-all hover:bg-neon-pink/30 hover:shadow-neon-pink"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      <p className="max-w-md text-center text-lg text-white/60">
        {mode === 'ai'
          ? `You're X, the AI is O. Win = ${POINTS.WIN} pts, draw = ${POINTS.DRAW} pts, loss = ${POINTS.LOSS} pts.`
          : 'Take turns on the same screen with a friend. X goes first.'}
        {!user && mode === 'ai' && ' Log in to save your score to the leaderboard.'}
      </p>
    </div>
  );
}
