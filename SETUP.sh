#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# FuelTH — Complete setup script
# Run from inside the fuelfinder-th directory
# ─────────────────────────────────────────────────────────
set -e

echo ""
echo "⛽  FuelTH Setup"
echo "────────────────"

# 1. Check Node version
NODE_VER=$(node --version 2>/dev/null | cut -d'.' -f1 | tr -d 'v' || echo "0")
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌  Node.js 18+ required. Current: $(node --version 2>/dev/null || echo 'not found')"
  exit 1
fi
echo "✅  Node.js $(node --version)"

# 2. Create .env.local if missing
if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  echo "📄  Created .env.local from example — add your API keys to enable maps & auth"
else
  echo "✅  .env.local exists"
fi

# 3. Install dependencies
echo ""
echo "📦  Installing dependencies..."
npm install

# 4. Done
echo ""
echo "✅  Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local and add your Firebase + Google Maps keys"
echo "  2. Run:  npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "The app runs in demo mode without API keys — maps show a placeholder"
echo "but all pages, filters, and UI work fully."
echo ""
