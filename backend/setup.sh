#!/bin/bash

# ============================================
# Score de Barrio Backend - Setup Script
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header "Score de Barrio Backend Setup"

# Check Node.js
print_info "Checking Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js not found"
    print_info "Install from: https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js installed: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found"
    exit 1
fi
print_success "npm installed: $(npm --version)"

# Install dependencies
print_header "Installing Dependencies"
print_info "Running npm install..."
npm install
print_success "Dependencies installed"

# Create data directory
print_header "Setting Up Database"
mkdir -p data
print_success "Data directory created"

# Setup .env
print_header "Configuration"
if [ ! -f .env ]; then
    print_info "Creating .env from .env.example..."
    cp .env.example .env
    print_warning ".env created - YOU MUST EDIT IT"
    print_info "Edit .env and add:"
    echo "  1. RELAYER_PRIVATE_KEY"
    echo "  2. MERCHANT_REGISTRY address"
    echo "  3. SALES_EVENT_LOG address"
else
    print_success ".env already exists"
fi

# Test configuration
print_header "Testing Configuration"
if [ -f .env ]; then
    source .env
    
    if [ -z "$RELAYER_PRIVATE_KEY" ] || [ "$RELAYER_PRIVATE_KEY" == "tu_private_key_sin_0x" ]; then
        print_warning "RELAYER_PRIVATE_KEY not configured"
    else
        print_success "RELAYER_PRIVATE_KEY configured"
    fi
    
    if [ -z "$MERCHANT_REGISTRY" ] || [ "$MERCHANT_REGISTRY" == "0x..." ]; then
        print_warning "MERCHANT_REGISTRY not configured"
    else
        print_success "MERCHANT_REGISTRY: $MERCHANT_REGISTRY"
    fi
    
    if [ -z "$SALES_EVENT_LOG" ] || [ "$SALES_EVENT_LOG" == "0x..." ]; then
        print_warning "SALES_EVENT_LOG not configured"
    else
        print_success "SALES_EVENT_LOG: $SALES_EVENT_LOG"
    fi
fi

# Test database connection
print_header "Testing Database"
print_info "Starting server briefly to initialize DB..."
timeout 3 npm start || true
sleep 1

if [ -f ./data/scoredebarrio.db ]; then
    print_success "Database initialized"
    
    # Check tables
    TABLES=$(sqlite3 ./data/scoredebarrio.db "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "")
    if [ -n "$TABLES" ]; then
        print_success "Database schema created"
    fi
else
    print_warning "Database not initialized yet"
fi

# Setup complete
print_header "Setup Complete"

echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env with your configuration:"
echo "   nano .env"
echo ""
echo "2. Start the server:"
echo "   npm run dev"
echo ""
echo "3. Test health endpoint:"
echo "   curl http://localhost:3000/health"
echo ""
echo "4. Register a test merchant:"
echo "   curl -X POST http://localhost:3000/api/merchants \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"phone\":\"+51999888777\",\"businessName\":\"Test\",\"location\":\"Lima\"}'"
echo ""
echo "5. Setup cron for auto-sync (optional):"
echo "   crontab -e"
echo "   */15 * * * * cd $(pwd) && npm run sync >> sync.log 2>&1"
echo ""

print_success "Ready to start!"