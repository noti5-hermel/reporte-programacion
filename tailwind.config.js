/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background-primary': 'var(--bg-primary)',
        'background-secondary': 'var(--bg-secondary)',
        'button-primary': 'var(--btn-primary)',
        'button-primary-hover': 'var(--btn-hover)',
        'button-secondary': 'var(--btn-secondary)',
        'title': 'var(--text-title)',
        'subtitle': 'var(--text-subtitle)',
        'icon-bg': 'var(--icon-bg)',
        'border-card': 'var(--border-card)',
        // Compatibility mappings to automatically apply theme project-wide
        'background': 'var(--bg-primary)',
        'card': 'var(--bg-secondary)',
        'foreground': 'var(--text-title)',
        'border': 'var(--border-card)',
        'muted-foreground': 'var(--text-subtitle)',
        'primary': 'var(--btn-primary)',
        'primary-foreground': '#ffffff',
        'secondary': 'var(--btn-secondary)',
        'secondary-foreground': 'var(--text-title)',
      },
      boxShadow: {
        'card': 'var(--card-shadow)',
        'btn-glow': 'var(--btn-glow)',
        'btn-glow-hover': 'var(--btn-glow-hover)',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
