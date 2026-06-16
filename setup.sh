#!/bin/bash
set -e

echo "Setting up Arcade Hub (MERN)..."
echo ""

# --- Server setup ---
echo "Installing server dependencies..."
cd server

if [ ! -f .env ]; then
  cp .env.example .env

  # Generate a random JWT secret and drop it into .env
  if command -v openssl >/dev/null 2>&1; then
    JWT_SECRET=$(openssl rand -base64 32)
  else
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  fi

  # Escape characters that are special to sed
  ESCAPED_SECRET=$(printf '%s\n' "$JWT_SECRET" | sed -e 's/[\/&]/\\&/g')

  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|replace_with_a_long_random_string|$ESCAPED_SECRET|" .env
  else
    sed -i "s|replace_with_a_long_random_string|$ESCAPED_SECRET|" .env
  fi

  echo "Created server/.env with a random JWT secret"
fi

npm install
cd ..

# --- Client setup ---
echo ""
echo "Installing client dependencies..."
cd client

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created client/.env"
fi

npm install
cd ..

# --- Root (concurrently runner) ---
echo ""
echo "Installing root dependencies..."
npm install

echo ""
echo "Setup complete!"
echo ""
echo "IMPORTANT: Make sure MongoDB is running and reachable at the"
echo "MONGODB_URI in server/.env (defaults to mongodb://localhost:27017/arcade-hub)."
echo "For MongoDB Atlas, paste your connection string into server/.env instead."
echo ""
echo "Start both the API and the React app together:"
echo "  npm run dev"
echo ""
echo "Or run them separately:"
echo "  cd server && npm run dev   # API on http://localhost:5000"
echo "  cd client && npm run dev   # App on http://localhost:3000"
