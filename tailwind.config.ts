import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: {
          DEFAULT: "#F5F0E8",
          light: "#FDFAF4",
        },
        brg: {
          DEFAULT: "#1B4332",
          hover: "#2D6A4F",
          light: "#E8F0EC",
        },
        racing: {
          red: "#C0392B",
        },
        border: "var(--border)",
        text: {
          primary: "#0A0A0A",
          secondary: "#4A4A4A",
          muted: "#8A8A8A",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
