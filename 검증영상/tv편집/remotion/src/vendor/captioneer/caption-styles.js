/**
 * Single source of truth for caption animation style ids.
 */
export const CAPTION_STYLES = [
    "word-highlight",
    "karaoke",
    "typewriter",
    "bounce",
    "wave",
    "glow",
    "typewriter-erase",
    "pill",
    "flicker",
    "highlighter",
    "blur",
    "rainbow",
    "scale",
    "spotlight",
];
/** Remotion composition id, e.g. word-highlight → WordHighlightDemo */
export function styleToCompositionId(style) {
    return (style
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("") + "Demo");
}
export const STYLE_LABELS = {
    "word-highlight": "Word Highlight",
    karaoke: "Karaoke",
    typewriter: "Typewriter",
    bounce: "Bounce",
    wave: "Wave",
    glow: "Glow",
    "typewriter-erase": "Typewriter Erase",
    pill: "Pill",
    flicker: "Flicker",
    highlighter: "Highlighter",
    blur: "Blur",
    rainbow: "Rainbow",
    scale: "Scale",
    spotlight: "Spotlight",
};
//# sourceMappingURL=caption-styles.js.map