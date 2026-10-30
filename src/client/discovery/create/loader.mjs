import { requestJson } from "../../http/request-json.mjs";
import { createDiscoveryUrl } from "./discovery-url.mjs";
import { validateMetadata } from "../validate/metadata.mjs";

export function createMetadataLoader(config) {
  let cache;
  let pending;
  let expiresAt = 0;
  const logDebug = (message) => config.logger?.debug?.(message, { operation: "discoverIssuer" });
  return function loadMetadata() {
    if (cache && config.now() < expiresAt) {
      logDebug("Issuer metadata cache hit");
      return Promise.resolve(cache);
    }
    if (pending) {
      logDebug("Issuer metadata request already in progress");
      return pending;
    }
    logDebug("Issuer metadata request started");
    pending = (async () => {
      const metadata = await requestJson(config.fetch, createDiscoveryUrl(config.issuerUrl), {
        timeoutMs: config.timeoutMs,
      });
      cache = validateMetadata(metadata, config.issuer);
      expiresAt = config.now() + config.metadataCacheMs;
      config.logger?.info("Issuer metadata loaded", { operation: "discoverIssuer" });
      return cache;
    })();
    return pending.finally(() => {
      pending = undefined;
    });
  };
}
