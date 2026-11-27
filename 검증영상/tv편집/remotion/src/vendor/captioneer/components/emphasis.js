/**
 * Shared emphasis treatment for caption style components.
 *
 * Style components spread `emphasisVisual()` output into their word spans so
 * `word.emphasis` words pop consistently: recolored, glowing, or scaled up.
 */
const NO_EMPHASIS = { scaleBoost: 1 };
export function emphasisVisual(word, props) {
    if (!word.emphasis || !props.emphasisStyle)
        return NO_EMPHASIS;
    const color = props.emphasisColor ?? props.highlightColor ?? "#FFD700";
    switch (props.emphasisStyle) {
        case "color":
            return { color, textShadow: `0 0 14px ${color}66`, scaleBoost: 1 };
        case "glow":
            return {
                textShadow: `0 0 16px ${color}, 0 0 34px ${color}88`,
                scaleBoost: 1,
            };
        case "scale":
            return { scaleBoost: 1.15 };
        default:
            return NO_EMPHASIS;
    }
}
//# sourceMappingURL=emphasis.js.map