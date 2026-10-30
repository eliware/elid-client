import { ElidClientError } from "../../errors/client-error.mjs";

export function validateAuthorizationResponse(input) {
  if (input.error !== undefined) {
    const error = new ElidClientError(
      "authorization_error",
      "The user or issuer declined authorization.",
    );
    if (typeof input.error === "string") error.oauthCode = input.error;
    throw error;
  }
  if (typeof input.code !== "string" || input.code.length === 0) {
    throw new ElidClientError("invalid_argument", "code must be a nonempty string.");
  }
}
