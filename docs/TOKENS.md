# TOKENS — lifecycle hardening (B5)

## Objective

Make token behavior deterministic for both reply and proactive sends.

## Strategy

1. Prefer fresh token from inbound event auth (`event_auth`).
2. Fallback to stored token if event auth is missing.
3. Detect near-expiry (`expiresAt <= now + skew`) and mark `needsRefresh=true`.
4. If refresh material is available (`client_id`, `client_secret`, `refresh_token`) — perform refresh.

## Implementation

- `src/token-lifecycle.ts`
  - `resolveSendToken(input)`
    - returns selected token source and refresh signal
  - `refreshAccessToken(params)`
    - executes OAuth refresh_token flow

## Expected behavior

- Inbound-driven traffic: fresh event token used first.
- Proactive traffic: stored token used; refresh attempted when expired/near-expired.
- No silent fallback loops: missing token throws explicit error.

## Wiring note

B5 provides lifecycle primitives. Full integration into channel runtime flow is finalized in the next transport integration blocks.
