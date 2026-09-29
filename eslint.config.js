import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Allow the TanStack Router `Route` const, the favorites hook, and shadcn
      // cva variant helpers to live alongside their components.
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['Route', 'useFavorites', 'badgeVariants', 'buttonVariants'] },
      ],
    },
  },
])
