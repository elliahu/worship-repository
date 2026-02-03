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