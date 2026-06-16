import { useEffect, useRef, useState, useCallback } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL = CANVAS_SIZE / GRID_SIZE;
const INITIAL_SPEED = 150; // ms per tick - lower is faster
const SPEED_STEP = 4;
const MIN_SPEED = 50;
const POINTS_PER_FOOD = 10;

function randomFood(snake) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

function createInitialState() {
  const snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  return {
    snake,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: randomFood(snake),
    speed: INITIAL_SPEED,
  };
}

export default function Snake() {
  const canvasRef = useRef(null);
  const stateRef = useRef(createInitialState());
  const scoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const { user } = useAuth();

  const submitScore = useCallback(
    async (finalScore) => {
      if (!user || finalScore <= 0) return;
      try {
        await api.post('/scores', { game: 'snake', score: finalScore });
        setSaveStatus('Score saved!');
      } catch {
        setSaveStatus('Could not save score');
      }
    },
    [user]
  );

  const resetGame = useCallback(() => {
    stateRef.current = createInitialState();
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setSaveStatus('');
  }, []);

  const handleStart = () => {
    resetGame();
    setRunning(true);
  };

  // Game loop + rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let lastTime = 0;

    const draw = () => {
      const { snake, food } = stateRef.current;

      ctx.fillStyle = '#0a0014';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // grid lines
      ctx.strokeStyle = 'rgba(0, 255, 247, 0.05)';
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(CANVAS_SIZE, i * CELL);
        ctx.stroke();
      }

      // food
      ctx.shadowColor = '#ff2bd6';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ff2bd6';
      ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
      ctx.shadowBlur = 0;

      // snake
      snake.forEach((segment, i) => {
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = i === 0 ? 12 : 0;
        ctx.fillStyle = i === 0 ? '#39ff14' : 'rgba(57, 255, 20, 0.65)';
        ctx.fillRect(segment.x * CELL + 1, segment.y * CELL + 1, CELL - 2, CELL - 2);
        ctx.shadowBlur = 0;
      });
    };

    const tick = (time) => {
      animationId = requestAnimationFrame(tick);

      if (!running) {
        draw();
        return;
      }

      const st = stateRef.current;
      if (time - lastTime < st.speed) return;
      lastTime = time;

      st.direction = st.nextDirection;
      const head = st.snake[0];
      const newHead = { x: head.x + st.direction.x, y: head.y + st.direction.y };

      const hitsWall = newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;
      const hitsSelf = st.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y);

      if (hitsWall || hitsSelf) {
        setRunning(false);
        setGameOver(true);
        draw();
        const finalScore = scoreRef.current;
        setHighScore((h) => Math.max(h, finalScore));
        submitScore(finalScore);
        return;
      }

      st.snake.unshift(newHead);

      if (newHead.x === st.food.x && newHead.y === st.food.y) {
        st.food = randomFood(st.snake);
        st.speed = Math.max(MIN_SPEED, st.speed - SPEED_STEP);
        scoreRef.current += POINTS_PER_FOOD;
        setScore(scoreRef.current);
      } else {
        st.snake.pop();
      }

      draw();
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [running, submitScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      const st = stateRef.current;
      const dir = st.direction;
      const key = e.key;

      if (key === ' ') {
        e.preventDefault();
        if (gameOver) {
          handleStart();
        } else {
          setRunning((r) => !r);
        }
        return;
      }

      let next = null;
      if ((key === 'ArrowUp' || key === 'w' || key === 'W') && dir.y === 0) next = { x: 0, y: -1 };
      else if ((key === 'ArrowDown' || key === 's' || key === 'S') && dir.y === 0) next = { x: 0, y: 1 };
      else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && dir.x === 0) next = { x: -1, y: 0 };
      else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && dir.x === 0) next = { x: 1, y: 0 };

      if (next) {
        e.preventDefault();
        st.nextDirection = next;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="font-pixel text-lg text-neon-green text-glow-green">🐍 SNAKE</h1>

      <div className="flex gap-8 font-pixel text-xs">
        <span>
          SCORE: <span className="text-neon-yellow text-glow-yellow">{score}</span>
        </span>
        <span>
          BEST: <span className="text-neon-yellow text-glow-yellow">{highScore}</span>
        </span>
      </div>

      <div className="relative rounded border-2 border-neon-green/40">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="block max-w-full" />

        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 p-4 text-center">
            {gameOver ? (
              <>
                <p className="font-pixel text-sm text-neon-pink text-glow-pink">GAME OVER</p>
                {saveStatus && <p className="text-lg text-white/70">{saveStatus}</p>}
              </>
            ) : (
              <p className="font-pixel text-sm text-neon-cyan text-glow-cyan">
                {score > 0 || gameOver ? 'PAUSED' : 'READY?'}
              </p>
            )}
            <button
              onClick={handleStart}
              className="rounded border-2 border-neon-green bg-neon-green/20 px-4 py-2 font-pixel text-xs text-neon-green transition-all hover:bg-neon-green/30 hover:shadow-neon-green"
            >
              {gameOver ? 'PLAY AGAIN' : 'START'}
            </button>
          </div>
        )}
      </div>

      <p className="max-w-md text-center text-lg text-white/60">
        Use arrow keys or WASD to move, space to pause/resume. Each food eaten is worth {POINTS_PER_FOOD} points
        and speeds the snake up.
        {!user && ' Log in to save your high score to the leaderboard.'}
      </p>
    </div>
  );
}
