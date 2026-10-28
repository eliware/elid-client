export function createDiscoveryUrl(issuerUrl) {
  const path = issuerUrl.pathname.replace(/\/$/u, "");
  return new URL(`${path}/.well-known/openid-configuration`, issuerUrl.origin);
}
