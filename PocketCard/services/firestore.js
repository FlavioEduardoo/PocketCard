// Firestore helper to fetch or create a user profile after login
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Retrieves the user profile document from the "users" collection.
 * If it does not exist, creates a default profile.
 *
 * @param {string} uid - Firebase Auth user UID
 * @param {string} email - User email address
 * @returns {Promise<Object>} The profile data
 */
export const getOrCreateUserProfile = async (uid, email) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data();
  }

  // First time login – create a default document
  const defaultProfile = {
    uid,
    email,
    createdAt: new Date(),
    // Add any other default fields your app expects here, e.g.:
    // cardName: 'Meu PocketCard',
    // limit: 0,
  };

  await setDoc(userRef, defaultProfile);
  return defaultProfile;
};
