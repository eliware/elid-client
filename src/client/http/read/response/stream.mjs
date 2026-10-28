import { ElidClientError } from "../../../errors/client-error.mjs";
import { validateResponseSize } from "./size.mjs";

export async function readResponseStream(reader) {
  const decoder = new TextDecoder();
  const chunks = [];
  let byteLength = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return chunks.join("") + decoder.decode();
      byteLength += value.byteLength;
      let sizeError;
      try {
        validateResponseSize(byteLength);
      } catch (error) {
        sizeError = error;
        try {
          await reader.cancel();
        } catch {
          // Stop reading after the response exceeds the limit.
        }
        throw sizeError;
      }
      chunks.push(decoder.decode(value, { stream: true }));
    }
  } catch (error) {
    if (error instanceof ElidClientError) throw error;
    throw new ElidClientError(
      "invalid_response",
      "The identity provider response could not be read.",
    );
  }
}
