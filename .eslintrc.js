module.exports = {
  parser: "@typescript-eslint/parser",

  extends: [
    "plugin:react/recommended",
    "eslint-config-airbnb",
    "prettier",
    "prettier/react",
  ],
  plugins: ["react", "prettier"],
  env: {
    es6: true,
    browser: true,
    node: true,
    "shared-node-browser": true,
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
    jsx: true,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  rules: {
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
      },
    ],
    "no-var": 2,
    "no-const-assign": "error",
    "prefer-template": "error",
    "prefer-const": "error",
    "prefer-spread": "error",
    eqeqeq: ["error", "always"],
    semi: ["error", "always"],
    "default-case": 2,
    "template-curly-spacing": 0, // Prettier.
    "arrow-parens": 0, // Does not work with Flow generic types
    "consistent-return": 0, // Flow.
    // Prefer new line before return
    // http://eslint.org/docs/rules/newline-before-return
    "newline-before-return": "error",
    "no-use-before-define": [
      "error",
      { functions: false, classes: false, variables: true },
    ],
    "import/no-extraneous-dependencies": 0,
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "no-return-await": 0,
    "no-restricted-syntax": 0,
    "no-underscore-dangle": 0,
    "import/first": 0,
    "no-restricted-globals": 1,
    "no-useless-escape": 1,
    // was not working when used with flow prop types
    "no-unused-vars": 1,
    "react/no-unused-prop-types": 1,
    // require or disallow Yoda conditions
    // https://eslint.org/docs/rules/yoda
    yoda: ["error", "never", { exceptRange: true }],
    // Require modules with a single export to use a default export
    // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/prefer-default-export.md
    "import/prefer-default-export": 0,

    "global-require": 0, // Used by webpack isomorphic tools and React Native.
    "no-console": 0, // we are enabling this in the scripts
    "no-debugger": 0, // we are enabling this in the scripts
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    quotes: ["error", "double", { avoidEscape: true }],
    // React control override.
    "react/display-name": 0,
    "react/forbid-prop-types": 0, // using Flow types.
    "react/jsx-closing-bracket-location": 0, // Prettier.
    "react/jsx-filename-extension": 0, // JSX belongs to .js files.
    "react/jsx-indent": 0, // Prettier.
    "react/jsx-indent-props": 0, // Prettier.
    "react/jsx-wrap-multilines": 0, // Prettier.
    "react/no-danger": 0, // Control freaky.
    "react/no-unescaped-entities": 0, // Prettier.
    "react/prop-types": 0, // Flow.
    "react/require-default-props": 0, // Flow.
    "react/jsx-no-bind": 2,
    "react/prefer-stateless-function": [2, { ignorePureComponents: true }],
  },
  settings: {
    polyfills: ["promises"],
    flowtype: {
      onlyFilesWithFlowAnnotation: false,
    },
  },
};
