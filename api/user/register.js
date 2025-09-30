import { db } from '../../firebase/firebase-admin.js'
import { handleCors } from "../../utils/handleCors.js"

export default async function Register(req,res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
   try {
   const user = req.body
   const { uid, email, createdAt, lastLoginAt } = user;
     const ref = db.ref(`users/${uid}`)
     await ref.set({
       account: {
         uid: uid,
         email: email,
         role: "visitor",
         createAt: createdAt,
         lastLoginAt: lastLoginAt,
         updatedAt: new Date().toISOString()
       }
     })
     
    res.status(200).json({ message: "success register user" })
   } catch (err) {
    res.status(500).json({ error: "GAGAL menyimpan "})
   }
}