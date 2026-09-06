/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // shadcn-style color tokens; components/ui defines its own --ic-* values
      // via CSS variables, so these map Tailwind utilities to those variables.
      colors: {
        border: 'var(--ic-border)',
        input: 'var(--ic-input)',
        ring: 'var(--ic-ring)',
        background: 'var(--ic-background)',
        foreground: 'var(--ic-foreground)',
        primary: {
          DEFAULT: 'var(--ic-primary)',
          foreground: 'var(--ic-background)'
        },
        secondary: {
          DEFAULT: 'var(--ic-secondary)',
          foreground: 'var(--ic-background)'
        },
        destructive: {
          DEFAULT: 'var(--ic-destructive)',
          foreground: '#ffffff'
        },
        muted: {
          DEFAULT: 'var(--ic-muted)',
          foreground: 'var(--ic-muted-foreground)'
        },
        accent: {
          DEFAULT: 'var(--ic-accent)',
          foreground: 'var(--ic-accent-foreground)'
        },
        card: {
          DEFAULT: 'var(--ic-card)',
          foreground: 'var(--ic-card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--ic-card)',
          foreground: 'var(--ic-popover-foreground)'
        }
      }
    }
  },
  plugins: []
}
