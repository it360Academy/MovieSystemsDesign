# Movie Systems Design - Run Script
Write-Host "Movie Systems Design Application" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if OpenAI API key is set
if (-not $env:OPENAI_API_KEY) {
    Write-Host "`nNote: OPENAI_API_KEY not set. Using mock enrichment mode." -ForegroundColor Yellow
    Write-Host "To use LLM features, set it with: `$env:OPENAI_API_KEY='your_key'" -ForegroundColor Yellow
}

# Run the application
Write-Host "`nStarting application...`n" -ForegroundColor Cyan
python main.py

