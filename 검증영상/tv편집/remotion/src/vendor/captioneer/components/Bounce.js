import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
export const Bounce = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.6)", bounceColor = "#FF4081", bounceHeight = 30, position = "bottom", maxWidth, emphasisStyle, emphasisColor, }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;
    const segment = getActiveSegment(captions, currentTimeMs);
    if (!segment)
        return null;
    const activeWordIndex = getActiveWordIndex(segment, currentTimeMs);
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
                alignItems: "baseline",
                gap: "8px 12px",
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: segment.words.map((word, i) => {
                const isActive = i === activeWordIndex;
                const isPast = i < activeWordIndex;
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor: bounceColor });
                // Bounce spring — rises then falls
                const bounce = isActive
                    ? spring({
                        frame,
                        fps,
                        config: {
                            damping: 8,
                            stiffness: 300,
                            mass: 0.5,
                        },
                    })
                    : 0;
                const yOffset = isActive ? -bounceHeight * Math.sin(bounce * Math.PI) : 0;
                const scale = (isActive ? 1 + 0.15 * Math.sin(bounce * Math.PI) : 1) * emph.scaleBoost;
                return (_jsx("span", { style: {
                        fontFamily,
                        fontSize,
                        fontWeight: 700,
                        color: emph.color
                            ? emph.color
                            : isActive
                                ? bounceColor
                                : isPast
                                    ? "white"
                                    : fontColor,
                        display: "inline-block",
                        transform: `translateY(${yOffset}px) scale(${scale})`,
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? `0 4px 15px ${bounceColor}60`
                                : "0 2px 8px rgba(0,0,0,0.5)",
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Bounce.js.map