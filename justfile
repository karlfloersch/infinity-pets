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

# Build supersim
build-supersim:
    cd supersim && go build -o supersim cmd/main.go

# Run supersim
run-supersim:
    ./supersim/supersim

# Run supersim with --interop.autorelay flag
run-supersim-autorelay:
    ./supersim/supersim --interop.autorelay

# Build contracts, run supersim, and serve frontend in parallel
dev: build-contracts
    just run-supersim & just serve-frontend

# Build contracts, run supersim with autorelay, and serve frontend in parallel
dev-autorelay: build-contracts
    just run-supersim-autorelay & just serve-frontend

# Build both contracts and frontend for production
build: build-contracts
    cd frontend && npm run build
