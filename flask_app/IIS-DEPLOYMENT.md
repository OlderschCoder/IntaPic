# IIS Deployment Guide for Billy's Photo Booth

## Quick Install (PowerShell Script)

This installs the photo booth as a **sub-application** under your existing IIS site (e.g., `http://yourserver/FilmStrip`).

1. Copy the entire `flask_app` folder to your Windows Server

2. Open PowerShell as Administrator

3. Navigate to the flask_app folder:
   ```powershell
   cd C:\path\to\flask_app
   ```

4. Run the installer with your API keys:
   ```powershell
   .\install-iis.ps1 -AppName "FilmStrip" -ResendApiKey "re_xxxxx" -TwilioAccountSid "ACxxxxx" -TwilioAuthToken "your-token" -TwilioPhoneNumber "+15551234567"
   ```

   Or run without keys (configure later):
   ```powershell
   .\install-iis.ps1
   ```

   Custom app name and parent site:
   ```powershell
   .\install-iis.ps1 -AppName "PhotoBooth" -ParentSite "MyWebsite"
   ```

## What the Script Does

1. **Installs Python 3.11** - Downloads and installs if not present
2. **Enables IIS CGI** - Required for running Python on IIS
3. **Creates app directory** - `C:\inetpub\wwwroot\billysbooth`
4. **Sets up virtual environment** - Isolated Python packages
5. **Installs dependencies** - Flask, Resend, Twilio, wfastcgi
6. **Configures FastCGI** - Connects Python to IIS
7. **Sets environment variables** - API keys stored securely as system variables
8. **Creates web.config** - IIS configuration for sub-application
9. **Creates IIS application** - Under your existing site at /FilmStrip

## Configuration Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `-AppPath` | `C:\inetpub\wwwroot\billysbooth` | Installation directory |
| `-AppName` | `FilmStrip` | URL path (e.g., /FilmStrip) |
| `-ParentSite` | `Default Web Site` | Existing IIS site to add app under |
| `-ResendApiKey` | (empty) | Your Resend API key |
| `-TwilioAccountSid` | (empty) | Twilio Account SID (starts with AC) |
| `-TwilioAuthToken` | (empty) | Twilio Auth Token |
| `-TwilioPhoneNumber` | (empty) | Your Twilio phone number |

## After Installation

### Test the Application

1. Open a browser and go to: `http://localhost/FilmStrip/api/health`
2. You should see: `{"status": "healthy", "email_configured": true, "sms_configured": true}`
3. Visit `http://localhost/FilmStrip` to see the photo booth

### Update API Keys Later

Set system environment variables:
```powershell
[System.Environment]::SetEnvironmentVariable("RESEND_API_KEY", "your-key", "Machine")
[System.Environment]::SetEnvironmentVariable("TWILIO_ACCOUNT_SID", "ACxxxxx", "Machine")
[System.Environment]::SetEnvironmentVariable("TWILIO_AUTH_TOKEN", "your-token", "Machine")
[System.Environment]::SetEnvironmentVariable("TWILIO_PHONE_NUMBER", "+15551234567", "Machine")
```

Then restart the application pool:
```powershell
Restart-WebAppPool -Name "FilmStripPool"
```

## Troubleshooting

### "500 Internal Server Error"
- Check Windows Event Viewer for Python errors
- Verify web.config has correct paths
- Restart application pool: `Restart-WebAppPool -Name "FilmStripPool"`

### "Handler not found"
- Ensure CGI is enabled in IIS
- Re-run: `python -m wfastcgi enable`

### "Module not found"
- Activate venv and reinstall packages:
  ```powershell
  C:\inetpub\wwwroot\billysbooth\venv\Scripts\activate
  pip install -r requirements.txt
  ```

### "404 Not Found"
- Verify the application was created under the correct parent site
- Check IIS Manager to confirm the application exists

## Manual Installation

If the script doesn't work, see the step-by-step guide in the main README.md
