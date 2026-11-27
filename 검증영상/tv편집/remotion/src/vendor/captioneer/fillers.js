/**
 * Filler-word removal — cut the "um"s and tighten speech.
 *
 * Detects hesitation sounds ("um", "uh") and discourse fillers ("you know",
 * "i mean", "kind of") in word-level captions and removes them, optionally
 * pulling subsequent words earlier to close the timing gaps. This is the
 * podcast-clip edit people do by hand, done from STT timing alone.
 *
 * "like" is deliberately NOT in the default list — word-level timing cannot
 * tell "I, like, guess" from "I like pizza". Add it via `extraFillers`.
 */
const DEFAULT_FILLERS = [
    "um",
    "umm",
    "uh",
    "uhh",
    "uhm",
    "erm",
    "er",
    "ah",
    "eh",
    "hmm",
    "hm",
    "mmm",
    "you know",
    "i mean",
    "kind of",
    "sort of",
];
const normalize = (word) => word.toLowerCase().replace(/[^a-z0-9']/g, "");
function buildFillerIndex(options) {
    const kept = new Set((options.keepFillers ?? []).map((p) => normalize(p)));
    const all = new Set();
    for (const filler of [...DEFAULT_FILLERS, ...(options.extraFillers ?? [])]) {
        const normalized = filler
            .split(/\s+/)
            .map(normalize)
            .filter(Boolean)
            .join(" ");
        if (normalized && !kept.has(normalized))
            all.add(normalized);
    }
    // A kept single word also removes it from inside kept phrases? No — keep is exact-phrase.
    for (const filler of options.keepFillers ?? []) {
        all.delete(filler.split(/\s+/).map(normalize).join(" "));
    }
    const single = new Map();
    const phrases = [];
    for (const entry of all) {
        const words = entry.split(" ");
        if (words.length === 1) {
            single.set(entry, 1);
        }
        else {
            phrases.push({ words, joined: entry });
        }
    }
    phrases.sort((a, b) => b.words.length - a.words.length);
    return { single, phrases };
}
/**
 * Remove (or report) filler words. Pure: input is never mutated; untouched
 * segments are shared by reference. With `closeGaps`, words after a removed
 * filler shift earlier by the removed span (never before the previous word),
 * and segment bounds are recomputed.
 */
export function filterFillers(captions, options = {}) {
    const opts = {
        remove: options.remove ?? true,
        closeGaps: options.closeGaps ?? true,
        extraFillers: options.extraFillers,
        keepFillers: options.keepFillers,
    };
    const index = buildFillerIndex(opts);
    const matches = [];
    const segments = captions.segments.map((segment, segmentIndex) => {
        const normalized = segment.words.map((w) => normalize(w.word));
        const removed = new Array(segment.words.length).fill(false);
        for (let i = 0; i < segment.words.length;) {
            let matchedLength = 0;
            for (const phrase of index.phrases) {
                const { words } = phrase;
                if (i + words.length > normalized.length)
                    continue;
                let ok = true;
                for (let j = 0; j < words.length; j++) {
                    if (normalized[i + j] !== words[j]) {
                        ok = false;
                        break;
                    }
                }
                if (ok) {
                    matchedLength = words.length;
                    break;
                }
            }
            if (matchedLength === 0 && index.single.has(normalized[i])) {
                matchedLength = 1;
            }
            if (matchedLength === 0) {
                i++;
                continue;
            }
            const matchedWords = segment.words.slice(i, i + matchedLength);
            matches.push({
                segmentIndex,
                wordIndex: i,
                words: matchedWords.map((w) => w.word),
                durationMs: matchedWords[matchedWords.length - 1].endMs - matchedWords[0].startMs,
            });
            for (let j = i; j < i + matchedLength; j++)
                removed[j] = true;
            i += matchedLength;
        }
        if (opts.remove === false || removed.every((r) => !r))
            return segment;
        // Close gaps: shift each surviving word left by the removed time before it.
        let shiftMs = 0;
        let prevEnd = -Infinity;
        const words = [];
        for (let i = 0; i < segment.words.length; i++) {
            const word = segment.words[i];
            if (removed[i]) {
                if (opts.closeGaps) {
                    shiftMs += Math.max(0, word.endMs - word.startMs);
                }
                continue;
            }
            const next = shiftMs > 0
                ? {
                    ...word,
                    startMs: Math.max(word.startMs - shiftMs, prevEnd + 1),
                    endMs: Math.max(word.endMs - shiftMs, Math.max(word.startMs - shiftMs, prevEnd + 1) + 1),
                }
                : word;
            prevEnd = Math.max(next.endMs, next.startMs + 1);
            words.push(next);
        }
        const nextSegment = {
            ...segment,
            words,
            text: words.map((w) => w.word).join(" "),
        };
        if (words.length > 0) {
            nextSegment.startMs = words[0].startMs;
            nextSegment.endMs = words[words.length - 1].endMs;
        }
        return nextSegment;
    });
    if (opts.remove === false || segments.every((s, i) => s === captions.segments[i])) {
        return { captions, matches };
    }
    return { captions: { ...captions, segments }, matches };
}
//# sourceMappingURL=fillers.js.map