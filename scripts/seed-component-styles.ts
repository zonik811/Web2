
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, ID } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'component_styles';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

// --- GENERATORS ---

const COLORS = [
    { name: 'Blue', tailwind: 'blue-600' },
    { name: 'Purple', tailwind: 'purple-600' },
    { name: 'Emerald', tailwind: 'emerald-600' },
    { name: 'Rose', tailwind: 'rose-600' },
    { name: 'Amber', tailwind: 'amber-500' },
    { name: 'Cyan', tailwind: 'cyan-500' },
    { name: 'Indigo', tailwind: 'indigo-600' },
    { name: 'Fuchsia', tailwind: 'fuchsia-600' },
    { name: 'Orange', tailwind: 'orange-500' },
    { name: 'Lime', tailwind: 'lime-500' },
];

const BUTTON_BASE = "relative inline-flex items-center justify-center transition-all duration-300 font-medium overflow-hidden";

const generateButtons = () => {
    const styles: any[] = [];

    // 1. Modern Solids
    COLORS.forEach(c => {
        styles.push({
            name: `Modern ${c.name}`,
            type: 'button',
            css_classes: `${BUTTON_BASE} rounded-lg shadow-sm hover:shadow-md bg-${c.tailwind} text-white hover:brightness-110 hover:-translate-y-0.5`,
            preview_markup: `<button class="px-4 py-2">Button</button>`,
            is_active: true
        });
    });

    // 2. Glassmorphism
    COLORS.forEach(c => {
        styles.push({
            name: `Glass ${c.name}`,
            type: 'button',
            css_classes: `${BUTTON_BASE} rounded-xl backdrop-blur-md bg-${c.tailwind}/20 border border-${c.tailwind}/30 text-${c.tailwind} hover:bg-${c.tailwind}/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)]`,
            preview_markup: `<button class="px-4 py-2">Glass</button>`,
            is_active: true
        });
    });

    // 3. Neo-Brutalism
    COLORS.forEach(c => {
        styles.push({
            name: `Neo-Brutal ${c.name}`,
            type: 'button',
            css_classes: `${BUTTON_BASE} rounded-none border-2 border-black bg-${c.tailwind} text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none`,
            preview_markup: `<button class="px-4 py-2 font-bold uppercase">Neo</button>`,
            is_active: true
        });
    });

    // 4. Gradients
    styles.push({
        name: 'Sunset Gradient',
        type: 'button',
        css_classes: `${BUTTON_BASE} rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg hover:shadow-orange-500/25`,
        preview_markup: `<button class="px-6 py-2">Gradient</button>`,
        is_active: true
    });
    styles.push({
        name: 'Ocean Gradient',
        type: 'button',
        css_classes: `${BUTTON_BASE} rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 text-white shadow-lg hover:shadow-blue-400/25`,
        preview_markup: `<button class="px-6 py-2">Gradient</button>`,
        is_active: true
    });
    styles.push({
        name: 'Cosmic Gradient',
        type: 'button',
        css_classes: `${BUTTON_BASE} rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:animate-pulse`,
        preview_markup: `<button class="px-6 py-2">Cosmic</button>`,
        is_active: true
    });


    return styles;
};

const generateBadges = () => {
    const styles: any[] = [];
    const base = "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    // 1. Soft Badges
    COLORS.forEach(c => {
        styles.push({
            name: `Soft ${c.name}`,
            type: 'badge',
            css_classes: `${base} rounded-md bg-${c.tailwind}/10 text-${c.tailwind} border border-${c.tailwind}/20`,
            preview_markup: `<span>Soft</span>`,
            is_active: true
        });
    });

    // 2. Outline Badges
    COLORS.forEach(c => {
        styles.push({
            name: `Outline ${c.name}`,
            type: 'badge',
            css_classes: `${base} rounded-full border border-${c.tailwind} text-${c.tailwind}`,
            preview_markup: `<span>Outline</span>`,
            is_active: true
        });
    });

    // 3. Glow Badges
    COLORS.forEach(c => {
        styles.push({
            name: `Glow ${c.name}`,
            type: 'badge',
            css_classes: `${base} rounded-full bg-${c.tailwind}/20 text-${c.tailwind} shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-${c.tailwind}/50`,
            preview_markup: `<span>Glow</span>`,
            is_active: true
        });
    });

    return styles;
};

