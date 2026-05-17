#!/bin/bash
# Start PYQ Portal Admin Dashboard
# This script starts the Node.js admin server on localhost:3000

echo ""
echo "========================================"
echo "  PYQ Portal Admin Dashboard"
echo "========================================"
echo ""

cd admin

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: npm install failed"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

echo ""
echo "Starting admin dashboard..."
echo ""
echo "✓ Server running at: http://localhost:3000"
echo "✓ Press Ctrl+C to stop"
echo ""

npm start
