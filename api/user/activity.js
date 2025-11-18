import { db } from "../../firebase/firebase-admin.js"
import { generateKey } from "../../utils/generateKey.js"
import { handleCors } from "../../utils/handleCors.js"

export default async function Activity (req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
  const { uid, dataActivity } = req.body;
  const { uniqueTimeKey, year } = generateKey(false)
    const ref = db.ref(`users/${uid}/activity/${year}/${uniqueTimeKey}`);
    
    console.log(`users/${uid}/activity/${year}/${uniqueTimeKey}`)
    
    await ref.set({
      ...dataActivity,
      createdAt: new Date().toISOString()
    });
    
    res.status(200).json({
       message: "success updates activity"
    })
   } catch (err) {
    console.error('Error updates activity:', err);
    res.status(500).json({
      error: 'Gagal menyimpan'
    });
  }
}