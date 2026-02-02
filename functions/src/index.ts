import { setGlobalOptions } from "firebase-functions";
import { onSchedule, ScheduledEvent } from "firebase-functions/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { getFunctions } from "firebase-admin/functions";
import { onTaskDispatched } from "firebase-functions/v2/tasks";
import { getAllArrangementsForSong, getAllSongs } from "./helpers/pcoApiWrapper";
import { PCO_CLIENT_ID, PCO_ACCESS_TOKEN } from "./config/secrets"
import { Song } from "./types/song";


// Set the global options
setGlobalOptions({ maxInstances: 2 });

admin.initializeApp();
const db = admin.firestore();


// Task handler for processing single song
export const processSongTask = onTaskDispatched({
    secrets: [PCO_ACCESS_TOKEN, PCO_CLIENT_ID],
    retryConfig: {
        maxAttempts: 3,
        minBackoffSeconds: 20, // Wait at least 20s if it fails (rate limit hit)
    },
    rateLimits: {
        maxConcurrentDispatches: 2, // Process only 2 at a time to stay under 100/20s limit
    },
}, async (req) => {
    const song = req.data as Song;
    console.log(`Processing song: ${song.id}`);

    // For each song we need to fetch all its arrangements as well
    const arrangements = await getAllArrangementsForSong(song.id);

    // Add the arrangement to song 
    song.arrangements = arrangements;

    // Save to firestore
    const songRef = db.collection("songs").doc(song.id);
    await songRef.set({
        ...song,
        arrangements: undefined // we store arrangements as subcollections
    }, { merge: true }); // merge allows overwrite but keeps existing fields

    // Store arrangements as subcollections 
    for (const arrangement of arrangements) {
        const arrRef = songRef.collection("arrangements").doc(arrangement.id);

        await arrRef.set({
            ...arrangement,
            keys: undefined,      // stored as subcollection
        }, { merge: true });

        // Store keys as subcollection
        if (arrangement.keys?.length) {
            for (const key of arrangement.keys) {
                const keyRef = arrRef.collection("keys").doc(key.id);
                await keyRef.set(key, { merge: true });
            }
        }
    }

    console.log(`Song ${song.id} saved to Firestore successfully.`);
});

// Scheduled cloud function that fetches all tracked song data from PCO 
// and stores them in the Firestore database
export const syncSongs = onSchedule({
    schedule: "every day 00:00",
    secrets: [PCO_CLIENT_ID, PCO_ACCESS_TOKEN]
}, async (event: ScheduledEvent) => {
    // Log the start of the function for debugging
    logger.info("Initiating songs synchronization.");
    try {
        // Get all the songs
        const songs = await getAllSongs();
        const queue = getFunctions().taskQueue("processSongTask");
        const enqueues = songs.map((song: Song) =>
            queue.enqueue(song) // This adds the work to the queue
        );

        // Wait for all te resolve
        await Promise.all(enqueues);
        console.log(`Enqueued ${songs.length} tasks.`);

    } catch (error) {
        logger.error("Error during song synchronization: ", error);
    }
});