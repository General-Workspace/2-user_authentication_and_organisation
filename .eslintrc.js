module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  overrides: [
    {
      files: ["tests/**/*.ts"],
      env: { node: true, jest: true },
    },
    {
      extends: ["plugin:@typescript-eslint/disabled-type-checked"],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
      },
    },
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs,mjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    project: true,
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
};
