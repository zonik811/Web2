// This will be used to map Google Font classNames
// We will need to import these in layout.tsx or a client component provider

export const fonts = {
    sans: "font-sans", // Inter default
    serif: "font-serif",
    mono: "font-mono",

    // Custom display fonts
    display: {
        space: "font-space-grotesk", // Requires Space Grotesk loaded
        outfit: "font-outfit",       // Requires Outfit loaded
        playfair: "font-playfair",   // Requires Playfair loaded
        cinzel: "font-cinzel",       // Requires Cinzel loaded
        syne: "font-syne"            // Requires Syne loaded
    }
};

export const textSizes = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl md:text-6xl",
    "6xl": "text-6xl md:text-7xl",
    "7xl": "text-7xl md:text-9xl", // Massive Hero
};
