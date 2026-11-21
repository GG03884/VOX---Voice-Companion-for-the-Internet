import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  initializeAppCheck, 
  ReCaptchaEnterpriseProvider, 
  ReCaptchaV3Provider,
  type AppCheck 
} from 'firebase/app-check';
import type { AppSettings } from '../types';

let cachedApp: FirebaseApp | null = null;
let cachedAppCheck: AppCheck | null = null;

export interface FirebaseConfigOptions {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

/**
 * Returns the effective Firebase configuration from environment or settings.
 */
export function getFirebaseConfig(settings?: Partial<AppSettings>): FirebaseConfigOptions {
  return {
    apiKey: settings?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: settings?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: settings?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: settings?.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
}

/**
 * Initializes and returns the FirebaseApp singleton.
 */
export function initFirebase(settings?: Partial<AppSettings>): FirebaseApp | null {
  const config = getFirebaseConfig(settings);

  if (!config.apiKey || config.apiKey.includes('PLACEHOLDER') || config.apiKey.includes('YOUR_')) {
    return null;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedApp = existingApps[0];
    return cachedApp;
  }

  try {
    cachedApp = initializeApp(config);
    return cachedApp;
  } catch (error) {
    console.error('[VOX Firebase] Initialization error:', error);
    return null;
  }
}

/**
 * Initializes Firebase App Check as required by Firebase AI Logic.
 * Supports development debug tokens and ReCaptcha Enterprise/v3.
 */
export function initAppCheck(app: FirebaseApp, settings?: Partial<AppSettings>): AppCheck | null {
  if (cachedAppCheck) return cachedAppCheck;

  // In development, extension context, or if debug token is provided:
  const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
  if (import.meta.env.DEV || debugToken) {
    // Configure global debug token for App Check
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken || true;
  }

  const siteKey = settings?.recaptchaSiteKey || import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  try {
    if (siteKey && siteKey.length > 10) {
      cachedAppCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } else if (import.meta.env.DEV || debugToken) {
      // In development with debug token, we can initialize with a fallback provider or debug provider
      cachedAppCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'), // standard test key
        isTokenAutoRefreshEnabled: true,
      });
    }
  } catch (err) {
    console.warn('[VOX AppCheck] App Check init warning (non-fatal for local testing):', err);
  }

  return cachedAppCheck;
}
