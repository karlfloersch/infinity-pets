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

# Run supersim
run-supersim:
    ./supersim/supersim

# Build contracts, run supersim, and serve frontend in parallel
dev: build-contracts
    just run-supersim & just serve-frontend

# Build both contracts and frontend for production
build: build-contracts
    cd frontend && npm run build
