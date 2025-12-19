# Billy's Photo Booth

## Project Overview
A vintage-style photo booth application for Billy's Ayr Lanes bowling alley. Runs on a Samsung Galaxy Tab S10 tablet mounted in a physical booth with curtain.

## Architecture
**Frontend-Only Application** - No backend server required
- React + Vite + Tailwind CSS v4
- Camera access via WebRTC
- Photo processing with Canvas API
- Payment via Tap to Pay on Android (NFC)
- Email delivery via device's native email client

## Key Features
1. **Photo Capture:** 4 spontaneous poses with countdown
2. **Film Styles:** Black & White or Color (vintage filter)
3. **Payment:** NFC tap-to-pay (Stripe/Square integration for production)
4. **Delivery:** Email + local download as single JPG strip
5. **Admin Panel:** Hidden settings (tap logo to access)

## Device Setup
- **Hardware:** Samsung Galaxy Tab S10
- **Email Account:** bojeunm@gmail.com (configured on device)
- **Camera:** External USB webcam
- **Mode:** Kiosk mode (auto-launch on boot)

## Recent Changes
- Updated to Tap to Pay on Android instead of card swipe
- Set default sender email to bojeunm@gmail.com
- Admin settings now persist in localStorage
- USB save button controlled by admin toggle

## Future Integration Notes
**Email Integration Dismissed:** User declined Resend/SendGrid backend integration. Current implementation uses device's native email client which is ideal for kiosk deployment - simpler, more reliable, works offline, no API keys to manage.

If backend email integration is needed in future, consider:
- Resend connector (for transactional emails)
- SendGrid connector (alternative)
- Store API keys as secrets using request_env_var tool

## User Preferences
- Prefers frontend-only solutions when possible
- Prioritizes simplicity and reliability for kiosk deployment
- Uses bojeunm@gmail.com for booth operations
