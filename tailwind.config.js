/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#E07A5F",
        secondary: "#81B29A",
        "background-light": "#F4F1DE",
        "background-dark": "#201512",
        "text-main": "#3D405B",
        "surface-light": "#FDFCF8",
      },
      fontFamily: {
        display: ["PlusJakartaSans_400Regular"],
        "display-medium": ["PlusJakartaSans_500Medium"],
        "display-semibold": ["PlusJakartaSans_600SemiBold"],
        "display-bold": ["PlusJakartaSans_700Bold"],
        serif: ["Fraunces_400Regular"],
        "serif-semibold": ["Fraunces_600SemiBold"],
      },
    },
  },
  plugins: [],
};
