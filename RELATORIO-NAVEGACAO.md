# Relatório — Correção de Navegação Befoctor

Gerado em: 2026-05-20T17:58:58.267Z

## Resumo

- **Arquivos processados:** 7
- **Páginas com navegação corrigida:** 7
- **Referências CAPTCHA removidas:** 0

## Problemas encontrados

- Removido lixo WP: wp-json
- Removido lixo WP: xmlrpc.php
- Header placeholder corrigido: servicos\design-branding\index.html
- Header placeholder corrigido: servicos\social-media\index.html

## Páginas corrigidas

- Fale conosco
- Home (index.html)
- Quem somos
- servicos/design-branding/index.html
- servicos/marketing-estrategia/index.html
- servicos/producao-audiovisual/index.html
- servicos/social-media/index.html

## Padronização de links

| Página | Home | Serviços (menu) | Jobs (menu) |
|--------|------|-----------------|-------------|
| Raiz | `index.html` | `#servicos` | `#jobs` |
| Subpasta (1 nível) | `../index.html` | `../index.html#servicos` | `../index.html#jobs` |
| Serviços (2 níveis) | `../../index.html` | `../../index.html#servicos` | `../../index.html#jobs` |

## Cards de serviços (Home)

Cada card abre página individual:

- `servicos/producao-audiovisual/index.html`
- `servicos/marketing-estrategia/index.html`
- `servicos/design-branding/index.html`
- `servicos/social-media/index.html`

## Jobs

Os cards de jobs na Home são vitrines (sem páginas individuais no projeto). O menu **Jobs** aponta para `#jobs` na Home.

## CAPTCHA

Scripts e iframes de reCAPTCHA/Turnstile/CF7 removidos dos HTML. Formulários usam validação local + WhatsApp/e-mail.

## Como testar

```bash
cd befoctor-agencia
npx serve .
```

Testar: Home → Fale Conosco → Home; Serviços (âncora); cada card de serviço; Jobs (âncora).

## Melhorias futuras

1. Criar páginas individuais para cada job (opcional).
2. Unificar header/footer em um único arquivo JS de componentes (se migrar para build).
3. Adicionar `politica-de-privacidade/index.html` (link no formulário aponta para #).
4. Configurar Formspree ou API para envio de formulário sem mailto.
