#!/bin/bash

echo "Starting Deblog Development Environment..."
echo "-----------------------------------"
echo

# Backend Part
echo "Starting backend..."
gnome-terminal -- bash -c "cd backend; echo 'Starting Backend...'; npm start; exec bash" &

# Frontend Part
echo "Starting frontend..."
gnome-terminal -- bash -c "cd frontend; echo 'Starting Frontend...'; npm start; exec bash" &

echo "Backend and frontend started in separate terminal windows."
echo "-----------------------------------"
echo "You can now access the application at http://localhost:3000"
echo "-----------------------------------"
echo "To stop the servers, close the terminal windows or use Ctrl+C in each terminal."
echo "-----------------------------------"
echo "Deblog Development Environment is running."
echo "-----------------------------------"
# Wait for user input to close the script
read -p "Press [Enter] to exit..."
# Close all terminal windows
pkill gnome-terminal
echo "Deblog Development Environment stopped."
echo "-----------------------------------"
echo "Thank you for using Deblog!"
echo "-----------------------------------"
# End of script
# Note: This script assumes you are using gnome-terminal. If you are using a different terminal emulator, you may need to modify the script accordingly.
# Make sure to give execute permission to this script before running it:
# chmod +x start.sh
# You can run the script using:
# ./start.sh
# This script is designed to start the backend and frontend of the Deblog application in separate terminal windows.
