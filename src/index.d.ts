import type { LoggerWithConfiguredLevels } from "@eliware/log";

export function createGreeting(
  name?: string,
  options?: { logger?: LoggerWithConfiguredLevels },
): string;
