import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 rounded-lg border-2 border-neon-cyan/40 bg-dark-panel/60 p-8">
      <h1 className="font-pixel text-lg text-center text-neon-cyan text-glow-cyan mb-6">LOGIN</h1>

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
            autoComplete="username"
            className="w-full rounded border-2 border-neon-cyan/30 bg-black/40 px-3 py-2 text-lg focus:border-neon-cyan focus:outline-none"
          />
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
            autoComplete="current-password"
            className="w-full rounded border-2 border-neon-cyan/30 bg-black/40 px-3 py-2 text-lg focus:border-neon-cyan focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded border-2 border-neon-cyan bg-neon-cyan/20 py-3 font-pixel text-xs text-neon-cyan transition-all hover:bg-neon-cyan/30 hover:shadow-neon-cyan disabled:opacity-50"
        >
          {loading ? 'LOGGING IN...' : 'LOGIN'}
        </button>
      </form>

      <p className="mt-6 text-center text-lg text-white/60">
        No account?{' '}
        <Link to="/register" className="text-neon-pink hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
