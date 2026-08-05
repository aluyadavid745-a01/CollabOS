# CollabOS Web App

CollabOS is a React/Vite web app for collaboration profiles and website creation. It includes a marketing homepage, Firebase-backed authentication, editable user profiles, and a website builder with AI-assisted drafts, visual editing, code editing, preview, publish, and export flows.

## Core Features

- Landing page with feature, pricing, testimonial, and CTA sections
- Email/password and Google authentication through Firebase
- Email verification action handling at `/auth/action`
- User profile editing with Firebase Storage uploads and local fallback
- Website dashboard for creating, duplicating, publishing, deleting, and exporting sites
- AI website builder with instant local drafts and optional Firebase AI refinement
- Drag-and-drop visual editor with pages, assets, element properties, undo/redo, autosave, and responsive breakpoints
- Code website builder for custom HTML, CSS, and JavaScript
- Website preview route for built projects
- Cookie consent-aware local persistence

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Firebase Auth, Firestore, Storage, and optional Firebase AI
- GSAP and Framer Motion
- Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run static preview:

```bash
npm run preview
```

Run checks:

```bash
npm run type-check
npm run lint
npm test
```

## Environment

Create `.env.local` for Firebase-backed features:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_AI_MODEL=gemini-3.5-flash
```

When Firebase is not configured or unavailable, profile and website data fall back to local browser storage so the app remains usable during local development.

## Firebase Rules

Firestore and Storage rules are included:

- `firestore.rules` restricts user profiles and websites to the authenticated owner.
- `storage.rules` restricts profile, cover, and project assets to the authenticated owner.

Deploy them with your Firebase project tooling after selecting the correct project.

## Project Structure

```text
src/
  components/         Reusable UI and website-builder components
  context/            Auth and website-builder state providers
  data/               Website templates and local AI generation helpers
  firebase/           Lazy Firebase configuration helpers
  hooks/              Shared React hooks
  pages/              Route-level screens
  services/           Firebase AI integration
  types/              Shared TypeScript types
  utils/              Cookies, storage, prefetching, toasts, helpers
tests/
  smoke-tests.mjs     Package-free source smoke tests
```

## Notes

- Firebase modules are lazy-loaded to keep the first page load lighter.
- Website saves now report whether they landed in Firebase or local storage.
- Firebase AI failures are surfaced in the AI builder instead of silently falling back.
