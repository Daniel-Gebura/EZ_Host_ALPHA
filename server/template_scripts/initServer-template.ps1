# Set the working directory to the parent directory of where the script is located
Set-Location -Path (Get-Item $PSScriptRoot).Parent.FullName

# Acquire variable hashtable from variables.txt in the server root directory
$ExternalVariablesFile = Join-Path (Get-Item $PSScriptRoot).Parent.FullName "variables.txt"
$ExternalVariables = Get-Content -raw -LiteralPath $ExternalVariablesFile | ConvertFrom-StringData

# Set our in-script variables from contents of variables.txt-hashtable
$MinecraftVersion = $ExternalVariables['MINECRAFT_VERSION']
$ModLoader = $ExternalVariables['MODLOADER']
$ModLoaderVersion = $ExternalVariables['MODLOADER_VERSION']
$LegacyFabricInstallerVersion = $ExternalVariables['LEGACYFABRIC_INSTALLER_VERSION']
$FabricInstallerVersion = $ExternalVariables['FABRIC_INSTALLER_VERSION']
$QuiltInstallerVersion = $ExternalVariables['QUILT_INSTALLER_VERSION']
$MinecraftServerUrl = $ExternalVariables['MINECRAFT_SERVER_URL']
$JavaArgs = $ExternalVariables['JAVA_ARGS']
$Java = $ExternalVariables['JAVA']

# Clean up quotes from the Java and Java Args variables
$Java = $Java.Trim('"')
$JavaArgs = $JavaArgs.Trim('"')

$MinecraftServerJarLocation = "do_not_manually_edit"
$LauncherJarLocation = "do_not_manually_edit"
$ServerRunCommand = "do_not_manually_edit"

Function DeleteFileSilently {
    param ($FileToDelete)
    $ErrorActionPreference = "SilentlyContinue"
    if ((Get-Item "${FileToDelete}").PSIsContainer) {
        Remove-Item "${FileToDelete}" -Recurse
    } else {
        Remove-Item "${FileToDelete}"
    }
    $ErrorActionPreference = "Continue"
}

Function PauseScript {
    Write-Host "Press any key to continue" -ForegroundColor Yellow
    $host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown") > $null
}

Function Crash {
    Write-Host "Exiting..."
    PauseScript
    exit 1
}

Function global:RunJavaCommand {
    param ($CommandToRun)
    CMD /C "`"${Java}`" ${CommandToRun}"
}

Function global:CheckJavaBitness {
    $Bit = CMD /C "`"${Java}`" -version 2>&1"
    if ( (${Bit} | Select-String "32-Bit").Length -gt 0) {
        Write-Host "WARNING! 32-Bit Java detected! It is highly recommended to use a 64-Bit version of Java!"
    }
}

Function DownloadIfNotExists {
    param ($FileToCheck, $FileToDownload, $DownloadURL)
    if (!(Test-Path -Path $FileToCheck -PathType Leaf)) {
        Write-Host "${FileToCheck} could not be found."
        Write-Host "Downloading ${FileToDownload}"
        Write-Host "from ${DownloadURL}"
        Invoke-WebRequest -URI "${DownloadURL}" -OutFile "${FileToDownload}"
        if (Test-Path -Path "${FileToDownload}" -PathType Leaf) {
            Write-Host "Download complete."
            return $true
        }
    } else {
        Write-Host "${FileToCheck} present."
        return $false
    }
}

