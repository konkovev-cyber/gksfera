import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /**
       * Хромает по-русски: модификатор прозрачности цвета (`bg-brand-warm/12`,
       * `text-white/85`, `border-border/45`) Tailwind берёт из шкалы opacity.
       * В дефолтной шкале только 0,5,10,15,20,25,30,40,50,60,70,75,80,90,95,100,
       * поэтому значения вроде 12 или 85 молча не генерировались: класс висел в
       * разметке, а правила в CSS не было — подложка бейджа оставалась прозрачной.
       * Разрешаем любые целые проценты.
       */
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, i) => [i, String(i / 100)]),
      ),
      /**
       * Та же история со шкалой шага: `h-13` (кнопки в хиро и в CTA-секции)
       * в дефолтной шкале Tailwind нет — класс есть в разметке, правила в CSS
       * нет, кнопка оставалась 48px вместо задуманных 52px. Добавляем 13.
       */
      height: {
        '13': '3.25rem',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        display: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        /**
         * Прежние ключи назывались brand-warm/brand-teal — так же, как цвета
         * из theme.colors, и Tailwind выдавал на класс `bg-brand-warm` то
         * заливку, то градиент (победитель зависел от порядка генерации).
         * Переименовываем: градиент теперь вызывается явно —
         * `bg-brand-gradient-warm`, а `bg-brand-warm` — всегда сплошной цвет.
         */
        'brand-gradient-warm':
          'linear-gradient(135deg, hsl(var(--grad-warm-1)), hsl(var(--grad-warm-2)))',
        'brand-gradient-teal':
          'linear-gradient(135deg, hsl(var(--grad-teal-1)), hsl(var(--grad-teal-2)))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        xl: 'calc(var(--radius) + 0.5rem)',
        '2xl': 'calc(var(--radius) + 1rem)',
        '3xl': 'calc(var(--radius) + 2rem)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          2: 'hsl(var(--surface-2))',
        },
        hairline: 'hsl(var(--hairline))',
        scrim: 'hsl(var(--scrim))',
        'on-scrim': 'hsl(var(--on-scrim))',
        // Чернила светлых плашек поверх фото (.glass-frost / .paper-plate).
        // В тёмной теме не переворачиваются: подложка принадлежит кадру.
        frost: {
          ink: 'hsl(var(--frost-ink))',
          muted: 'hsl(var(--frost-ink-muted))',
        },
        // Фирменные чернила для светлых плашек поверх фото: в отличие от
        // brand-*-ink сюда заглядывает тёмная тема, и белая пилюля не должна
        // от этого светлеть (замер: 1.81:1 на brand-warm-ink в dark).
        plate: {
          warm: 'hsl(var(--plate-warm-ink))',
          teal: 'hsl(var(--plate-teal-ink))',
        },
        panel: {
          DEFAULT: 'hsl(var(--panel))',
          2: 'hsl(var(--panel-2))',
          foreground: 'hsl(var(--on-panel))',
        },
        brand: {
          warm: 'hsl(var(--brand-warm))',
          // «Чернильные» тона — те же акценты, но годные для мелкого текста:
          // brand-warm на белом даёт 2.46:1, brand-warm-ink — 5.9:1.
          'warm-ink': 'hsl(var(--brand-warm-ink))',
          'teal-ink': 'hsl(var(--brand-teal-ink))',
          'warm-light': 'hsl(var(--brand-warm-light))',
          teal: 'hsl(var(--brand-teal))',
          'teal-light': 'hsl(var(--brand-teal-light))',
          cream: 'hsl(var(--brand-cream))',
          sand: 'hsl(var(--brand-sand))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(20px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(20px) rotate(-360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
