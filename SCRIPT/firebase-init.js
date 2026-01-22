// SCRIPT/firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js"; // NUEVO

const firebaseConfig = {
  apiKey: "AIzaSyBkJTrS91d6Fga8pbQf7hN97LnED7EX7xc",
  authDomain: "vidalink-v2.firebaseapp.com",
  projectId: "vidalink-v2",
  storageBucket: "vidalink-v2.firebasestorage.app",
  messagingSenderId: "361194406862",
  appId: "1:361194406862:web:4bd4f4157efbc29fbce19f",
  measurementId: "G-MV4CDET1F2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // NUEVO: instancia de Firestore

console.log("Firebase inicializado correctamente ✅");

export { auth, db };