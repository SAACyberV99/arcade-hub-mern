import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1;
const AI = 2;
const AI_DEPTH = 5;
const WIN_SCORE = 100;

// ---------- Game logic helpers ----------

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function getValidColumns(board) {
  const cols = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === EMPTY) cols.push(c);
  }
  return cols;
}

function dropPiece(board, col, piece) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) {
      const newBoard = board.map((row) => [...row]);
      newBoard[r][col] = piece;
      return newBoard;
    }
  }
  return null;
}

function checkWin(board, piece) {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === piece && board[r][c + 1] === piece && board[r][c + 2] === piece && board[r][c + 3] === piece) {
        return true;
      }
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      if (board[r][c] === piece && board[r + 1][c] === piece && board[r + 2][c] === piece && board[r + 3][c] === piece) {
        return true;
      }
    }
  }
  // Diagonal (down-right)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (
        board[r][c] === piece &&
        board[r + 1][c + 1] === piece &&
        board[r + 2][c + 2] === piece &&
        board[r + 3][c + 3] === piece
      ) {
        return true;
      }
    }
  }
  // Diagonal (up-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (
        board[r][c] === piece &&
        board[r - 1][c + 1] === piece &&
        board[r - 2][c + 2] === piece &&
        board[r - 3][c + 3] === piece
      ) {
        return true;
      }
    }
  }
  return false;
}

function isBoardFull(board) {
  return board[0].every((cell) => cell !== EMPTY);
}

function evaluateWindow(cells, piece) {
  const opponent = piece === AI ? PLAYER : AI;
  const pieceCount = cells.filter((c) => c === piece).length;
  const emptyCount = cells.filter((c) => c === EMPTY).length;
  const oppCount = cells.filter((c) => c === opponent).length;

  let score = 0;
  if (pieceCount === 4) score += 100;
  else if (pieceCount === 3 && emptyCount === 1) score += 5;
  else if (pieceCount === 2 && emptyCount === 2) score += 2;

  if (oppCount === 3 && emptyCount === 1) score -= 4;

  return score;
}

function scorePosition(board, piece) {
  let score = 0;

  // Prefer center column
  const centerCol = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerCol] === piece) score += 3;
  }

  // Horizontal windows
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += evaluateWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]], piece);
    }
  }
  // Vertical windows
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      score += evaluateWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]], piece);
    }
  }
  // Diagonal (down-right)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += evaluateWindow(
        [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]],
        piece
      );
    }
  }
  // Diagonal (up-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += evaluateWindow(
        [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]],
        piece
      );
    }
  }

  return score;
}

function isTerminalNode(board) {
  return checkWin(board, PLAYER) || checkWin(board, AI) || getValidColumns(board).length === 0;
}

