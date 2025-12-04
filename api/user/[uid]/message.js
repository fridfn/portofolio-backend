import dotenv from 'dotenv';
import webpush from 'web-push';
import { db, verifyIdToken } from "../../../firebase/firebase-admin.js"
import { handleCors } from "../../../utils/handleCors.js"

dotenv.config();

const vapidKeysPublic = process.env.PUBLIC_VAPID_KEY;
const vapidKeysPrivate = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  'mailto:faridfathonin@email.com',
  vapidKeysPublic,
  vapidKeysPrivate,
);

export default async function Message(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") {
   return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1]
    if (!idToken) {
      return res.status(401).json({ error: "id token Unauthorized: no token" })
    }
     
     const { targetUid } = req.body;
     const { message, icon, badge } = req.body;
     const [title, messages = ""] = message.split("-").map(str => str.trim())
     
     const decodedToken = await verifyIdToken(idToken);
     const authUid = decodedToken.uid;
     
     const senderSnap = await db.ref(`/users/${authUid}/account/role`).once("value")
     const recepientSnap = await db.ref(`/subscriptions/${uid}`).once("value")
     const recepientVal = recepientSnap.val()
     
     if (!recepientVal) {
       return res.status(404).json({ error: "Recipient not found" })
     }
     
     const payload = JSON.stringify({
      title: title || 'Notifikasi Baru!',
      body: messages || 'Ini pesan default dari admin 😚',
      icon: icon || "https://pwa-notification-phi.vercel.app/mailbox.png",
      badge: badge || "https://cdn-icons-png.flaticon.com/64/545/545782.png"
     });
      
      const results = webpush.sendNotification(recepientVal.subscription, payload).catch((err) => {
        if (
          err.statusCode === 404 ||
          err.statusCode === 410
        ) {
          db.ref(`subscriptions/${recepientSnap}`).remove();
          console.log("Hapus subscription invalid:", recepientSnap);
        } else {
          console.error("Error lain:", err);
        }
      })
    
    return res.status(200).json({ success: true, results })
    
  } catch(error) {
   console.error("❌ Error kirim notifikasi:", error)
   return res.status(500).json({ error: 'Internal server error' + error });
  }
}