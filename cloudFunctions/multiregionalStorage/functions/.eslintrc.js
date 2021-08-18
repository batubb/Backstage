module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'google'],
  rules: {
    quotes: 'off',
    camelcase: 'off',
    indent: 'off',
  },
  parserOptions: {
    ecmaVersion: 8,
  },
};
