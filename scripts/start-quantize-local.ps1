$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Port = 3001
$Url = "http://127.0.0.1:$Port/monitor"

function Test-PortOpen {
  param([int] $TargetPort)
  $connection = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue
  return $null -ne $connection
}

Set-Location $ProjectRoot

$alreadyRunning = Test-PortOpen -TargetPort $Port

if (-not $alreadyRunning) {
  Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev", "--", "-p", "$Port") -WorkingDirectory $ProjectRoot -WindowStyle Hidden
  Start-Process $Url
}

$deadline = (Get-Date).AddSeconds(45)
while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/api/local/processes" -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      break
    }
  } catch {
    Start-Sleep -Seconds 1
  }
}

Start-Process $Url
