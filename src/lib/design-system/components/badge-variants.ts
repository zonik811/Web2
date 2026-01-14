import { shadows } from "../tokens/effects";

export type BadgeStyle = 'solid' | 'outline' | 'soft' | 'glow' | 'tag' | 'pill' | 'indicator' | 'clean' | 'tech';

export const BADGE_STYLES: Record<BadgeStyle, string> = {
    solid: "rounded-full bg-primary text-primary-foreground border border-transparent hover:bg-primary/80",
    outline: "rounded-full border border-primary text-primary bg-transparent",
    soft: "rounded-full bg-primary/10 text-primary border border-primary/20",
    glow: `rounded-full bg-primary/20 text-primary border border-primary/50 ${shadows.glow.primary}`,
    tag: "rounded-none border-l-4 border-primary bg-slate-100 text-slate-800 px-3",
    pill: "rounded-full px-4 border border-slate-200 bg-white text-slate-900 shadow-sm",
    indicator: "rounded-full bg-white text-slate-900 border border-slate-200 pl-2 pr-3 gap-1.5",
    clean: "rounded-md bg-transparent text-primary font-bold uppercase tracking-wider p-0",
    tech: "rounded-sm border border-primary/50 bg-primary/5 text-primary font-mono text-[10px]"
};

export const getBadgeClasses = (style: BadgeStyle = 'solid') => {
    const base = "inline-flex items-center px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    return `${base} ${BADGE_STYLES[style]}`;
};
