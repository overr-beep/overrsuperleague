$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

$Port = 3000
$Connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

foreach ($Connection in $Connections) {
  $Process = Get-Process -Id $Connection.OwningProcess -ErrorAction SilentlyContinue

  if ($null -eq $Process) {
    continue
  }

  if ($Process.ProcessName -notin @("node", "npm", "cmd", "powershell", "pwsh")) {
    Write-Error "Port $Port is already used by $($Process.ProcessName) (PID $($Process.Id)). Stop it manually or use another port."
  }

  Write-Host "Stopping stale dev process on port $Port (PID $($Process.Id), $($Process.ProcessName))..."
  Stop-Process -Id $Process.Id -Force
}

if (Test-Path ".next") {
  Write-Host "Removing stale .next cache..."
  Remove-Item -LiteralPath ".next" -Recurse -Force
}

Write-Host "Starting Next.js on http://localhost:$Port ..."
& ".\node_modules\.bin\next.cmd" dev --port $Port
