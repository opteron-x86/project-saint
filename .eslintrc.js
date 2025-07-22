// .eslintrc.js
module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript'
    ],
    plugins: ['@typescript-eslint', 'react', 'import'],
    env: {
      browser: true,
      es2021: true
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // Customize your rules as needed to prevent eslint errors.
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'import/order': ['error', { 'newlines-between': 'always' }]
    }
  }
  