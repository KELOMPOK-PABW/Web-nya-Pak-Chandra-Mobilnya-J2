#!/bin/bash
# ================================================================
# PABW Shop — Single-Command Dev Starter
# Starts backend (Express, port 3000) + frontend (Next.js, port 3001)
# ================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo -e "${YELLOW}⏹  Shutting down all services...${NC}"
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  wait 2>/dev/null
  echo -e "${GREEN}✓ All services stopped.${NC}"
}
trap cleanup SIGINT SIGTERM

# ── 1. Read DATABASE_URL from backend .env (strip quotes) ────────
# Dotenv files often quote values; Prisma's CLI rejects quoted env vars,
# so we strip surrounding " or ' before exporting.
if [ -f "$BACKEND_DIR/.env" ]; then
  raw=$(grep -E '^[[:space:]]*DATABASE_URL=' "$BACKEND_DIR/.env" | head -1 | sed 's/^[[:space:]]*DATABASE_URL=//')
  # Strip surrounding single or double quotes
  cleaned=$(echo "$raw" | sed -E "s/^'(.*)'$/\1/; s/^\"(.*)\"$/\1/")
  if [ -n "$cleaned" ]; then
    export DATABASE_URL="$cleaned"
  fi
fi

# ── 2. Check dependencies ────────────────────────────────────────
command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: Node.js not found. Please install Node.js 18+.${NC}"; exit 1; }

if [ ! -f "$BACKEND_DIR/node_modules/.package-lock.json" ]; then
  echo -e "${CYAN}📦 Installing backend dependencies...${NC}"
  (cd "$BACKEND_DIR" && npm install) || { echo -e "${RED}Backend install failed${NC}"; exit 1; }
fi

if [ ! -f "$FRONTEND_DIR/node_modules/.package-lock.json" ]; then
  echo -e "${CYAN}📦 Installing frontend dependencies...${NC}"
  (cd "$FRONTEND_DIR" && npm install) || { echo -e "${RED}Frontend install failed${NC}"; exit 1; }
fi

# ── 3. Apply migrations + generate Prisma client ──────────────────
echo -e "${CYAN}🔧 Applying database migrations...${NC}"
(cd "$BACKEND_DIR" && npx prisma migrate deploy) || {
  echo -e "${YELLOW}⚠  No pending migrations or migrate deploy failed. Trying db push...${NC}"
  (cd "$BACKEND_DIR" && npx prisma db push) || { echo -e "${RED}Database setup failed${NC}"; exit 1; }
}
echo -e "${CYAN}🔧 Generating Prisma client...${NC}"
(cd "$BACKEND_DIR" && npx prisma generate) || { echo -e "${RED}Prisma generate failed${NC}"; exit 1; }

# ── 4. Start backend (port 3000) ─────────────────────────────────
echo -e "${GREEN}🚀 Starting backend on ${BOLD}http://localhost:3000${NC}${GREEN}...${NC}"
(cd "$BACKEND_DIR" && node src/index.js) &
BACKEND_PID=$!

# Wait for backend to be ready
echo -n "   Waiting for backend"
for i in {1..30}; do
  if curl -s http://localhost:3000/api/products >/dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}   ✓ Backend is running${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo ""
    echo -e "${RED}   ✗ Backend failed to start within 15s. Try running it manually:${NC}"
    echo -e "     cd backend && node src/index.js"
    kill "$BACKEND_PID" 2>/dev/null
    exit 1
  fi
  echo -n "."
  sleep 0.5
done

# ── 5. Start frontend (port 3001) ────────────────────────────────
echo -e "${GREEN}🚀 Starting frontend on ${BOLD}http://localhost:3001${NC}${GREEN}...${NC}"
(cd "$FRONTEND_DIR" && npx next dev -p 3001) &
FRONTEND_PID=$!

# ── 6. Print summary ─────────────────────────────────────────────
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  PABW Shop — Development Server${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "  ${BOLD}Backend API:${NC}  http://localhost:3000"
echo -e "  ${BOLD}Frontend:${NC}    http://localhost:3001"
echo -e "  ${BOLD}API Proxy:${NC}   http://localhost:3001/api → http://localhost:3000/api"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo ""

# Wait
wait
