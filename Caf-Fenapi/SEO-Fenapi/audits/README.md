# audits/

Report di audit SEO del sito `fenapipiemonte.org`. Snapshot in un dato momento, datati.

## Cosa va qui

- Audit tecnico (Core Web Vitals, sitemap, robots.txt, indexability, redirect chain, mobile)
- Audit on-page (title, meta description, H1, structured data, internal linking)
- Baseline e snapshot periodici da Search Console e GA4
- Audit del blog SEO esistente
- Audit accessibilità (WCAG) se rilevante per SEO

## Cosa NON va qui

- Brief di modifica → vanno in `../briefs/`
- Keyword research / competitor analysis → vanno in `../research/`
- Script che generano gli audit → vanno in `../scripts/` (gli output li lasci qui)

## Naming

`NNN-titolo-kebab-case.md` con numerazione progressiva, es:
- `001-audit-tecnico-iniziale.md`
- `002-baseline-search-console.md`
- `003-baseline-ga4.md`

Includi sempre in cima al file: data dell'audit, fonte dati, scope (quali pagine/sezioni), e una sezione "Findings prioritari" che linki ai brief generati come follow-up.
