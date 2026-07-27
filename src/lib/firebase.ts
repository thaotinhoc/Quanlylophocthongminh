import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Graceful check for config presence or load
let firebaseConfig: any = null;
let isFirebaseEnabled = false;

let app: any = null;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

function initializeFirebase() {
  if (!firebaseConfig) return;
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Validate Connection to Firestore (Skill constraint)
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or network connection.");
        }
      }
    };
    testConnection();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    isFirebaseEnabled = false;
  }
}

const defaultConfig = {
  apiKey: "AIzaSyDhT4SNrfzxxB0z9vnHZ0TT6loJgUmzaL4",
  authDomain: "quanlylophocthongminh.firebaseapp.com",
  projectId: "quanlylophocthongminh",
  storageBucket: "quanlylophocthongminh.firebasestorage.app",
  messagingSenderId: "100743016793",
  appId: "1:100743016793:web:388ba64aca4a28215c5c48"
};

// 1. Sync check from Vite environment variables first
const metaEnv = (import.meta as any).env;
if (metaEnv && metaEnv.VITE_FIREBASE_API_KEY) {
  firebaseConfig = {
    apiKey: metaEnv.VITE_FIREBASE_API_KEY,
    authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
    storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: metaEnv.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: metaEnv.VITE_FIREBASE_FIRESTORE_DB_ID || '(default)'
  };
  isFirebaseEnabled = true;
  initializeFirebase();
} else {
  // 2. Default config set immediately
  firebaseConfig = defaultConfig;
  isFirebaseEnabled = true;
  initializeFirebase();

  // 3. Optional update from config file if available
  const configPath = '../../firebase-applet-config.json';
  import(/* @vite-ignore */ configPath)
    .then((config) => {
      if (config && (config.apiKey || config.default?.apiKey)) {
        firebaseConfig = config.default || config;
        initializeFirebase();
      }
    })
    .catch(() => {});
}

export { app, db, auth, googleProvider, isFirebaseEnabled };

// Custom Firestore Error Logger & Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Detail: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
