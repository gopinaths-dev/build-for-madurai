# Green Madurai - Eco-Learning PWA MVP

## 1. Project Overview
**Vision:** To create an environmentally conscious generation in Madurai by gamifying waste management for children.
**Target Audience:** Children aged 5–10 years in Madurai, Tamil Nadu.
**Problem Statement:** Waste segregation is often seen as a chore. Children lack engagement in environmental activities.
**Solution:** A playful, mobile-first PWA that rewards children for correct waste segregation with points, badges, and real-world class rewards.

## 2. Technical Architecture
### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (Mobile-first, playful UI)
- **Animations:** Framer Motion (Transitions & Badge Unlocks)
- **PWA:** Service Workers & Web Manifest for offline capability and "Install to Home Screen" prompt.
- **State Management:** React Hooks + LocalStorage for session persistence.

### Backend
- **Server:** Node.js + Express
- **API Structure:**
  - `POST /api/score`: Mock AI analysis of uploaded waste images.
  - `GET /api/leaderboard`: Retrieves student rankings and class progress.
- **Data Flow:** Client uploads image -> Server analyzes (mock) -> Server returns score/category -> Client updates local state and shows animations.

## 3. Design Guidelines
- **Colors:** 
  - Primary: Emerald Green (#10b981) - Nature/Eco
  - Secondary: Sky Blue (#0ea5e9) - Freshness
  - Accent: Amber/Gold (#f59e0b) - Temple/Royalty
- **Tone:** Friendly "Hinglish" (Tamil-English mix) to resonate with Madurai kids. Example: "Super da! 🌟"
- **Accessibility:** Large touch targets (min 44px), high contrast, emoji-heavy for pre-readers.
- **Gamification:** 
  - Immediate feedback (Points + Confetti)
  - Social proof (Leaderboard)
  - Collective goals (Class Reward Threshold)

## 4. AI Logic (Future Integration Plan)
- **Phase 1 (Current):** Filename-based mock logic.
- **Phase 2:** Gemini Pro Vision API integration to classify images into Biodegradable, Plastic, Paper, or Metal.
- **Phase 3:** Edge-based TensorFlow.js models for real-time offline classification.

## 5. Milestone Breakdown
- **Milestone 1 (Hackathon):** Mock PWA with camera upload, scoring logic, and leaderboard.
- **Milestone 2:** Real AI integration + MongoDB for persistent global leaderboards.
- **Milestone 3:** Teacher/School dashboard for managing rewards and tree-planting events.
