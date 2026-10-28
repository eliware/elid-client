export class ElidClientError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = "ElidClientError";
    this.code = code;
    if (status !== undefined) this.status = status;
  }
}
