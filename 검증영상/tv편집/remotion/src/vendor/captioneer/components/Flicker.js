import { jsx as _jsx } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { emphasisVisual } from "./emphasis.js";
import { getActiveSegment, getActiveWordIndex } from "../utils.js";
export const Flicker = ({ captions, fontFamily = "Inter, sans-serif", fontSize = 56, fontColor = "rgba(255,255,255,0.25)", flickerColor = "#FF9500", position = "bottom", emphasisStyle, emphasisColor, maxWidth, }) => {
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
                alignItems: "center",
                gap: "8px 12px",
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
            }, children: segment.words.map((word, i) => {
                const isActive = i === activeWordIndex;
                const isPast = i < activeWordIndex;
                const emph = emphasisVisual(word, { emphasisStyle, emphasisColor, highlightColor: flickerColor });
                const isEmph = Boolean(word.emphasis && emphasisStyle);
                // Flicker effect: rapidly toggle opacity for active word
                let opacity = isPast ? 1 : isActive ? 0.4 : 0.25;
                if (isActive) {
                    // Flicker pattern: on-off-on-on-off-on
                    const flickerFrame = frame % 8;
                    opacity = [1, 0.2, 1, 1, 0.3, 1, 1, 0.2][flickerFrame];
                }
                // Emphasized words never fade into the dim idle state.
                if (!isActive && !isPast && isEmph)
                    opacity = 0.9;
                const scale = emph.scaleBoost;
                return (_jsx("span", { style: {
                        fontFamily,
                        fontSize,
                        fontWeight: 700,
                        color: emph.color
                            ? emph.color
                            : isActive
                                ? flickerColor
                                : isPast
                                    ? "white"
                                    : fontColor,
                        display: "inline-block",
                        opacity,
                        transform: scale !== 1 ? `scale(${scale})` : undefined,
                        textShadow: emph.textShadow
                            ? emph.textShadow
                            : isActive
                                ? `0 0 10px ${flickerColor}, 0 0 20px ${flickerColor}60`
                                : isPast
                                    ? "0 2px 8px rgba(0,0,0,0.5)"
                                    : "none",
                    }, children: word.word }, `${word.startMs}-${i}`));
            }) }) }));
};
//# sourceMappingURL=Flicker.js.map