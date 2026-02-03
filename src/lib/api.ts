import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export const callGetSongsList = async (payload: any = {}) => {
    const func = httpsCallable(functions, "getSongsList");
    const result = await func(payload);
    return result.data;
};