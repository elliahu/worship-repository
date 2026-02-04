import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import type { Index, Song } from "./types";

// Calls a cloud function
/**
 * @deprecated The method should not be used
 */
export const callGetSongsList = async (payload: any = {}) => {
    const func = httpsCallable(functions, "getSongsList");
    const result = await func(payload);
    return result.data;
};

/**
 * @deprecated The method should not be used
 */
export const callGetSongDetail = async (payload: { id: number }) => {
    const func = httpsCallable(functions, "getSongDetail");
    const result = await func(payload);
    return result.data;
};


// Firestore call
export const getSongsList = async (options: {
    orderBy: string,
    orderByDirection: "asc" | "desc"
}) => {
    const songsRef = collection(db, "songs");
    const songsQuery = query(songsRef, orderBy(options.orderBy, options.orderByDirection));
    const snap = await getDocs(songsQuery);

    const songs = snap.docs.map(doc => doc.data() as Song);
    return songs;
};


export const getSongDetail = async (options: { id: string }) => {
    const songRef = doc(db, "songs", options.id);
    const songSnap = await getDoc(songRef);

    if (!songSnap.exists()) {
        throw Error("Song not found");
    }

    return songSnap.data() as Song;
};

export const getSongsIndex = async (options: {
    orderBy: string,
    orderByDirection: "asc" | "desc"
}) => {
    const indexRef = doc(db, "metadata", "index");
    const indexSnap = await getDoc(indexRef);

    if (!indexSnap.exists()) {
        throw Error("Index not found. Wait for sync.");
    }

    return indexSnap.data() as Index;
};