# Script to set API key and start the server
param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host "Setting OPENAI_API_KEY..." -ForegroundColor Green
$env:OPENAI_API_KEY = $ApiKey

# Verify
if ($env:OPENAI_API_KEY) {
    Write-Host "✓ API key set (length: $($env:OPENAI_API_KEY.Length))" -ForegroundColor Green
    if ($env:OPENAI_API_KEY -notmatch '^sk-') {
        Write-Host "⚠ Warning: API key should start with 'sk-'" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Failed to set API key" -ForegroundColor Red
    exit 1
}

Write-Host "`nStarting server with API key..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start the server
npm start

