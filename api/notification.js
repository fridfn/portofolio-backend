import dotenv from 'dotenv';
import webpush from 'web-push';
import { db } from '../firebase/firebase-admin.js';
import { handleCors } from "../utils/handleCors.js"

dotenv.config();

const vapidKeysPublic = process.env.PUBLIC_VAPID_KEY
const vapidKeysPrivate = process.env.PRIVATE_VAPID_KEY

webpush.setVapidDetails(
  'mailto:faridfathonin@email.com',
  vapidKeysPublic,
  vapidKeysPrivate,
);

export default async function Notification(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { title, body, icon, badge } = req.body
    const snapshot = await db.ref('subscriptions').once('value');
    const subs = snapshot.val();
    
    if (!subs) {
      return res.status(404).json({ error: 'Tidak ada subscription ditemukan.' });
    }
    
    const payload = JSON.stringify({
      title: title || 'Notifikasi Baru!',
      body: body || 'Ini pesan default dari server mu 😚',
      icon: icon || "https://pwa-notification-phi.vercel.app/mailbox.png",
      badge: badge || "https://cdn-icons-png.flaticon.com/64/545/545782.png"
    });
    
    const results = await Promise.allSettled(
      Object.values(subs).map((sub) => {
        const allUsers = sub.subscription;
        
        if (!allUsers || !allUsers.endpoint) {
          console.warn("⚠️ Subscription invalid / kosong:", sub);
          return Promise.resolve();
        }
        
        return webpush.sendNotification(allUsers, payload).catch((err) => {
          if (
            err.statusCode === 404 ||
            err.statusCode === 410
          ) {
            db.ref(`subscriptions/${sub}`).remove();
            console.log("Hapus subscription invalid:", sub.id);
          } else {
            console.error("Error lain:", err);
          }
        })
      })
    );

    const success = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    res.status(200).json({
      message: 'Push Notification selesai dikirim.',
      success,
      failed,
      datas: req.body
    });
  } catch (err) {
    console.error('❌ Gagal total kirim notif:', err);
    res.status(500).json({ error: 'Server error saat kirim notifikasi' });
  }
}
