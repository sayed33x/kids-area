#!/bin/bash
echo "🎪 Kids Area — Starting..."
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi
npm run dev
