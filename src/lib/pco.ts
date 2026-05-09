import { rateLimitedFetch } from "./rateLimitedFetch";

export function getPcoAuthHeader(
  clientId: string,
  accessToken: string,
): string {
  const credentials = Buffer.from(`${clientId}:${accessToken}`).toString(
    "base64",
  );

  return `Basic ${credentials}`;
}
