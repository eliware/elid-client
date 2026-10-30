import { ElidClientError } from "../../errors/client-error.mjs";

export function readError(response) {
  return new ElidClientError(
    "http_error",
    "The identity provider rejected the request.",
    response.status,
  );
}
