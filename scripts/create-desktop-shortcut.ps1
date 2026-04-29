$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Launcher = Join-Path $ProjectRoot "scripts\launch-quantize.vbs"
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "Quantize Research.lnk"
$WScript = Join-Path $env:SystemRoot "System32\wscript.exe"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = $WScript
$shortcut.Arguments = "`"$Launcher`""
$shortcut.WorkingDirectory = $ProjectRoot
$shortcut.IconLocation = "$WScript,0"
$shortcut.Description = "Start Quantize local research workspace and run monitor"
$shortcut.Save()

Write-Host "Created desktop shortcut: $ShortcutPath"
