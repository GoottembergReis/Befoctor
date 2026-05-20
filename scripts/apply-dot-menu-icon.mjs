import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const DOT_TOGGLE_CSS = `      .mobile-toggle {
        display: none;
        width: 44px;
        height: 44px;
        padding: 9px;
        border: 1px solid rgba(180, 106, 217, 0.28);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        cursor: pointer;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 4px;
        place-items: center;
        flex-shrink: 0;
        z-index: 1001;
        transition: transform 0.3s ease, border-color 0.3s ease;
      }

      .mobile-toggle span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        transition: transform 0.25s ease, opacity 0.25s ease;
      }

      .mobile-toggle span:nth-child(1) {
        background: #d28cff;
      }
      .mobile-toggle span:nth-child(2) {
        background: #c77ee8;
      }
      .mobile-toggle span:nth-child(3) {
        background: #b46ad9;
      }
      .mobile-toggle span:nth-child(4) {
        background: #d28cff;
      }
      .mobile-toggle span:nth-child(5) {
        background: #b46ad9;
      }
      .mobile-toggle span:nth-child(6) {
        background: #a855f7;
      }
      .mobile-toggle span:nth-child(7) {
        background: #b46ad9;
      }
      .mobile-toggle span:nth-child(8) {
        background: #9d4edd;
      }
      .mobile-toggle span:nth-child(9) {
        background: #8b5cf6;
      }

      .mobile-toggle.active {
        border-color: rgba(180, 106, 217, 0.55);
        transform: scale(0.96);
      }

      .mobile-toggle.active span {
        transform: scale(0.82);
        opacity: 0.7;
      }`;

const DOT_SPANS_HTML = `            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>`;

const oldToggleBlock =
  /      \.mobile-toggle \{[\s\S]*?      \.mobile-toggle\.active span:nth-child\(3\) \{[\s\S]*?\}\s*\n/;

const oldThreeSpans =
  /            <span><\/span>\s*\n\s*<span><\/span>\s*\n\s*<span><\/span>/g;

const files = [
  "index.html",
  "quem-somos/index.html",
  "fale-conosco/index.html",
  "servicos/producao-audiovisual/index.html",
  "servicos/marketing-estrategia/index.html",
  "servicos/design-branding/index.html",
  "servicos/social-media/index.html",
];

for (const rel of files) {
  const filePath = path.join(root, rel);
  let html = fs.readFileSync(filePath, "utf8");

  if (!oldToggleBlock.test(html)) {
    console.log("CSS block not found:", rel);
    continue;
  }

  html = html.replace(oldToggleBlock, `${DOT_TOGGLE_CSS}\n\n`);
  html = html.replace(oldThreeSpans, DOT_SPANS_HTML);
  html = html.replace(
    /        \.mobile-toggle \{\s*display: flex;\s*\}/g,
    "        .mobile-toggle {\n          display: grid;\n        }",
  );

  fs.writeFileSync(filePath, html, "utf8");
  console.log("Updated:", rel);
}

console.log("Done.");
