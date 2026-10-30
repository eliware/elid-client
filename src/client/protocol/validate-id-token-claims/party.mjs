import { ElidClientError } from "../../errors/client-error.mjs";

export function validateIdTokenParty(payload, { clientId }) {
  if (payload.azp !== undefined && (typeof payload.azp !== "string" || payload.azp !== clientId)) {
    throw new ElidClientError(
      "invalid_id_token",
      "ID Token authorized party does not match the client.",
    );
  }
  if (
    Array.isArray(payload.aud) &&
    payload.aud.length > 1 &&
    (typeof payload.azp !== "string" || payload.azp !== clientId)
  ) {
    throw new ElidClientError(
      "invalid_id_token",
      "ID Token audience requires a matching authorized party.",
    );
  }
}
