import { readResponseFallback } from "./fallback.mjs";
import { readResponseStream } from "./stream.mjs";

export async function readResponseText(response) {
  const reader = response.body?.getReader?.();
  if (reader) return readResponseStream(reader);
  return readResponseFallback(response);
}