const generateCards = () => {
    const styles: any[] = [];
    const base = "relative overflow-hidden transition-all duration-300";

    styles.push({
        name: 'Clean Minimum',
        type: 'card',
        css_classes: `${base} bg-white border border-slate-100 rounded-2xl p-6`,
        preview_markup: `<div>Content</div>`,
        is_active: true
    });

    styles.push({
        name: 'Hover Lift',
        type: 'card',
        css_classes: `${base} bg-white rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl p-6`,
        preview_markup: `<div>Content</div>`,
        is_active: true
    });

    styles.push({
        name: 'Glass Panel',
        type: 'card',
        css_classes: `${base} backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl shadow-sm p-6`,
        preview_markup: `<div>Content</div>`,
        is_active: true
    });

    styles.push({
        name: 'Neo Brutalist',
        type: 'card',
        css_classes: `${base} bg-white border-2 border-black shadow-[4px_4px_0_0_black] rounded-none p-6`,
        preview_markup: `<div>Content</div>`,
        is_active: true
    });

    COLORS.forEach(c => {
        styles.push({
            name: `Border ${c.name}`,
            type: 'card',
            css_classes: `${base} bg-white border-l-4 border-${c.tailwind} rounded-r-lg shadow-sm p-6`,
            preview_markup: `<div>Content</div>`,
            is_active: true
        });
    });

    return styles;
};

const generateWildStyles = () => {
    const styles: any[] = [];
    const BTN_BASE = "relative inline-flex items-center justify-center transition-all duration-300 font-bold overflow-hidden";

    // 1. Cyberpunk Glitch
    styles.push({
        name: 'Cyberpunk Neon',
        type: 'button',
        css_classes: `${BTN_BASE} rounded-none skew-x-[-10deg] border-2 border-cyan-400 bg-slate-900 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_theme('colors.cyan.400')] hover:skew-x-0 tracking-widest uppercase`,
        preview_markup: `<button class="px-6 py-2">CYBER</button>`,
        is_active: true
    });

    styles.push({
        name: 'Cyberpunk Rose',
        type: 'button',
        css_classes: `${BTN_BASE} rounded-none border-b-4 border-rose-600 bg-slate-900 text-rose-500 hover:text-white hover:bg-rose-600 active:translate-y-1 active:border-b-0 font-mono tracking-tighter`,
        preview_markup: `<button class="px-6 py-2">HACK</button>`,
        is_active: true
    });

    // 2. Holographic
    styles.push({
        name: 'Holographic Silver',
        type: 'button',
        css_classes: `${BTN_BASE} rounded-xl bg-gradient-to-r from-slate-300 via-white to-slate-200 bg-[length:200%_auto] hover:bg-[position:right_center] text-slate-900 border border-white/50 shadow-lg shadow-white/20 hover:shadow-cyan-200/50 hover:scale-105`,
        preview_markup: `<button class="px-6 py-2">Holo</button>`,
        is_active: true
    });

    // 3. Pop Art
    styles.push({
        name: 'Pop Art Yellow',
        type: 'button',
        css_classes: `${BTN_BASE} rounded-lg bg-yellow-400 text-black border-4 border-black shadow-[4px_4px_0_0_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_black] active:shadow-none font-black text-lg`,
        preview_markup: `<button class="px-6 py-2">POP!</button>`,
        is_active: true
    });

    styles.push({
        name: 'Pop Art Comic',
        type: 'button',
        css_classes: `${BTN_BASE} rounded-full bg-white text-black border-2 border-black shadow-[4px_4px_0_0_theme('colors.blue.500')] hover:shadow-[6px_6px_0_0_theme('colors.red.500')] transition-shadow font-comic`,
        preview_markup: `<button class="px-6 py-2">POW!</button>`,
        is_active: true
    });

    // 4. Crazy Gradients
    styles.push({
        name: 'Electric Violet',
        type: 'button',
        css_classes: `${BTN_BASE} rounded-full bg-gradient-to-bl from-violet-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_20px_theme('colors.indigo.500')] hover:shadow-[0_0_40px_theme('colors.indigo.500')] hover:scale-110 animate-pulse`,
        preview_markup: `<button class="px-6 py-2">Energy</button>`,
        is_active: true
    });

    // 5. Glass Borders (Neon)
    styles.push({
        name: 'Neon Outline Green',
        type: 'button',
        css_classes: `${BTN_BASE} rounded-full bg-transparent border-2 border-lime-400 text-lime-400 shadow-[0_0_10px_theme('colors.lime.400'),inset_0_0_10px_theme('colors.lime.400')] hover:bg-lime-400 hover:text-black hover:shadow-[0_0_30px_theme('colors.lime.400')]`,
        preview_markup: `<button class="px-6 py-2">NEON</button>`,
        is_active: true
    });

    // --- CARDS ---
    styles.push({
        name: 'Card Holographic',
        type: 'card',
        css_classes: `relative overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:border-white/40 transition-all p-6 text-white`,
        preview_markup: `<div>Holo Content</div>`,
        is_active: true
    });

    styles.push({
        name: 'Card Cyber Grid',
        type: 'card',
        css_classes: `relative overflow-hidden bg-slate-950 border border-cyan-500/50 rounded-lg p-6 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:24px_24px] shadow-[0_0_15px_rgba(6,182,212,0.15)]`,
        preview_markup: `<div>Grid Content</div>`,
        is_active: true
    });

    styles.push({
        name: 'Card Neumorph Dark',
        type: 'card',
        css_classes: `bg-slate-800 rounded-2xl shadow-[20px_20px_60px_#0f172a,-20px_-20px_60px_#334155] border border-slate-700/50 p-6`,
        preview_markup: `<div>Dark Neo</div>`,
        is_active: true
    });

    // --- BADGES ---
    styles.push({
        name: 'Badge Glitch',
        type: 'badge',
        css_classes: `inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold bg-slate-900 text-green-400 border border-green-400 shadow-[2px_0_0_0_red,-2px_0_0_0_blue]`,
        preview_markup: `<span>ERROR</span>`,
        is_active: true
    });

    styles.push({
        name: 'Badge Fire',
        type: 'badge',
        css_classes: `inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-t from-red-600 to-yellow-400 text-white shadow-[0_0_10px_orange] animate-pulse`,
        preview_markup: `<span>HOT</span>`,
        is_active: true
    });

    return styles;
};

