import { useEffect, useState } from 'react';
import api from '../api/axios';

const GAMES = [
  { id: 'snake', label: '🐍 SNAKE', color: 'text-neon-green text-glow-green', border: 'border-neon-green/40' },
  {
    id: 'connect-four',
    label: '🔴 CONNECT FOUR',
    color: 'text-neon-cyan text-glow-cyan',
    border: 'border-neon-cyan/40',
  },
  { id: 'tic-tac-toe', label: '✕ TIC TAC TOE', color: 'text-neon-pink text-glow-pink', border: 'border-neon-pink/40' },
];

export default function Leaderboard() {
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const results = {};
        for (const game of GAMES) {
          const { data } = await api.get(`/scores/${game.id}`);
          results[game.id] = data;
        }
        if (!cancelled) setScores(results);
      } catch (err) {
        if (!cancelled) setError('Could not load the leaderboard. Is the API running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <h1 className="font-pixel text-xl text-center text-neon-pink text-glow-pink">LEADERBOARDS</h1>

      {loading && <p className="text-center font-pixel text-sm text-white/60">LOADING...</p>}

      {error && <p className="text-center text-lg text-red-300">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-3">
          {GAMES.map((game) => (
            <div key={game.id} className={`rounded-lg border-2 bg-dark-panel/60 p-4 ${game.border}`}>
              <h2 className={`mb-4 text-center font-pixel text-xs ${game.color}`}>{game.label}</h2>

              {scores[game.id]?.length ? (
                <ol className="space-y-2">
                  {scores[game.id].map((entry, i) => (
                    <li key={entry._id} className="flex items-center justify-between text-lg">
                      <span className="text-white/70">
                        {i + 1}. {entry.username}
                      </span>
                      <span className="text-neon-yellow text-glow-yellow">{entry.score}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-center text-lg text-white/40">No scores yet &mdash; be the first!</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
