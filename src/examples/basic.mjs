import { createGreeting } from "../create-greeting.mjs";

export function createBasicExampleGreeting(logger) {
  return createGreeting("Eli", { logger });
}
