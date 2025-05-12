Write-Host "Starting Deblog Development Environment..."
Write-Host "-----------------------------------"
Write-Host ""

# Backend Part
Write-Host "Starting backend..."
Start-Process powershell -WindowStyle Minimized -ArgumentList 'cd backend; Write-Host "Starting Backend..."; npm start'

# Frontend Part
Write-Host "Starting frontend..."
Start-Process powershell -WindowStyle Minimized -ArgumentList 'cd frontend; Write-Host "Starting Frontend..."; npm start'

Write-Host "Backend and frontend started in separate windows."
Write-Host "-----------------------------------"
Write-Host "To stop the servers, close the respective windows."