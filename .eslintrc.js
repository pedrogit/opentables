module.exports = {
  parser: "@babel/eslint-parser",
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:react/recommended", "airbnb", "prettier"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "prettier"],
  rules: {
    "react/prop-types": 0,
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
    "react/jsx-filename-extension": "off",
    "no-console": "off",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
  },
};
