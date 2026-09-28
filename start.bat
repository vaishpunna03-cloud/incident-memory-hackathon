@echo off
echo ========================================================
echo  INCIDENT MEMORY: AI SRE ROOT-CAUSE AGENT (HINDSIGHT)
echo ========================================================
echo.

echo Starting FastAPI Backend on port 8000...
start cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo Starting Next.js Frontend Console on port 3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  System Initialized Successfully!
echo  Console URL: http://localhost:3000
echo  API Docs:    http://127.0.0.1:8000/docs
echo  Demo URL:    http://localhost:3000/demo
echo ========================================================
echo.
pause
