# justfile

# Default recipe to run when just is called without arguments
default:
    @just --list

# Build the smart contracts using Forge
build-contracts:
    forge build

# Serve the frontend using Vite
serve-frontend:
    cd frontend && npm run dev

# Build contracts and serve frontend
dev: build-contracts serve-frontend

# Build both contracts and frontend for production
build: build-contracts
    cd frontend && npm run build
