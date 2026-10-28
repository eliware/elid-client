import { ElidClientError } from "../errors/client-error.mjs";

export function validateTransaction(input, config) {
  const { code, state, transaction } = input;
  if (typeof transaction !== "object" || transaction === null) {
    throw new ElidClientError(
      "invalid_transaction",
      "The saved authorization transaction is invalid.",
    );
  }
  if (typeof state !== "string" || state.length === 0 || state !== transaction?.state) {
    throw new ElidClientError(
      "state_mismatch",
      "Authorization response state does not match the transaction.",
    );
  }
  if (input.error !== undefined) {
    const error = new ElidClientError(
      "authorization_error",
      "The user or issuer declined authorization.",
    );
    if (typeof input.error === "string") error.oauthCode = input.error;
    throw error;
  }
  if (typeof code !== "string" || code.length === 0) {
    throw new ElidClientError("invalid_argument", "code must be a nonempty string.");
  }
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
  return { code, transaction };
}
