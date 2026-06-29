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


## V8 Änderung

Sitemap-Integration vorübergehend entfernt, da Azure/Oryx-Build mit @astrojs/sitemap fehlschlug. Kann später sauber ergänzt werden.


## Blog schreiben und veröffentlichen

Blogartikel liegen als Markdown-Dateien unter:

```text
src/content/blog/
```

Medien/Bilder liegen artikelbezogen unter:

```text
public/media/blog/<artikel-slug>/
```

Beispiel:

```text
src/content/blog/meilenstein-1-abgeschlossen.md
public/media/blog/meilenstein-1-abgeschlossen/hero.webp
public/media/blog/meilenstein-1-abgeschlossen/image-01.png
```

Markdown-Bildreferenz:

```md
![Beschreibung](/media/blog/meilenstein-1-abgeschlossen/image-01.png)
```

Veröffentlichung:

```powershell
npm run dev
npm run build
git add .
git commit -m "blog: publish <titel>"
git push
```


### Optionales Titelbild

Wenn ein Artikel ein Titelbild erhalten soll, füge im Frontmatter hinzu:

```yaml
cover: "/media/blog/meilenstein-1-abgeschlossen/hero.webp"
coverAlt: "Beschreibung des Titelbildes"
```

Die Datei muss dann tatsächlich unter `public/media/blog/meilenstein-1-abgeschlossen/hero.webp` liegen.


## Featured-Cover und Neu-Markierung

Featured-Kacheln nutzen automatisch das Feld `cover` aus dem Artikel-Frontmatter.

```yaml
cover: "/media/blog/meilenstein-1-abgeschlossen/hero.webp"
coverAlt: "Beschreibung des Titelbildes"
```

Wenn kein `cover` gesetzt ist, nutzt die Kachel automatisch das Standardbild `public/images/backgrounds/card-cube.png`.

Artikel werden automatisch mit `Neu` markiert, wenn das Veröffentlichungsdatum (`date`) maximal 14 Tage zurückliegt. Dafür ist kein zusätzliches Frontmatter-Feld nötig.


## V11 Layout-Hinweis

Die `Neu`-Markierung wird automatisch über das Artikeldatum erzeugt:

- Featured-Kacheln: `Neu` sitzt oben rechts separat, damit Kategorie/Datum links stabil bleiben.
- Journal Archiv: `Neu` sitzt direkt hinter dem Artikeltitel, nicht neben dem Kategorie-Tag.

Featured-Cover werden weiterhin über `cover` im Frontmatter gesteuert. Ohne `cover` greift das Standardbild.


## V12 Subscribe-Hinweis

Die Subscribe-/Waitlist-Felder speichern noch keine Daten. Beim Klick auf den Button wird ein Hinweis angezeigt.

- Startseite/Kontakt: Hinweis erscheint unterhalb des Formulars.
- Blog-Newsletterleiste: Hinweis erscheint innerhalb der Box über die volle Breite.
- `mailto:` wurde aus den Subscribe-Formularen entfernt; die direkte Kontakt-Mail bleibt als normaler Kontakt-Link erhalten.


## V13 Layout-Hinweis

- Die Featured-Metazeile nutzt `max-width: calc(100% - 7rem)` und `white-space: nowrap`, damit Kategorie/Datum auf Desktop nicht umbrechen.
- Die Blogseite darf jetzt vertikal scrollen. Damit bleibt der Newsletter-Hinweis innerhalb der Seite erreichbar.
- Auf schmaleren Viewports darf die Metazeile wieder umbrechen, damit Mobile nicht kaputtläuft.


## V14 Impressum und Datenschutz

Ergänzt wurden:

- `/impressum/`
- `/datenschutz/`
- globaler Footer mit Impressum, Datenschutz und Kontakt
- Datenschutz-Link in den Subscribe-/Waitlist-Hinweisen

Die Newsletter-/Benachrichtigungsfelder bleiben weiterhin deaktiviert und speichern keine E-Mail-Adressen.
