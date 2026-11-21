// Flat config for the whole monorepo. Basic rules only (not type-checked), see PLAN section 2.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    // Allow unused args prefixed with _ (Express error handlers need all four params).
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  {
    files: ['apps/api/**/*.ts', 'packages/**/*.ts', '*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    // components/ui stays generic: it must never import feature code (PLAN section 2).
    files: ['apps/web/src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/features/**'], message: 'components/ui must not import from features/.' },
          ],
        },
      ],
    },
  },
  // Must stay last: turns off rules that clash with Prettier.
  prettier,
);
