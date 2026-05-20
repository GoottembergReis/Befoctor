import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const MOBILE_BASE_CSS = `      .mobile-toggle {
        display: none;
        width: 46px;
        height: 46px;
        padding: 0;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex-shrink: 0;
        z-index: 1001;
      }

      .mobile-toggle span {
        display: block;
        width: 22px;
        height: 2px;
        background: #fff;
        border-radius: 2px;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }

      .mobile-toggle.active span:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
      }

      .mobile-toggle.active span:nth-child(2) {
        opacity: 0;
      }

      .mobile-toggle.active span:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
      }

      .nav-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 998;
        opacity: 0;
        transition: opacity 0.3s ease;
        border: none;
        padding: 0;
        cursor: pointer;
      }

      .nav-overlay.active {
        display: block;
        opacity: 1;
      }`;

const MOBILE_MEDIA_CSS = `        .mobile-toggle {
          display: flex;
        }

        .nav-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: min(320px, 85vw);
          height: 100vh;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
          padding: 100px 32px 40px;
          background: rgba(5, 8, 22, 0.98);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 1000;
          transition: right 0.35s ease;
          overflow-y: auto;
        }

        .nav-menu.active {
          right: 0;
        }

        .nav-menu li {
          width: 100%;
        }

        .nav-menu li a {
          width: 100%;
          padding: 16px 0;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: block;
        }

        body.menu-open {
          overflow: hidden;
        }`;

const TOGGLE_HTML = `          <button
            type="button"
            class="mobile-toggle"
            id="mobileToggle"
            aria-label="Abrir menu"
            aria-expanded="false"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>`;

const OVERLAY_HTML = `
    <button
      type="button"
      class="nav-overlay"
      id="navOverlay"
      aria-label="Fechar menu"
    ></button>
`;

const MOBILE_JS = `      (function () {
        const toggle = document.getElementById("mobileToggle");
        const nav = document.getElementById("navMenu");
        const overlay = document.getElementById("navOverlay");
        if (!toggle || !nav || !overlay) return;

        function closeMenu() {
          toggle.classList.remove("active");
          nav.classList.remove("active");
          overlay.classList.remove("active");
          document.body.classList.remove("menu-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Abrir menu");
        }

        function openMenu() {
          toggle.classList.add("active");
          nav.classList.add("active");
          overlay.classList.add("active");
          document.body.classList.add("menu-open");
          toggle.setAttribute("aria-expanded", "true");
          toggle.setAttribute("aria-label", "Fechar menu");
        }

        toggle.addEventListener("click", function () {
          if (nav.classList.contains("active")) closeMenu();
          else openMenu();
        });

        overlay.addEventListener("click", closeMenu);

        nav.querySelectorAll("a").forEach(function (link) {
          link.addEventListener("click", closeMenu);
        });

        window.addEventListener("resize", function () {
          if (window.innerWidth > 1024) closeMenu();
        });
      })();
`;

const files = [
  "fale-conosco/index.html",
  "servicos/producao-audiovisual/index.html",
  "servicos/marketing-estrategia/index.html",
  "servicos/design-branding/index.html",
  "servicos/social-media/index.html",
];

const oldToggleCss =
  /      \.mobile-toggle \{\s*display: none;\s*font-size: 1\.8rem;\s*cursor: pointer;\s*\}/;

const oldNavMedia =
  /        \.nav-menu \{\s*position: fixed;\s*top: 70px;\s*left: -100%;[\s\S]*?        \.mobile-toggle \{\s*display: block;\s*\}/;

const oldToggleHtml =
  /          <div class="mobile-toggle" id="mobileToggle">\s*<i class="fas fa-bars"><\/i>\s*<\/div>/;

const mobileJsPatterns = [
  /      \/\/ Mobile toggle[\s\S]*?      \}\);\s*\n\n      \/\/ Form handling/,
  /      const mobileToggle = document\.getElementById\("mobileToggle"\);[\s\S]*?      \}\);\s*\n    <\/script>/,
  /      const mobileToggle = document\.querySelector\("\.mobile-toggle"\);[\s\S]*?      \}\);\s*\n    <\/script>/,
];

for (const rel of files) {
  const filePath = path.join(root, rel);
  let html = fs.readFileSync(filePath, "utf8");
  let changed = false;

  if (oldToggleCss.test(html)) {
    html = html.replace(oldToggleCss, MOBILE_BASE_CSS);
    changed = true;
  }

  if (oldNavMedia.test(html)) {
    html = html.replace(oldNavMedia, MOBILE_MEDIA_CSS);
    changed = true;
  }

  if (oldToggleHtml.test(html)) {
    html = html.replace(oldToggleHtml, TOGGLE_HTML);
    changed = true;
  }

  if (!html.includes('id="navOverlay"')) {
    html = html.replace(/    <\/header>\n/, `    </header>${OVERLAY_HTML}\n`);
    changed = true;
  }

  for (const pattern of mobileJsPatterns) {
    if (pattern.test(html)) {
      if (pattern.source.includes("Form handling")) {
        html = html.replace(
          pattern,
          `${MOBILE_JS}\n      // Form handling`,
        );
      } else {
        html = html.replace(pattern, `${MOBILE_JS}    </script>`);
        html = html.replace(/    <\/script>\s*<\/script>/, "    </script>");
      }
      changed = true;
      break;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, html, "utf8");
    console.log("Updated:", rel);
  } else {
    console.log("Skipped (no match):", rel);
  }
}

console.log("Done.");
