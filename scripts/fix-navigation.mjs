/**
 * Padroniza navegação, links e remove referências CAPTCHA.
 * Uso: node scripts/fix-navigation.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const report = {
  filesProcessed: [],
  linksFixed: [],
  captchaRemoved: [],
  issuesFound: [],
  pagesFixed: [],
};

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "scripts" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

function getDepth(filePath) {
  const rel = path.relative(ROOT, path.dirname(filePath));
  if (!rel || rel === ".") return 0;
  return rel.split(path.sep).length;
}

function prefixForDepth(depth) {
  if (depth === 0) return "";
  return "../".repeat(depth);
}

function navUrls(depth) {
  const p = prefixForDepth(depth);
  return {
    home: `${p}index.html`,
    quemSomos: `${p}quem-somos/index.html`,
    servicos: `${p}index.html#servicos`,
    jobs: `${p}index.html#jobs`,
    faleConosco: `${p}fale-conosco/index.html`,
    logo: `${p}index.html`,
  };
}

const SERVICE_HEADER = (urls, active = "") => `<header class="header">
      <div class="container">
        <div class="navbar">
          <div class="logo"><a href="${urls.logo}">BEFOCTOR</a></div>
          <div class="mobile-toggle" id="mobileToggle">
            <i class="fas fa-bars"></i>
          </div>
          <ul class="nav-menu" id="navMenu">
            <li><a href="${urls.home}"${active === "home" ? ' class="active"' : ""}>Home</a></li>
            <li><a href="${urls.quemSomos}"${active === "quem" ? ' class="active"' : ""}>Quem somos</a></li>
            <li><a href="${urls.servicos}"${active === "servicos" ? ' class="active"' : ""}>Serviços</a></li>
            <li><a href="${urls.jobs}"${active === "jobs" ? ' class="active"' : ""}>Jobs</a></li>
            <li><a href="${urls.faleConosco}"${active === "fale" ? ' class="active"' : ""}>Fale conosco</a></li>
          </ul>
        </div>
      </div>
    </header>`;

const SERVICE_FOOTER = (urls) => `<footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <div class="logo">BEFOCTOR</div>
            <p>
              Produtora audiovisual premium. Criamos narrativas que posicionam
              marcas no mercado.
            </p>
          </div>
          <div class="footer-col">
            <h4>FALE CONOSCO</h4>
            <div class="footer-links">
              <a href="${urls.faleConosco}"><i class="fas fa-phone-alt"></i> +55 (83) 9996-7111</a>
              <a href="mailto:befoctor@gmail.com"><i class="far fa-envelope"></i> befoctor@gmail.com</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>LINKS</h4>
            <div class="footer-links">
              <a href="${urls.home}">Home</a>
              <a href="${urls.quemSomos}">Quem somos</a>
              <a href="${urls.servicos}">Serviços</a>
              <a href="${urls.jobs}">Jobs</a>
              <a href="${urls.faleConosco}">Fale conosco</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>REDES SOCIAIS</h4>
            <div class="social-icons">
              <a href="https://www.instagram.com/befoctor/" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a>
              <a href="https://wa.me/558399967111" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i></a>
            </div>
          </div>
        </div>
        <div class="copyright">
          <p>© 2025 Befoctor — Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>`;

function removeCaptcha(content, filePath) {
  let html = content;
  const before = html;

  html = html.replace(/<script[^>]*recaptcha[^>]*>[\s\S]*?<\/script>\s*/gi, "");
  html = html.replace(/<script[^>]*google\.com\/recaptcha[^>]*>[\s\S]*?<\/script>\s*/gi, "");
  html = html.replace(/<script[^>]*turnstile[^>]*>[\s\S]*?<\/script>\s*/gi, "");
  html = html.replace(/<script[^>]*id=['"][^'"]*wpcf7-recaptcha[^'"]*['"][\s\S]*?<\/script>\s*/gi, "");
  html = html.replace(/<script[^>]*id=['"][^'"]*contact-form-7[^'"]*['"][\s\S]*?<\/script>\s*/gi, "");
  html = html.replace(/<iframe[^>]*recaptcha[^>]*>[\s\S]*?<\/iframe>\s*/gi, "");
  html = html.replace(/<div[^>]*class=['"][^'"]*g-recaptcha[^'"]*['"][\s\S]*?<\/div>\s*/gi, "");
  html = html.replace(/<input[^>]*_wpcf7_recaptcha[^>]*>\s*/gi, "");
  html = html.replace(/data-sitekey=['"][^'"]*['"]\s*/gi, "");
  html = html.replace(/grecaptcha\.execute\([^)]*\);?/gi, "");
  html = html.replace(/https?:\/\/www\.google\.com\/recaptcha\/[^\s"']+/gi, "");

  if (html !== before) {
    report.captchaRemoved.push(path.relative(ROOT, filePath));
  }
  return html;
}

function normalizeExtensions(content) {
  return content
    .replace(/index-1\.html/gi, "index.html")
    .replace(/index\.htm/gi, "index.html")
    .replace(/nossos-servicos/gi, "servicos");
}

function fixIndexPage(html) {
  const urls = navUrls(0);
  let out = html;

  out = out.replace(/id="nossos-servicos"/gi, 'id="servicos"');
  out = out.replace(/href="index\.html"/gi, `href="${urls.home}"`);
  out = out.replace(
    /<a href="index\.html">\s*<img/gi,
    `<a href="${urls.logo}"><img`,
  );

  // Header nav (uppercase style)
  out = out.replace(
    /<nav class="nav-menu">[\s\S]*?<\/nav>/i,
    `<nav class="nav-menu">
            <a href="${urls.home}" class="active">HOME</a>
            <a href="${urls.quemSomos}">QUEM SOMOS</a>
            <a href="#servicos">SERVIÇOS</a>
            <a href="#jobs">JOBS</a>
            <a href="${urls.faleConosco}">FALE CONOSCO</a>
          </nav>`,
  );

  // Logo link
  out = out.replace(
    /<a href="[^"]*">\s*<img src="img\/logo\.png"/i,
    `<a href="${urls.logo}"><img src="img/logo.png"`,
  );

  // Service cards
  const services = [
    "producao-audiovisual",
    "marketing-estrategia",
    "design-branding",
    "social-media",
  ];
  for (const slug of services) {
    out = out.replace(
      new RegExp(`href="servicos/${slug}/index\\.html"`, "gi"),
      `href="servicos/${slug}/index.html"`,
    );
  }

  // Footer links
  out = out.replace(
    /<li><a href="[^"]*">Home<\/a><\/li>\s*<li><a href="[^"]*">Quem Somos<\/a><\/li>\s*<li><a href="[^"]*">Serviços<\/a><\/li>\s*<li><a href="[^"]*">Jobs<\/a><\/li>/i,
    `<li><a href="${urls.home}">Home</a></li>
              <li><a href="${urls.quemSomos}">Quem Somos</a></li>
              <li><a href="#servicos">Serviços</a></li>
              <li><a href="#jobs">Jobs</a></li>`,
  );

  out = out.replace(/fale-conosco\/index\.html/gi, urls.faleConosco);

  return out;
}

function fixQuemSomos(html) {
  const urls = navUrls(1);
  let out = html;

  out = out.replace(
    /<nav class="nav-menu">[\s\S]*?<\/nav>/i,
    `<nav class="nav-menu">
          <a href="${urls.home}">HOME</a>
          <a href="${urls.quemSomos}" class="active">QUEM SOMOS</a>
          <a href="${urls.servicos}">SERVIÇOS</a>
          <a href="${urls.jobs}">JOBS</a>
          <a href="${urls.faleConosco}">FALE CONOSCO</a>
        </nav>`,
  );

  out = out.replace(/href="\.\.\/servicos\/"/gi, `href="${urls.servicos}"`);
  out = out.replace(/href="\.\.\/fale-conosco\/"/gi, `href="${urls.faleConosco}"`);
  out = out.replace(/href="\.\.\/index\.html#jobs"/gi, `href="${urls.jobs}"`);
  out = out.replace(/href="\.\.\/index\.html"/gi, `href="${urls.home}"`);

  // Footer
  out = out.replace(
    /<li><a href="\.\.\/index\.html">Home<\/a><\/li>[\s\S]*?<li><a href="\.\.\/fale-conosco\/">Fale Conosco<\/a><\/li>/i,
    `<li><a href="${urls.home}">Home</a></li>
              <li><a href="${urls.quemSomos}">Quem Somos</a></li>
              <li><a href="${urls.servicos}">Serviços</a></li>
              <li><a href="${urls.jobs}">Jobs</a></li>
              <li><a href="${urls.faleConosco}">Fale Conosco</a></li>`,
  );

  return out;
}

function fixFaleConosco(html) {
  const urls = navUrls(1);
  let out = html;

  const navBlock = `<ul class="nav-menu" id="navMenu">
            <li><a href="${urls.home}">Home</a></li>
            <li><a href="${urls.quemSomos}">Quem somos</a></li>
            <li><a href="${urls.servicos}">Serviços</a></li>
            <li><a href="${urls.jobs}">Jobs</a></li>
            <li><a href="index.html" class="active">Fale conosco</a></li>
          </ul>`;

  out = out.replace(/<ul class="nav-menu" id="navMenu">[\s\S]*?<\/ul>/i, navBlock);

  const footerLinks = `<div class="footer-links">
              <a href="${urls.home}">Home</a>
              <a href="${urls.quemSomos}">Quem somos</a>
              <a href="${urls.servicos}">Serviços</a>
              <a href="${urls.jobs}">Jobs</a>
              <a href="index.html">Fale conosco</a>
            </div>`;

  out = out.replace(
    /<div class="footer-links">[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-col">\s*<h4>Contato<\/h4>/i,
    `${footerLinks}
          </div>
          <div class="footer-col">
            <h4>Contato</h4>`,
  );

  return out;
}

function fixServicePage(html, filePath) {
  const urls = navUrls(2);
  let out = html;

  if (out.includes("<header class=\"header\">...</header>")) {
    out = out.replace(
      /<header class="header">\.\.\.<\/header>/i,
      SERVICE_HEADER(urls),
    );
    report.issuesFound.push(`Header placeholder corrigido: ${path.relative(ROOT, filePath)}`);
  } else {
    out = out.replace(/<header class="header">[\s\S]*?<\/header>/i, SERVICE_HEADER(urls));
  }

  if (out.includes('<footer class="footer">...</footer>')) {
    out = out.replace(/<footer class="footer">\.\.\.<\/footer>/i, SERVICE_FOOTER(urls));
  } else {
    out = out.replace(/<footer class="footer">[\s\S]*?<\/footer>/i, SERVICE_FOOTER(urls));
  }

  out = out.replace(/href="\.\.\/\.\.\/\.\.\/index\.html"(?!#)/gi, `href="${urls.servicos}"`);
  out = out.replace(/href="\.\.\/\.\.\/\.\.\/index\.html#nossos-servicos"/gi, `href="${urls.servicos}"`);
  out = out.replace(/href="\.\.\/\.\.\/\.\.\/index\.html#servicos"/gi, `href="${urls.servicos}"`);
  out = out.replace(/href="\.\.\/\.\.\/\.\.\/index\.html#jobs"/gi, `href="${urls.jobs}"`);
  out = out.replace(/href="#jobs"/gi, `href="${urls.jobs}"`);
  out = out.replace(/href="\.\.\/\.\.\/\.\.\/fale-conosco\/index\.html"/gi, `href="${urls.faleConosco}"`);

  return out;
}

function renameHtmToHtml() {
  walk(ROOT, (file) => {
    if (!/\.htm$/i.test(file)) return;
    const htmlFile = file.replace(/\.htm$/i, ".html");
    if (fs.existsSync(htmlFile)) fs.unlinkSync(file);
    fs.renameSync(file, htmlFile);
    report.linksFixed.push(`Renomeado: ${path.relative(ROOT, file)} → index.html`);
  });
}

function processHtmlFiles() {
  walk(ROOT, (file) => {
    if (!/\.html?$/i.test(file)) return;
    if (file.includes(`${path.sep}scripts${path.sep}`)) return;

    let content = fs.readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");

    content = removeCaptcha(content, file);
    content = normalizeExtensions(content);

    if (rel === "index.html") {
      content = fixIndexPage(content);
      report.pagesFixed.push("Home (index.html)");
    } else if (rel === "quem-somos/index.html") {
      content = fixQuemSomos(content);
      report.pagesFixed.push("Quem somos");
    } else if (rel === "fale-conosco/index.html") {
      content = fixFaleConosco(content);
      report.pagesFixed.push("Fale conosco");
    } else if (rel.startsWith("servicos/") && rel.endsWith("/index.html")) {
      content = fixServicePage(content, file);
      report.pagesFixed.push(rel);
    }

    fs.writeFileSync(file, content, "utf8");
    report.filesProcessed.push(rel);
  });
}

function removeWpJunk() {
  for (const dir of ["wp-json", "xmlrpc.php"]) {
    const target = path.join(ROOT, dir);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
      report.issuesFound.push(`Removido lixo WP: ${dir}`);
    }
  }
}

function writeReport() {
  const md = `# Relatório — Correção de Navegação Befoctor

Gerado em: ${new Date().toISOString()}

## Resumo

- **Arquivos processados:** ${report.filesProcessed.length}
- **Páginas com navegação corrigida:** ${report.pagesFixed.length}
- **Referências CAPTCHA removidas:** ${report.captchaRemoved.length}

## Problemas encontrados

${report.issuesFound.map((i) => `- ${i}`).join("\n") || "- Nenhum"}

## Páginas corrigidas

${report.pagesFixed.map((p) => `- ${p}`).join("\n")}

## Padronização de links

| Página | Home | Serviços (menu) | Jobs (menu) |
|--------|------|-----------------|-------------|
| Raiz | \`index.html\` | \`#servicos\` | \`#jobs\` |
| Subpasta (1 nível) | \`../index.html\` | \`../index.html#servicos\` | \`../index.html#jobs\` |
| Serviços (2 níveis) | \`../../index.html\` | \`../../index.html#servicos\` | \`../../index.html#jobs\` |

## Cards de serviços (Home)

Cada card abre página individual:

- \`servicos/producao-audiovisual/index.html\`
- \`servicos/marketing-estrategia/index.html\`
- \`servicos/design-branding/index.html\`
- \`servicos/social-media/index.html\`

## Jobs

Os cards de jobs na Home são vitrines (sem páginas individuais no projeto). O menu **Jobs** aponta para \`#jobs\` na Home.

## CAPTCHA

Scripts e iframes de reCAPTCHA/Turnstile/CF7 removidos dos HTML. Formulários usam validação local + WhatsApp/e-mail.

## Como testar

\`\`\`bash
cd befoctor-agencia
npx serve .
\`\`\`

Testar: Home → Fale Conosco → Home; Serviços (âncora); cada card de serviço; Jobs (âncora).

## Melhorias futuras

1. Criar páginas individuais para cada job (opcional).
2. Unificar header/footer em um único arquivo JS de componentes (se migrar para build).
3. Adicionar \`politica-de-privacidade/index.html\` (link no formulário aponta para #).
4. Configurar Formspree ou API para envio de formulário sem mailto.
`;

  fs.writeFileSync(path.join(ROOT, "RELATORIO-NAVEGACAO.md"), md, "utf8");
}

console.log("=== Corrigindo navegação Befoctor ===\n");
renameHtmToHtml();
removeWpJunk();
processHtmlFiles();
writeReport();
console.log("\n=== Concluído ===");
console.log(`Arquivos: ${report.filesProcessed.length}`);
console.log(`Relatório: RELATORIO-NAVEGACAO.md`);
