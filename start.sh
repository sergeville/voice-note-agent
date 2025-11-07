#!/bin/bash

echo "Starting Voice-to-Note Taking Agent..."
echo ""

# Check if in correct directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the voice-note-agent root directory"
    exit 1
fi

# Start backend
echo "Starting backend server..."
cd backend
pnpm dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend
echo "Starting frontend server..."
cd frontend/voice-note-frontend
pnpm dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "========================================="
echo "Voice-to-Note Agent is running!"
echo "========================================="
echo ""
echo "Backend API:  http://localhost:3001"
echo "Frontend App: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
