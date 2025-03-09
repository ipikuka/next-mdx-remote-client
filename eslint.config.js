import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import react from "eslint-plugin-react";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/archive/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/package-lock.json",
      "**/.DS_Store",
      "**/.vscode",
    ],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    plugins: {
      react,
      prettier: eslintPluginPrettier,
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["**/*.jsx", "tests/context/ExampleForm.mjs"],
    plugins: {
      react,
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
  },
  {
    files: ["src/csr/idle-callback-polyfill.js"],
    languageOptions: {
      sourceType: "script",
      globals: globals.browser,
    },
  },
  eslintConfigPrettier,
);
