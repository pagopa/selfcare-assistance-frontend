---
applyTo: "src/locale/**"
---

# Locale files

- Files: `it.ts`, `en.ts`, `fr.ts`, `de.ts`, `sl.ts`; each is a default-exported nested object registered in `src/locale/index.ts`.
- Every key must exist in **all five** files with the same nesting. Italian (`it`) is the default and fallback language.
- Keys are camelCase and grouped by feature/component.
- Use i18next interpolation (`{{name}}`) with identical placeholders across languages.
- If a translation is unknown, add the English text rather than omitting the key, and mention it in the PR.
