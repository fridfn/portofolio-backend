import admin from 'firebase-admin';
import { readFileSync } from 'fs';

//const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
const serviceAccount = JSON.parse(readFileSync('./firebase-credentials.json', 'utf-8')) 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fridfn-pwa-notif-default-rtdb.asia-southeast1.firebasedatabase.app'
  });
}

export async function verifyIdToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken; // berisi uid, email, etc.
  } catch (error) {
    throw new Error('Invalid token');
  }
}


export const db = admin.database();