Function global:SetupForge {
    "Running Forge checks and setup..."
    $ForgeInstallerUrl = "https://files.minecraftforge.net/maven/net/minecraftforge/forge/${MinecraftVersion}-${ModLoaderVersion}/forge-${MinecraftVersion}-${ModLoaderVersion}-installer.jar"
    $ForgeJarLocation = "do_not_manually_edit"
    $MINOR = ${MinecraftVersion}.Split(".")
    if ([int]$MINOR[1] -le 16) {
        $ForgeJarLocation = "forge.jar"
        $script:LauncherJarLocation = "forge.jar"
        $script:MinecraftServerJarLocation = "minecraft_server.${MinecraftVersion}.jar"
        $script:ServerRunCommand = "-Dlog4j2.formatMsgNoLookups=true ${JavaArgs} -jar ${LauncherJarLocation} nogui"
    } else {
        $ForgeJarLocation = "libraries/net/minecraftforge/forge/${MinecraftVersion}-${ModLoaderVersion}/forge-${MinecraftVersion}-${ModLoaderVersion}-server.jar"
        $script:LauncherJarLocation = "libraries/net/minecraftforge/forge/${MinecraftVersion}-${ModLoaderVersion}/forge-${MinecraftVersion}-${ModLoaderVersion}-server.jar"
        $script:MinecraftServerJarLocation = "libraries/net/minecraft/server/${MinecraftVersion}/server-${MinecraftVersion}.jar"
        $script:ServerRunCommand = "-Dlog4j2.formatMsgNoLookups=true @user_jvm_args.txt @libraries/net/minecraftforge/forge/${MinecraftVersion}-${ModLoaderVersion}/win_args.txt nogui"
        Write-Host "Generating user_jvm_args.txt from variables..."
        DeleteFileSilently 'user_jvm_args.txt'
        "# Xmx and Xms set the maximum and minimum RAM usage, respectively.`n" +
        "# They can take any number, followed by an M or a G.`n" +
        "# M means Megabyte, G means Gigabyte.`n" +
        "# For example, to set the maximum to 3GB: -Xmx3G`n" +
        "# To set the minimum to 2.5GB: -Xms2500M`n" +
        "# A good default for a modded server is 4GB.`n" +
        "# Uncomment the next line to set it.`n" +
        "# -Xmx4G`n" +
        "${script:JavaArgs}" | Out-File user_jvm_args.txt -encoding utf8
    }
    if ((DownloadIfNotExists "${ForgeJarLocation}" "forge-installer.jar" "${ForgeInstallerUrl}")) {
        "Forge Installer downloaded. Installing..."
        RunJavaCommand "-jar forge-installer.jar --installServer"
        if ([int]$MINOR[1] -gt 16) {
            DeleteFileSilently 'run.bat'
            DeleteFileSilently 'run.sh'
        } else {
            "Renaming forge-${MinecraftVersion}-${ModLoaderVersion}.jar to forge.jar"
            Move-Item "forge-${MinecraftVersion}-${ModLoaderVersion}.jar" 'forge.jar'
        }
        if ((Test-Path -Path "${ForgeJarLocation}" -PathType Leaf)) {
            DeleteFileSilently 'forge-installer.jar'
            DeleteFileSilently 'forge-installer.jar.log'
            "Installation complete. forge-installer.jar deleted."
        } else {
            DeleteFileSilently 'forge-installer.jar'
            "Something went wrong during the server installation. Please try again in a couple of minutes and check your internet connection."
            Crash
        }
    }
}

Function global:SetupNeoForge {
    "Running NeoForge checks and setup..."
    $ForgeInstallerUrl = "https://maven.neoforged.net/net/neoforged/forge/${MinecraftVersion}-${ModLoaderVersion}/forge-${MinecraftVersion}-${ModLoaderVersion}-installer.jar"
    $ForgeJarLocation = "do_not_manually_edit"
    $MINOR = ${MinecraftVersion}.Split(".")
    if ([int]$MINOR[1] -le 16) {
        $ForgeJarLocation = "forge.jar"
        $script:LauncherJarLocation = "forge.jar"
        $script:MinecraftServerJarLocation = "minecraft_server.${MinecraftVersion}.jar"
        $script:ServerRunCommand = "-Dlog4j2.formatMsgNoLookups=true ${JavaArgs} -jar ${LauncherJarLocation} nogui"
    } else {
        $ForgeJarLocation = "libraries/net/neoforged/forge/${MinecraftVersion}-${ModLoaderVersion}/forge-${MinecraftVersion}-${ModLoaderVersion}-server.jar"
        $script:LauncherJarLocation = "libraries/net/neoforged/forge/${MinecraftVersion}-${ModLoaderVersion}/forge-${MinecraftVersion}-${ModLoaderVersion}-server.jar"
        $script:MinecraftServerJarLocation = "libraries/net/minecraft/server/${MinecraftVersion}/server-${MinecraftVersion}.jar"
        $script:ServerRunCommand = "-Dlog4j2.formatMsgNoLookups=true @user_jvm_args.txt @libraries/net/neoforged/forge/${MinecraftVersion}-${ModLoaderVersion}/win_args.txt nogui"
        Write-Host "Generating user_jvm_args.txt from variables..."
        DeleteFileSilently 'user_jvm_args.txt'
        "# Xmx and Xms set the maximum and minimum RAM usage, respectively.`n" +
        "# They can take any number, followed by an M or a G.`n" +
        "# M means Megabyte, G means Gigabyte.`n" +
        "# For example, to set the maximum to 3GB: -Xmx3G`n" +
        "# To set the minimum to 2.5GB: -Xms2500M`n" +
        "# A good default for a modded server is 4GB.`n" +
        "# Uncomment the next line to set it.`n" +
        "# -Xmx4G`n" +
        "${script:JavaArgs}" | Out-File user_jvm_args.txt -encoding utf8
    }
    if ((DownloadIfNotExists "${ForgeJarLocation}" "neoforge-installer.jar" "${ForgeInstallerUrl}")) {
        "NeoForge Installer downloaded. Installing..."
        RunJavaCommand "-jar neoforge-installer.jar --installServer"
        if ([int]$MINOR[1] -gt 16) {
            DeleteFileSilently 'run.bat'
            DeleteFileSilently 'run.sh'
        } else {
            "Renaming forge-${MinecraftVersion}-${ModLoaderVersion}.jar to forge.jar"
            Move-Item "forge-${MinecraftVersion}-${ModLoaderVersion}.jar" 'forge.jar'
        }
        if ((Test-Path -Path "${ForgeJarLocation}" -PathType Leaf)) {
            DeleteFileSilently 'neoforge-installer.jar'
            DeleteFileSilently 'neoforge-installer.jar.log'
            "Installation complete. neoforge-installer.jar deleted."
        } else {
            DeleteFileSilently 'neoforge-installer.jar'
            "Something went wrong during the server installation. Please try again in a couple of minutes and check your internet connection."
            Crash
        }
    }
}

