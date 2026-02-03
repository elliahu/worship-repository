import { HttpsError, onCall } from "firebase-functions/https";
import { db } from "./helpers/firebase";
import * as logger from "firebase-functions/logger";
import { Song } from "./types/song";

// Lists all songs 
export const getSongsList = onCall({
    region: "europe-west3",
}, async (request) => {
    try {
        const collectionRef = db.collection("songs");
        const snapshot = await collectionRef.get();

        if (snapshot.empty) {
            return { items: [] };
        }

        const songs = snapshot.docs.map((doc) => {
            const song = doc.data();
            return {
                id: doc.id,
                title: song.title,
                author: song.author,
                last_scheduled_at: song.last_scheduled_at,
            };
        });

        return { items: songs };

    } catch (error) {
        logger.error("Error retrieving songs list: ", error);
        throw new HttpsError("internal", "Error retrieving songs list");
    }
});


// Get song detail
export const getSongDetail = onCall({
    region: "europe-west3",
}, async (request) => {
    try {
        const songId = request.data.id;

        if (!songId) {
            throw new HttpsError("invalid-argument", "Invalid or missing id.");
        }

        const songSnap = await db.collection("songs").doc(songId).get();

        if (!songSnap.exists) {
            throw new HttpsError("not-found", `No song with id: ${songId}`);
        }

        const data = songSnap.data() as Song;
        return { item: data };

    } catch (error) {
        logger.error("Error retrieving songs list: ", error);
        throw new HttpsError("internal", "Error retrieving songs list");
    }
});



