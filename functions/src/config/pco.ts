import { PCO_CLIENT_ID, PCO_ACCESS_TOKEN } from "../config/secrets";

export function getPcoAuthHeader(): string {
  const credentials = Buffer
    .from(`${PCO_CLIENT_ID.value()}:${PCO_ACCESS_TOKEN.value()}`)
    .toString("base64");

  return `Basic ${credentials}`;
}
