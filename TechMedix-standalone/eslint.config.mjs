import next from "eslint-config-next/core-web-vitals";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...next,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".vercel/**",
      "public/**",
      "**/*.html",
    ],
  },
  {
    // React 19's stricter react-hooks rules flag idiomatic, intentional
    // patterns (e.g. fetching in an effect, syncing a ref during render).
    // These are false-positives for this app's data-fetching style, so we
    // keep the core rules-of-hooks check active but disable the noisy ones.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default config;
