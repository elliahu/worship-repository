import * as logger from "firebase-functions/logger";
import { PCO_API_DATA_SOURCE } from "../config/secrets";
import { getPcoAuthHeader } from "../config/pco";


// Helper function to GET request all songs from PCO
// Song arrangements are not part of the result
export const getAllSongs = async () => {
    // Pagination
    const perPage = 100; // Number of songs per page
    let page = 1; // Current page
    let totalRetrieved = 0; // Total count of retrieved songs
    let nextPage = true; // Should we fetch the next page?
    const songs: any[] = []; // Retrieved songs

    while (nextPage) {
        // Build the fetch url
        const offset = (page - 1) * perPage;
        const url = `${PCO_API_DATA_SOURCE.value()}/services/v2/songs?per_page=${perPage}&offset=${offset}`;
        logger.info(`Fetching from ${url}`);

        // Send the request
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: getPcoAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        // Check response status
        if (!response.ok) {
            throw Error(`${response.status}: Failed to fetch Planning Center songs data. Message: ${response.statusText}`);
        }

        // Get the data as JSON
        const result = await response.json();
        totalRetrieved += result.meta.count;
        page++;
        nextPage = totalRetrieved < result.meta.total_count;
        logger.info("Retrieved ", result.meta.count, " songs.");

        // Save the data
        const data = result.data;
        if (Array.isArray(data)) {
            for (const item of data) {
                songs.push({
                    id: item.id,
                    ...item.attributes
                });
            }
        }
    };

    logger.info("Songs retrieved: ", totalRetrieved);
    return songs;
}


// Fetches all arrangements for a give song
export const getAllArrangementsForSong = async (song_id: string) => {
    // Prepare the url
    const url = `${PCO_API_DATA_SOURCE.value()}/services/v2/songs/${song_id}/arrangements?include=keys,sections`;
    logger.info(`Fetching from ${url}`);

    // Make the request
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: getPcoAuthHeader(),
            'Content-Type': 'application/json'
        }
    });

    // Check response status
    if (!response.ok) {
        throw Error(`${response.status}: Failed to fetch Planning Center arrangement data. Message: ${response.statusText}`);
    }

    // Parse the data
    const result = await response.json();
    logger.info("Retrieved ", result.meta.count, " arrangements for song ", song_id);
    const data = result.data;
    const included = result.included;

    const arrangements: any[] = [];
    if (Array.isArray(data)) {
        for (const item of data) {
            arrangements.push({
                id: item.id,
                ...item.attributes
            });
        }
    }

    const keys: any[] = [];
    const sections: any[] = [];
    if (Array.isArray(included)) {
        for (const item of included) {
            if (item.type == "Key") {
                keys.push({
                    id: item.id,
                    ...item.attributes
                });
            } else if (item.type == "ArrangementSections") {
                const section: any = {
                    id: item.id,
                    sections: []
                };

                for (const s of item.attributes.sections) {
                    section.sections!.push({
                        ...s
                    });
                }

                sections.push(section);
            }
        }
    }

    // Link arrangements with their keys and their sections:
    const keyMap = new Map<string, any>();
    for (const key of keys) {
        keyMap.set(key.id, key);
    }

    const sectionMap = new Map<string, any>();
    for (const section of sections) {
        sectionMap.set(section.id, section);
    }

    // Link arrangements with their keys and sections
    for (const arrangement of arrangements) {
        const source = data.find((d: any) => d.id === arrangement.id);
        if (!source || !source.relationships) continue;

        // ---- Keys ----
        const keyRels = source.relationships.keys?.data;
        if (Array.isArray(keyRels)) {
            arrangement.keys = keyRels
                .map((rel: any) => keyMap.get(rel.id))
                .filter(Boolean) as any[];
        }

        // ---- Sections ----
        const sectionRel = source.relationships.sections?.data;
        if (sectionRel) {
            arrangement.sections = sectionMap.get(sectionRel.id);
        }
    }

    return arrangements;
};
