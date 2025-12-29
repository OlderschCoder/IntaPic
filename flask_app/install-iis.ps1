#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Installs Billy's Photo Booth Flask application as an IIS sub-application
.DESCRIPTION
    This script will:
    - Install Python 3.11 if not present
    - Enable IIS CGI feature
    - Create the application directory structure
    - Set up a Python virtual environment
    - Install all required Python packages
    - Configure wfastcgi for IIS
    - Create the IIS application under Default Web Site at /FilmStrip
    - Generate the web.config file
.NOTES
    Run this script as Administrator on your Windows Server with IIS installed
.EXAMPLE
    .\install-iis.ps1 -AppName "FilmStrip"
    Installs at http://localhost/FilmStrip
.EXAMPLE
    .\install-iis.ps1 -AppName "PhotoBooth" -ParentSite "MyWebsite"
    Installs at http://localhost/PhotoBooth under MyWebsite
#>

param(
    [string]$AppPath = "C:\inetpub\wwwroot\billysbooth",
    [string]$AppName = "FilmStrip",
    [string]$ParentSite = "Default Web Site",
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
Write-Host "Installing as: /$AppName under $ParentSite" -ForegroundColor White
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

# Step 1: Check/Install Python
Write-Host "[1/9] Checking Python installation..." -ForegroundColor Yellow

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
Write-Host "[2/9] Enabling IIS CGI feature..." -ForegroundColor Yellow

$cgiFeature = Get-WindowsOptionalFeature -Online -FeatureName IIS-CGI -ErrorAction SilentlyContinue
if ($cgiFeature.State -ne "Enabled") {
    Enable-WindowsOptionalFeature -Online -FeatureName IIS-CGI -NoRestart | Out-Null
    Write-Host "  IIS CGI feature enabled" -ForegroundColor Green
} else {
    Write-Host "  IIS CGI feature already enabled" -ForegroundColor Green
}

# Step 3: Create application directory
Write-Host "[3/9] Creating application directory..." -ForegroundColor Yellow

if (-not (Test-Path $AppPath)) {
    New-Item -ItemType Directory -Path $AppPath -Force | Out-Null
    Write-Host "  Created directory: $AppPath" -ForegroundColor Green
} else {
    Write-Host "  Directory already exists: $AppPath" -ForegroundColor Green
}

# Copy application files
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$flaskAppDir = Join-Path $AppPath "flask_app"

if (-not (Test-Path $flaskAppDir)) {
    New-Item -ItemType Directory -Path $flaskAppDir -Force | Out-Null
}

Write-Host "  Copying application files..." -ForegroundColor Gray
Copy-Item -Path "$scriptDir\*" -Destination $flaskAppDir -Recurse -Force -Exclude "install-iis.ps1"
Write-Host "  Application files copied" -ForegroundColor Green

# Step 4: Create virtual environment
Write-Host "[4/9] Creating Python virtual environment..." -ForegroundColor Yellow

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
Write-Host "[5/9] Installing Python packages..." -ForegroundColor Yellow

$requirementsPath = Join-Path $flaskAppDir "requirements.txt"
& $pipExe install --upgrade pip | Out-Null
& $pipExe install -r $requirementsPath
& $pipExe install wfastcgi
Write-Host "  All packages installed" -ForegroundColor Green

# Step 6: Configure wfastcgi
Write-Host "[6/9] Configuring wfastcgi for IIS..." -ForegroundColor Yellow

$wfastcgiPath = Join-Path $venvPath "Lib\site-packages\wfastcgi.py"

try {
    & $pythonExe -m wfastcgi enable 2>&1 | Out-Null
    Write-Host "  wfastcgi enabled" -ForegroundColor Green
} catch {
    Write-Host "  wfastcgi configuration (manual setup may be needed)" -ForegroundColor Yellow
}

# Step 7: Set system environment variables for secrets
Write-Host "[7/9] Configuring environment variables..." -ForegroundColor Yellow

if (-not [string]::IsNullOrEmpty($ResendApiKey)) {
    [System.Environment]::SetEnvironmentVariable("RESEND_API_KEY", $ResendApiKey, "Machine")
    Write-Host "  Set RESEND_API_KEY" -ForegroundColor Green
}
if (-not [string]::IsNullOrEmpty($TwilioAccountSid)) {
    [System.Environment]::SetEnvironmentVariable("TWILIO_ACCOUNT_SID", $TwilioAccountSid, "Machine")
    Write-Host "  Set TWILIO_ACCOUNT_SID" -ForegroundColor Green
}
if (-not [string]::IsNullOrEmpty($TwilioAuthToken)) {
    [System.Environment]::SetEnvironmentVariable("TWILIO_AUTH_TOKEN", $TwilioAuthToken, "Machine")
    Write-Host "  Set TWILIO_AUTH_TOKEN" -ForegroundColor Green
}
if (-not [string]::IsNullOrEmpty($TwilioPhoneNumber)) {
    [System.Environment]::SetEnvironmentVariable("TWILIO_PHONE_NUMBER", $TwilioPhoneNumber, "Machine")
    Write-Host "  Set TWILIO_PHONE_NUMBER" -ForegroundColor Green
}

$secretKey = [System.Guid]::NewGuid().ToString()
[System.Environment]::SetEnvironmentVariable("FLASK_SECRET_KEY", $secretKey, "Machine")

# Step 8: Create web.config for sub-application
Write-Host "[8/9] Creating web.config..." -ForegroundColor Yellow

$webConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <appSettings>
    <add key="WSGI_HANDLER" value="wsgi.app" />
    <add key="PYTHONPATH" value="$flaskAppDir" />
    <add key="SCRIPT_NAME" value="/$AppName" />
  </appSettings>
  <system.webServer>
    <handlers>
      <remove name="Python FastCGI" />
      <add name="Python FastCGI"
           path="*"
           verb="*"
           modules="FastCgiModule"
           scriptProcessor="$pythonExe|$wfastcgiPath"
           resourceType="Unspecified"
           requireAccess="Script" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="Static Files" stopProcessing="true">
          <match url="^static/(.*)$" />
          <action type="Rewrite" url="static/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
"@

$webConfigPath = Join-Path $flaskAppDir "web.config"
$webConfig | Out-File -FilePath $webConfigPath -Encoding UTF8
Write-Host "  web.config created" -ForegroundColor Green

# Step 9: Create IIS Application (sub-app under existing site)
Write-Host "[9/9] Creating IIS application..." -ForegroundColor Yellow

Import-Module WebAdministration -ErrorAction SilentlyContinue

# Create Application Pool
$appPoolName = "${AppName}Pool"
if (-not (Test-Path "IIS:\AppPools\$appPoolName")) {
    New-WebAppPool -Name $appPoolName | Out-Null
    Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name managedRuntimeVersion -Value ""
    Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name processModel.loadUserProfile -Value $true
    Write-Host "  Created application pool: $appPoolName" -ForegroundColor Green
} else {
    Write-Host "  Application pool already exists: $appPoolName" -ForegroundColor Green
}

# Check if parent site exists
if (-not (Test-Path "IIS:\Sites\$ParentSite")) {
    Write-Host "  ERROR: Parent site '$ParentSite' does not exist!" -ForegroundColor Red
    Write-Host "  Available sites:" -ForegroundColor Yellow
    Get-Website | ForEach-Object { Write-Host "    - $($_.Name)" -ForegroundColor Gray }
    exit 1
}

# Remove existing application if present
$appPath = "IIS:\Sites\$ParentSite\$AppName"
if (Test-Path $appPath) {
    Remove-WebApplication -Site $ParentSite -Name $AppName
    Write-Host "  Removed existing application: /$AppName" -ForegroundColor Yellow
}

# Create Application under the parent site
New-WebApplication -Site $ParentSite -Name $AppName -PhysicalPath $flaskAppDir -ApplicationPool $appPoolName | Out-Null
Write-Host "  Created application: /$AppName under $ParentSite" -ForegroundColor Green

# Set permissions
$acl = Get-Acl $AppPath
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule)
Set-Acl $AppPath $acl

