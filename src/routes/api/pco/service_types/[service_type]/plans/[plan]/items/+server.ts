import { env } from "$env/dynamic/private";
import { getPcoAuthHeader } from "$lib/pco";
import { rateLimitedFetch } from "$lib/rateLimitedFetch";
import { json } from "@sveltejs/kit";

export async function GET({ params }) {
  const { service_type, plan } = params;

  const res = await rateLimitedFetch(
    `${env.PCO_API_DATA_SOURCE}/services/v2/service_types/${service_type}/plans/${plan}/items`,
    {
      headers: {
        Authorization: `${getPcoAuthHeader(env.PCO_CLIENT_ID!, env.PCO_ACCESS_TOKEN!)}`,
      },
    },
  );

  const data = await res.json();

  return json(data);
}
