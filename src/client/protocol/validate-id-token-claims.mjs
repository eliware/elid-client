import { validateIdTokenIdentity } from "./validate-id-token-claims/identity.mjs";
import { validateIdTokenParty } from "./validate-id-token-claims/party.mjs";
import { validateIdTokenNonce } from "./validate-id-token-claims/nonce.mjs";

export function validateIdTokenClaims(payload, options) {
  validateIdTokenIdentity(payload, options);
  validateIdTokenParty(payload, options);
  validateIdTokenNonce(payload, options);
  return payload;
}
