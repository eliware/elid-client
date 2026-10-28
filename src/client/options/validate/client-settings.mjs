import { ElidClientError } from "../../errors/client-error.mjs";

export function validateClientSettings(options) {
  if (typeof options.clientId !== "string" || options.clientId.length === 0) {
    throw new ElidClientError("invalid_configuration", "clientId must be a nonempty string.");
  }
  if (
    options.clientSecret !== undefined &&
    (typeof options.clientSecret !== "string" || !options.clientSecret)
  ) {
    throw new ElidClientError(
      "invalid_configuration",
      "clientSecret must be a nonempty string when supplied.",
    );
  }
  if (!Number.isSafeInteger(options.timeoutMs ?? 5000) || (options.timeoutMs ?? 5000) < 1) {
    throw new ElidClientError("invalid_configuration", "timeoutMs must be a positive integer.");
  }
  if (
    !Number.isSafeInteger(options.metadataCacheMs ?? 300000) ||
    (options.metadataCacheMs ?? 300000) < 0
  ) {
    throw new ElidClientError(
      "invalid_configuration",
      "metadataCacheMs must be a nonnegative integer.",
    );
  }
  if (
    !Number.isSafeInteger(options.clockToleranceSeconds ?? 5) ||
    (options.clockToleranceSeconds ?? 5) < 0
  ) {
    throw new ElidClientError(
      "invalid_configuration",
      "clockToleranceSeconds must be a nonnegative integer.",
    );
  }
  if (
    !Number.isSafeInteger(options.maxIdTokenAgeSeconds ?? 86400) ||
    (options.maxIdTokenAgeSeconds ?? 86400) < 1
  ) {
    throw new ElidClientError(
      "invalid_configuration",
      "maxIdTokenAgeSeconds must be a positive integer.",
    );
  }
  if (typeof (options.fetch ?? globalThis.fetch) !== "function") {
    throw new ElidClientError("invalid_configuration", "fetch must be a function.");
  }
  if (typeof (options.now ?? Date.now) !== "function") {
    throw new ElidClientError("invalid_configuration", "now must be a function.");
  }
  if (
    options.logger !== undefined &&
    (options.logger === null ||
      typeof options.logger !== "object" ||
      typeof options.logger.info !== "function")
  ) {
    throw new ElidClientError("invalid_configuration", "logger must provide an info method.");
  }
  return {
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    timeoutMs: options.timeoutMs ?? 5000,
    metadataCacheMs: options.metadataCacheMs ?? 300000,
    clockToleranceSeconds: options.clockToleranceSeconds ?? 5,
    maxIdTokenAgeSeconds: options.maxIdTokenAgeSeconds ?? 86400,
    fetch: options.fetch ?? globalThis.fetch,
    now: options.now ?? Date.now,
    logger: options.logger,
  };
}
