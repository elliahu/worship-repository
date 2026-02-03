import { setGlobalOptions } from "firebase-functions";
import { syncSongs, processSongTask } from "./sync";
import { getSongsList } from "./api";

// Set the global options
setGlobalOptions({ maxInstances: 2 });

export {
    syncSongs,
    processSongTask,
    getSongsList
};

