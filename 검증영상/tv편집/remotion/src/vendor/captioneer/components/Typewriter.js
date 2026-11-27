import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, } from "remotion";
import { captionBoxMaxWidth } from "./style-props.js";
import { getActiveSegment } from "../utils.js";
export const Typewriter = ({ captions, fontFamily = "JetBrains Mono, monospace", fontSize = 48, fontColor = "#FFFFFF", cursorColor = "#00FF88", position = "bottom", maxWidth, }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTimeMs = (frame / fps) * 1000;
    const segment = getActiveSegment(captions, currentTimeMs);
    if (!segment)
        return null;
    // Calculate how much of the text to show based on word progress
    const totalWords = segment.words.length;
    const segmentProgress = (currentTimeMs - segment.startMs) / (segment.endMs - segment.startMs);
    const wordsToShow = Math.ceil(segmentProgress * totalWords);
    const visibleText = segment.words
        .slice(0, wordsToShow)
        .map((w) => w.word)
        .join(" ");
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
                border: `2px solid ${cursorColor}40`,
            }, children: _jsxs("span", { style: {
                    fontFamily,
                    fontSize,
                    fontWeight: 500,
                    color: fontColor,
                    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }, children: [visibleText, showCursor && (_jsx("span", { style: {
                            color: cursorColor,
                            fontWeight: 400,
                            marginLeft: "2px",
                        }, children: "|" }))] }) }) }));
};
//# sourceMappingURL=Typewriter.js.map