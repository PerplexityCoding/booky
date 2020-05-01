module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/recommended", "@vue/prettier"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
  },
  globals: {
    chrome: "readable",
  },
  ignorePatterns: ["lib/smooth-dnd/", "node_modules/"],
};
