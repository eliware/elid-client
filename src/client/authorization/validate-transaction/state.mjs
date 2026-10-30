import { ElidClientError } from "../../errors/client-error.mjs";

export function validateTransactionState(state, transaction) {
  if (typeof transaction !== "object" || transaction === null) {
    throw new ElidClientError(
      "invalid_transaction",
      "The saved authorization transaction is invalid.",
    );
  }
  if (typeof state !== "string" || state.length === 0 || state !== transaction.state) {
    throw new ElidClientError(
      "state_mismatch",
      "Authorization response state does not match the transaction.",
    );
  }
}
