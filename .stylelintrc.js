module.exports = {
  extends: "stylelint-config-standard",
  ignoreFiles: ["dist/**", "node_modules/**"],
  plugins: ["stylelint-scss"],
  rules: {
    "at-rule-disallowed-list": ["debug"],
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["function", "if", "each", "include", "mixin", "use"],
      },
    ],
    "no-invalid-position-at-import-rule": null,
    "selector-class-pattern": null,
    "selector-id-pattern": null,
  },
};
