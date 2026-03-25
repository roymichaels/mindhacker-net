import type { Config } from "tailwindcss";
import baseConfig from "../../tailwind.config";

export default {
  ...baseConfig,
  content: [
    "../../src/**/*.{ts,tsx}",
    "../../api/**/*.{ts,tsx}",
    "./index.html",
  ],
} satisfies Config;
