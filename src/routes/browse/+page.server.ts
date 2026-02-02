import { PCO_API_DATA_SOURCE, PCO_CLIENT_ID, PCO_ACCESS_TOKEN } from "$env/static/private";
import { error } from "@sveltejs/kit";

export const load = async ({ url }) => {
    // Get params from URL or set defaults
    const perPage = Number(url.searchParams.get('per_page')) || 25;
    const page = Number(url.searchParams.get('page')) || 1;
    const offset = (page - 1) * perPage;

    const credentials = btoa(`${PCO_CLIENT_ID}:${PCO_ACCESS_TOKEN}`);

    // Build URL with dynamic paging
    const fetchUrl = `${PCO_API_DATA_SOURCE}/services/v2/songs?per_page=${perPage}&offset=${offset}`;
    
    const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        throw error(response.status, "Failed to fetch Planning Center data");
    }

    const result = await response.json();

    return {
        items: result.data,
        meta: result.meta, // Contains total_count (326)
        pagination: {
            page,
            perPage,
            totalPages: Math.ceil(result.meta.total_count / perPage)
        }
    };
};