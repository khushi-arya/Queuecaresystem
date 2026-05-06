@REM QueueCare API Testing Script - Simple Version
@echo off
setlocal enabledelayedexpansion

echo.
echo =====================================
echo QueueCare REST API Testing
echo =====================================
echo.

set "BASE_URL=http://localhost:8080/api"
set "PATIENT_EMAIL=testpatient@queuecare.com"
set "PATIENT_PASS=Patient123@"

REM Test 1: Register a new patient
echo [TEST 1] Register New Patient
echo ============================
echo POST /auth/register
curl -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"%PATIENT_EMAIL%\", \"password\": \"%PATIENT_PASS%\"}"

echo.
echo.

REM Test 2: Login patient to get JWT token
echo [TEST 2] Login Patient (Get JWT Token)
echo ======================================
echo POST /auth/login
curl -X POST "%BASE_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"%PATIENT_EMAIL%\", \"password\": \"%PATIENT_PASS%\"}"

echo.
echo.

REM Test 3: Try accessing admin endpoint without token (should fail)
echo [TEST 3] Test Unauthorized Access (No Token)
echo ============================================
echo PUT /admin/promote/1 (WITHOUT TOKEN)
echo Expected: 401 Unauthorized or 403 Forbidden
echo.
curl -i -X PUT "%BASE_URL%/admin/promote/1" ^
  -H "Content-Type: application/json"

echo.
echo.

echo [TEST SUMMARY]
echo ==============
echo Test 1: Registration - Should create user with PATIENT role automatically
echo Test 2: Login - Should return JWT token with user info
echo Test 3: Authorization - Should block access without valid admin token
echo.
echo Next: Use the JWT token from Test 2 to test admin endpoints
echo.

pause
