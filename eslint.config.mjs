import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  // ...tseslint.config.stylistic,

  {
    ignores: ['eslint.config.mjs', 'build/**/*', 'postcss.config.js', 'tailwind.config.js', 'vite.config.mjs'],
  },
  {
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // eslint-rules
  {
    rules: {
      'linebreak-style': ['error', 'unix'],
      'no-unused-vars': 'off',
      'no-warning-comments': 'warn',
      eqeqeq: 'error',
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  },

  // typescript-eslint rules
  {
    rules: {
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-parameter-properties': ['off'],
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: false,
          vars: 'all',
        },
      ],
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },

  // react
  reactPlugin.configs.flat.recommended,
  {
    plugins: {
      react: reactPlugin,
    },
    rules: {
      'react/self-closing-comp': ['error', { component: true, html: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // should come last
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'prettier/prettier': 'error',
    },
  },
);
