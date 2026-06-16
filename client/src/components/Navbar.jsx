import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-neon-pink/40 bg-dark-panel/80 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="font-pixel text-[11px] sm:text-sm text-neon-cyan text-glow-cyan whitespace-nowrap">
          ARCADE HUB
        </Link>

        <div className="flex items-center gap-3 sm:gap-5 font-pixel text-[9px] sm:text-[11px]">
          <Link to="/" className="hover:text-neon-pink transition-colors">
            HOME
          </Link>
          <Link to="/leaderboard" className="hover:text-neon-pink transition-colors">
            SCORES
          </Link>

          {user ? (
            <>
              <span className="text-neon-green text-glow-green hidden sm:inline">
                {user.username.toUpperCase()}
              </span>
              <button onClick={handleLogout} className="hover:text-neon-pink transition-colors">
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-neon-pink transition-colors">
                LOGIN
              </Link>
              <Link to="/register" className="hover:text-neon-pink transition-colors">
                JOIN
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
