/**
 * Firebase Configuration & Auth Service
 * Note: You should replace the config object with your own from Firebase Console.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// YOUR REAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAtl4Ue26ZsNPbqvoglkThwzdlebmwsjMA",
  authDomain: "anime-7746c.firebaseapp.com",
  projectId: "anime-7746c",
  storageBucket: "anime-7746c.firebasestorage.app",
  messagingSenderId: "388117545150",
  appId: "1:388117545150:web:67d1bc2f03ba7c35949eef",
  measurementId: "G-F2TM3JY93V"
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

    static async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            // Attempt to sync with Firestore, but don't block login if it fails due to "offline"
            try {
                const userRef = doc(db, "users", result.user.uid);
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists()) {
                    await setDoc(userRef, {
                        email: result.user.email,
                        watchlist: [],
                        history: [],
                        createdAt: new Date().toISOString()
                    });
                }
            } catch (fsError) {
                console.warn("Firestore sync failed, continuing with local session:", fsError);
            }
            return result;
        } catch (authError) {
            console.error("Auth Error:", authError);
            throw authError;
        }
    }

    static async logout() {
        return signOut(auth);
    }

    // Watchlist Management
    static async toggleWatchlist(animeId, animeTitle, poster) {
        const user = auth.currentUser;
        if (!user) throw new Error("Please login first");

        const userRef = doc(db, "users", user.uid);
        let userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, { email: user.email, watchlist: [], history: [], createdAt: new Date().toISOString() });
            userDoc = await getDoc(userRef);
        }

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
    // Watch History Management
    static async saveWatchProgress(animeId, animeTitle, episode, isTmdb, posterUrl) {
        const user = auth.currentUser;
        if (!user) return; // Do nothing if not logged in

        const userRef = doc(db, "users", user.uid);
        let userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, { email: user.email, watchlist: [], history: [], createdAt: new Date().toISOString() });
            userDoc = await getDoc(userRef);
        }

        let history = userDoc.data().history || [];
        
        // Remove if it already exists (we'll move it to the front)
        history = history.filter(item => item.id != animeId);
        
        // Add to the front
        history.unshift({
            id: animeId,
            title: animeTitle,
            episode: episode,
            isTmdb: isTmdb,
            poster: posterUrl,
            timestamp: new Date().toISOString()
        });

        // Keep only top 20
        if (history.length > 20) history = history.slice(0, 20);

        await updateDoc(userRef, { history: history });
    }

    static async getWatchHistory() {
        const user = auth.currentUser;
        if (!user) return [];
        try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) return [];
            return userDoc.data().history || [];
        } catch (e) {
            console.warn("History fetch failed:", e);
            return [];
        }
    }

    // Contact Form Submission
    static async submitContact(name, email, message) {
        const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        const contactsRef = collection(db, "contacts");
        await addDoc(contactsRef, {
            name: name,
            email: email,
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    static async getWatchlist() {
        const user = auth.currentUser;
        if (!user) return JSON.parse(localStorage.getItem('anime_library') || '[]');
        try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            return userDoc.exists() ? userDoc.data().watchlist || [] : [];
        } catch (e) {
            console.warn("Watchlist fetch failed:", e);
            return [];
        }
    }
}
window.AuthService = AuthService;
window.AuthService.db = db;
export { auth, db };
