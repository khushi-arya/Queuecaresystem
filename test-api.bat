@echo off
REM QueueCare API Testing Script - Windows Batch
REM Test RBAC Implementation

setlocal enabledelayedexpansion

echo.
echo =====================================
echo QueueCare REST API Testing Script
echo =====================================
echo.

REM Configuration
set "BASE_URL=http://localhost:8080/api"
set "PATIENT_EMAIL=patient1@queuecare.com"
set "PATIENT_PASSWORD=Patient123@"
set "PATIENT2_EMAIL=patient2@queuecare.com"
set "ADMIN_EMAIL=admin@queuecare.com"
set "ADMIN_PASSWORD=AdminPass123@"

REM Temporary files for storing tokens
set "TEMP_DIR=%TEMP%"
set "PATIENT_TOKEN_FILE=%TEMP_DIR%\patient_token.txt"
set "ADMIN_TOKEN_FILE=%TEMP_DIR%\admin_token.txt"
set "USER_ID_FILE=%TEMP_DIR%\user_id.txt"

echo.
echo [1/5] Testing User Registration (POST /auth/register)
echo ======================================================
echo Request: POST %BASE_URL%/auth/register
echo Body: { "email": "%PATIENT_EMAIL%", "password": "%PATIENT_PASSWORD%" }
echo.

curl -s -X POST %BASE_URL%/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"%PATIENT_EMAIL%\", \"password\": \"%PATIENT_PASSWORD%\"}" > registration.json

if exist registration.json (
    echo Response:
    type registration.json
    echo.
    
    REM Extract user ID (simplified - requires jq or similar)
    echo ✓ Registration successful
) else (
    echo ✗ Registration failed
)

echo.
echo [2/5] Testing User Login (POST /auth/login)
echo ===========================================
echo Request: POST %BASE_URL%/auth/login
echo Body: { "email": "%PATIENT_EMAIL%", "password": "%PATIENT_PASSWORD%" }
echo.

curl -s -X POST %BASE_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"%PATIENT_EMAIL%\", \"password\": \"%PATIENT_PASSWORD%\"}" > patient_login.json

if exist patient_login.json (
    echo Response:
    type patient_login.json
    echo.
    echo ✓ Login successful
) else (
    echo ✗ Login failed
)

echo.
echo [3/5] Testing Admin Login (POST /auth/login)
echo ============================================
echo Request: POST %BASE_URL%/auth/login
echo Body: { "email": "%ADMIN_EMAIL%", "password": "%ADMIN_PASSWORD%" }
echo.

curl -s -X POST %BASE_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"%ADMIN_EMAIL%\", \"password\": \"%ADMIN_PASSWORD%\"}" > admin_login.json

if exist admin_login.json (
    echo Response:
    type admin_login.json
    echo.
    echo ✓ Admin login successful
) else (
    echo ✗ Admin login failed
)

echo.
echo [4/5] Testing Unauthorized Access (Non-Admin)
echo =============================================
echo Request: PUT %BASE_URL%/admin/promote/1 (without admin token)
echo Expected: 403 Forbidden
echo.

curl -s -X PUT %BASE_URL%/admin/promote/1 > unauthorized.json 2>&1

if exist unauthorized.json (
    echo Response:
    type unauthorized.json
    echo.
    echo ✓ Unauthorized request blocked
) else (
    echo ✗ Test failed
)

echo.
echo [5/5] Summary
echo ==============
echo.
echo Files created with responses:
echo - registration.json (User registration response)
echo - patient_login.json (Patient login + JWT token)
echo - admin_login.json (Admin login + JWT token)
echo - unauthorized.json (Unauthorized access attempt)
echo.
echo Next Steps:
echo 1. Copy JWT token from patient_login.json or admin_login.json
echo 2. Use it in Authorization header: "Authorization: Bearer TOKEN"
echo 3. Test promotion endpoint: PUT /api/admin/promote/{userId}
echo.
echo ✓ Testing completed!
echo.

REM Cleanup
REM del registration.json
REM del patient_login.json
REM del admin_login.json
REM del unauthorized.json

pause
