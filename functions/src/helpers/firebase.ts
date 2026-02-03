import * as admin from "firebase-admin";

const app = admin.apps.length
  ? admin.app()
  : admin.initializeApp();

export const db = app.firestore();

export const deepSanitize = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(item => deepSanitize(item));
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => [key, deepSanitize(value)])
        );
    }
    return obj;
};

