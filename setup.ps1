Write-Host "Starting Deblog Setup Process..."
Write-Host "-----------------------------------"
Write-Host ""

# Backend Part
Write-Host "Starting backend Setup..."
Start-Process powershell -WindowStyle Minimized -ArgumentList 'cd backend; Write-Host "Setting up Backend..."; npm install'
# Frontend Part
Write-Host "Starting frontend Setup..."
Start-Process powershell -WindowStyle Minimized -ArgumentList 'cd frontend; Write-Host "Setting up Frontend..."; npm install'

Write-Host "Backend and frontend Setup started in separate windows."
Write-Host "-----------------------------------"
Write-Host "To stop the Process, close the respective windows."