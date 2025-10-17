import fs from "fs";
import { globSync } from "glob";
import iconv from "iconv-lite";

const MOJIBAKE_MARKERS = ["à¸", "à¹", "Ã", "ã", "àš"];

function looksMojibake(s) {
    return MOJIBAKE_MARKERS.some(m => s.includes(m));
}

function demojibake(s) {
    const bytes = iconv.encode(s, "latin1");  // treat mojibake text as latin1 bytes
    return iconv.decode(bytes, "utf8");       // decode bytes as proper UTF-8
}

const exts = ["ts", "tsx", "js", "jsx", "html", "css"];
const patterns = exts.map(e => `src/**/*.${e}`);

for (const pat of patterns) {
    const files = globSync(pat, { nodir: true });
    for (const file of files) {
        const raw = fs.readFileSync(file, "utf8");
        if (!looksMojibake(raw)) continue;

        const fixed = demojibake(raw);

        if (fixed !== raw && /[ก-ฮๆฯะ-๙]/.test(fixed)) {
            const bak = `${file}.bak`;
            if (!fs.existsSync(bak)) fs.writeFileSync(bak, raw, "utf8");
            fs.writeFileSync(file, fixed, "utf8");
            console.log("Fixed:", file);
        }
    }
}
console.log("Done.");
