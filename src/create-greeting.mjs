import log from "@eliware/log";

export function createGreeting(name = "world", { logger = log } = {}) {
  const greeting = "Hello, " + name + "!";
  logger.info("Greeting created", { operation: "createGreeting" });
  return greeting;
}
