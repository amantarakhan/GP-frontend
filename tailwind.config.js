/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: "#1E40AF", light: "#EFF6FF", dark: "#1E3A8A" },
        corporate: { DEFAULT: "#1E293B" },
        success:   { DEFAULT: "#0D9488", light: "#F0FDFA" },
        warning:   { DEFAULT: "#D97706", light: "#FFFBEB" },
        danger:    { DEFAULT: "#EF4444", light: "#FEF2F2" },
        pearl:     "#F8FAFC",
        border:    "#E2E8F0",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};