# Script to set up GitHub remote and push
param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl
)

Write-Host "Setting up GitHub remote..." -ForegroundColor Cyan

# Add remote
git remote add origin $RepoUrl 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Remote added: $RepoUrl" -ForegroundColor Green
} else {
    # Try to update if it already exists
    git remote set-url origin $RepoUrl
    Write-Host "✓ Remote updated: $RepoUrl" -ForegroundColor Green
}

# Check current branch
$branch = git branch --show-current
if (-not $branch) {
    $branch = "main"
    git branch -M main
}

Write-Host "`nCurrent branch: $branch" -ForegroundColor Cyan
Write-Host "`nReady to push! Run:" -ForegroundColor Yellow
Write-Host "  git push -u origin $branch" -ForegroundColor White

