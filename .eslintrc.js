module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    "shared-node-browser": true,
  },
  extends: [
    "plugin:react/recommended",
    "prettier",
    "prettier/react",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    ecmaVersion: 2019,
    sourceType: "module",
    jsx: true,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  plugins: ["react", "prettier", "@typescript-eslint", "import"],
  rules: {
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-empty-interface": "warn",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-shadow": [
      "warn",
      {
        hoist: "all",
      },
    ],
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-use-before-define": [
      "error",
      { functions: false, classes: false, variables: true },
    ],
    "@typescript-eslint/prefer-for-of": "warn",
    "@typescript-eslint/return-await": ["error", "never"],
    "@typescript-eslint/semi": "error",
    "@typescript-eslint/triple-slash-reference": "error",
    "@typescript-eslint/unified-signatures": "warn",
    "comma-dangle": ["error", "only-multiline"],
    "constructor-super": "error",
    eqeqeq: ["warn", "always"],
    "import/no-deprecated": "warn",
    "import/no-extraneous-dependencies": "error",
    "import/no-unassigned-import": "warn",
    "import/no-unresolved": "off",
    "import/prefer-default-export": "error",
    "no-cond-assign": "error",
    "no-console": "warn",
    "no-debugger": "warn",
    "no-duplicate-case": "error",
    "no-duplicate-imports": "error",
    "no-empty": [
      "error",
      {
        allowEmptyCatch: true,
      },
    ],
    "no-floating-promises": "off",
    "no-invalid-this": "off",
    "no-new-wrappers": "error",
    "no-param-reassign": "warn",
    "no-redeclare": "error",
    "no-return-await": "off",
    "no-sequences": "error",
    "no-shadow": "off",
    "no-throw-literal": "error",
    "no-unsafe-finally": "error",
    "no-unused-labels": "error",
    "no-var": "warn",
    "no-void": "warn",
    "prefer-const": "warn",
    "prefer-destructuring": "warn",
    "prettier/prettier": [
      "error",
      {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        trailingComma: "es5",
        jsxBracketSameLine: false,
        semi: true,
        singeQuote: false,
        quoteProps: "as-needed",
        jsxSingleQuote: false,
        bracketSpacing: true,
        arrowParens: "always",
        htmlWhitespaceSensitivity: "css",
        endOfLine: "lf",
        embeddedLanguageFormatting: "auto",
        allowEmptyCatch: true,
      },
    ],
    "react/prop-types": "warn",
  },
  settings: {
    jsdoc: {
      tagNamePreference: {
        returns: "return",
      },
    },
    react: {
      version: "detect",
    },
  },
};