const generateExtraBadges = () => {
    const styles: any[] = [];
    const base = "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    // 1. Gradient Badges (5)
    styles.push({ name: 'Badge Gradient Aurora', type: 'badge', css_classes: `${base} rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-sm`, preview_markup: `<span>Aurora</span>`, is_active: true });
    styles.push({ name: 'Badge Gradient Sunset', type: 'badge', css_classes: `${base} rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm`, preview_markup: `<span>Sunset</span>`, is_active: true });
    styles.push({ name: 'Badge Gradient Ocean', type: 'badge', css_classes: `${base} rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm`, preview_markup: `<span>Ocean</span>`, is_active: true });
    styles.push({ name: 'Badge Gradient Fire', type: 'badge', css_classes: `${base} rounded-full bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-sm`, preview_markup: `<span>Fire</span>`, is_active: true });
    styles.push({ name: 'Badge Gradient Lavender', type: 'badge', css_classes: `${base} rounded-full bg-gradient-to-r from-indigo-300 to-purple-400 text-white shadow-sm`, preview_markup: `<span>Lav</span>`, is_active: true });

    // 2. Glass Badges (5)
    styles.push({ name: 'Badge Glass Light', type: 'badge', css_classes: `${base} rounded-md bg-white/30 backdrop-blur-md border border-white/50 text-slate-800`, preview_markup: `<span>Glass</span>`, is_active: true });
    styles.push({ name: 'Badge Glass Dark', type: 'badge', css_classes: `${base} rounded-md bg-black/30 backdrop-blur-md border border-white/10 text-white`, preview_markup: `<span>Dark</span>`, is_active: true });
    styles.push({ name: 'Badge Glass Blue', type: 'badge', css_classes: `${base} rounded-md bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-blue-700`, preview_markup: `<span>Blue</span>`, is_active: true });
    styles.push({ name: 'Badge Glass Emerald', type: 'badge', css_classes: `${base} rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-700`, preview_markup: `<span>Eco</span>`, is_active: true });
    styles.push({ name: 'Badge Glass Rose', type: 'badge', css_classes: `${base} rounded-md bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-700`, preview_markup: `<span>Love</span>`, is_active: true });

    // 3. Status Indicators (5)
    styles.push({ name: 'Status Online', type: 'badge', css_classes: `${base} rounded-full bg-white border border-slate-200 text-slate-700 pl-1.5 gap-1.5 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-green-500`, preview_markup: `<span>Online</span>`, is_active: true });
    styles.push({ name: 'Status Busy', type: 'badge', css_classes: `${base} rounded-full bg-white border border-slate-200 text-slate-700 pl-1.5 gap-1.5 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-red-500`, preview_markup: `<span>Busy</span>`, is_active: true });
    styles.push({ name: 'Status Away', type: 'badge', css_classes: `${base} rounded-full bg-white border border-slate-200 text-slate-700 pl-1.5 gap-1.5 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-amber-500`, preview_markup: `<span>Away</span>`, is_active: true });
    styles.push({ name: 'Status Offline', type: 'badge', css_classes: `${base} rounded-full bg-white border border-slate-200 text-slate-700 pl-1.5 gap-1.5 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-slate-400`, preview_markup: `<span>Offline</span>`, is_active: true });
    styles.push({ name: 'Status New', type: 'badge', css_classes: `${base} rounded-full bg-white border border-slate-200 text-slate-700 pl-1.5 gap-1.5 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-blue-500 before:animate-pulse`, preview_markup: `<span>New!</span>`, is_active: true });

    // 4. Retro & Minimal (5)
    styles.push({ name: 'Badge Retro Pixel', type: 'badge', css_classes: `${base} rounded-none border-2 border-slate-900 bg-slate-200 text-slate-900 font-mono text-[10px] uppercase tracking-widest`, preview_markup: `<span>8BIT</span>`, is_active: true });
    styles.push({ name: 'Badge Minimal Underline', type: 'badge', css_classes: `inline-flex px-1 py-0.5 text-xs font-bold text-slate-900 border-b-2 border-indigo-500 bg-transparent`, preview_markup: `<span>Minimal</span>`, is_active: true });
    styles.push({ name: 'Badge High Contrast', type: 'badge', css_classes: `${base} rounded-none bg-black text-white font-black uppercase border border-white italic`, preview_markup: `<span>BOLD</span>`, is_active: true });
    styles.push({ name: 'Badge Capsule Outline', type: 'badge', css_classes: `${base} rounded-full border-2 border-slate-900 bg-transparent text-slate-900 font-bold`, preview_markup: `<span>Capsule</span>`, is_active: true });
    styles.push({ name: 'Badge Tag Primary', type: 'badge', css_classes: `${base} rounded-l-none rounded-r-md bg-indigo-600 text-white pl-1 border-l-4 border-indigo-800`, preview_markup: `<span>Tag</span>`, is_active: true });

    return styles;
};

