import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'stelfly-navy': '#002D5B',
        'stelfly-gold': '#C5A059',
        'stelfly-navy-light': '#003E7E',
        'stelfly-gold-light': '#D6B678',
      },
      borderRadius: {
        'sms': '4px', // Sharp corners as requested
      }
    },
  },
  plugins: [],
};
export default config;
