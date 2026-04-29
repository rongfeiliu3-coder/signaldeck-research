$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Port = 3001
$Url = "http://127.0.0.1:$Port/monitor"
$RuntimeDir = Join-Path $ProjectRoot "runtime"
$LauncherLog = Join-Path $RuntimeDir "launcher.log"
$LaunchStamp = Join-Path $RuntimeDir "launcher-starting.txt"
$LoadingPage = Join-Path $RuntimeDir "quantize-loading.html"

function Write-LauncherLog {
  param([string] $Message)
  if (-not (Test-Path $RuntimeDir)) {
    New-Item -ItemType Directory -Path $RuntimeDir -Force | Out-Null
  }
  Add-Content -Path $LauncherLog -Value "[$(Get-Date -Format o)] $Message"
}

function Open-QuantizeBrowser {
  param([string] $TargetUrl)
  $edgePaths = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
  )
  $edge = $edgePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

  if ($edge) {
    Start-Process -FilePath $edge -ArgumentList @("--new-window", $TargetUrl)
    return
  }

  Start-Process $TargetUrl
}

function Write-LoadingPage {
  $html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="10; url=$Url" />
  <title>Quantize is starting</title>
  <style>
    :root { color-scheme: dark; font-family: "Segoe UI", Arial, sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #05070a; color: #edf2f7; }
    .panel { width: min(560px, calc(100vw - 32px)); border: 1px solid rgba(255,255,255,.12); border-radius: 18px; background: rgba(12,17,24,.96); padding: 32px; box-shadow: 0 24px 80px rgba(0,0,0,.45); }
    .badge { display: inline-flex; gap: 8px; align-items: center; color: #5edfff; border: 1px solid rgba(94,223,255,.28); background: rgba(94,223,255,.1); padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: .08em; }
    h1 { margin: 22px 0 10px; font-size: 30px; line-height: 1.15; }
    p { margin: 0; color: #94a3b8; line-height: 1.8; }
    .bar { height: 8px; margin-top: 24px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.08); }
    .bar::before { content: ""; display: block; width: 38%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #5edfff, #7cf7b4); animation: load 1.2s ease-in-out infinite alternate; }
    .hint { margin-top: 18px; font-size: 13px; color: #64748b; }
    @keyframes load { from { transform: translateX(-20%); } to { transform: translateX(180%); } }
  </style>
</head>
<body>
  <main class="panel">
    <div class="badge">QUANTIZE LOCAL</div>
    <h1>Starting research workspace</h1>
    <p>The local service is warming up. This usually takes a few seconds. The page will redirect to the run monitor automatically.</p>
    <div class="bar" aria-hidden="true"></div>
    <p class="hint">If it does not redirect, wait a moment and refresh this page, or double-click the desktop shortcut again.</p>
  </main>
</body>
</html>
"@
  Set-Content -Path $LoadingPage -Value $html -Encoding UTF8
}

function Test-PortOpen {
  param([int] $TargetPort)
  $connection = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue
  return $null -ne $connection
}

Set-Location $ProjectRoot

$alreadyRunning = Test-PortOpen -TargetPort $Port
Write-LauncherLog "Launcher clicked. Port $Port running: $alreadyRunning"

if (-not $alreadyRunning -and (Test-Path $LaunchStamp)) {
  $lastLaunch = Get-Item $LaunchStamp
  if (((Get-Date) - $lastLaunch.LastWriteTime).TotalSeconds -lt 20) {
    Write-LauncherLog "Ignored duplicate click while server is starting."
    exit 0
  }
}

if (-not $alreadyRunning) {
  Write-LauncherLog "Starting Quantize dev server."
  Set-Content -Path $LaunchStamp -Value (Get-Date -Format o)
  Write-LoadingPage
  Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev", "--", "-p", "$Port") -WorkingDirectory $ProjectRoot -WindowStyle Hidden
  Open-QuantizeBrowser $LoadingPage
} else {
  Remove-Item $LaunchStamp -ErrorAction SilentlyContinue
  Open-QuantizeBrowser $Url
}
