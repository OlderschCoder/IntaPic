# Flashbulb Photo Booth - Design Document for Billy's Bowling Alley

## 1. Project Overview
**Flashbulb Photo Booth** is a custom digital photography experience designed specifically for **Billy's Bowling Alley**. It bridges the gap between the nostalgia of vintage chemical photo booths and modern digital convenience.

**Deployment Context:**
*   **Location:** Installed in a custom-built physical booth near the bar at Billy's.
*   **Hardware:** Android Tablet (mounted below camera) + External USB Camera.
*   **Connectivity:** Wi-Fi/Internet enabled for instant email delivery.
*   **Physical Build:** Old-fashioned wooden cabinetry with a privacy curtain.

## 2. Design Philosophy
The design aims to complement the bowling alley's retro-social atmosphere. It must be:
*   **Durable & Simple:** The UI must be "bar-proof"—large touch targets, high contrast, and idiot-proof workflows for users who may be holding a drink.
*   **Authentic:** The software interface mimics the physical "Photo-Matic" machines of the mid-20th century to match the physical cabinet design.
*   **Social:** The output is designed to be shared (via email) but feels like a physical artifact.

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
    *   **Screen Prompt:** "Swipe Card on Reader Below."
    *   **Physical Action:** User swipes card on the attached hardware reader.
    *   **Input:** User types email address on the tablet's on-screen keyboard.
    *   **Selection:** Large toggle for "B&W" (Classic) or "Color" (Modern) film.

3.  **The Shoot:**
    *   **Positioning:** Live video feed shows users what the external camera sees.
    *   **Guidance:** "Look Up at Camera" arrow (since tablet is mounted below).
    *   **Countdown:** Giant 3-2-1 numbers visible even with friends crowding in.
    *   **Capture:** 4 photos taken with a simulated "Flash" (screen goes white to light up faces).

4.  **Delivery:**
    *   **Processing:** "Developing Film" animation.
    *   **Result:** The digital strip slides up.
    *   **Completion:** "Sent to [Email]" confirmation.
    *   **Reset:** Auto-resets after 30 seconds for the next group.

## 5. Technical Specifications

### Hardware Target
*   **Device:** Android Tablet (running Kiosk mode).
*   **Camera:** External USB Webcam (mounted at eye level).
*   **Input:** Capacitive Touchscreen + External Card Reader (Simulated in software for prototype).

### Frontend Architecture
*   **Framework:** React + Vite.
*   **Responsiveness:** Fixed layout optimized for tablet portrait/landscape mode (depending on mount).
*   **Performance:** Lightweight animations (CSS/Framer Motion) to ensure smooth 60fps on mid-range Android tablets.
*   **Storage:** LocalStorage for temporary session data; designed to be stateless to prevent data buildup on the device.

### Mockup vs. Production
*   *Current Mockup:* Simulates card swipe via touch gesture.
*   *Production Goal:* Integrate with Stripe Terminal or Square SDK for the physical reader events.
