import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172126",
        slate: "#5B6A72",
        sand: "#F3EFE7",
        oat: "#FAF7F0",
        mint: "#B4D6CD",
        moss: "#3E6A57",
        coral: "#E58D72",
        amber: "#E8B44D",
      },
      boxShadow: {
        card: "0 14px 40px rgba(23, 33, 38, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
