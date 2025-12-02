# Deployment Instructions

## 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named `matri-ai` (or similar).
3. **Authentication:**
   - Enable "Email/Password" provider.
   - (Optional) Enable "Google" provider.
4. **Firestore Database:**
   - Create database in "Production mode".
   - Go to "Rules" tab and copy the content of `firestore.rules` from this project.
5. **Storage:**
   - Enable Storage.
   - Configure rules (default or custom).
6. **Project Settings:**
   - Create a Web App.
   - Copy the `firebaseConfig` object values.
   - Add them to your `.env.local` (for local dev) and Vercel Environment Variables (for production).

## 2. GitHub Setup

1. Create a new repository on GitHub named `matri_ai`.
2. Initialize the repository locally (if not done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M master
   git remote add origin https://github.com/YOUR_USERNAME/matri_ai.git
   git push -u origin master
   ```
   *Note: Ensure you are in the `matri_ai` root directory.*

## 3. Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click "Add New..." -> "Project".
3. Import the `matri_ai` repository from GitHub.
4. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `.` (default)
   - **Environment Variables:** Add the Firebase config variables:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Click **Deploy**.

## 4. Updates

When you push changes to the `master` branch on GitHub, Vercel will automatically redeploy the application.


