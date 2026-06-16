# 🎮 Arcade Hub (MERN)

A full-stack arcade game website built with **MongoDB**, **Express.js**, **React (Vite)**, and **Node.js** - a MERN-stack project.

## Features

- **3 Playable Games**
  - 🐍 **Snake** — Classic snake with speed scaling and real-time score
  - 🔴 **Connect Four** — vs AI with minimax algorithm (depth 5)
  - ✕ **Tic Tac Toe** — vs AI (Easy / Medium / Hard) or vs a friend locally
- **Authentication** — Register & login with hashed passwords (bcryptjs) and JWTs
- **Leaderboard** — Top 10 per game, updated after every session
- **MongoDB Database** — Via Mongoose ODM
- **Retro Neon Design** — CRT scanlines, pixel fonts, neon glow effects

---

## Quick Start

### Requirements
- Node.js **18+**
- npm
- A MongoDB instance (local install **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Run the setup script (recommended)

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Create `server/.env` with a random JWT secret (from `server/.env.example`)
- Create `client/.env` (from `client/.env.example`)
- Install dependencies for the server, client, and root

Then start both the API and the React app:

```bash
npm run dev
```

- API: **http://localhost:5000**
- App: **http://localhost:3000**

---

### 2. Manual setup

```bash
# 1. Server
cd server
cp .env.example .env
# Edit .env:
#  - set MONGODB_URI (local Mongo or Atlas connection string)
#  - set JWT_SECRET to a random string, e.g. `openssl rand -base64 32`
npm install
npm run dev          # starts the API on http://localhost:5000

# 2. Client (in a new terminal)
cd client
cp .env.example .env   # optional, default works with the dev proxy
npm install
npm run dev          # starts the app on http://localhost:3000
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`, so no CORS setup is needed in development.

---

## Project Structure

```
arcade-hub-mern/
├── server/                       # Express API
│   ├── config/
│   │   └── db.js                 # Mongoose connection
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # User schema (username + hashed password)
│   │   └── Score.js              # Score schema (one doc per user/game)
│   ├── routes/
│   │   ├── auth.js                # POST /api/auth/register, /login, GET /me
│   │   └── scores.js              # GET /api/scores/:game, POST /api/scores
│   ├── server.js                  # App entry point
│   ├── package.json
│   └── .env.example
├── client/                        # React (Vite) SPA
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state (login/register/logout)
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── games/
│   │   │       ├── Snake.jsx          # Canvas-based snake, speed scaling
│   │   │       ├── ConnectFour.jsx    # Full game with AI (minimax depth 5)
│   │   │       └── TicTacToe.jsx      # 3 difficulties + vs-human mode
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── SnakePage.jsx
│   │   │   ├── ConnectFourPage.jsx
│   │   │   └── TicTacToePage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Retro neon theme, CRT effect
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── package.json                   # Root: runs server + client together
├── setup.sh
└── .gitignore
```

---

## Scoring System

| Game        | Win  | Draw | Loss |
|-------------|------|------|------|
| Snake       | +10 per food eaten | — | — |
| Connect Four| 100 pts | — | 0 |
| Tic Tac Toe | 10 pts | 5 pts | 0 |

Only the **highest score per player per game** appears on the leaderboard. Each `Score` document is uniquely keyed by `(user, game)`; a new submission only overwrites the stored score if it's higher.

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create an account, returns `{ token, user }` |
| `POST` | `/api/auth/login` | — | Log in, returns `{ token, user }` |
| `GET` | `/api/auth/me` | required | Get the current user from the token |
| `GET` | `/api/scores/:game` | — | Top 10 scores for `snake`, `connect-four`, or `tic-tac-toe` |
| `POST` | `/api/scores` | required | Submit a score: `{ game, score }`. Only kept if it's a new personal best |

Authenticated requests send `Authorization: Bearer <token>`.

---

## Environment Variables

### `server/.env`

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string, e.g. `mongodb://localhost:27017/arcade-hub` |
| `JWT_SECRET` | Random secret string used to sign JWTs |
| `PORT` | Port for the Express API (default `5000`) |
| `CLIENT_URL` | Origin allowed by CORS (default `http://localhost:3000`) |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL for the API. Defaults to `/api`, which works with the Vite dev proxy |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Auth | Custom JWT (jsonwebtoken + bcryptjs) |
| ORM/ODM | Mongoose |
| Database | MongoDB |
| Passwords | bcryptjs |

---

## Production Deployment

- **Database**: point `MONGODB_URI` at a managed MongoDB instance (e.g. MongoDB Atlas).
- **API**: deploy `/server` as a Node service (Render, Railway, Fly.io, a VPS, etc.). Set `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_URL` (your deployed frontend's origin, for CORS).
- **Frontend**: run `npm run build` in `/client` to produce a static `dist/` bundle, then deploy it to any static host (Vercel, Netlify, Cloudflare Pages, etc.). Set `VITE_API_URL` to your deployed API's URL (e.g. `https://api.your-domain.com/api`) before building.

---

## Adding More Games

1. Create `client/src/components/games/YourGame.jsx` with the game logic and UI.
2. Create `client/src/pages/YourGamePage.jsx` that renders it, and add a `<Route>` for it in `client/src/App.jsx`.
3. Add a card for it to the `GAMES` array in `client/src/pages/Home.jsx`.
4. Post scores via:
   ```js
   import api from '../../api/axios';
   await api.post('/scores', { game: 'your-game', score: N });
   ```
5. Add `'your-game'` to the `VALID_GAMES` array in both `server/models/Score.js` and `server/routes/scores.js`.
