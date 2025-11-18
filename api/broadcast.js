import { db } from '../firebase/firebase-admin.js';
import { generateKey } from "../utils/generateKey.js";
import { handleCors } from "../utils/handleCors.js"

export default async function Broadcast(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
  const broadcast = req.body;
  const { uniqueTimeKey, year }  = generateKey(true)
    const ref = db.ref(`broadcast/${uniqueTimeKey}`);
    await ref.set(broadcast);
    
    res.status(200).json({ message: 'broadcast berhasil disimpan!' });
  } catch (err) {
    console.error('Error simpan broadcast:', err);
    res.status(500).json({ error: 'Gagal menyimpan' });
  }
}