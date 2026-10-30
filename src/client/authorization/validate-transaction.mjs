import { validateTransactionState } from "./validate-transaction/state.mjs";
import { validateAuthorizationResponse } from "./validate-transaction/response.mjs";
import { validateSavedTransaction } from "./validate-transaction/saved.mjs";

export function validateTransaction(input, config) {
  const { code, state, transaction } = input;
  validateTransactionState(state, transaction);
  validateAuthorizationResponse(input);
  validateSavedTransaction(transaction, config);
  return { code, transaction };
}
