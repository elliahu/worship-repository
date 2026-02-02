import { setGlobalOptions } from "firebase-functions";
import { onSchedule, ScheduledEvent } from "firebase-functions/scheduler";
import * as logger from "firebase-functions/logger";
import { defineSecret, defineString } from "firebase-functions/params";
import { onTaskDispatched } from "firebase-functions/v2/tasks";
import { getFunctions } from "firebase-admin/functions";

// Set the global options
setGlobalOptions({ maxInstances: 2 });


// Define secrets
const PCO_API_DATA_SOURCE = defineString("PCO_API_DATA_SOURCE");
const PCO_CLIENT_ID = defineSecret("PCO_CLIENT_ID");
const PCO_ACCESS_TOKEN = defineSecret("PCO_ACCESS_TOKEN");
const credentials = btoa(`${PCO_CLIENT_ID.value()}:${PCO_ACCESS_TOKEN.value()}`); // Credentials

// Task handler for processing single song
export const processSongTask = onTaskDispatched({
  secrets: [PCO_ACCESS_TOKEN, PCO_CLIENT_ID],
  retryConfig: {
    maxAttempts: 3,
    minBackoffSeconds: 20, // Wait at least 20s if it fails (rate limit hit)
  },
  rateLimits: {
    maxConcurrentDispatches: 5, // Process only 5 at a time to stay under 100/20s limit
  },
}, async (req) => {
  const songData = req.data;
  console.log(`Processing song: ${songData.id}`);



});

// Scheduled cloud function that fetches all tracked song data from PCO 
// and stores them in the Firestore database
export const syncSongs = onSchedule({
    schedule: "every day 00:00",
    secrets: [PCO_CLIENT_ID, PCO_ACCESS_TOKEN]
}, async (event: ScheduledEvent) => {
    // Log the start of the function for debugging
    logger.info("Initiating songs synchronization.");

    // Pagination
    const perPage = 100; // Number of songs per page
    let page = 1; // Current page
    let totalRetrieved = 0; // Total count of retrieved songs
    let nextPage = true; // Should we fetch the next page?
    const songs: any[] = []; // Retrieved songs

    try {
        while (nextPage) {
            // Build the fetch url
            const offset = (page - 1) * perPage;
            const url = `${PCO_API_DATA_SOURCE.value()}/services/v2/songs?per_page=${perPage}&offset=${offset}`;
            logger.info(`Fetching from ${url}`);

            // Send the request
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            });

            // Check response status
            if (!response.ok) {
                throw Error(`${response.status}: Failed to fetch Planning Center data. Message: ${response.statusText}`);
            }

            // Get the data as JSON
            const result = await response.json();
            totalRetrieved += result.meta.count;
            page++;
            nextPage = totalRetrieved < result.meta.total_count;
            logger.info("Retrieved ", result.meta.count, " songs.");

            // Save the data
            const data = result.data;
            songs.push(data)
        };

        logger.info("Songs retrieved: ",totalRetrieved);


        const queue = getFunctions().taskQueue("processSongTask");
        const enqueues = songs.map((song) => 
            queue.enqueue(song) // This adds the work to the queue
        );

        await Promise.all(enqueues);
        console.log(`Enqueued ${songs.length} tasks.`);

    } catch (error) {
        logger.error("Error during song synchronization: ", error);
    }
});