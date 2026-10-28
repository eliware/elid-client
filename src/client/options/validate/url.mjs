import { ElidClientError } from "../../errors/client-error.mjs";

export function validateUrl(value, name, { allowLoopbackHttp = false, allowQuery = false } = {}) {
  const authority =
    typeof value === "string" ? value.match(/^[a-z][a-z\d+.-]*:\/\/([^/?#]*)/iu)?.[1] : undefined;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ElidClientError("invalid_configuration", `${name} must be an absolute URL.`);
  }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(allowLoopbackHttp && loopback && url.protocol === "http:")) {
    throw new ElidClientError("invalid_configuration", `${name} must use HTTPS.`);
  }
  if (
    url.username ||
    url.password ||
    authority?.includes("@") ||
    (!allowQuery && url.search) ||
    url.hash
  ) {
    throw new ElidClientError("invalid_configuration", `${name} contains unsupported URL parts.`);
  }
  return url;
}
