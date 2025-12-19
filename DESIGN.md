# Flashbulb Photo Booth - Design Document for Billy's Bowling Alley

## 1. Project Overview
**Flashbulb Photo Booth** is a custom digital photography experience designed specifically for **Billy's Bowling Alley**. It bridges the gap between the nostalgia of vintage chemical photo booths and modern digital convenience.

**Deployment Context:**
*   **Location:** Installed in a custom-built physical booth near the bar at Billy's.
*   **Hardware:** Samsung Galaxy Tab S10 (mounted below camera).
*   **Connectivity:** Wi-Fi enabled for email delivery.
*   **Physical Build:** Old-fashioned wooden cabinetry with a privacy curtain.
*   **Payment:** Tap to Pay on Android (NFC contactless payments).

## 2. Design Philosophy
The design aims to complement the bowling alley's retro-social atmosphere. It must be:
*   **Durable & Simple:** The UI must be "bar-proof"—large touch targets, high contrast, and idiot-proof workflows for users who may be holding a drink.
*   **Authentic:** The software interface mimics the physical "Photo-Matic" machines of the mid-20th century to match the physical cabinet design.
*   **Social:** The output is designed to be shared (via email) but feels like a physical artifact.
*   **Offline-Capable:** Core functionality works without internet connection.

## 3. Visual System

### Branding
*   **Identity:** "Billy's Photo-Matic"
*   **Aesthetic:** Digital Darkroom / Retro Bowling Alley.
*   **Palette:**
    *   **Background:** Deep Zinc/Black (to reduce screen glare in the dim booth).
    *   **Primary:** Velvet Red (Matches the physical curtain).
    *   **Accent:** Neon Amber (Simulating "Ready" lights and lane indicators).

### Typography
*   **Headings:** `Oswald` - Bold, condensed. Readable from a distance (standing outside the booth).
*   **Details:** `Courier Prime` - Monospace. Used for "receipt" details and technical readouts.

## 4. User Flow & Physical Interaction

1.  **Attract Mode (Screen Saver):**
    *   Displays "Billy's Photo Booth" with pulsing "Touch to Start" text.
    *   Designed to draw attention from the bar area.

2.  **Payment:**
    *   **Screen Prompt:** "Tap Card or Phone Here."
    *   **Physical Action:** User taps NFC-enabled card or phone directly on the tablet.
    *   **Input:** User types email address on the tablet's on-screen keyboard.
    *   **Selection:** Large toggle for "B&W" (Classic) or "Color" (Modern) film.

3.  **The Shoot:**
    *   **Positioning:** Live video feed shows users what the external camera sees.
    *   **Guidance:** Clear countdown indicators.
    *   **Countdown:** Giant 3-2-1 numbers visible even with friends crowding in.
    *   **Capture:** 4 photos taken with a simulated "Flash" (screen goes white to light up faces).

4.  **Delivery:**
    *   **Processing:** "Developing Film" animation.
    *   **Result:** The digital strip slides up.
    *   **Email:** Opens device's default email client to send from bojeunm@gmail.com.
    *   **Save:** Downloads photo strip as single JPG to device.
    *   **Reset:** Auto-resets after timeout for the next group.

## 5. Technical Architecture

### Frontend-Only Application
This application runs entirely in the browser with no backend server required:

*   **Framework:** React + Vite
*   **Styling:** Tailwind CSS v4
*   **Animation:** Framer Motion
*   **Routing:** Wouter (client-side)
*   **State Management:** React useState + localStorage
*   **Camera Access:** WebRTC `getUserMedia` API
*   **Image Processing:** HTML5 Canvas API
*   **Payment:** Tap to Pay on Android (NFC via device OS)

### Data Persistence
*   **Settings:** Stored in browser localStorage (`booth_settings`)
*   **Session Data:** Temporary localStorage for current session photos
*   **Email Delivery:** Delegates to device's native email client
*   **Photo Storage:** Downloads directly to device's file system

### Key Technical Features
1.  **Camera Integration:** Uses external USB camera via WebRTC
2.  **Canvas Rendering:** Generates photo strips by compositing multiple images
3.  **NFC Payment:** Simulated for prototype; production would integrate with Stripe/Square SDK
4.  **Offline Mode:** All core features work without internet (except email sending)

### Production Deployment Notes
*   **Kiosk Mode:** Android tablet locked to single-app mode
*   **Auto-Start:** App launches on device boot
*   **Payment Integration:** Stripe Tap to Pay SDK or Square Terminal API for production
*   **Email Configuration:** Gmail account (bojeunm@gmail.com) configured on device
*   **Camera Permissions:** WebRTC permissions granted at OS level
*   **File System:** Downloads folder accessible for USB transfer if enabled in admin settings

## 6. Admin Panel
Hidden admin panel accessible via logo tap:
*   **Pricing:** Configure cost per strip
*   **Email Settings:** Set sender address
*   **Features:** Toggle USB saving, auto-print, kiosk mode
*   **Persistence:** All settings saved to localStorage
