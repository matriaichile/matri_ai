# MatriMatch MVP

Platform for connecting wedding planners/couples with service providers using intelligent matchmaking.

## Technology Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules
- **State Management:** Zustand
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable components (landing, ui, etc).
- `src/lib/firebase`: Firebase configuration and helpers.
- `src/store`: Zustand stores.
- `src/hooks`: Custom React hooks.
- `src/utils`: Utility functions.
- `firestore.rules`: Security rules for Firestore.

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Run Development Server:**
   ```bash
   pnpm dev
   ```

## Deployment

See `DEPLOY.md` for detailed deployment instructions.
