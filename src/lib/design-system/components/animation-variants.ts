export type ButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shine' | 'wiggle' | 'float';

export const getAnimationClasses = (anim: ButtonAnimation = 'none') => {
    const presets: Record<ButtonAnimation, string> = {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        shine: "relative overflow-hidden after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-[shimmer_2s_infinite]",
        wiggle: "hover:animate-[wiggle_1s_ease-in-out_infinite]",
        float: "animate-[float_3s_ease-in-out_infinite]"
    };
    return presets[anim] || "";
};
