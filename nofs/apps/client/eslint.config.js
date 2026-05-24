// apps/client/eslint.config.js
import { viteConfig } from "@repo/eslint-config/vite";

export default [
  ...viteConfig,
  {
    // You can add unique client modifications here if needed
    rules: {
      "react/prop-types": "off",
    },
  },
];
