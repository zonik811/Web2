import { shadows, glass } from "../tokens/effects";
// import { palette } from "../tokens/colors"; // Used in implementation details

export type ButtonIntent = 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'white';
export type ButtonStyle = 'modern' | 'neobrutalism' | 'glass' | 'cyber' | 'minimal' | '3d' | 'gradient' | 'cosmic' | 'magnetic' | 'pixel';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export const buttonComposition = {
    base: "relative inline-flex items-center justify-center transition-all duration-300 overflow-hidden font-medium disabled:opacity-50 disabled:pointer-events-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

    variants: {
        intent: {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            accent: "bg-purple-600 text-white hover:bg-purple-700",
            ghost: "hover:bg-accent hover:text-accent-foreground bg-transparent",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            white: "bg-white text-slate-900 hover:bg-slate-100"
        },

        style: {
            modern: "rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5",

            neobrutalism: `rounded-none border-2 border-black ${shadows.neobrutalism} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide font-bold active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`,

            glass: `rounded-xl ${glass.md} hover:bg-white/25 text-white border-white/30`,

            cyber: "rounded-none border-b-4 border-cyan-500 hover:text-cyan-400 bg-slate-900 text-cyan-500 font-mono clip-path-polygon-[0_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%]",

            minimal: "bg-transparent hover:bg-transparent shadow-none border-b border-current rounded-none px-0 hover:border-b-2",

            "3d": "rounded-lg border-b-4 border-primary-foreground/30 active:border-b-0 active:translate-y-1 bg-opacity-100",

            gradient: "rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:bg-[length:200%_200%] animate-gradient shadow-lg border-0",

            cosmic: "rounded-full bg-slate-900 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-purple-500/50 hover:shadow-[0_0_25px_rgba(124,58,237,0.8)] hover:border-purple-500",

            magnetic: "rounded-full border border-current hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-colors duration-500",

            pixel: "rounded-none border-2 border-black font-mono shadow-[4px_0_0_0_black,0_4px_0_0_black,4px_4px_0_0_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none"
        },

        size: {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-8 text-sm",
            lg: "h-14 px-10 text-base",
            xl: "h-16 px-12 text-lg"
        }
    },

    defaultVariants: {
        intent: 'primary',
        style: 'modern',
        size: 'md'
    }
};

/**
 * Helper to get classes based on selection
 */
export const getButtonClasses = (
    intent: ButtonIntent = 'primary',
    style: ButtonStyle = 'modern',
    size: ButtonSize = 'md'
): string => {
    const base = buttonComposition.base;

    // Intent logic overrides might be needed for specific styles (e.g. Glass ignores bg-primary)
    let intentClass = buttonComposition.variants.intent[intent];
    const styleClass = buttonComposition.variants.style[style];
    const sizeClass = buttonComposition.variants.size[size];

    // Specific Overrides for compatibility
    if (style === 'glass' || style === 'cosmic' || style === 'gradient' || style === 'cyber') {
        // These styles define their own backgrounds/text, so we might want to ignore the intent's background
        if (intent === 'primary') intentClass = "text-white"; // Force white text for dark/complex backgrounds
    }

    // Neo-Brutalism color handling
    if (style === 'neobrutalism' || style === 'pixel') {
        if (intent === 'white') intentClass = "bg-white text-black border-black";
        if (intent === 'primary') intentClass = "bg-primary text-primary-foreground border-black";
    }

    return `${base} ${intentClass} ${styleClass} ${sizeClass}`;
};
