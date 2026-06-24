# ForgePool Site

Astro-basierte Pre-Launch Website für ForgePool.

## Lokale Entwicklung

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
npm run preview
```

## Struktur

- `src/pages/` enthält die Seiten: Start, Blog, Roadmap, Kontakt
- `src/components/` enthält wiederverwendbare UI-Bausteine
- `src/styles/global.css` enthält Design-Tokens und Responsive Styles
- `public/` enthält Logos, Icons und Hintergrundbilder

## Deployment zu Azure Static Web Apps

Für GitHub Actions muss im Repo das Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` gesetzt werden.

## V5 changes

- Blog archive restored to full content width.
- Blog newsletter/email box shortened on desktop.
- Mobile/tablet header is fixed so it remains visible while scrolling.
