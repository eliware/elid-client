import { ElidClientError } from "../../errors/client-error.mjs";

export function validateIdTokenNonce(payload, { nonce, allowMissingNonce = false }) {
  if ((!allowMissingNonce || payload.nonce !== undefined) && payload.nonce !== nonce) {
    throw new ElidClientError(
      "nonce_mismatch",
      "ID Token nonce does not match the authorization transaction.",
    );
  }
}
