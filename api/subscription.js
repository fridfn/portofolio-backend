import { db } from '../firebase/firebase-admin.js';
import { handleCors } from "../utils/handleCors.js"

export default async function Subscription(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { subscription, uid } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription kosong' });
    }
    
    const ref = db.ref('subscriptions');
    
    if (uid) {
      // 🔑 User login → simpan pakai uid
      await ref.child(uid).set({
        subscription,
        subscribeAt: new Date().toISOString()
      });
    } else {
      // 👤 Guest → simpan pakai random key
      await ref.push({
        subscription,
        subscribeAt: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      subscription,
      message: 'Subscription berhasil disimpan!'
    });
  } catch (err) {
    console.error('Error simpan subscription:', err);
    res.status(500).json({ error: 'Gagal menyimpan' });
  }
}

