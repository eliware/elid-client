import { ElidClientError } from "../../errors/client-error.mjs";

export function validateScopes(scopes) {
  if (
    !Array.isArray(scopes) ||
    scopes.length === 0 ||
    scopes.some(
      (scope) => typeof scope !== "string" || !/^[\x21\x23-\x5B\x5D-\x7E]+$/.test(scope),
    ) ||
    new Set(scopes).size !== scopes.length ||
    !scopes.includes("openid")
  ) {
    throw new ElidClientError(
      "invalid_configuration",
      "scopes must contain unique OAuth scope values and include openid.",
    );
  }
  return [...scopes];
}
