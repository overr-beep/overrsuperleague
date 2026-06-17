$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

$Port = 3000
$Connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
$ProcessIds = @()

foreach ($Connection in $Connections) {
  $ProcessIds += $Connection.OwningProcess
}

$NetstatLines = netstat -ano | Select-String "LISTENING" | Select-String ":$Port"

foreach ($Line in $NetstatLines) {
  $Parts = ($Line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
  $PidText = $Parts[-1]

  if ($PidText -match "^\d+$") {
    $ProcessIds += [int]$PidText
  }
}

$ProcessIds = $ProcessIds | Sort-Object -Unique

foreach ($ProcessId in $ProcessIds) {
  $Process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue

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
