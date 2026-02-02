import { defineSecret, defineString } from "firebase-functions/params";

export const PCO_API_DATA_SOURCE = defineString("PCO_API_DATA_SOURCE");
export const PCO_CLIENT_ID = defineSecret("PCO_CLIENT_ID");
export const PCO_ACCESS_TOKEN = defineSecret("PCO_ACCESS_TOKEN");