import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// This is NOT a secret
const firebaseConfig = {
  apiKey: "AIzaSyC1W7VeT1s5masCIMiGNy8WpbwN9014k1Q",
  authDomain: "worship-repository.firebaseapp.com",
  projectId: "worship-repository",
  storageBucket: "worship-repository.firebasestorage.app",
  messagingSenderId: "349437468245",
  appId: "1:349437468245:web:45eb5ecc1996ca8c117edc"
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

export const functions = getFunctions(app, "europe-west3");
/*export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});*/
export const db = getFirestore(app);