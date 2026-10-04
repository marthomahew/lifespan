import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const impurity = [
  {
    selector: "MemberExpression[object.name='Math'][property.name='random']",
    message: 'Use the seeded RNG in game state, not Math.random.',
  },
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: 'The engine is pure: no Date.now(). Timestamps come from the platform layer.',
  },
  {
    selector: "NewExpression[callee.name='Date']",
    message: 'The engine is pure: no new Date(). Timestamps come from the platform layer.',
  },
  {
    selector: "MemberExpression[object.name='Date'][property.name='now']",
    message: 'The engine is pure: no Date.now.',
  },
  {
    selector: "CallExpression[callee.name='Date']",
    message: 'The engine is pure: no Date().',
  },
  {
    selector: "MemberExpression[object.name='Math'][computed=true]",
    message: 'Use the seeded RNG in game state, not Math.random (no computed Math access).',
  },
  {
    selector: "VariableDeclarator[init.name='Math'] > ObjectPattern",
    message: 'Use the seeded RNG in game state, not Math.random (no destructuring Math).',
  },
  {
    selector: "MemberExpression[object.name='Date'][computed=true]",
    message: 'The engine is pure: no Date access.',
  },
];

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'out/**',
      'dist/**',
      'dist-web/**',
      'release/**',
      'release-final/**',
      'reports/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
      'no-console': 'off',
    },
  },
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    files: ['src/engine/**/*.ts', 'src/content/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...impurity],
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'The engine is pure: no DOM.' },
        { name: 'document', message: 'The engine is pure: no DOM.' },
        { name: 'localStorage', message: 'The engine is pure: no I/O.' },
        { name: 'process', message: 'The engine is pure: no Node APIs.' },
        { name: 'fetch', message: 'The engine is pure: no I/O.' },
        { name: 'performance', message: 'The engine is pure: no clocks.' },
        { name: 'setTimeout', message: 'The engine is pure: no timers.' },
        { name: 'globalThis', message: 'The engine is pure: no global access.' },
        { name: 'self', message: 'The engine is pure: no global access.' },
        { name: 'crypto', message: 'Use the seeded RNG in game state.' },
        { name: 'require', message: 'The engine is pure: no require.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*', 'fs', 'path', 'os', 'child_process', 'electron'],
              message: 'The engine is pure.',
            },
            {
              group: ['react', 'react-dom', '**/renderer/**', '**/main/**'],
              message: 'The engine is pure.',
            },
          ],
        },
      ],
    },
  },
);
