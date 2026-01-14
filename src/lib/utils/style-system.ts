export type ButtonStyle = 'modern' | 'neobrutalism' | 'glass' | 'gradient' | 'minimal' | '3d';
export type BadgeStyle = 'solid' | 'outline' | 'glow' | 'tag';
export type CardStyle = 'clean' | 'hover-lift' | 'neo-border' | 'glass-morphism';

export const getButtonClasses = (style: ButtonStyle, variant: 'primary' | 'secondary' | 'ghost' | 'footer' = 'primary', colorOverride?: string) => {
    // Base classes
    const base = "transition-all duration-300 font-medium relative overflow-hidden";

    // Style presets
    const presets: Record<ButtonStyle, string> = {
        modern: "rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5",
        neobrutalism: "rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide font-bold",
        glass: "rounded-xl backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/10",
        gradient: "rounded-full bg-gradient-to-r hover:bg-gradient-to-l shadow-lg bg-[length:200%_200%] animate-gradient",
        minimal: "rounded-sm hover:underline underline-offset-4 bg-transparent hover:bg-transparent shadow-none",
        '3d': "rounded-lg border-b-4 active:border-b-0 active:translate-y-1"
    };

    // Color maps (simplified defaults, can be complex logic)
    const variantColors: Record<string, string> = {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "bg-transparent text-current",
        footer: "bg-slate-900 text-white hover:bg-slate-800"
    };

    // Special handling for Neobrutalism colors to ensure contrast or borders
    if (style === 'neobrutalism' && variant === 'primary') return `${base} ${presets.neobrutalism} bg-primary text-primary-foreground`;
    if (style === 'neobrutalism' && variant === 'secondary') return `${base} ${presets.neobrutalism} bg-white text-black`;

    // 3D Specifics (Need distinct border colors)
    if (style === '3d' && variant === 'primary') return `${base} ${presets['3d']} bg-primary border-primary-foreground/30 text-primary-foreground`;

    return `${base} ${presets[style] || presets.modern} ${variantColors[variant]}`;
};

export const getBadgeClasses = (style: BadgeStyle) => {
    const base = "px-3 py-1 text-xs font-medium transition-all duration-300";

    const presets: Record<BadgeStyle, string> = {
        solid: "rounded-full bg-primary text-primary-foreground border border-transparent",
        outline: "rounded-full border border-primary text-primary bg-transparent",
        glow: "rounded-full bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]",
        tag: "rounded-none border-l-4 border-primary bg-slate-100 text-slate-800"
    };

    return `${base} ${presets[style] || presets.solid}`;
};

export const getCardClasses = (style: CardStyle) => {
    const base = "relative transition-all duration-300";

    const presets: Record<CardStyle, string> = {
        clean: "bg-white rounded-xl shadow-sm border border-slate-100",
        "hover-lift": "bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1",
        "neo-border": "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none",
        "glass-morphism": "bg-white/80 backdrop-blur-lg border border-white/50 shadow-lg rounded-2xl"
    };

    return `${base} ${presets[style] || presets.clean}`;
};
