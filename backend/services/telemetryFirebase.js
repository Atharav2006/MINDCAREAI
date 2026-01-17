// backend/services/telemetryFirebase.js
const fs = require('fs');

let admin = null;
let db = null;
const COLLECTION = 'anonymous_events';

function noopLog(event) {
  console.log('[telemetry][noop]', JSON.stringify(event));
}

try {
  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';
  if (saPath && fs.existsSync(saPath)) {
    admin = require('firebase-admin');
    const serviceAccount = require(saPath);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DB_URL || undefined
      });
    }
    db = admin.firestore();
    module.exports = {
      logEvent: async function (event) {
        const doc = {
          ...event,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        try {
          await db.collection(COLLECTION).add(doc);
        } catch (err) {
          console.error('[telemetry] failed to write to firestore', err);
        }
      }
    };
    console.log('[telemetry] Firebase initialized');
    return;
  } else {
    console.warn('[telemetry] No Firebase service account found at', saPath, '- telemetry disabled (noop).');
  }
} catch (err) {
  console.error('[telemetry] initialization error, telemetry disabled:', err);
}

module.exports = {
  logEvent: async function (event) {
    try {
      noopLog(event);
    } catch (e) {
      // swallow errors in telemetry fallback
    }
  }
};