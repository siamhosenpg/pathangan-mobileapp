/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // ✅ system অনুযায়ী dark mode
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: "#00914d",
        "accent-secondary": "#009439",
        "accent-transparent": "#09330946",

        // ✅ Light

        text: "#1b1b1b",
        "text-secondary": "#3a3a3a",
        "text-tertiary": "#6d6d6d",
        background: "#ffffff",
        "background-secondary": "#f7f7f7",
        "background-tertiary": "#dddddd",
        "background-transparent": "#0000003b",
        foreground: "#1b1b1b",
        border: "#e7e7e7",

        // ✅ Dark
        dark: {
          accent: "#00914d",
          "accent-secondary": "#22c55e",
          text: "#f1f1f1",
          "text-secondary": "#c4c4c4",
          "text-tertiary": "#8a8a8a",
          background: "#0f0f0f",
          "background-secondary": "#1a1a1a",
          "background-tertiary": "#2a2a2a",
          "background-transparent": "#ffffff1a",
          foreground: "#f1f1f1",
          border: "#2e2e2e",
        },
      },
    },
  },
  plugins: [],
};
