import * as logger from "firebase-functions/logger";
import { PCO_API_DATA_SOURCE } from "../config/secrets";
import { getPcoAuthHeader } from "../config/pco";
import { Song, Arrangement, Key, ArrangementSections, ArrangementSection } from "../types/song";


// Helper function to GET request all songs from PCO
// Song arrangements are not part of the result
export const getAllSongs = async () => {
    // Pagination
    const perPage = 100; // Number of songs per page
    let page = 1; // Current page
    let totalRetrieved = 0; // Total count of retrieved songs
    let nextPage = true; // Should we fetch the next page?
    const songs: Song[] = []; // Retrieved songs

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
                    title: item.attributes.title,
                    created_at: item.attributes.created_at,
                    updated_at: item.attributes.updated_at,
                    admin: item.attributes.admin,
                    author: item.attributes.author,
                    copyright: item.attributes.copyright,
                    hidden: item.attributes.hidden,
                    notes: item.attributes.notes,
                    themes: item.attributes.themes,
                    last_scheduled_short_date: item.attributes.last_scheduled_short_date,
                    last_scheduled_at: item.attributes.last_scheduled_at,
                    ccli_number: item.attributes.ccli_number
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

    const arrangements: Arrangement[] = [];
    if (Array.isArray(data)) {
        for (const item of data) {
            arrangements.push({
                id: item.id,
                name: item.attributes.name,
                bpm: item.attributes.bpm,
                created_at: item.attributes.created_at,
                updated_at: item.attributes.updated_at,
                has_chords: item.attributes.has_chords,
                has_chord_chart: item.attributes.has_chord_chart,
                length: item.attributes.length,
                meter: item.attributes.meter,
                notes: item.attributes.notes,
                chord_chart: item.attributes.chord_chart,
                chord_chart_key: item.attributes.chord_chart_key,
                sequence: item.attributes.sequence,
                sequence_short: item.attributes.sequence_short,
                sequence_full: item.attributes.sequence_full,
                lyrics: item.attributes.lyrics
            });
        }
    }

    const keys: Key[] = [];
    const sections: ArrangementSections[] = [];
    if (Array.isArray(included)) {
        for (const item of included) {
            if (item.type == "Key") {
                keys.push({
                    id: item.id,
                    created_at: item.attributes.created_at,
                    updated_at: item.attributes.updated_at,
                    name: item.attributes.name,
                    starting_key: item.attributes.starting_key,
                    ending_key: item.attributes.ending_key,
                    starting_minor: item.attributes.starting_minor,
                    ending_minor: item.attributes.ending_minor
                });
            } else if (item.type == "ArrangementSections") {
                const section: ArrangementSections = {
                    id: item.id,
                    sections: []
                };

                for (const s of item.attributes.sections) {
                    section.sections!.push({
                        label: s.label,
                        lyrics: s.lyrics
                    } as ArrangementSection);
                }

                sections.push(section);
            }
        }
    }

    // Link arrangements with their keys and their sections:
    const keyMap = new Map<string, Key>();
    for (const key of keys) {
        keyMap.set(key.id, key);
    }

    const sectionMap = new Map<string, ArrangementSections>();
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
                .filter(Boolean) as Key[];
        }

        // ---- Sections ----
        const sectionRel = source.relationships.sections?.data;
        if (sectionRel) {
            arrangement.sections = sectionMap.get(sectionRel.id);
        }
    }

    return arrangements;
};
