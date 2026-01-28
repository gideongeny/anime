/**
 * Firebase Configuration & Auth Service
 * Note: You should replace the config object with your own from Firebase Console.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAs-DEMO-KEY-REPLACE-ME",
    authDomain: "anime-stream-demo.firebaseapp.com",
    projectId: "anime-stream-demo",
    storageBucket: "anime-stream-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdefg"
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