Function global:SetupFabric {
    "Running Fabric checks and setup..."
    $FabricInstallerUrl = "https://maven.fabricmc.net/net/fabricmc/fabric-installer/${FabricInstallerVersion}/fabric-installer-${FabricInstallerVersion}.jar"
    $ImprovedFabricLauncherUrl = "https://meta.fabricmc.net/v2/versions/loader/${MinecraftVersion}/${ModLoaderVersion}/${FabricInstallerVersion}/server/jar"
    $ErrorActionPreference = "SilentlyContinue"
    $script:ImprovedFabricLauncherAvailable = [int][System.Net.WebRequest]::Create("${ImprovedFabricLauncherUrl}").GetResponse().StatusCode
    $ErrorActionPreference = "Continue"
    if ("${ImprovedFabricLauncherAvailable}" -eq "200") {
        "Improved Fabric Server Launcher available..."
        "The improved launcher will be used to run this Fabric server."
        $script:LauncherJarLocation = "fabric-server-launcher.jar"
        (DownloadIfNotExists "${script:LauncherJarLocation}" "${script:LauncherJarLocation}" "${ImprovedFabricLauncherUrl}") > $null
    } else {
        try {
            $ErrorActionPreference = "SilentlyContinue"
            $FabricAvailable = [int][System.Net.WebRequest]::Create("https://meta.fabricmc.net/v2/versions/loader/${MinecraftVersion}/${ModLoaderVersion}/server/json").GetResponse().StatusCode
            $ErrorActionPreference = "Continue"
        } catch {
            $FabricAvailable = "400"
        }
        if ("${FabricAvailable}" -ne "200") {
            "Fabric is not available for Minecraft ${MinecraftVersion}, Fabric ${ModLoaderVersion}."
            Crash
        }
        if ((DownloadIfNotExists "fabric-server-launch.jar" "fabric-installer.jar" "${FabricInstallerUrl}")) {
            "Installer downloaded..."
            $script:LauncherJarLocation = "fabric-server-launch.jar"
            $script:MinecraftServerJarLocation = "server.jar"
            RunJavaCommand "-jar fabric-installer.jar server -mcversion ${MinecraftVersion} -loader ${ModLoaderVersion} -downloadMinecraft"
            if ((Test-Path -Path 'fabric-server-launch.jar' -PathType Leaf)) {
                DeleteFileSilently '.fabric-installer' -Recurse
                DeleteFileSilently 'fabric-installer.jar'
                "Installation complete. fabric-installer.jar deleted."
            } else {
                DeleteFileSilently 'fabric-installer.jar'
                "fabric-server-launch.jar not found. Maybe the Fabric servers are having trouble."
                "Please try again in a couple of minutes and check your internet connection."
                Crash
            }
        } else {
            $script:LauncherJarLocation = "fabric-server-launcher.jar"
            $script:MinecraftServerJarLocation = "server.jar"
        }
    }
    $script:ServerRunCommand = "-Dlog4j2.formatMsgNoLookups=true ${script:JavaArgs} -jar ${script:LauncherJarLocation} nogui"
}

