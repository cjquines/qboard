module.exports = {
  extends: "stylelint-config-standard",
  ignoreFiles: ["dist/**", "node_modules/**"],
  plugins: ["stylelint-scss"],
  rules: {
    "at-rule-disallowed-list": ["debug"],
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["function", "if", "each", "include", "mixin"],
      },
    ],
  },
};
