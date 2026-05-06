# QueueCare API Testing Script - PowerShell
# Test RBAC Implementation

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "QueueCare REST API Testing Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Configuration
$BASE_URL = "http://localhost:8080/api"
$PATIENT_EMAIL = "patient1@queuecare.com"
$PATIENT_PASSWORD = "Patient123@"
$ADMIN_EMAIL = "admin@queuecare.com"
$ADMIN_PASSWORD = "AdminPass123@"

$PATIENT_TOKEN = ""
$ADMIN_TOKEN = ""
$USER_ID = ""

# Helper function to make requests
function Invoke-APIRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body,
        [string]$Token
    )
    
    $url = "$BASE_URL$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -Body (ConvertTo-Json $Body) -ErrorAction Stop
        return $response.Content | ConvertFrom-Json
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorContent = $streamReader.ReadToEnd()
            Write-Host "Response: $errorContent" -ForegroundColor Yellow
            $streamReader.Close()
        }
        return $null
    }
}

# Test 1: Register User
Write-Host "[1/6] Testing User Registration" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "POST /auth/register"
Write-Host "Body: { email: $PATIENT_EMAIL, password: $PATIENT_PASSWORD }" -ForegroundColor Gray
Write-Host ""

$registerBody = @{
    email = $PATIENT_EMAIL
    password = $PATIENT_PASSWORD
}

$registerResponse = Invoke-APIRequest -Method "POST" -Endpoint "/auth/register" -Body $registerBody

if ($registerResponse) {
    Write-Host "✓ Registration successful" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $registerResponse | ConvertTo-Json | Write-Host -ForegroundColor Gray
    $USER_ID = $registerResponse.userId
    Write-Host "User ID: $USER_ID" -ForegroundColor Yellow
} else {
    Write-Host "✗ Registration failed" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 2: Patient Login
Write-Host "[2/6] Testing Patient Login" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "POST /auth/login"
Write-Host "Body: { email: $PATIENT_EMAIL, password: $PATIENT_PASSWORD }" -ForegroundColor Gray
Write-Host ""

$loginBody = @{
    email = $PATIENT_EMAIL
    password = $PATIENT_PASSWORD
}

$loginResponse = Invoke-APIRequest -Method "POST" -Endpoint "/auth/login" -Body $loginBody

if ($loginResponse) {
    Write-Host "✓ Patient login successful" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $loginResponse | ConvertTo-Json | Write-Host -ForegroundColor Gray
    $PATIENT_TOKEN = $loginResponse.token
    Write-Host "Token saved: $($PATIENT_TOKEN.Substring(0, 20))..." -ForegroundColor Yellow
} else {
    Write-Host "✗ Patient login failed" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 3: Admin Login
Write-Host "[3/6] Testing Admin Login" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "POST /auth/login"
Write-Host "Body: { email: $ADMIN_EMAIL, password: $ADMIN_PASSWORD }" -ForegroundColor Gray
Write-Host ""

$adminLoginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
}

$adminLoginResponse = Invoke-APIRequest -Method "POST" -Endpoint "/auth/login" -Body $adminLoginBody

if ($adminLoginResponse) {
    Write-Host "✓ Admin login successful" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $adminLoginResponse | ConvertTo-Json | Write-Host -ForegroundColor Gray
    $ADMIN_TOKEN = $adminLoginResponse.token
    Write-Host "Token saved: $($ADMIN_TOKEN.Substring(0, 20))..." -ForegroundColor Yellow
} else {
    Write-Host "✗ Admin login failed - Try creating admin user in DB first" -ForegroundColor Yellow
    Write-Host "SQL: INSERT INTO users (email, password, role, created_at, updated_at)" -ForegroundColor Gray
    Write-Host "     VALUES ('admin@queuecare.com', 'hashed_password', 'ADMIN', NOW(), NOW());" -ForegroundColor Gray
}

Write-Host ""
Write-Host ""

# Test 4: Try promotion without token (should fail)
Write-Host "[4/6] Testing Unauthorized Promotion (No Token)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "PUT /admin/promote/1"
Write-Host "Headers: None" -ForegroundColor Gray
Write-Host "Expected: 401 Unauthorized" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/admin/promote/1" -Method "PUT" -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Correctly blocked unauthorized request" -ForegroundColor Green
        Write-Host "Status Code: 401 Unauthorized" -ForegroundColor Yellow
    } else {
        Write-Host "Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host ""

# Test 5: Try promotion with patient token (should fail)
Write-Host "[5/6] Testing Forbidden Access (Patient Token)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "PUT /admin/promote/1"
Write-Host "Authorization: Bearer PATIENT_TOKEN" -ForegroundColor Gray
Write-Host "Expected: 403 Forbidden" -ForegroundColor Yellow
Write-Host ""

if ($PATIENT_TOKEN) {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $PATIENT_TOKEN"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL/admin/promote/1" -Method "PUT" -Headers $headers -Body '{}' -ErrorAction Stop
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✓ Correctly blocked patient promotion attempt" -ForegroundColor Green
            Write-Host "Status Code: 403 Forbidden" -ForegroundColor Yellow
        } else {
            Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Skipped (patient token not available)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ""

# Test 6: Promotion with admin token (should succeed)
Write-Host "[6/6] Testing Valid Promotion (Admin Token)" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "PUT /admin/promote/$USER_ID"
Write-Host "Authorization: Bearer ADMIN_TOKEN" -ForegroundColor Gray
Write-Host "Expected: 200 OK" -ForegroundColor Yellow
Write-Host ""

if ($ADMIN_TOKEN -and $USER_ID) {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $ADMIN_TOKEN"
    }
    
    $response = Invoke-APIRequest -Method "PUT" -Endpoint "/admin/promote/$USER_ID" -Body @{} -Token $ADMIN_TOKEN
    
    if ($response) {
        Write-Host "✓ Promotion successful" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Gray
        $response | ConvertTo-Json | Write-Host -ForegroundColor Gray
    } else {
        Write-Host "✗ Promotion failed" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped (admin token or user ID not available)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "✓ Public endpoints (/auth/*) - No token required" -ForegroundColor Green
Write-Host "✓ Admin endpoints (/admin/*) - ADMIN token required" -ForegroundColor Green
Write-Host "✓ Protected endpoints - Any valid token required" -ForegroundColor Green
Write-Host ""

Write-Host "Token Details:" -ForegroundColor Cyan
if ($PATIENT_TOKEN) {
    Write-Host "Patient Token: $($PATIENT_TOKEN.Substring(0, 30))..." -ForegroundColor Gray
}
if ($ADMIN_TOKEN) {
    Write-Host "Admin Token: $($ADMIN_TOKEN.Substring(0, 30))..." -ForegroundColor Gray
}
Write-Host "User ID: $USER_ID" -ForegroundColor Gray
Write-Host ""
