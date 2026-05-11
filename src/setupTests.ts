// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

// Suppress react-i18next warnings in tests
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
  withTranslation: () => (Component: any) => {
    // eslint-disable-next-line functional/immutable-data
    Component.defaultProps = { ...Component.defaultProps, t: (key: string) => key };
    return Component;
  },
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));
