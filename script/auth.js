// script/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged as _onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxEuc36jSRacu6SzIhhdjVWvb53UXl5KI",
  authDomain: "bounty-clicker-a2404.firebaseapp.com",
  projectId: "bounty-clicker-a2404",
  storageBucket: "bounty-clicker-a2404.firebasestorage.app",
  messagingSenderId: "1015535363894",
  appId: "1:1015535363894:web:09a0649a01ec20bd3cf597"
};

// Initialisation
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export function register(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

// Surveille l'état de connexion
export function onUserReady(callback) {
  _onAuthStateChanged(auth, user => {
    if (user) callback(user);
    else window.location.href = "login.html";
  });
}
