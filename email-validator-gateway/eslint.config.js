import globals from "globals";
import pluginJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["node_modules/**/*", "dist/**/*", "*.config.js"], // Ignore node_modules, dist, and config files
  },

  pluginJs.configs.recommended,

  // TypeScript configuration
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      eqeqeq: "error", // Enforce strict equality
      "no-var": "warn", // Disallow using var
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-floating-promises": "error", // Require promises to be awaited or handled
      "@typescript-eslint/no-misused-promises": "error", // Prevent common mistakes with promises
      "@typescript-eslint/require-await": "warn", // Warn if async function doesn't use await
    },
  },

  // JavaScript configuration
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      eqeqeq: "error",
      "no-var": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
