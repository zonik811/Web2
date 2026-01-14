export type OverlayStyle = 'none' | 'dots' | 'grid' | 'aurora' | 'noise' | 'circuit' | 'waves' | 'vignette';

export const OVERLAY_STYLES: Record<OverlayStyle, string> = {
    none: "hidden",
    dots: "opacity-[0.15] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]",
    grid: "opacity-[0.1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]",
    aurora: "opacity-40 bg-gradient-to-t from-transparent via-primary/10 to-primary/5",
    noise: "opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]",
    circuit: "opacity-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0,rgba(0,0,0,0)_100%),radial-gradient(circle_at_center,rgba(var(--primary),0.1)_0,rgba(var(--primary),0)_100%)]",
    waves: "opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-50 to-teal-50",
    vignette: "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"
};

export const getOverlayClasses = (style: OverlayStyle = 'none') => {
    const base = "absolute inset-0 pointer-events-none z-0";
    return `${base} ${OVERLAY_STYLES[style] || OVERLAY_STYLES.none}`;
};
