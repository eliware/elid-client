import { validateClientSettings } from "./client-settings.mjs";
import { validateScopes } from "./scopes.mjs";
import { validateUrl } from "./url.mjs";

export function validateOptions(options = {}) {
  const issuerUrl = validateUrl(options.issuer, "issuer", { allowLoopbackHttp: true });
  validateUrl(options.redirectUri, "redirectUri");
  const settings = validateClientSettings(options);
  const resourceUrl =
    options.resource === undefined
      ? undefined
      : validateUrl(options.resource, "resource", { allowQuery: true });
  return {
    issuer: options.issuer,
    issuerUrl,
    ...settings,
    redirectUri: options.redirectUri,
    scopes: validateScopes(options.scopes),
    resource: resourceUrl ? options.resource : undefined,
  };
}