// Minimax with alpha-beta pruning. Returns { col, score }.
function minimax(board, depth, alpha, beta, maximizing) {
  const validCols = getValidColumns(board);
  const terminal = isTerminalNode(board);

  if (depth === 0 || terminal) {
    if (terminal) {
      if (checkWin(board, AI)) return { col: null, score: 1_000_000 };
      if (checkWin(board, PLAYER)) return { col: null, score: -1_000_000 };
      return { col: null, score: 0 }; // draw
    }
    return { col: null, score: scorePosition(board, AI) };
  }

  // Order columns from center outward - improves alpha-beta pruning
  const order = [...validCols].sort((a, b) => Math.abs(a - Math.floor(COLS / 2)) - Math.abs(b - Math.floor(COLS / 2)));

  if (maximizing) {
    let value = -Infinity;
    let bestCol = order[0];
    for (const col of order) {
      const newBoard = dropPiece(board, col, AI);
      const { score } = minimax(newBoard, depth - 1, alpha, beta, false);
      if (score > value) {
        value = score;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: value };
  }

  let value = Infinity;
  let bestCol = order[0];
  for (const col of order) {
    const newBoard = dropPiece(board, col, PLAYER);
    const { score } = minimax(newBoard, depth - 1, alpha, beta, true);
    if (score < value) {
      value = score;
      bestCol = col;
    }
    beta = Math.min(beta, value);
    if (alpha >= beta) break;
  }
  return { col: bestCol, score: value };
}

// ---------- Component ----------

export default function ConnectFour() {
  const [board, setBoard] = useState(createBoard);
  const [turn, setTurn] = useState(PLAYER);
  const [status, setStatus] = useState('Your turn - drop a piece');
  const [gameOver, setGameOver] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const { user } = useAuth();

  const submitScore = async (score) => {
    if (!user) return;
    try {
      await api.post('/scores', { game: 'connect-four', score });
      setSaveStatus('Score saved!');
    } catch {
      setSaveStatus('Could not save score');
    }
  };

  const resetGame = () => {
    setBoard(createBoard());
    setTurn(PLAYER);
    setStatus('Your turn - drop a piece');
    setGameOver(false);
    setSaveStatus('');
  };

  const handleColumnClick = (col) => {
    if (gameOver || turn !== PLAYER) return;

    const newBoard = dropPiece(board, col, PLAYER);
    if (!newBoard) return; // column full

    setBoard(newBoard);

    if (checkWin(newBoard, PLAYER)) {
      setStatus('You win! 🎉');
      setGameOver(true);
      submitScore(WIN_SCORE);
      return;
    }
    if (isBoardFull(newBoard)) {
      setStatus("It's a draw");
      setGameOver(true);
      submitScore(0);
      return;
    }

    setTurn(AI);
    setStatus('AI is thinking...');
  };

  // AI's turn
  useEffect(() => {
    if (turn !== AI || gameOver) return;

    const timer = setTimeout(() => {
      const { col } = minimax(board, AI_DEPTH, -Infinity, Infinity, true);
      if (col === null) return;

      const newBoard = dropPiece(board, col, AI);
      if (!newBoard) return;

      setBoard(newBoard);

      if (checkWin(newBoard, AI)) {
        setStatus('AI wins! Better luck next time.');
        setGameOver(true);
        submitScore(0);
      } else if (isBoardFull(newBoard)) {
        setStatus("It's a draw");
        setGameOver(true);
        submitScore(0);
      } else {
        setTurn(PLAYER);
        setStatus('Your turn - drop a piece');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, board, gameOver]);

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="font-pixel text-lg text-neon-cyan text-glow-cyan">🔴 CONNECT FOUR</h1>
      <p className="font-pixel text-xs text-white/80 text-center">{status}</p>

      <div className="rounded-lg border-2 border-neon-cyan/40 bg-blue-950/40 p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={`col-${c}`}
              onClick={() => handleColumnClick(c)}
              disabled={gameOver || turn !== PLAYER || board[0][c] !== EMPTY}
              aria-label={`Drop piece in column ${c + 1}`}
              className="group flex flex-col gap-1 sm:gap-2 disabled:cursor-not-allowed"
            >
              {Array.from({ length: ROWS }).map((_, r) => {
                const cell = board[r][c];
                let cellClass = 'bg-black/40';
                if (cell === PLAYER) cellClass = 'bg-neon-pink shadow-neon-pink';
                else if (cell === AI) cellClass = 'bg-neon-yellow shadow-neon-yellow';

                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className={`h-8 w-8 rounded-full transition-all sm:h-12 sm:w-12 ${cellClass} group-enabled:group-hover:ring-2 group-enabled:group-hover:ring-white/40`}
                  />
                );
              })}
            </button>
          ))}
        </div>
      </div>

      {gameOver && (
        <div className="flex flex-col items-center gap-3">
          {saveStatus && <p className="text-lg text-white/70">{saveStatus}</p>}
          <button
            onClick={resetGame}
            className="rounded border-2 border-neon-cyan bg-neon-cyan/20 px-4 py-2 font-pixel text-xs text-neon-cyan transition-all hover:bg-neon-cyan/30 hover:shadow-neon-cyan"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      <p className="max-w-md text-center text-lg text-white/60">
        Click a column to drop your piece (pink). Connect four to beat the AI (yellow) for {WIN_SCORE} points.
        {!user && ' Log in to save your score to the leaderboard.'}
      </p>
    </div>
  );
}
