import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', '.vercel/**', '.safety-backups/**', '.edit-recovery/**'] },
  {
    files: ['**/*.js'],
    rules: js.configs.recommended.rules,
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['api/**/*.js', 'test/**/*.js', '*.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.webworker } },
  },
];