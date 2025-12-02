import { db, verifyIdToken } from "../../firebase/firebase-admin.js"
import { handleCors } from "../../utils/handleCors.js"

export default async function Role(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 1️⃣ Ambil token Firebase dari header
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    const validRoles = ["owner", "administrator", "admin", "visitor", "user"];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized: no token' });
    }
    
    // 2️⃣ Verifikasi token
    const decodedToken = await verifyIdToken(idToken);
    const authUid = decodedToken.uid;

    // 3️⃣ Ambil target uid dari URL
    const { newRole, uid } = req.body;
    
    // 4️⃣ Ambil role updater dan target dari RTDB
    const updaterSnap = await db.ref(`/users/${authUid}/account/role`).once('value');
    const targetSnap = await db.ref(`users/${uid}/account/role`).once('value');

    const updaterRole = updaterSnap.val();
    const targetRole = targetSnap.exists() ? targetSnap.val() : null;

    if (!newRole) {
      return res.status(400).json({ error: 'newRole is required' });
    }

    // 5️⃣ Validasi hierarki
    let allowed = false;

    // Self-update
    if (authUid === uid) {
      allowed = true;
    }
    
    // Owner rules
    else if (updaterRole === 'owner') {
      if (!targetRole || (newRole !== "owner" && targetRole !== "owner")) {
        allowed = true;
      }
    }
    
    // Admin rules
    else if (updaterRole === 'administrator') {
      if (newRole !== 'administrator' && newRole !== 'owner') {
        allowed = true;
      }
    }
    
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden: cannot update this user role' });
    }

    // 6️⃣ Update role di RTDB
    await db.ref(`users/${uid}/account/role`).set(newRole);

    return res.status(200).json({ success: true, uid, newRole });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
