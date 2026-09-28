Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " INCIDENT MEMORY: AI SRE ROOT-CAUSE AGENT (HINDSIGHT)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "Starting FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "Starting Next.js Frontend Console on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "========================================================" -ForegroundColor Green
Write-Host " System Initialized Successfully!" -ForegroundColor Green
Write-Host " Console URL: http://localhost:3000" -ForegroundColor White
Write-Host " API Docs:    http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host " Demo URL:    http://localhost:3000/demo" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
