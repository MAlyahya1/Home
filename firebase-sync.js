import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIOAmyP87MtUXn9WCQ0WBYsNK-_ixp75s",
  authDomain: "home-ae448.firebaseapp.com",
  projectId: "home-ae448",
  storageBucket: "home-ae448.firebasestorage.app",
  messagingSenderId: "291783771060",
  appId: "1:291783771060:web:e620feb2ff72e7b14728e1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docRef = doc(db, "household", "shared");

export function subscribeToRemoteState(onRemoteUpdate, onStatusChange) {
  onSnapshot(
    docRef,
    (snapshot) => {
      onStatusChange("synced");
      if (snapshot.exists()) {
        onRemoteUpdate(snapshot.data());
      }
    },
    () => onStatusChange("offline")
  );
}

export function pushState(state) {
  setDoc(docRef, state).catch(() => {});
}
