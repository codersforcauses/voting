import form from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**"],
  theme: {
    extend: {},
  },
  plugins: [form()],
};
