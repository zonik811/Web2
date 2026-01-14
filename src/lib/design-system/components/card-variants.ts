import { shadows, glass } from "../tokens/effects";

export type CardStyle = 'clean' | 'hover-lift' | 'neo-border' | 'glass-morphism' | 'minimal';

export const CARD_STYLES: Record<CardStyle, string> = {
    clean: "bg-white rounded-xl shadow-sm border border-slate-100",
    "hover-lift": "bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 hover:shadow-slate-200/50",
    "neo-border": `bg-white border-2 border-slate-900 ${shadows.neobrutalism} rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`,
    "glass-morphism": `rounded-2xl ${glass.lg}`,
    minimal: "bg-white border-b border-slate-200 rounded-none hover:bg-slate-50"
};

export const getCardClasses = (style: CardStyle = 'clean') => {
    const base = "relative transition-all duration-300 overflow-hidden";
    return `${base} ${CARD_STYLES[style] || CARD_STYLES.clean}`;
};
