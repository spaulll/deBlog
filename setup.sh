#!/bin/bash

echo "Starting Deblog Setup Process..."
echo "-----------------------------------"
echo

# Backend Part
echo "Starting backend Setup..."
gnome-terminal -- bash -c "cd backend; echo 'Setting up Backend...'; npm install; exec bash" &

# Frontend Part
echo "Starting frontend Setup..."
gnome-terminal -- bash -c "cd frontend; echo 'Setting up Frontend...'; npm install; exec bash" &

# End of script
# Note: This script assumes you are using gnome-terminal. If you are using a different terminal emulator, you may need to modify the script accordingly.
# Make sure to give execute permission to this script before running it:
# chmod +x setup.sh
# You can run the script using:
# ./setup.sh
