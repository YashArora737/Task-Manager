# Start Task Management System
# Run this script from the Internshala_Assignment folder

Write-Host "🚀 Starting Task Management System..." -ForegroundColor Cyan

# Backend
Write-Host "`n📦 Starting Backend (port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Frontend
Write-Host "🌐 Starting Frontend (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host "`n✅ Both servers starting!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nWait ~10 seconds for both to be ready, then open http://localhost:3000`n"
