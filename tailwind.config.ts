import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./scripts/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0EA5E9",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /bg-(blue|purple|emerald|rose|amber|cyan|indigo|fuchsia|orange|lime|red|green|yellow|slate|gray|zinc|neutral|stone|pink|violet|sky|teal|white|black)-(50|100|200|300|400|500|600|700|800|900)?(\/(5|10|20|25|30|40|50|60|70|75|80|90|95|100))?/,
      variants: ['hover', 'focus', 'active', 'group-hover', 'before', 'after'],
    },
    {
      pattern: /text-(blue|purple|emerald|rose|amber|cyan|indigo|fuchsia|orange|lime|red|green|yellow|slate|gray|zinc|neutral|stone|pink|violet|sky|teal|white|black)-(50|100|200|300|400|500|600|700|800|900)?(\/(5|10|20|25|30|40|50|60|70|75|80|90|95|100))?/,
      variants: ['hover', 'focus', 'active', 'group-hover', 'before', 'after'],
    },
    {
      pattern: /border-(blue|purple|emerald|rose|amber|cyan|indigo|fuchsia|orange|lime|red|green|yellow|slate|gray|zinc|neutral|stone|pink|violet|sky|teal|white|black)-(50|100|200|300|400|500|600|700|800|900)?(\/(5|10|20|25|30|40|50|60|70|75|80|90|95|100))?/,
      variants: ['hover', 'focus', 'active', 'group-hover', 'before', 'after'],
    },
    {
      pattern: /backdrop-blur-(none|sm|md|lg|xl|2xl|3xl)/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /ring-(blue|purple|emerald|rose|amber|cyan|indigo|fuchsia|orange|lime|red|green|yellow|slate|gray|zinc|neutral|stone|pink|violet|sky|teal)-(50|100|200|300|400|500|600|700|800|900)(\/(10|20|30|40|50|60|70|80|90|100))?/,
      variants: ['hover', 'focus', 'active', 'group-hover'],
    },
    {
      pattern: /shadow-(blue|purple|emerald|rose|amber|cyan|indigo|fuchsia|orange|lime|red|green|yellow|slate|gray|zinc|neutral|stone|pink|violet|sky|teal)-(50|100|200|300|400|500|600|700|800|900)(\/(10|20|30|40|50|60|70|80|90|100))?/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern: /to-(blue|purple|emerald|rose|amber|cyan|indigo|fuchsia|orange|lime|red|green|yellow|slate|gray|zinc|neutral|stone|pink|violet|sky|teal)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /from-(blue|purple|emerald|rose|amber|cyan|indigo|fuchsia|orange|lime|red|green|yellow|slate|gray|zinc|neutral|stone|pink|violet|sky|teal)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /via-(blue|purple|emerald|rose|amber|cyan|indigo|fuchsia|orange|lime|red|green|yellow|slate|gray|zinc|neutral|stone|pink|violet|sky|teal)-(50|100|200|300|400|500|600|700|800|900)/,
    },
  ],
};

export default config;
```
