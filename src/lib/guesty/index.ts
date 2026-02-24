import { GuestyApiClient } from "./client";
import { GuestyService } from "./service";
import { MockGuestyService } from "./mock-service";

export type GuestyServiceType = GuestyService | MockGuestyService;

export function getGuestyService(): GuestyServiceType {
  const client = new GuestyApiClient();
  if (client.isConfigured()) {
    return new GuestyService(client);
  }
  return new MockGuestyService();
}
