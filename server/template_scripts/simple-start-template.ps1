# Set the working directory to the directory where the script is located
Set-Location -Path $PSScriptRoot

# Read variables from variables.txt
$variablesFile = Join-Path -Path $PSScriptRoot -ChildPath "variables.txt"
$variables = Get-Content -raw -LiteralPath $variablesFile | ConvertFrom-StringData

# Set variables
$Java = $variables['JAVA']
$JavaArgs = $variables['JAVA_ARGS']
$LauncherJarLocation = $variables['LAUNCHER_JAR']  # Assuming you have a variable for the launcher JAR in variables.txt

# Clean up quotes from the Java variable
if ($Java[0] -eq '"') { $Java = $Java.Substring(1, $Java.Length - 1) }
if ($Java[$Java.Length - 1] -eq '"') { $Java = $Java.Substring(0, $Java.Length - 1) }

# Clean up quotes from the Java Args variable
if ($JavaArgs[0] -eq '"') { $JavaArgs = $JavaArgs.Substring(1, $JavaArgs.Length - 1) }
if ($JavaArgs[$JavaArgs.Length - 1] -eq '"') { $JavaArgs = $JavaArgs.Substring(0, $JavaArgs.Length - 1) }

# Java command to run the server
$javaCommand = "$Java -Dlog4j2.formatMsgNoLookups=true $JavaArgs -jar $LauncherJarLocation nogui"

# Use Start-Process to open a new PowerShell window and run the Java command
Start-Process powershell -ArgumentList "-NoExit -Command `"$javaCommand`""

# Pause to keep the current window open
Pause
