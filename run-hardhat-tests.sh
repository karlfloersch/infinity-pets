#!/bin/bash

# Start the supersim service in the background
./supersim/main --log.level DEBUG --log.format terminal --logs.directory ./supersim/logs --interop.autorelay &

# Capture the process ID of the supersim service
SUPERSIM_PID=$!

# Wait for 2 seconds to ensure the service is up
sleep 2

# Run the existing hardhat tests
npx hardhat test

# Terminate the supersim service
kill $SUPERSIM_PID