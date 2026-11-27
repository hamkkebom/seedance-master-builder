/**
 * Configuration loader
 * Reads .captioneerrc or captioneer field from package.json
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
const VALID_STYLES = new Set([
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
]);
/** Resolve default caption style from config with validation. */
export function resolveDefaultStyle(config) {
    const style = config?.defaultStyle ?? "word-highlight";
    return VALID_STYLES.has(style) ? style : "word-highlight";
}
export async function loadConfig() {
    // Check .captioneerrc
    const rcPath = resolve(process.cwd(), ".captioneerrc");
    if (existsSync(rcPath)) {
        const raw = readFileSync(rcPath, "utf-8");
        return JSON.parse(raw);
    }
    // Check package.json
    const pkgPath = resolve(process.cwd(), "package.json");
    if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        if (pkg.captioneer) {
            return pkg.captioneer;
        }
    }
    return null;
}
//# sourceMappingURL=config.js.map