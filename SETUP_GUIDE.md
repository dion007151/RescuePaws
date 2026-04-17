# Firebase Setup Guide for RescuePaws

Follow these steps to set up Firebase for your RescuePaws application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `rescuepaws` (or your preferred name)
4. Disable Google Analytics (optional for this MVP)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, click **Authentication** in the left sidebar
2. Click **Get started**
3. Click on **Email/Password** in the Sign-in method tab
4. Toggle **Email/Password** to **Enabled**
5. Click **Save**

## Step 3: Create Firestore Database

1. Click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Select **Start in test mode** (we'll secure it later)
4. Choose your region (pick closest to your users)
5. Click **Enable**

## Step 4: Enable Storage

1. Click **Storage** in the left sidebar
2. Click **Get started**
3. Select **Start in test mode**
4. Click **Next**
5. Choose your region
6. Click **Done**

## Step 5: Get Firebase Config

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Select **Project settings**
3. Scroll down to "Your apps" section
4. Click the **</>** (Web) icon
5. Enter app nickname: `rescuepaws-web`
6. Click **Register app**
7. Copy the firebaseConfig object values

## Step 6: Configure Environment Variables

1. In your project root, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase config values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rescuepaws-xxxxx.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=rescuepaws-xxxxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rescuepaws-xxxxx.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
   ```

## Step 7: Secure Your Database (Production)

### Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      // Anyone authenticated can read
      allow read: if request.auth != null;
      
      // Anyone authenticated can create
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Anyone authenticated can update (for marking as rescued)
      allow update: if request.auth != null;
      
      // Only the creator can delete their reports
      allow delete: if request.auth != null 
                    && resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **Publish**

### Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths=**} {
      // Anyone authenticated can read
      allow read: if request.auth != null;
      
      // Anyone authenticated can write with restrictions
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024  // Max 5MB
                   && request.resource.contentType.matches('image/.*');  // Images only
    }
  }
}
```

3. Click **Publish**

## Step 8: Test Your Setup

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Try to register a new account

4. Try to submit a report with an image

5. Check Firebase Console to see the data:
   - **Authentication** → Users tab (you should see your user)
   - **Firestore Database** → Data tab (you should see your reports)
   - **Storage** → Files tab (you should see uploaded images)

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Make sure there are no extra spaces in `.env.local`

### "Missing or insufficient permissions"
- You forgot to enable test mode or set up security rules
- Go back to Step 3 or Step 7

### "Network request failed"
- Check your internet connection
- Verify Firebase project is active in Firebase Console

### Images not uploading
- Check Storage is enabled (Step 4)
- Verify storage rules are published (Step 7)
- Make sure image is under 5MB

## Next Steps

✅ Your Firebase is now fully configured!

You can:
- Deploy to Vercel (remember to add environment variables)
- Customize the security rules for your use case
- Add indexes for complex queries (Firestore will prompt you)
- Monitor usage in Firebase Console

## Production Checklist

Before going live:

- [ ] Switch from test mode to production rules
- [ ] Set up Firebase App Check for abuse prevention
- [ ] Enable Firebase Analytics (optional)
- [ ] Configure custom domain in Firebase Hosting
- [ ] Set up budget alerts in Firebase Console
- [ ] Review and test security rules thoroughly
- [ ] Enable reCAPTCHA for authentication (recommended)

---

Need help? Check the main README.md or open an issue!
