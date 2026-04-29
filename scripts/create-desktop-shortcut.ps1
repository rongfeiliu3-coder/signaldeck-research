$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Launcher = Join-Path $ProjectRoot "scripts\start-quantize-local.ps1"
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "Quantize Research.lnk"
$PowerShell = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = $PowerShell
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$Launcher`""
$shortcut.WorkingDirectory = $ProjectRoot
$shortcut.IconLocation = "$PowerShell,0"
$shortcut.Description = "Start Quantize local research workspace and run monitor"
$shortcut.Save()

Write-Host "Created desktop shortcut: $ShortcutPath"
