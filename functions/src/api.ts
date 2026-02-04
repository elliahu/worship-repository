import { HttpsError, onCall } from "firebase-functions/https";
import { db } from "./helpers/firebase";
import * as logger from "firebase-functions/logger";
import { OrderByDirection } from "firebase-admin/firestore";

// Lists all songs 
export const getSongsList = onCall({
    region: "europe-west3",
}, async (request) => {
    try {
        const orderBy: string = request.data.orderBy ?? "title";
        const orderByDirection: OrderByDirection = request.data.orderByDirection ?? "asc";

        if (!["asc", "desc"].includes(orderByDirection)){
            throw new HttpsError("invalid-argument", "orderByDirection invalid: valid values are asc,desc");
        }

        const collectionRef = db.collection("songs");
        const snapshot = await collectionRef.orderBy(`${orderBy}`, `${orderByDirection}`).get();

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

        const data = songSnap.data();
        return { item: data };

    } catch (error) {
        logger.error("Error retrieving songs list: ", error);
        throw new HttpsError("internal", "Error retrieving songs list");
    }
});



