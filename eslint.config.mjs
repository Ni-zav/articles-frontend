import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // JavaScript recommended
  js.configs.recommended,

  // Next.js recommended config via compat
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // TypeScript + project overrides and rule customizations
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: false
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      next: nextPlugin
    },
    rules: {
      // Requested global disables/tweaks
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",

      // Allow console across project so eslint-disable no-console isn't needed
      "no-console": "off",

      // Ensure the rule exists; disable if you want to allow any for now
      "@typescript-eslint/no-explicit-any": "off",

      // If you want to keep <a> tags for internal routes, uncomment next line:
      "@next/next/no-html-link-for-pages": "off",
    }
  }
];
