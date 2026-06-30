import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "app.js",
      "tweaks-app.jsx",
      "tweaks-panel.jsx",
      "public/app.js",
      "public/tweaks-app.jsx",
      "public/tweaks-panel.jsx"
    ]
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;
