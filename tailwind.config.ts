import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        "tertiary-fixed-dim": "#c8c6c6",
        "on-tertiary-container": "#3b3b3b",
        "inverse-on-surface": "#f1f1f1",
        "on-tertiary-fixed-variant": "#474747",
        "tertiary-fixed": "#e4e2e2",
        "primary-fixed": "#e5e2e1",
        "on-surface-variant": "#4e4639",
        "on-secondary-container": "#785a1a",
        "inverse-primary": "#c8c6c5",
        "on-tertiary-fixed": "#1b1c1c",
        "on-surface": "#1a1c1c",
        "surface-container-highest": "#e2e2e2",
        "primary-fixed-dim": "#c8c6c5",
        "on-tertiary": "#ffffff",
        "secondary-fixed": "#ffdea5",
        "surface-dim": "#dadada",
        "on-primary-container": "#3b3b3b",
        "on-secondary-fixed": "#261900",
        "surface-tint": "#5f5e5e",
        "surface-container-high": "#e8e8e8",
        "surface-container": "#eeeeee",
        "surface-container-low": "#f3f3f3",
        "secondary-container": "#fed488",
        "on-primary-fixed": "#1c1b1b",
        "on-secondary-fixed-variant": "#5d4201",
        "surface-bright": "#f9f9f9",
        "surface-container-lowest": "#ffffff",
        "on-secondary": "#ffffff",
        "outline-variant": "#d1c5b4",
        "inverse-surface": "#2f3131",
        "tertiary-container": "#a6a5a5",
        "on-primary": "#ffffff",
        "surface": "#f9f9f9",
        "secondary-fixed-dim": "#e9c176",
        "surface-variant": "#e2e2e2",
        "on-error": "#ffffff",
        "on-primary-fixed-variant": "#474746",
        "on-background": "#1a1c1c",
      },
      fontFamily: {
        headline: ['var(--font-noto-serif)', 'serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
        label: ['var(--font-manrope)', 'sans-serif']
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
export default config
