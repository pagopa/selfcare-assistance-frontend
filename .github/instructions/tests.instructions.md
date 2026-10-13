---
applyTo: "**/*.test.ts,**/*.test.tsx,src/setupTests.ts,src/**/__mocks__/**"
---

# Unit test conventions

- Vitest (globals enabled) + React Testing Library; environment is jsdom.
- Tests sit in a `__tests__` folder next to the code under test, named `<Subject>.test.ts(x)`.
- `src/setupTests.ts` mocks `react-i18next` (`t` returns the key) and loads jest-dom matchers. Assert on translation keys, roles or labels; prefer `getByRole`/`getByLabelText` over test ids.
- `withLogin` is aliased to `src/__mocks__/@pagopa/selfcare-common-frontend/decorators/withLogin.tsx` in `vitest.config.ts`; service mocks live in `src/services/__mocks__`. Extend existing mocks instead of re-mocking.
- Service tests (`src/services/__tests__`) mock the API client and assert on calls.
- `restoreMocks` and `clearMocks` are enabled globally; keep tests deterministic (no real timers/network, use `vi.useFakeTimers()` when needed).
- Run a single file with `yarn vitest run <path>`.
