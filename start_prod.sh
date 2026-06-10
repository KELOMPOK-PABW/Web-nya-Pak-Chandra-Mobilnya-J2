#!/bin/bash
# ================================================================
# PABW Shop — Production Start
# Builds frontend, then starts backend (Express, port 3000) +
# frontend (Next.js, port 3001) with NODE_ENV=production
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
if [ -f "$BACKEND_DIR/.env" ]; then
  raw=$(grep -E '^[[:space:]]*DATABASE_URL=' "$BACKEND_DIR/.env" | head -1 | sed 's/^[[:space:]]*DATABASE_URL=//')
  cleaned=$(echo "$raw" | sed -E "s/^'(.*)'$/\1/; s/^\"(.*)\"$/\1/")
  if [ -n "$cleaned" ]; then
    export DATABASE_URL="$cleaned"
  fi
fi

# ── 2. Check dependencies + JWT_SECRET ────────────────────────────
command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: Node.js not found.${NC}"; exit 1; }

# Production safety check: JWT_SECRET must be strong
if [ -f "$BACKEND_DIR/.env" ]; then
  jwt_raw=$(grep -E '^[[:space:]]*JWT_SECRET=' "$BACKEND_DIR/.env" | head -1 | sed 's/^[[:space:]]*JWT_SECRET=//')
  jwt_clean=$(echo "$jwt_raw" | sed -E "s/^'(.*)'$/\1/; s/^\"(.*)\"$/\1/")
  if [ -z "$jwt_clean" ] || [ ${#jwt_clean} -lt 32 ] || [ "$jwt_clean" = "change-me-to-a-long-random-string-at-least-32-chars" ]; then
    echo -e "${RED}[FATAL] JWT_SECRET must be at least 32 characters and not the default placeholder.${NC}"
    echo -e "${YELLOW}  Generate one: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"${NC}"
    exit 1
  fi
fi

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
  echo -e "${YELLOW}⚠  migrate deploy failed — trying db push...${NC}"
  (cd "$BACKEND_DIR" && npx prisma db push) || { echo -e "${RED}Database setup failed${NC}"; exit 1; }
}
echo -e "${CYAN}🔧 Generating Prisma client...${NC}"
(cd "$BACKEND_DIR" && npx prisma generate) || { echo -e "${RED}Prisma generate failed${NC}"; exit 1; }

# ── 4. Build frontend for production ──────────────────────────────
echo -e "${CYAN}🏗️  Building frontend for production...${NC}"
(cd "$FRONTEND_DIR" && npm run build) || { echo -e "${RED}Frontend build failed${NC}"; exit 1; }
echo -e "${GREEN}   ✓ Frontend built${NC}"

# ── 5. Start backend (port 3000, production mode) ─────────────────
echo -e "${GREEN}🚀 Starting backend on ${BOLD}http://localhost:3000${NC}${GREEN} (production)...${NC}"
(cd "$BACKEND_DIR" && NODE_ENV=production node src/index.js) &
BACKEND_PID=$!

echo -n "   Waiting for backend"
for i in {1..30}; do
  if curl -s http://localhost:3000/api/products >/dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}   ✓ Backend is running${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo ""
    echo -e "${RED}   ✗ Backend failed to start within 15s.${NC}"
    kill "$BACKEND_PID" 2>/dev/null
    exit 1
  fi
  echo -n "."
  sleep 0.5
done

# ── 6. Start frontend (port 3001, production mode) ────────────────
echo -e "${GREEN}🚀 Starting frontend on ${BOLD}http://localhost:3001${NC}${GREEN} (production)...${NC}"
(cd "$FRONTEND_DIR" && PORT=3001 npx next start) &
FRONTEND_PID=$!

# ── 7. Print summary ─────────────────────────────────────────────
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  PABW Shop — Production Server${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "  ${BOLD}Mode:${NC}        Production (NODE_ENV=production)"
echo -e "  ${BOLD}Backend API:${NC}  http://localhost:3000"
echo -e "  ${BOLD}Frontend:${NC}    http://localhost:3001"
echo -e "  ${BOLD}API Proxy:${NC}   http://localhost:3001/api → http://localhost:3000/api"
echo ""
echo -e "  ${YELLOW}Note: In production, set CORS_ORIGIN in backend/.env${NC}"
echo -e "  ${YELLOW}to the frontend URL (not *) for security.${NC}"
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo ""

wait
