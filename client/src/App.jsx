import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';
import SnakePage from './pages/SnakePage';
import ConnectFourPage from './pages/ConnectFourPage';
import TicTacToePage from './pages/TicTacToePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="crt min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/games/snake" element={<SnakePage />} />
              <Route path="/games/connect-four" element={<ConnectFourPage />} />
              <Route path="/games/tic-tac-toe" element={<TicTacToePage />} />
            </Routes>
          </main>

          <footer className="text-center font-pixel text-[9px] text-neon-purple py-6 opacity-60">
            ARCADE HUB &mdash; {new Date().getFullYear()}
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
