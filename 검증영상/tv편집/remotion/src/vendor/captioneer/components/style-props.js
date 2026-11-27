/**
 * Shared layout props for caption style components.
 */
import { getSegmentDisplayLines } from "../utils.js";
export function captionBoxMaxWidth(maxWidth) {
    return maxWidth ? `${maxWidth}px` : "80%";
}
export function resolveDisplayLines(segment, layout) {
    return getSegmentDisplayLines(segment, {
        wordsPerLine: layout?.wordsPerLine,
        useSmartWrap: layout?.useSmartWrap,
    });
}
/** Map flat word index for active-word styles */
export function flatWordIndex(lines, lineIndex, wordIndexInLine) {
    let idx = 0;
    for (let l = 0; l < lineIndex; l++)
        idx += lines[l].length;
    return idx + wordIndexInLine;
}
//# sourceMappingURL=style-props.js.map