import { HttpsError, onCall } from "firebase-functions/https";
import { db } from "./helpers/firebase";
import * as logger from "firebase-functions/logger";

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




