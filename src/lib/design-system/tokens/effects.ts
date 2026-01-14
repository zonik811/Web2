export const shadows = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
    inner: "shadow-inner",
    none: "shadow-none",

    // Custom Uiverse Style Shadows
    neobrutalism: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    'neobrutalism-sm': "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
    'neobrutalism-lg': "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",

    glow: {
        primary: "shadow-[0_0_15px_rgba(var(--primary),0.5)]",
        white: "shadow-[0_0_15px_rgba(255,255,255,0.5)]",
        cosmic: "shadow-[0_0_20px_rgba(168,85,247,0.5)]"
    }
};

export const borders = {
    none: "border-0",
    thin: "border",
    medium: "border-2",
    thick: "border-4",
};

export const glass = {
    sm: "backdrop-blur-sm bg-white/10 border border-white/20",
    md: "backdrop-blur-md bg-white/10 border border-white/20",
    lg: "backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl",
    heavy: "backdrop-blur-xl bg-white/5 border border-white/10"
};
