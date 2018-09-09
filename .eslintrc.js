module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['airbnb', 'prettier', 'prettier/react'],
  plugins: ['react'],
  rules: {
    'no-console': [1, { allow: ['warn', 'error'] }],
    'arrow-body-style': 0,
    'react/jsx-filename-extension': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
}
