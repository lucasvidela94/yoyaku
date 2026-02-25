#!/bin/bash

set -e

echo "🧪 Running all tests..."
echo ""

echo "📦 Backend tests (Go)..."
go test ./... -v

echo ""
echo "🎨 Frontend tests (React)..."
cd frontend
npm run test -- --run

echo ""
echo "✅ All tests passed!"