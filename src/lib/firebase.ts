import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Attempt to load configuration safely
try {
  // In environments where firebase-applet-config.json exists:
  // @ts-ignore
  import('../../firebase-applet-config.json')
    .then((config) => {
      const fbConfig = config.default || config;
      if (!getApps().length && fbConfig.apiKey) {
        app = initializeApp(fbConfig);
        db = getFirestore(app, fbConfig.firestoreDatabaseId);
        auth = getAuth(app);
        console.log('Firebase initialized successfully from config.');
      }
    })
    .catch(() => {
      // Configuration file not yet generated or manual mode
    });
} catch (e) {
  // Graceful fallback
}

export { app, auth, db };

export async function testConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or awaiting configuration.');
    }
    return false;
  }
}
