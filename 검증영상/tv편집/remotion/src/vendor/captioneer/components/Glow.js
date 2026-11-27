import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
export const Glow = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.35)", glowColor = "#A855F7", glowIntensity = 30, position = "bottom", maxWidth, emphasisStyle, emphasisColor, }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;
    const segment = getActiveSegment(captions, currentTimeMs);
    if (!segment)
        return null;
    const activeWordIndex = getActiveWordIndex(segment, currentTimeMs);
    // Pulse the glow
    const pulse = Math.sin(frame * 0.15) * 0.3 + 0.7;
    const positionStyle = {
        top: position === "top" ? "10%" : position === "center" ? "50%" : undefined,
        bottom: position === "bottom" ? "10%" : undefined,
        transform: position === "center" ? "translateY(-50%)" : undefined,
    };
    return (_jsx(AbsoluteFill, { style: {
            justifyContent: "center",
            alignItems: "center",
            ...positionStyle,
        }, children: _jsx("div", { style: {
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px 14px",
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: segment.words.map((word, i) => {
                const isActive = i === activeWordIndex;
                const isPast = i < activeWordIndex;
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor: glowColor });
                const glowAmount = isActive ? glowIntensity * pulse : 0;
                const scale = emph.scaleBoost;
                return (_jsx("span", { style: {
                        fontFamily,
                        fontSize,
                        fontWeight: 700,
                        color: emph.color
                            ? emph.color
                            : isActive
                                ? "#fff"
                                : isPast
                                    ? "white"
                                    : fontColor,
                        display: "inline-block",
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? `0 0 ${glowAmount}px ${glowColor}, 0 0 ${glowAmount * 2}px ${glowColor}80, 0 0 ${glowAmount * 3}px ${glowColor}40`
                                : "0 2px 8px rgba(0,0,0,0.5)",
                        filter: isActive ? `brightness(${1 + pulse * 0.3})` : "none",
                        ...(scale !== 1 ? { transform: `scale(${scale})` } : {}),
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Glow.js.map