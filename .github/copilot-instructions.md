# Copilot instructions

SelfCare assistance page (PagoPA): React 18 + TypeScript SPA built with Vite, MUI v5 and `@pagopa/mui-italia`. Node >= 24 (see `.node-version`), yarn 1 (classic).

## Commands

- `yarn start` – dev server
- `yarn build` – runs `generate`, then `tsc -b` and `vite build`
- `yarn generate` – regenerates the dashboard API client into `src/api/generated/b4f-dashboard` from `openApi/dashboard-api-docs.json` (do not edit generated files; adjust `openApi/scripts/*` fix scripts instead)
- `yarn test` – Vitest (jsdom); single file: `yarn vitest run src/path/to/file.test.tsx`
- `yarn test:coverage`
- `yarn lint` / `yarn lint-autofix`, `yarn prettify`

## Architecture

- `src/api` – `DashboardApiClient` wrapping the generated io-ts client.
- `src/services` – `assistanceService.ts` and its mocks (`src/services/__mocks__`).
- `src/pages/Assistance` – the assistance form page; `src/components/Layout` – shared layout.
- `src/redux` – Redux Toolkit store; `src/utils` (constants, `env.ts`).
- `src/locale` – i18next translations (`it`, `en`, `fr`, `de`, `sl`); every user-facing string must go through `t()` and be added to all locales.
- Shared auth/session/error handling comes from `@pagopa/selfcare-common-frontend`.

## Environment and mocks

- Config comes from `.env`, `.env.development.local` and `.env.test.local`, read via `import.meta.env` (typed in `src/vite-env.d.ts`) and exposed through `ENV` in `src/utils/env.ts`. Add new `VITE_*` variables to `vite-env.d.ts` and `.env`.
- `VITE_API_MOCK_ASSISTANCE=true` enables mock behavior for the assistance API.
- `yarn generate` must be run before type-check/tests; generated clients are gitignored.

## Conventions

- Prettier: 100 cols, semicolons, single quotes, trailing commas `es5`.
- ESLint (`.eslintrc.js`) includes sonarjs, functional and react-hooks rules; keep lint clean.
- Functional components with hooks; Formik for forms; fp-ts/io-ts for decoding API responses.
- Tests live in `__tests__` folders next to the code, using Vitest + React Testing Library; globals are enabled and setup is in `src/setupTests.ts`.
- Routing is React Router v5 (`useHistory`, `useLocation`); do not use v6 APIs.
- `src/setupTests.ts` mocks `react-i18next` so `t(key)` returns the key: assert on keys. `withLogin` is aliased to a mock in `src/__mocks__` via `vitest.config.ts`; `restoreMocks`/`clearMocks` are on.
- Type-check with `yarn tsc --noEmit`; a change is done when type-check, lint and the relevant tests pass.
- Detailed path-specific rules live in `.github/instructions/` (`locale`, `tests`, `ui`); API calls go through `src/services`, not directly from components.
- Never commit secrets.
