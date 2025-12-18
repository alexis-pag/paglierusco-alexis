// script/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "TA_CLE",
    authDomain: "TON_DOMAINE.firebaseapp.com",
    projectId: "TON_ID",
    appId: "TON_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Fonctions pratiques
export function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
    return signOut(auth);
}

export function guard() {
    onAuthStateChanged(auth, user => {
        if (!user) window.location.href = "login.html";
    });
}
