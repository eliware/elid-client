import { ElidClientError } from "../../../errors/client-error.mjs";

const maximumBytes = 1000000;

export function validateResponseSize(byteLength) {
  if (byteLength > maximumBytes) {
    throw new ElidClientError("invalid_response", "The identity provider response is too large.");
  }
}
