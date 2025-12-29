# IIS Deployment Guide for Billy's Photo Booth

## Quick Install (PowerShell Script)

1. Copy the entire `flask_app` folder to your Windows Server

2. Open PowerShell as Administrator

3. Navigate to the flask_app folder:
   ```powershell
   cd C:\path\to\flask_app
   ```

4. Run the installer with your API keys:
   ```powershell
   .\install-iis.ps1 -ResendApiKey "re_xxxxx" -TwilioAccountSid "ACxxxxx" -TwilioAuthToken "your-token" -TwilioPhoneNumber "+15551234567"
   ```

   Or run without keys (configure later):
   ```powershell
   .\install-iis.ps1
   ```

## What the Script Does

1. **Installs Python 3.11** - Downloads and installs if not present
2. **Enables IIS CGI** - Required for running Python on IIS
3. **Creates app directory** - `C:\inetpub\wwwroot\billysbooth`
4. **Sets up virtual environment** - Isolated Python packages
5. **Installs dependencies** - Flask, Resend, Twilio, wfastcgi
6. **Configures FastCGI** - Connects Python to IIS
7. **Creates web.config** - IIS configuration with your API keys
8. **Creates IIS website** - Ready to serve on port 80

## Configuration Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| `-AppPath` | `C:\inetpub\wwwroot\billysbooth` | Installation directory |
| `-SiteName` | `BillysPhotoBooth` | IIS website name |
| `-Port` | `80` | HTTP port |
| `-ResendApiKey` | (empty) | Your Resend API key |
| `-TwilioAccountSid` | (empty) | Twilio Account SID (starts with AC) |
| `-TwilioAuthToken` | (empty) | Twilio Auth Token |
| `-TwilioPhoneNumber` | (empty) | Your Twilio phone number |

## After Installation

### Test the Application

1. Open a browser and go to: `http://localhost/api/health`
2. You should see: `{"status": "healthy", "email_configured": true, "sms_configured": true}`
3. Visit `http://localhost` to see the photo booth

### Update API Keys Later

Edit the web.config file at:
```
C:\inetpub\wwwroot\billysbooth\flask_app\web.config
```

Update these values:
```xml
<add key="RESEND_API_KEY" value="your-key-here" />
<add key="TWILIO_ACCOUNT_SID" value="ACxxxxx" />
<add key="TWILIO_AUTH_TOKEN" value="your-token" />
<add key="TWILIO_PHONE_NUMBER" value="+15551234567" />
```

Then restart IIS:
```powershell
iisreset /restart
```

## Troubleshooting

### "500 Internal Server Error"
- Check Windows Event Viewer for Python errors
- Verify web.config has correct paths
- Run `iisreset /restart`

### "Handler not found"
- Ensure CGI is enabled in IIS
- Re-run: `python -m wfastcgi enable`

### "Module not found"
- Activate venv and reinstall packages:
  ```powershell
  C:\inetpub\wwwroot\billysbooth\venv\Scripts\activate
  pip install -r requirements.txt
  ```

## Manual Installation

If the script doesn't work, see the step-by-step guide in the main README.md
