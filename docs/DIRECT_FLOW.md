# DIRECT_FLOW — runtime wiring (D7)

## Objective

Bind direct-mode building blocks into a single execution pipeline.

## Pipeline order

1. `inbound.normalizeBitrixInbound(payload)`
2. `token-lifecycle.resolveSendToken(...)`
3. optional `token-lifecycle.refreshAccessToken(...)`
4. `outbound.sendBitrixImbotMessage(...)`

## Implementation

- `src/direct-flow.ts`
- main function: `executeDirectFlow(input)`

## Input summary

- raw inbound payload
- reply text to send
- token state (`eventAuth` + `stored`)
- optional oauth refresh config (`clientId`, `clientSecret`, `tokenEndpoint`)

## Output summary

Structured execution result:
- `ok`
- `phase`
- normalized context (domain/dialog/session)
- token source + refresh flag
- outbound result id (when successful)
- explicit error (when failed)

## Notes

- D7 wires runtime flow primitives together.
- Final transport hooks in full channel runtime remain part of follow-up integration/testing blocks.
