import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigValid = !!firebaseConfig.apiKey && 
                       firebaseConfig.apiKey !== "" && 
                       firebaseConfig.apiKey !== "your_api_key_here";

const app = getApps().length === 0 && isConfigValid 
  ? initializeApp(firebaseConfig) 
  : getApps().length > 0 ? getApps()[0] : null;

if (!isConfigValid && typeof window !== 'undefined') {
  console.warn("RescuePaws: Firebase API Key is missing or invalid. Authentication features will be disabled. Check your .env.local file.");
}

// Fallback for build time / server side when app might not be initialized
export const auth = (app ? getAuth(app) : null) as any;
export const db = (app ? getFirestore(app) : null) as any;
export default app;
