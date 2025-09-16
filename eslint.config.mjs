// @ts-check

import eslint from "@eslint/js";
import prettierPluginRecommended from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  prettierPluginRecommended
);
