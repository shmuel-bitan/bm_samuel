const admin = require("firebase-admin");

function getFirebaseApp() {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    throw new Error("Firebase environment variables are missing.");
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

function getDb() {
  getFirebaseApp();
  return admin.firestore();
}

module.exports = { admin, getDb };
