import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 rounded-lg border-2 border-neon-pink/40 bg-dark-panel/60 p-8">
      <h1 className="font-pixel text-lg text-center text-neon-pink text-glow-pink mb-6">JOIN THE ARCADE</h1>

      {error && (
        <p className="mb-4 rounded border border-red-400/50 bg-red-400/10 p-2 text-center text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-2 block font-pixel text-[10px] text-white/70">
            USERNAME
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            title="Letters, numbers, and underscores only"
            autoComplete="username"
            className="w-full rounded border-2 border-neon-pink/30 bg-black/40 px-3 py-2 text-lg focus:border-neon-pink focus:outline-none"
          />
          <p className="mt-1 text-sm text-white/40">3-20 characters, letters/numbers/underscores only</p>
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block font-pixel text-[10px] text-white/70">
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded border-2 border-neon-pink/30 bg-black/40 px-3 py-2 text-lg focus:border-neon-pink focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block font-pixel text-[10px] text-white/70">
            CONFIRM PASSWORD
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded border-2 border-neon-pink/30 bg-black/40 px-3 py-2 text-lg focus:border-neon-pink focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded border-2 border-neon-pink bg-neon-pink/20 py-3 font-pixel text-xs text-neon-pink transition-all hover:bg-neon-pink/30 hover:shadow-neon-pink disabled:opacity-50"
        >
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <p className="mt-6 text-center text-lg text-white/60">
        Already have an account?{' '}
        <Link to="/login" className="text-neon-cyan hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
