# HerbalTrace V2: The S-Tier Implementation Blueprint

## 🏗️ System Architecture

This architecture separates the frontend (UI) from the backend (API/Bot) to reflect enterprise-level system design.

### 1. The Backend (The Brain)
*   **Hosting:** Vercel Serverless Functions (`/api` directory)
*   **Input Layer:** Twilio WhatsApp Sandbox (Receives messages and images via Webhooks)
*   **Database:** Firebase Realtime Database (Stores batch details) & Firebase Storage (Stores images)
*   **Blockchain Engine:** `ethers.js` running securely on the server. Uses a platform-owned private key to pay gas and record transactions on Polygon Amoy.

### 2. The Frontend (The Dashboards)
*   **Framework:** Vite + React (SPA)
*   **Styling:** Tailwind CSS + Framer Motion (for premium, smooth animations)
*   **Components:** 
    *   **Consumer Scan Page (`/track/:id`):** A beautiful vertical timeline showing the immutable journey of the product.
    *   **Factory Portal:** For scanning incoming batches and recording lab tests.
    *   **Regulator Analytics:** Leaflet.js maps and Chart.js graphs for fraud detection.

---

## 🗺️ Step-by-Step Work Plan

### Phase 1: Foundation & Scaffolding (Day 1)
*   **Goal:** Set up the clean environment without touching the old codebase.
*   **Steps:**
    1.  Create a new directory `ayurvedic_v2` on the Desktop.
    2.  Run `npx create-vite@latest . --template react`.
    3.  Install core dependencies: `npm install tailwindcss ethers firebase framer-motion react-router-dom react-icons`.
    4.  Set up `.env.local` for Firebase and Polygon API keys.
    5.  Establish the folder structure (`/src/components`, `/src/pages`, `/api`).

### Phase 2: The Consumer Journey Page (Day 2)
*   **Goal:** Build the "Hero" feature. If you only have 30 seconds to show the project, you show this page.
*   **Steps:**
    1.  Create the `/track/:batchId` route.
    2.  Build the `<Timeline />` component using Framer Motion so each step (Farm ➔ Factory ➔ Lab) animates smoothly as you scroll.
    3.  Build the `<BlockchainProof />` component showing the verified Polygon hash.
    4.  *(Temporary: Mock the data initially just to perfect the UI).*

### Phase 3: The WhatsApp Bot & Serverless API (Day 3-4)
*   **Goal:** Build the backend logic that makes the project truly unique.
*   **Steps:**
    1.  Create a Vercel Serverless Function: `/api/whatsapp-webhook`.
    2.  Connect it to a free Twilio WhatsApp Sandbox account.
    3.  Write the conversational logic: 
        *   *If user says 'new', ask for herb.*
        *   *If user sends an image, save to Firebase Storage.*
    4.  **The Server Wallet:** In the API, initialize an ethers wallet using a private key environment variable. Have it automatically call the Polygon smart contract and save the `txHash` to Firebase.

### Phase 4: Factory & Regulator Web Dashboards (Day 5)
*   **Goal:** Port your excellent business logic from the old prototype into React.
*   **Steps:**
    1.  Build the Factory Dashboard. Integrate `html5-qrcode` as a React component.
    2.  Build the Regulator Dashboard. Port the existing `FraudDetectionEngine` math.
    3.  Add `Leaflet.js` to show the origin of the batches on a real map.

### Phase 5: Polish & CV Preparation (Day 6)
*   **Goal:** Make it ready for recruiters.
*   **Steps:**
    1.  Write a stunning `README.md` with system architecture diagrams (Mermaid.js) and screenshots.
    2.  Deploy the frontend to Vercel (free).
    3.  Record a 2-minute video demo (WhatsApp input ➔ Factory Web Verification ➔ Consumer QR Scan).

---

## ❓ Open Questions for Execution

1.  **Framework Familiarity:** Are you comfortable with me writing this in React and Tailwind CSS? This is the industry standard for SDE/Full Stack roles right now.
2.  **Twilio Account:** During Phase 3, you will need to spend 5 minutes creating a free Twilio account so we can get your WhatsApp bot testing number. Is that acceptable?
