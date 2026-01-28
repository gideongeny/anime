/**
 * Comment Service
 * Real-time discussion using Firestore
 */
import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class CommentService {

    static async postComment(animeId, episode, text) {
        const user = auth.currentUser;
        if (!user) throw new Error("Please login to comment");

        return await addDoc(collection(db, "comments"), {
            animeId: animeId,
            episode: episode,
            userId: user.uid,
            userEmail: user.email,
            text: text,
            timestamp: serverTimestamp()
        });
    }

    static subscribeToComments(animeId, episode, callback) {
        const q = query(
            collection(db, "comments"),
            where("animeId", "==", animeId),
            where("episode", "==", episode),
            orderBy("timestamp", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const comments = [];
            snapshot.forEach((doc) => {
                comments.push({ id: doc.id, ...doc.data() });
            });
            callback(comments);
        }, (error) => {
            console.error("Comments error:", error);
        });
    }
}

window.CommentService = CommentService;
export { CommentService };
