import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { getActiveSegment } from "../utils.js";
export const TypewriterErase = ({ captions, fontFamily = "JetBrains Mono, monospace", fontSize = 48, fontColor = "#FFFFFF", cursorColor = "#00FF88", eraseColor = "#FF4444", position = "bottom", maxWidth, }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;
    const segment = getActiveSegment(captions, currentTimeMs);
    if (!segment)
        return null;
    const segmentProgress = (currentTimeMs - segment.startMs) / (segment.endMs - segment.startMs);
    // Type phase: first 60% of segment duration
    // Erase phase: last 40%
    const typeEnd = 0.6;
    const eraseStart = 0.7;
    let visibleWords;
    let isErasing = false;
    if (segmentProgress < typeEnd) {
        // Typing phase
        const wordsToShow = Math.ceil((segmentProgress / typeEnd) * segment.words.length);
        visibleWords = segment.words.slice(0, wordsToShow).map((w) => w.word);
    }
    else if (segmentProgress < eraseStart) {
        // Full display
        visibleWords = segment.words.map((w) => w.word);
    }
    else {
        // Erase phase
        isErasing = true;
        const eraseProgress = (segmentProgress - eraseStart) / (1 - eraseStart);
        const wordsToKeep = Math.floor((1 - eraseProgress) * segment.words.length);
        visibleWords = segment.words.slice(0, wordsToKeep).map((w) => w.word);
    }
    const showCursor = Math.floor(frame / 15) % 2 === 0;
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
                maxWidth: captionBoxMaxWidth(maxWidth),
                padding: "16px 24px",
                background: "rgba(0,0,0,0.6)",
                borderRadius: "12px",
                border: `2px solid ${isErasing ? eraseColor + "40" : cursorColor + "40"}`,
            }, children: _jsxs("span", { style: {
                    fontFamily,
                    fontSize,
                    fontWeight: 500,
                    color: isErasing ? eraseColor : fontColor,
                    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }, children: [visibleWords.join(" "), showCursor && (_jsx("span", { style: {
                            color: isErasing ? eraseColor : cursorColor,
                            fontWeight: 400,
                            marginLeft: "2px",
                        }, children: "|" }))] }) }) }));
};
//# sourceMappingURL=TypewriterErase.js.map