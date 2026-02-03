import { onSchedule, ScheduledEvent } from "firebase-functions/scheduler";
import * as logger from "firebase-functions/logger";
import { db } from "./helpers/firebase"
import { getFunctions } from "firebase-admin/functions";
import { onTaskDispatched } from "firebase-functions/v2/tasks";
import { getAllArrangementsForSong, getAllSongs } from "./helpers/pcoApiWrapper";
import { PCO_CLIENT_ID, PCO_ACCESS_TOKEN } from "./config/secrets"
import { Song } from "./types/song";
import { deepSanitize } from "./helpers/firebase"



// Task handler for processing single song
export const processSongTask = onTaskDispatched({
    region: "europe-west3",
    secrets: [PCO_ACCESS_TOKEN, PCO_CLIENT_ID],
    retryConfig: {
        maxAttempts: 3,
        minBackoffSeconds: 20, // Wait at least 20s if it fails (rate limit hit)
    },
    rateLimits: {
        maxConcurrentDispatches: 2, // Process only 2 at a time to stay under 100/20s limit
    },
}, async (req) => {
    try {
        const song = req.data as Song;
        console.log(`Processing song: ${song.id}`);

        // For each song we need to fetch all its arrangements as well
        const arrangements = await getAllArrangementsForSong(song.id);

        // Add the arrangement to song 
        song.arrangements = arrangements;

        // Clean the song
        const cleanedSong = deepSanitize(song);

        // Save as a single document
        const songRef = db.collection("songs").doc(song.id);
        await songRef.set(cleanedSong, { merge: true });

        console.log(`Song ${song.id} saved to Firestore successfully.`);
    } catch (error){
        logger.error("Error during song processing: ", error);
    }
});

// Scheduled cloud function that fetches all tracked song data from PCO 
// and stores them in the Firestore database
export const syncSongs = onSchedule({
    schedule: "every day 00:00",
    region: "europe-west3",
    secrets: [PCO_CLIENT_ID, PCO_ACCESS_TOKEN]
}, async (event: ScheduledEvent) => {
    // Log the start of the function for debugging
    logger.info("Initiating songs synchronization.");
    try {
        // Get all the songs
        const songs = await getAllSongs();
        const queue = getFunctions().taskQueue("projects/worship-repository/locations/europe-west3/functions/processSongTask",);
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