$rule2 = New-Object System.Security.AccessControl.FileSystemAccessRule("IUSR", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule2)
Set-Acl $AppPath $acl
Write-Host "  Set folder permissions" -ForegroundColor Green

# Restart Application Pool
Write-Host ""
Write-Host "Restarting application pool..." -ForegroundColor Yellow
Restart-WebAppPool -Name $appPoolName

# Get parent site binding for URL
$siteBindings = Get-WebBinding -Name $ParentSite
$binding = $siteBindings | Select-Object -First 1
$port = if ($binding.bindingInformation -match ':(\d+):') { $Matches[1] } else { "80" }
$baseUrl = "http://localhost"
if ($port -ne "80") { $baseUrl = "http://localhost:$port" }

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your photo booth is now available at:" -ForegroundColor Cyan
Write-Host "  $baseUrl/$AppName" -ForegroundColor White
Write-Host ""
Write-Host "Test the API health endpoint:" -ForegroundColor White
Write-Host "  $baseUrl/$AppName/api/health" -ForegroundColor Gray
Write-Host ""

if ([string]::IsNullOrEmpty($ResendApiKey)) {
    Write-Host "NOTE: Email not configured." -ForegroundColor Yellow
    Write-Host "  Set system environment variable: RESEND_API_KEY" -ForegroundColor Gray
}
if ([string]::IsNullOrEmpty($TwilioAccountSid)) {
    Write-Host "NOTE: SMS not configured." -ForegroundColor Yellow
    Write-Host "  Set system environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Application files: $flaskAppDir" -ForegroundColor Gray
Write-Host "Virtual environment: $venvPath" -ForegroundColor Gray
Write-Host ""
