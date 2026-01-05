# Script to set OpenAI API key and restart the server
param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host "Setting OPENAI_API_KEY environment variable..."
$env:OPENAI_API_KEY = $ApiKey

# Verify it's set
if ($env:OPENAI_API_KEY) {
    Write-Host "✓ API key set (length: $($env:OPENAI_API_KEY.Length))"
    if ($env:OPENAI_API_KEY -notmatch '^sk-') {
        Write-Host "⚠ Warning: API key should start with 'sk-'"
    }
} else {
    Write-Host "✗ Failed to set API key"
    exit 1
}

Write-Host "`nTo make this permanent, add to your PowerShell profile:"
Write-Host "`$env:OPENAI_API_KEY='$ApiKey'"
Write-Host "`nOr create a .env file in the project root with:"
Write-Host "OPENAI_API_KEY=$ApiKey"

