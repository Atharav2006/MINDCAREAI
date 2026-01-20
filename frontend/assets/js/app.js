// assets/js/app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAdQ6zFs-cTNAKXOYS2SxTscIec_Qk9gO4",
  authDomain: "mindcareai-2c356.firebaseapp.com",
  databaseURL: "https://mindcareai-2c356-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mindcareai-2c356",
  storageBucket: "mindcareai-2c356.firebasestorage.app",
  messagingSenderId: "928128212939",
  appId: "1:928128212939:web:49ed80a9179f9d62a5a04e",
  measurementId: "G-HEPR7E44Y3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.auth = auth;

window.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");

  if (loginBtn) {
    loginBtn.onclick = async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        if (userInfo) userInfo.textContent = `Logged in as ${auth.currentUser?.displayName || auth.currentUser?.email}`;
        loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
      } catch (err) {
        console.error("Login error", err);
        alert("Login failed. Check console for details.");
      }
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      try {
        await signOut(auth);
        if (userInfo) userInfo.textContent = "";
        if (loginBtn) loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
      } catch (err) {
        console.error("Logout error", err);
      }
    };
  }
});

export { auth, db };