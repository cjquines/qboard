module.exports = {
  extends: "stylelint-config-standard",
  plugins: ["stylelint-scss"],
  rules: {
    "at-rule-blacklist": ["debug"],
    "at-rule-no-unknown": {
      ignoreAtRules: ["function", "if", "each", "include", "mixin"],
    },
  },
};
