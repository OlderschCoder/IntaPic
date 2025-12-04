# Flashbulb Photo Booth - Design Document

## 1. Project Overview
**Flashbulb Photo Booth** is a nostalgic, digital recreation of a vintage photo booth experience. It transforms a standard web interface into an immersive "Digital Darkroom," focusing on spontaneity, tactile interactions, and retro aesthetics.

## 2. Design Philosophy
The core design principle is **"Atmosphere over Utility."** unlike standard photo apps that prioritize clean, frictionless UI, Flashbulb prioritizes *feeling*.
*   **Aesthetic:** "Digital Darkroom" / Noir / Vintage Theater.
*   **Vibe:** Mysterious, warm, mechanical, spontaneous.
*   **Interaction:** Tactile buttons, simulated mechanical delays (developing time), and physical metaphors (curtains, card slots).

## 3. Visual System

### Typography
We use a pairing that evokes mechanical precision and bold signage:
*   **Headings (Display):** `Oswald` - Bold, condensed, uppercase. Reminiscent of theater marquees and warning signs.
*   **Body/Data (Monospace):** `Courier Prime` - Typewriter style. Used for receipts, timestamps, and machine status text.

### Color Palette
A high-contrast dark mode palette designed to feel like a dimly lit room or the inside of a machine.
*   **Background:** Deep Black / Zinc-950 (`#09090b`).
*   **Primary:** Velvet Red (`hsl(350 70% 40%)`) - Used for the "Start" button and curtains.
*   **Accent:** Amber Light (`hsl(45 100% 50%)`) - Used for "Ready" lights, flash indicators, and active states.
*   **Text:** Warm Off-White / Silver - Readable but not harsh.

### Textures & Effects
*   **Red Velvet Curtain:** A generated background texture adds depth and richness.
*   **Glows:** CSS text-shadows and box-shadows simulate neon and incandescent bulbs.
*   **Filters:**
    *   **B&W:** High contrast grayscale (`grayscale(100%) contrast(120%) brightness(110%)`).
    *   **Color:** Vintage warm (`contrast(110%) brightness(105%) saturate(120%) sepia(20%)`).

## 4. User Flow

1.  **Attract Screen (Home):**
    *   Inviting "Start" button.
    *   Pulsing "Insert Coin" style prompts.
    *   Establishes the mood.

2.  **Payment & Options:**
    *   **Input:** User enters email (for digital delivery).
    *   **Selection:** User chooses film type (Black & White vs. Color).
    *   **Action:** Simulated "Card Swipe" gesture to trigger the session.

3.  **The Booth (Capture):**
    *   **Live Feed:** Mirrored video with a crosshair overlay.
    *   **Countdown:** Large 3-2-1 numbers.
    *   **Flash:** Full-screen white flash animation.
    *   **Sequence:** Takes 4 photos automatically.

4.  **Development (Result):**
    *   **Wait State:** "Developing Film..." spinner builds anticipation.
    *   **Reveal:** The photo strip slides up from the bottom (simulating a dispensing slot).
    *   **Output:** A vertically stacked strip of 4 photos with timestamp and ID.
    *   **Actions:** Save or Retake.

## 5. Technical Implementation (Frontend)

### Stack
*   **Framework:** React (w/ Vite).
*   **Styling:** Tailwind CSS v4 (using `@theme inline` for tokens).
*   **Animation:** Framer Motion (for complex sequences like the card swipe and strip reveal).
*   **Routing:** `wouter` (lightweight client-side routing).

### Key Components
*   `BoothShell`: The wrapper component that provides the "Machine" frame, red velvet background, and consistent lighting effects.
*   `Booth` (Page): Handles `navigator.mediaDevices.getUserMedia` for camera access. Includes fallback simulation mode for environments without cameras.
*   `Payment` (Page): Manages state for email and photo type preference.
*   `Result` (Page): Generates the final layout using the captured base64 image data stored in `localStorage`.

### Data Persistence
*   **Session Data:** Photos and user choices are stored in `localStorage` ("booth_photos", "photo_type") to persist across page loads without a backend database.
*   **Mocking:** Payment processing and email delivery are simulated with UI states (`isSwiping`, `isPrinting`).
