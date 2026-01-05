# Kill process on port 3001 (or specified port)
param(
    [int]$Port = 3001
)

$processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($procId in $processes) {
        try {
            Stop-Process -Id $procId -Force
            Write-Host "Killed process $procId on port $Port"
        } catch {
            Write-Host "Failed to kill process $procId : $_"
        }
    }
} else {
    Write-Host "No process found on port $Port"
}

