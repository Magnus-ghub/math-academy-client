import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2D2DB5",
          50:  "#EBEBFB",
          100: "#C8C8F4",
          200: "#9393EC",
          300: "#6666E4",
          400: "#4646CC",
          500: "#2D2DB5",
          600: "#2424A0",
          700: "#1A1A85",
          800: "#10106A",
          900: "#08084F",
        },
        accent: {
          DEFAULT: "#F97316",
          50:  "#FFF3E8",
          100: "#FDD9B8",
          200: "#FBB87A",
          300: "#FA9A3C",
          400: "#F97316",
          500: "#E05C00",
          600: "#B84D00",
          700: "#8F3C00",
          800: "#662B00",
          900: "#3D1A00",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;