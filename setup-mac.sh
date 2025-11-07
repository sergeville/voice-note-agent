#!/bin/bash

# Voice-to-Note Taking Agent - Mac Quick Start Script
# This script will help you set up everything needed to run the application on your Mac

set -e

echo "🎯 Voice-to-Note Taking Agent - Mac Quick Start"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS. Please follow the manual setup guide."
    exit 1
fi

print_status "Checking prerequisites..."

# Check Homebrew
if ! command -v brew &> /dev/null; then
    print_error "Homebrew is not installed. Please install it first:"
    print_status "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi
print_success "Homebrew is installed"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Installing..."
    brew install node
else
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    print_success "Node.js v$NODE_VERSION is installed"
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm is not installed. Installing..."
    npm install -g pnpm
else
    print_success "pnpm is installed"
fi

# Check Git
if ! command -v git &> /dev/null; then
    print_warning "Git is not installed. Installing..."
    brew install git
else
    print_success "Git is installed"
fi

echo ""
print_status "Checking application structure..."

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the voice-note-agent root directory"
    print_status "The directory should contain 'backend' and 'frontend' folders"
    exit 1
fi

print_success "Application structure looks good"

echo ""
print_status "Installing backend dependencies..."

cd backend
if [ -f "package.json" ]; then
    pnpm install
    print_success "Backend dependencies installed"
else
    print_error "Backend package.json not found. Please check your directory structure."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Created .env file from .env.example"
        print_warning "Please edit .env and add your OpenAI API key"
        print_status "OPENAI_API_KEY=\"your-openai-api-key-here\""
    else
        print_error ".env.example not found in backend directory"
        exit 1
    fi
else
    print_success "Backend .env file already exists"
fi

# Initialize database
print_status "Initializing database..."
npx prisma generate
npx prisma db push
print_success "Database initialized"

cd ..

echo ""
print_status "Installing frontend dependencies..."

cd frontend/voice-note-frontend
if [ -f "package.json" ]; then
    pnpm install
    print_success "Frontend dependencies installed"
else
    print_error "Frontend package.json not found. Please check your directory structure."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Frontend .env file created"
    else
        print_error "Frontend .env.example not found"
        exit 1
    fi
else
    print_success "Frontend .env file already exists"
fi

cd ../..

echo ""
print_status "Checking for optional Ollama installation..."

if command -v ollama &> /dev/null; then
    print_success "Ollama is installed"
    print_status "To get the best AI analysis experience, run:"
    print_status "ollama pull llama3.1:70b"
else
    print_warning "Ollama is not installed (optional but recommended for AI analysis)"
    print_status "To install Ollama, run:"
    print_status "curl https://ollama.ai/install.sh | sh"
fi

echo ""
print_success "🎉 Setup Complete!"
echo ""
print_status "Next steps:"
echo "1. Edit backend/.env and add your OpenAI API key"
echo "2. Start the backend server:"
echo "   cd backend && pnpm dev"
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend/voice-note-frontend && pnpm dev"
echo "4. Open http://localhost:5173 in your browser"
echo ""
print_status "For detailed instructions, see MAC_SETUP_GUIDE.md"
print_status "For troubleshooting, check the guide's troubleshooting section"

# Create a simple start script
cat > start.sh << 'EOF'
#!/bin/bash

# Voice-to-Note Taking Agent - Start Script

echo "🚀 Starting Voice-to-Note Taking Agent..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the voice-note-agent root directory"
    exit 1
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found. Please run setup first."
    exit 1
fi

if [ ! -f "frontend/voice-note-frontend/.env" ]; then
    echo "❌ Frontend .env file not found. Please run setup first."
    exit 1
fi

# Start backend in background
echo "🔧 Starting backend server on port 3001..."
cd backend && pnpm dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background  
echo "🎨 Starting frontend server on port 5173..."
cd ../frontend/voice-note-frontend && pnpm dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo ""
echo "✅ Both servers are starting!"
echo "🔗 Backend API: http://localhost:3001"
echo "🌐 Frontend App: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID
EOF

chmod +x start.sh

print_success "Created start.sh script for easy launching"

echo ""
print_status "💡 Pro Tip: You can now run './start.sh' to start both servers at once!"