Function global:SetupQuilt {
    "Running Quilt checks and setup..."
    $QuiltInstallerUrl = "https://maven.quiltmc.org/repository/release/org/quiltmc/quilt-installer/${QuiltInstallerVersion}/quilt-installer-${QuiltInstallerVersion}.jar"
    if ((ConvertFrom-JSON (Invoke-WebRequest -Uri "https://meta.fabricmc.net/v2/versions/intermediary/${MinecraftVersion}")).Length -eq 0) {
        "Quilt is not available for Minecraft ${MinecraftVersion}, Quilt ${ModLoaderVersion}."
        Crash
    } elseif ((DownloadIfNotExists "quilt-server-launch.jar" "quilt-installer.jar" "${QuiltInstallerUrl}")) {
        "Installer downloaded. Installing..."
        RunJavaCommand "-jar quilt-installer.jar install server ${MinecraftVersion} --download-server --install-dir=."
        if ((Test-Path -Path 'quilt-server-launch.jar' -PathType Leaf)) {
            DeleteFileSilently 'quilt-installer.jar'
            "Installation complete. quilt-installer.jar deleted."
        } else {
            DeleteFileSilently 'quilt-installer.jar'
            "quilt-server-launch.jar not found. Maybe the Quilt servers are having trouble."
            "Please try again in a couple of minutes and check your internet connection."
            Crash
        }
    }
    $script:LauncherJarLocation = "quilt-server-launch.jar"
    $script:MinecraftServerJarLocation = "server.jar"
    $script:ServerRunCommand = "-Dlog4j2.formatMsgNoLookups=true ${JavaArgs} -jar ${LauncherJarLocation} nogui"
}

Function global:SetupLegacyFabric {
    "Running LegacyFabric checks and setup..."
    $LegacyFabricInstallerUrl = "https://maven.legacyfabric.net/net/legacyfabric/fabric-installer/${LegacyFabricInstallerVersion}/fabric-installer-${LegacyFabricInstallerVersion}.jar"
    if ((ConvertFrom-JSON (Invoke-WebRequest -Uri "https://meta.legacyfabric.net/v2/versions/loader/${MinecraftVersion}")).Length -eq 0) {
        "LegacyFabric is not available for Minecraft ${MinecraftVersion}, LegacyFabric ${ModLoaderVersion}."
        Crash
    } elseif ((DownloadIfNotExists "fabric-server-launch.jar" "legacyfabric-installer.jar" "${LegacyFabricInstallerUrl}")) {
        "Installer downloaded. Installing..."
        RunJavaCommand "-jar legacyfabric-installer.jar server -mcversion ${MinecraftVersion} -loader ${ModLoaderVersion} -downloadMinecraft"
        if ((Test-Path -Path 'fabric-server-launch.jar' -PathType Leaf)) {
            DeleteFileSilently 'legacyfabric-installer.jar'
            "Installation complete. legacyfabric-installer.jar deleted."
        } else {
            DeleteFileSilently 'legacyfabric-installer.jar'
            "fabric-server-launch.jar not found. Maybe the LegacyFabric servers are having trouble."
            "Please try again in a couple of minutes and check your internet connection."
            Crash
        }
    }
    $script:LauncherJarLocation = "fabric-server-launch.jar"
    $script:MinecraftServerJarLocation = "server.jar"
    $script:ServerRunCommand = "-Dlog4j2.formatMsgNoLookups=true ${JavaArgs} -jar ${LauncherJarLocation} nogui"
}

Function global:Minecraft {
    if (($ModLoader -eq "Fabric") -and (${ImprovedFabricLauncherAvailable} -eq "200")) {
        "Skipping Minecraft Server JAR checks because we are using the improved Fabric Server Launcher."
    } else {
        (DownloadIfNotExists "${MinecraftServerJarLocation}" "${MinecraftServerJarLocation}" "${MinecraftServerUrl}") > $null
    }
}

Function Eula {
    $eulaPath = Join-Path (Get-Item $PSScriptRoot).Parent.FullName 'eula.txt'
    if (!(Test-Path -Path $eulaPath -PathType Leaf)) {
        # By adding the server, the user has already agreed to EULA
        "#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).`neula=true" | Out-File $eulaPath -Encoding utf8
    } else {
        (Get-Content $eulaPath) | ForEach-Object {
            $_ -replace '^eula=.*', 'eula=true'
        } | Set-Content $eulaPath
    }
    Write-Host "EULA agreement set to true."
}


switch ( ${ModLoader} ) {
    Forge { SetupForge }
    NeoForge { SetupNeoForge }
    Fabric { SetupFabric }
    Quilt { SetupQuilt }
    LegacyFabric { SetupLegacyFabric }
    default {
        "Incorrect modloader specified: ${ModLoader}"
        Crash
    }
}

CheckJavaBitness
Minecraft
Eula

# Store the server run command and launcher jar location in a file for use in start.ps1
$ServerRunCommandFile = Join-Path $PSScriptRoot "server_run_command.txt"
"${Java} ${ServerRunCommand}" | Out-File -FilePath $ServerRunCommandFile -Encoding utf8

$LauncherJarFile = Join-Path $PSScriptRoot "launcher_jar.txt"
"${LauncherJarLocation}" | Out-File -FilePath $LauncherJarFile -Encoding utf8

""
"Initialization complete. Server is ready to be started with start.ps1."
""
PauseScript
exit 0
