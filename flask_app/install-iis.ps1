#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Installs and configures Billy's Photo Booth Flask application on IIS
.DESCRIPTION
    This script will:
    - Install Python 3.11 if not present
    - Enable IIS CGI feature
    - Create the application directory structure
    - Set up a Python virtual environment
    - Install all required Python packages
    - Configure wfastcgi for IIS
    - Create the IIS website and application pool
    - Generate the web.config file
.NOTES
    Run this script as Administrator on your Windows Server with IIS installed
#>

param(
    [string]$AppPath = "C:\inetpub\wwwroot\billysbooth",
    [string]$SiteName = "BillysPhotoBooth",
    [int]$Port = 80,
    [string]$ResendApiKey = "",
    [string]$TwilioAccountSid = "",
    [string]$TwilioAuthToken = "",
    [string]$TwilioPhoneNumber = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Billy's Photo Booth - IIS Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

# Step 1: Check/Install Python
Write-Host "[1/8] Checking Python installation..." -ForegroundColor Yellow

$pythonPath = $null
$pythonVersion = $null

try {
    $pythonVersion = python --version 2>&1
    $pythonPath = (Get-Command python).Source
    Write-Host "  Found Python: $pythonVersion at $pythonPath" -ForegroundColor Green
} catch {
    Write-Host "  Python not found. Installing Python 3.11..." -ForegroundColor Yellow
    
    $pythonInstaller = "$env:TEMP\python-3.11.9-amd64.exe"
    $pythonUrl = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe"
    
    Write-Host "  Downloading Python installer..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonInstaller -UseBasicParsing
    
    Write-Host "  Running Python installer (this may take a few minutes)..." -ForegroundColor Gray
    Start-Process -FilePath $pythonInstaller -ArgumentList "/quiet", "InstallAllUsers=1", "PrependPath=1", "Include_test=0" -Wait -NoNewWindow
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    
    # Verify installation
    $pythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
    if ($pythonPath) {
        Write-Host "  Python installed successfully at $pythonPath" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Python installation failed!" -ForegroundColor Red
        exit 1
    }
    
    Remove-Item $pythonInstaller -Force -ErrorAction SilentlyContinue
}

# Step 2: Enable IIS CGI Feature
Write-Host "[2/8] Enabling IIS CGI feature..." -ForegroundColor Yellow

$cgiFeature = Get-WindowsOptionalFeature -Online -FeatureName IIS-CGI -ErrorAction SilentlyContinue
if ($cgiFeature.State -ne "Enabled") {
    Enable-WindowsOptionalFeature -Online -FeatureName IIS-CGI -NoRestart | Out-Null
    Write-Host "  IIS CGI feature enabled" -ForegroundColor Green
} else {
    Write-Host "  IIS CGI feature already enabled" -ForegroundColor Green
}

# Step 3: Create application directory
Write-Host "[3/8] Creating application directory..." -ForegroundColor Yellow

if (-not (Test-Path $AppPath)) {
    New-Item -ItemType Directory -Path $AppPath -Force | Out-Null
    Write-Host "  Created directory: $AppPath" -ForegroundColor Green
} else {
    Write-Host "  Directory already exists: $AppPath" -ForegroundColor Green
}

# Copy application files (assumes script is run from flask_app directory)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$flaskAppDir = Join-Path $AppPath "flask_app"

if (-not (Test-Path $flaskAppDir)) {
    New-Item -ItemType Directory -Path $flaskAppDir -Force | Out-Null
}

Write-Host "  Copying application files..." -ForegroundColor Gray
Copy-Item -Path "$scriptDir\*" -Destination $flaskAppDir -Recurse -Force -Exclude "install-iis.ps1"
Write-Host "  Application files copied" -ForegroundColor Green

# Step 4: Create virtual environment
Write-Host "[4/8] Creating Python virtual environment..." -ForegroundColor Yellow

$venvPath = Join-Path $AppPath "venv"
$pythonExe = Join-Path $venvPath "Scripts\python.exe"
$pipExe = Join-Path $venvPath "Scripts\pip.exe"

if (-not (Test-Path $venvPath)) {
    & python -m venv $venvPath
    Write-Host "  Virtual environment created at $venvPath" -ForegroundColor Green
} else {
    Write-Host "  Virtual environment already exists" -ForegroundColor Green
}

# Step 5: Install Python packages
Write-Host "[5/8] Installing Python packages..." -ForegroundColor Yellow

$requirementsPath = Join-Path $flaskAppDir "requirements.txt"
& $pipExe install --upgrade pip | Out-Null
& $pipExe install -r $requirementsPath
& $pipExe install wfastcgi
Write-Host "  All packages installed" -ForegroundColor Green

# Step 6: Configure wfastcgi
Write-Host "[6/8] Configuring wfastcgi for IIS..." -ForegroundColor Yellow

$wfastcgiPath = Join-Path $venvPath "Lib\site-packages\wfastcgi.py"

# Register FastCGI application
$configPath = "$env:windir\System32\inetsrv\config\applicationHost.config"
$fastCgiSection = @"
            <application fullPath="$pythonExe" arguments="$wfastcgiPath" />
"@

try {
    & $pythonExe -m wfastcgi enable 2>&1 | Out-Null
    Write-Host "  wfastcgi enabled" -ForegroundColor Green
} catch {
    Write-Host "  wfastcgi configuration (manual setup may be needed)" -ForegroundColor Yellow
}

# Step 7: Create web.config
Write-Host "[7/8] Creating web.config..." -ForegroundColor Yellow

$secretKey = [System.Guid]::NewGuid().ToString()

$webConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <appSettings>
    <add key="WSGI_HANDLER" value="wsgi.app" />
    <add key="PYTHONPATH" value="$flaskAppDir" />
    <add key="SECRET_KEY" value="$secretKey" />
    <add key="RESEND_API_KEY" value="$ResendApiKey" />
    <add key="TWILIO_ACCOUNT_SID" value="$TwilioAccountSid" />
    <add key="TWILIO_AUTH_TOKEN" value="$TwilioAuthToken" />
    <add key="TWILIO_PHONE_NUMBER" value="$TwilioPhoneNumber" />
  </appSettings>
  <system.webServer>
    <handlers>
      <add name="Python FastCGI"
           path="*"
           verb="*"
           modules="FastCgiModule"
           scriptProcessor="$pythonExe|$wfastcgiPath"
           resourceType="Unspecified"
           requireAccess="Script" />
    </handlers>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
"@

$webConfigPath = Join-Path $flaskAppDir "web.config"
$webConfig | Out-File -FilePath $webConfigPath -Encoding UTF8
Write-Host "  web.config created" -ForegroundColor Green

# Step 8: Create IIS Website
Write-Host "[8/8] Creating IIS website..." -ForegroundColor Yellow

Import-Module WebAdministration -ErrorAction SilentlyContinue

# Create Application Pool
$appPoolName = "${SiteName}Pool"
if (-not (Test-Path "IIS:\AppPools\$appPoolName")) {
    New-WebAppPool -Name $appPoolName | Out-Null
    Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name managedRuntimeVersion -Value ""
    Write-Host "  Created application pool: $appPoolName" -ForegroundColor Green
} else {
    Write-Host "  Application pool already exists: $appPoolName" -ForegroundColor Green
}

# Remove existing site if present
if (Test-Path "IIS:\Sites\$SiteName") {
    Remove-Website -Name $SiteName
    Write-Host "  Removed existing site: $SiteName" -ForegroundColor Yellow
}

# Create Website
New-Website -Name $SiteName -PhysicalPath $flaskAppDir -ApplicationPool $appPoolName -Port $Port -Force | Out-Null
Write-Host "  Created website: $SiteName on port $Port" -ForegroundColor Green

# Set permissions
$acl = Get-Acl $AppPath
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule)
Set-Acl $AppPath $acl
Write-Host "  Set folder permissions" -ForegroundColor Green

# Restart IIS
Write-Host ""
Write-Host "Restarting IIS..." -ForegroundColor Yellow
iisreset /restart | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your photo booth is now available at: http://localhost:$Port" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test the API health endpoint:" -ForegroundColor White
Write-Host "  http://localhost:$Port/api/health" -ForegroundColor Gray
Write-Host ""

if ([string]::IsNullOrEmpty($ResendApiKey)) {
    Write-Host "NOTE: Email not configured. Edit web.config to add RESEND_API_KEY" -ForegroundColor Yellow
}
if ([string]::IsNullOrEmpty($TwilioAccountSid)) {
    Write-Host "NOTE: SMS not configured. Edit web.config to add Twilio credentials" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "web.config location: $webConfigPath" -ForegroundColor Gray
Write-Host ""
