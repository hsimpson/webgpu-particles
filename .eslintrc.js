module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'import', 'deprecation'],
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
    eqeqeq: 'error',
    'deprecation/deprecation': 'warn',
    'import/no-deprecated': 'warn',
    'import/no-unresolved': 'error',
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    'no-unused-vars': 'off',
    'no-warning-comments': 'warn',
    'prettier/prettier': 'error',
    quotes: ['error', 'single'],
    'react/self-closing-comp': ['error', { component: true, html: true }],
    semi: ['error', 'always'],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      'eslint-import-resolver-typescript': true,
    },
    /*
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`

        // Choose from one of the "project" configs below or omit to use <root>/tsconfig.json by default

        // use <root>/path/to/folder/tsconfig.json
        "project": "./tsconfig.json"
      }
    }
    */
  },
};
