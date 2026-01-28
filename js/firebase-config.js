/**
 * Firebase Configuration & Auth Service
 * Note: You should replace the config object with your own from Firebase Console.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// YOUR REAL FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyCO3PHrX1bL6pGnPcTkRNB4bBqfumVHX7s",
    authDomain: "anime-9a81f.firebaseapp.com",
    projectId: "anime-9a81f",
    storageBucket: "anime-9a81f.firebasestorage.app",
    messagingSenderId: "465784307562",
    appId: "1:465784307562:web:875c5cd7d7d66606deef13",
    measurementId: "G-9ZGP95B8EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Service Class
class AuthService {
    static getCurrentUser() {
        return auth.currentUser;
    }

    static onAuthChange(callback) {
        onAuthStateChanged(auth, callback);
    }

    static async login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    static async signup(email, password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user profile in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            watchlist: [],
            history: [],
            createdAt: new Date().toISOString()
        });
        return userCredential;
    }

    static async logout() {
        return signOut(auth);
    }

    // Watchlist Management
    static async toggleWatchlist(animeId, animeTitle, poster) {
        const user = auth.currentUser;
        if (!user) throw new Error("Please login first");

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) return;

        const watchlist = userDoc.data().watchlist || [];
        const exists = watchlist.find(item => item.id == animeId);

        if (exists) {
            const newWatchlist = watchlist.filter(item => item.id != animeId);
            await updateDoc(userRef, { watchlist: newWatchlist });
            return false; // Removed
        } else {
            await updateDoc(userRef, {
                watchlist: arrayUnion({ id: animeId, title: animeTitle, poster: poster, addedAt: new Date().toISOString() })
            });
            return true; // Added
        }
    }
}

window.AuthService = AuthService;
export { auth, db };
