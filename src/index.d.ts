import type { LoggerWithConfiguredLevels } from "@eliware/log";

export type AuthorizationTransaction = {
  state: string;
  nonce?: string;
  codeVerifier: string;
  redirectUri: string;
  scopes: string[];
  resource?: string;
};

export type EliDClientOptions = {
  issuer: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  resource?: string;
  timeoutMs?: number;
  metadataCacheMs?: number;
  clockToleranceSeconds?: number;
  maxIdTokenAgeSeconds?: number;
  fetch?: typeof globalThis.fetch;
  now?: () => number;
  logger?: LoggerWithConfiguredLevels;
};

export type TokenSet = {
  accessToken: string;
  refreshToken?: string;
  tokenType: "Bearer";
  expiresIn?: number;
  scope?: string;
  idToken?: string;
  idTokenClaims?: Record<string, unknown>;
  identity?: { issuer: string; subject: string };
};

export type EliDClient = {
  discover(): Promise<Record<string, unknown>>;
  createAuthorizationRequest(): Promise<{
    authorizationUrl: string;
    transaction: AuthorizationTransaction;
  }>;
  exchangeAuthorizationCode(input: {
    code?: string;
    state: string;
    transaction: AuthorizationTransaction;
    error?: unknown;
  }): Promise<TokenSet>;
  getUserInfo(accessToken: string, expectedSubject: string): Promise<Record<string, unknown>>;
  refreshTokens(input: { refreshToken: string; nonce?: string }): Promise<TokenSet>;
  revokeToken(token: string, tokenTypeHint?: "access_token" | "refresh_token"): Promise<void>;
};

export class ElidClientError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly oauthCode?: string;
}

export function createEliDClient(options: EliDClientOptions): EliDClient;
