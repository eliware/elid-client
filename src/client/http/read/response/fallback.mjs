import { ElidClientError } from "../../../errors/client-error.mjs";
import { validateResponseSize } from "./size.mjs";

export async function readResponseFallback(response) {
  let text;
  try {
    text = await response.text();
  } catch {
    throw new ElidClientError(
      "invalid_response",
      "The identity provider response could not be read.",
    );
  }
  validateResponseSize(new TextEncoder().encode(text).byteLength);
  return text;
}
