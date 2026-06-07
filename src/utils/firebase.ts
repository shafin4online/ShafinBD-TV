import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID from the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Validate Connection once
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Firestore client is offline or permissions issue.", error);
    }
  }
}

testConnection();
