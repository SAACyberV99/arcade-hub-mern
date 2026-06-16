import { Link } from 'react-router-dom';

const GAMES = [
  {
    id: 'snake',
    title: 'SNAKE',
    emoji: '🐍',
    description: 'Classic snake with speed scaling and real-time score. +10 per food.',
    path: '/games/snake',
    classes: {
      border: 'border-neon-green/40 hover:border-neon-green',
      text: 'text-neon-green text-glow-green',
      shadow: 'hover:shadow-neon-green',
    },
  },
  {
    id: 'connect-four',
    title: 'CONNECT FOUR',
    emoji: '🔴',
    description: 'Battle an AI powered by minimax search (depth 5). Win = 100 pts.',
    path: '/games/connect-four',
    classes: {
      border: 'border-neon-cyan/40 hover:border-neon-cyan',
      text: 'text-neon-cyan text-glow-cyan',
      shadow: 'hover:shadow-neon-cyan',
    },
  },
  {
    id: 'tic-tac-toe',
    title: 'TIC TAC TOE',
    emoji: '✕',
    description: 'vs AI (Easy / Medium / Hard) or pass-and-play with a friend.',
    path: '/games/tic-tac-toe',
    classes: {
      border: 'border-neon-pink/40 hover:border-neon-pink',
      text: 'text-neon-pink text-glow-pink',
      shadow: 'hover:shadow-neon-pink',
    },
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 pt-4">
        <h1 className="font-pixel text-xl sm:text-3xl text-neon-pink text-glow-pink leading-relaxed">
          WELCOME TO
          <br />
          ARCADE HUB
        </h1>
        <p className="text-lg sm:text-xl text-neon-cyan/80 max-w-xl mx-auto">
          Pick a game, beat your best score, and climb the leaderboard.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {GAMES.map((game) => (
          <Link
            key={game.id}
            to={game.path}
            className={`group flex flex-col items-center gap-3 rounded-lg border-2 bg-dark-panel/60 p-6 text-center transition-all duration-200 ${game.classes.border} ${game.classes.shadow}`}
          >
            <div className="text-5xl">{game.emoji}</div>
            <h2 className={`font-pixel text-sm ${game.classes.text}`}>{game.title}</h2>
            <p className="text-lg text-white/70">{game.description}</p>
            <span className="font-pixel text-[10px] text-white/40 group-hover:text-white transition-colors">
              PLAY NOW &rarr;
            </span>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/leaderboard"
          className="font-pixel text-[11px] text-neon-yellow text-glow-yellow hover:underline"
        >
          VIEW ALL LEADERBOARDS &rarr;
        </Link>
      </div>
    </div>
  );
}
