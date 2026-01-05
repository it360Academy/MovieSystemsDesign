# Direct API key verification using OpenAI API
param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Content-Type" = "application/json"
}

Write-Host "Testing API key directly with OpenAI API..." -ForegroundColor Cyan
Write-Host "Key preview: $($ApiKey.Substring(0, 7))...$($ApiKey.Substring($ApiKey.Length - 4))" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/models" -Headers $headers -Method Get
    Write-Host "`n✅ API key is VALID!" -ForegroundColor Green
    Write-Host "Available models: $($response.data.Count)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    if ($statusCode -eq 401) {
        Write-Host "`n❌ API key is INVALID (401)" -ForegroundColor Red
        Write-Host "Error: $errorBody" -ForegroundColor Red
        Write-Host "`nThe API key you provided is not valid. Please:" -ForegroundColor Yellow
        Write-Host "  1. Check if the key is correct at: https://platform.openai.com/api-keys" -ForegroundColor Yellow
        Write-Host "  2. Make sure the key hasn't been revoked or expired" -ForegroundColor Yellow
        Write-Host "  3. Generate a new key if needed" -ForegroundColor Yellow
    } elseif ($statusCode -eq 429) {
        Write-Host "`n❌ Quota exceeded (429)" -ForegroundColor Red
        Write-Host "Check your billing at: https://platform.openai.com/account/billing" -ForegroundColor Yellow
    } else {
        Write-Host "`n❌ Error: $statusCode" -ForegroundColor Red
        Write-Host "Details: $errorBody" -ForegroundColor Red
    }
}

