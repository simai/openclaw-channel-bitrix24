# COMPAT — compatibility mode and rollback switch (B6)

## Objective

Guarantee no-break migration while introducing channel plugin flow.

## Rule

- Safe baseline: `direct` path.
- `channel` path is enabled only when explicitly selected and fully configured.
- Any invalid/partial channel config triggers automatic rollback to `direct`.

## Compatibility guard

Implementation file:
- `src/compat.ts`

Function:
- `resolveCompatibilityMode(input)`

Input signals:
- selected mode (`direct`/`channel`)
- plugin enabled state
- direct config completeness
- channel config completeness

Output:
- `effectiveMode`
- `rollbackActive`
- explicit `reason`

## Rollback policy

Trigger rollback to direct when:
- plugin disabled,
- `mode=channel` but channel config incomplete,
- ambiguous/invalid mode state.

## Operational checklist

1. Set tenant to `direct` if any instability appears.
2. Send test message and confirm inbound `200` + outbound `result` id.
3. Keep channel mode disabled for tenant until issue root-cause is fixed.
