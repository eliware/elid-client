import { validateUrl } from "../../options/validate/url.mjs";

export function validateEndpoints(metadata) {
  for (const key of ["authorization_endpoint", "token_endpoint", "jwks_uri"]) {
    validateUrl(metadata[key], key, { allowLoopbackHttp: true, allowQuery: true });
  }
  for (const key of ["userinfo_endpoint", "revocation_endpoint"]) {
    if (metadata[key] !== undefined) {
      validateUrl(metadata[key], key, { allowLoopbackHttp: true, allowQuery: false });
    }
  }
}
