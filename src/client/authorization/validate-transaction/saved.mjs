import { ElidClientError } from "../../errors/client-error.mjs";

export function validateSavedTransaction(transaction, config) {
  if (
    (config.scopes.includes("openid") &&
      (typeof transaction.nonce !== "string" || transaction.nonce.length === 0)) ||
    (!config.scopes.includes("openid") && transaction.nonce !== undefined) ||
    typeof transaction.codeVerifier !== "string" ||
    !/^[A-Za-z0-9._~-]{43,128}$/.test(transaction.codeVerifier) ||
    transaction.redirectUri !== config.redirectUri ||
    !Array.isArray(transaction.scopes) ||
    transaction.scopes.join(" ") !== config.scopes.join(" ") ||
    transaction.resource !== config.resource
  ) {
    throw new ElidClientError(
      "invalid_transaction",
      "The saved authorization transaction is invalid.",
    );
  }
}
