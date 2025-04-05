/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#10b981",
          "primary-focus": "#059669",
          "primary-content": "#ffffff",
          "secondary": "#3b82f6",
          "secondary-focus": "#2563eb",
          "secondary-content": "#ffffff",
          "accent": "#8b5cf6",
          "accent-focus": "#7c3aed",
          "accent-content": "#ffffff",
          "neutral": "#1f2937",
          "neutral-focus": "#111827",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          "base-content": "#1f2937",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      {
        dark: {
          "primary": "#10b981",
          "primary-focus": "#059669",
          "primary-content": "#ffffff",
          "secondary": "#3b82f6",
          "secondary-focus": "#2563eb",
          "secondary-content": "#ffffff",
          "accent": "#8b5cf6",
          "accent-focus": "#7c3aed",
          "accent-content": "#ffffff",
          "neutral": "#374151",
          "neutral-focus": "#1f2937",
          "neutral-content": "#ffffff",
          "base-100": "#1f2937",
          "base-200": "#111827",
          "base-300": "#374151",
          "base-content": "#f9fafb",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  },
}