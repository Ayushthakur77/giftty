import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json' with { type: "json" };

if (!getApps().length) {
  let credential = undefined;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      let val = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      // Handle case where user wrapped the JSON in single quotes in the env var
      if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      
      // JSON doesn't allow escaped single quotes (\')
      val = val.replace(/\\'/g, "'");
      
      // Handle literal newlines that might cause parsing errors
      val = val.replace(/\n/g, '\\n');
      
      // Remove invalid escapes (e.g. \p, \M) that cause "Bad escaped character"
      val = val.replace(/\\([^"\\/bfnrtu])/g, "$1");

      const serviceAccount = JSON.parse(val);
      credential = cert(serviceAccount);
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    }
  }

  initializeApp({
    projectId: firebaseConfig.projectId,
    ...(credential ? { credential } : {})
  });
}

export const adminAuth = getAuth();
