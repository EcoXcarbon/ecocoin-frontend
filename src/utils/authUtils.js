import { doc, getDoc, getFirestore } from "firebase/firestore";

export const isAdminUser = async (uid) => {
  if (!uid) return false;
  const db = getFirestore();
  const adminRef = doc(db, "admins", uid);
  const snap = await getDoc(adminRef);
  return snap.exists();
};
