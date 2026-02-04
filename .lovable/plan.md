

## Pizza Quality Analyzer - Native Android App

A speed-optimized mobile app for store staff to capture pizza photos for quality training.

### Core Flow

**1. Login Screen**
- Clean, simple login interface with SSO placeholder
- Mock authentication for now (you can integrate real SSO later)
- After login, user is assigned to a store (mocked for now)

**2. Camera Screen (Main Experience)**
- Camera launches automatically after login - no extra taps
- Store ID badge displayed in corner for context
- Large, prominent capture button at bottom
- Minimal UI to maximize speed

**3. Photo Preview & Submit**
- Full-screen preview of captured photo
- Two clear buttons: "Retake" or "Submit"
- On submit → instant return to live camera (no confirmation delay)
- Background upload while user continues working

**4. Offline Queue System**
- Photos saved locally when offline
- Automatic sync when connection returns
- Small indicator showing pending uploads
- Queue persists even if app closes

### Design Approach
- Dark theme to reduce eye strain in kitchen environments
- Large touch targets for speed
- Minimal text, icon-driven interface
- High contrast for visibility in various lighting

### Technical Setup
- Capacitor for native Android packaging
- Full camera access via Capacitor Camera plugin
- Local storage for offline queue
- Mock API endpoints (ready for your real backend integration)

