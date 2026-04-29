Set shell = CreateObject("WScript.Shell")
projectRoot = CreateObject("Scripting.FileSystemObject").GetParentFolderName(CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName))
launcher = projectRoot & "\scripts\start-quantize-local.ps1"
powershell = shell.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\WindowsPowerShell\v1.0\powershell.exe"
command = """" & powershell & """ -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & launcher & """"
shell.Run command, 0, False
