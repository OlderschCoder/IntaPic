# Billy's Photo Booth - Flask Version

A Python Flask version of Billy's Photo Booth application.

## Features

- Photo booth workflow with camera capture
- Email delivery via Resend
- SMS/MMS delivery via Twilio
- QR code and NFC payment options
- Admin settings panel

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
python run.py
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Flask secret key for sessions |
| `RESEND_API_KEY` | Your Resend API key for email delivery |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID (must start with 'AC') |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |

## Deployment

### Using Gunicorn

```bash
gunicorn --bind 0.0.0.0:5000 wsgi:app
```

### Using Replit

The app is configured to run on Replit with automatic deployment support.

## Building Frontend

If you need to rebuild the React frontend:

```bash
cd ..
npm run build
cp -r dist/public/* flask_app/static/
```

## API Endpoints

- `POST /api/send-photos` - Send photo strip via email
- `POST /api/send-sms` - Send photo strip via SMS/MMS
- `GET /api/health` - Health check endpoint