const generateExtraCards = () => {
    const styles: any[] = [];
    const base = "relative overflow-hidden transition-all duration-300";

    // 1. Glass Cards (5)
    styles.push({ name: 'Card Glass Heavy', type: 'card', css_classes: `${base} bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-6 text-slate-800`, preview_markup: `<div>Glass</div>`, is_active: true });
    styles.push({ name: 'Card Glass Frost', type: 'card', css_classes: `${base} bg-white/40 backdrop-blur-md border border-white/60 rounded-xl shadow-sm p-6`, preview_markup: `<div>Frost</div>`, is_active: true });
    styles.push({ name: 'Card Glass Dark', type: 'card', css_classes: `${base} bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl p-6 text-white`, preview_markup: `<div>Dark</div>`, is_active: true });
    styles.push({ name: 'Card Glass Prism', type: 'card', css_classes: `${base} bg-white/20 backdrop-blur-lg border-t border-l border-white/50 rounded-3xl shadow-[5px_5px_30px_rgba(0,0,0,0.1)] p-6`, preview_markup: `<div>Prism</div>`, is_active: true });
    styles.push({ name: 'Card Glass Tinted', type: 'card', css_classes: `${base} bg-indigo-500/10 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6`, preview_markup: `<div>Tint</div>`, is_active: true });

    // 2. Interactive Motion (5)
    styles.push({ name: 'Card Hover Lift', type: 'card', css_classes: `${base} bg-white rounded-xl shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 p-6`, preview_markup: `<div>Lift</div>`, is_active: true });
    styles.push({ name: 'Card Hover Scale', type: 'card', css_classes: `${base} bg-white rounded-xl shadow-md border border-slate-100 hover:scale-105 p-6`, preview_markup: `<div>Scale</div>`, is_active: true });
    styles.push({ name: 'Card Hover Glow', type: 'card', css_classes: `${base} bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:border-indigo-300 p-6`, preview_markup: `<div>Glow</div>`, is_active: true });
    styles.push({ name: 'Card Hover Tilt', type: 'card', css_classes: `${base} bg-white rounded-2xl border border-slate-200 shadow-lg hover:rotate-1 hover:scale-105 p-6 origin-center`, preview_markup: `<div>Tilt</div>`, is_active: true });
    styles.push({ name: 'Card Hover Expand', type: 'card', css_classes: `${base} bg-slate-50 border border-slate-200 rounded-lg hover:rounded-2xl hover:bg-white hover:shadow-lg p-6`, preview_markup: `<div>Expand</div>`, is_active: true });

    // 3. Border Accents (5)
    styles.push({ name: 'Card Top Rainbow', type: 'card', css_classes: `${base} bg-white rounded-xl shadow-sm border-t-4 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-origin-border p-6`, preview_markup: `<div>Rainbow</div>`, is_active: true });
    styles.push({ name: 'Card Top Primary', type: 'card', css_classes: `${base} bg-white rounded-lg shadow-sm border-t-4 border-indigo-600 p-6`, preview_markup: `<div>Top</div>`, is_active: true });
    styles.push({ name: 'Card Side Accent', type: 'card', css_classes: `${base} bg-white rounded-lg shadow-sm border-l-8 border-emerald-500 p-6`, preview_markup: `<div>Side</div>`, is_active: true });
    styles.push({ name: 'Card Corner Gradient', type: 'card', css_classes: `${base} bg-white rounded-2xl shadow-md p-6 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_150px)]`, preview_markup: `<div>Corner</div>`, is_active: true });
    styles.push({ name: 'Card Border Dashed', type: 'card', css_classes: `${base} bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 p-6`, preview_markup: `<div>Dashed</div>`, is_active: true });

    // 4. Dark & Neon (5)
    styles.push({ name: 'Card Neon Cyber', type: 'card', css_classes: `${base} bg-slate-950 border border-cyan-500/50 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] p-6 text-cyan-500`, preview_markup: `<div>Cyber</div>`, is_active: true });
    styles.push({ name: 'Card Dark Minimal', type: 'card', css_classes: `${base} bg-neutral-900 rounded-3xl border border-neutral-800 p-6 text-neutral-400 hover:text-white`, preview_markup: `<div>Minimal</div>`, is_active: true });
    styles.push({ name: 'Card Gradient Dark', type: 'card', css_classes: `${base} rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-t border-slate-700 shadow-2xl p-6 text-white`, preview_markup: `<div>Grad</div>`, is_active: true });
    styles.push({ name: 'Card Glow Border', type: 'card', css_classes: `${base} bg-black rounded-xl p-[1px] bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500`, preview_markup: `<div>Border</div>`, is_active: true }); // Needs inner div for content usually, but this works as container style
    styles.push({ name: 'Card Mesh Dark', type: 'card', css_classes: `${base} bg-slate-900 rounded-2xl border border-white/10 p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/50 via-slate-900 to-slate-900 text-indigo-100`, preview_markup: `<div>Mesh</div>`, is_active: true });

    return styles;
};

async function seed() {
    console.log(`${colors.cyan}🚀 Iniciando siembra de estilos (Target: 30+ per category)...${colors.reset}\n`);

    const extraCards = generateExtraCards();

    const all = [...extraCards]; // ONLY INSERT NEW CARDS
    console.log(`${colors.blue}📦 Generados ${all.length} NUEVAS tarjetas para insertar.${colors.reset}`);

    // Batch insert
    let success = 0;
    let fail = 0;


    // Chunking not mostly needed for 100 items but good practice
    for (const style of all) {
        try {
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                style
            );
            process.stdout.write(`${colors.green}.${colors.reset}`);
            success++;
        } catch (error: any) {
            process.stdout.write(`${colors.red}x${colors.reset}`);
            // console.error(error.message);
            fail++;
        }
    }

    console.log(`\n\n${colors.green}✅ Finalizado: ${success} insertados. ${colors.red}${fail} fallidos.${colors.reset}\n`);
}

seed();
