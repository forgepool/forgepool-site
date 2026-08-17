# ForgePool Site

## ForgePool

ForgePool ist ein Build-in-Public-Projekt rund um Cardano, Cloud und
Infrastructure Engineering. Dieses Repository enthält die öffentliche,
statisch erzeugte Website [forgepool.de](https://forgepool.de).

Die Website basiert auf [Astro](https://astro.build/) und wird über Azure
Static Web Apps bereitgestellt. Der Quellcode des Repositories ist öffentlich
einsehbar.

## Repository purpose

Dieses Repository enthält:

- die öffentliche Website und ihre Astro-Komponenten,
- Journal- und Blog-Inhalte,
- öffentliche Bilder, Icons und weitere Assets,
- CI- und Deployment-Workflows.

Es enthält nicht:

- den Anwendungscode von ForgePool Studio,
- Secret-Werte oder private Betriebsdaten,
- Azure-Infrastructure-State,
- interne Administration.

Content wird über ForgePool Studio gepflegt und durch einen kontrollierten
GitHub-Pull-Request-Workflow in dieses Repository veröffentlicht. Interne
Studio-Endpunkte und Betriebsdetails sind nicht Teil dieser Dokumentation.

## Architektur

Die ausgelieferte Anwendung ist eine statische Website:

```text
src/content/blog + Astro-Komponenten
  -> Astro Production Build
  -> Azure Static Web Apps
  -> Browser
```

### Publishing

```text
ForgePool Studio
  -> GitHub Branch
  -> Pull Request
  -> ForgePool Site CI
  -> Merge nach main
  -> Azure Static Web Apps Deployment
  -> öffentliche Website
```

### Withdrawal

```text
veröffentlichte Markdown-Datei
  -> Withdrawal Pull Request
  -> Markdown-Datei entfernt
  -> Merge nach main
  -> Azure Static Web Apps Deployment
  -> öffentliche Artikel-URL wird nicht mehr erzeugt
```

Ein Withdrawal entfernt den Artikel aus dem aktuellen Site-Build. Bereits
öffentliche Git- und Pull-Request-Historie bleibt davon unberührt.

## Content-Modell

Blogartikel liegen als Markdown-Dateien unter `src/content/blog/`. Das aktuelle
Astro-Schema definiert folgende Frontmatter-Felder:

| Feld | Typ | Bedeutung |
|---|---|---|
| `articleId` | UUID | Stabiler fachlicher Artikel-Identifier. |
| `title` | String | Öffentlicher Artikeltitel. |
| `description` | String | Kurzbeschreibung für Übersichten und Metadaten. |
| `date` | Datum | Redaktionelles Datum; es steuert Anzeige und Sortierung, ist aber nicht die technische Erstveröffentlichungszeit. |
| `publishedAt` | Datum, optional | Kanonischer technischer Zeitpunkt der ersten erfolgreichen Veröffentlichung. |
| `labelId` | UUID | Referenz auf das fachliche Label. Der sichtbare Labelname wird von der Site aufgelöst. |
| `featured` | Boolean, Standard `false` | Redaktionelle Hervorhebung. Nur explizit `true` markiert einen Beitrag als Featured. |
| `draft` | Boolean, Standard `false` | Drafts werden nicht in die statische öffentliche Ausgabe aufgenommen. |
| `cover` | String, optional | Öffentlicher Pfad zum Titelbild. |
| `coverAlt` | String, optional | Alternativtext beziehungsweise Bildbeschreibung. |

`slug` und `label` sind keine separaten Frontmatter-Felder: Astro leitet den
Slug aus dem Markdown-Dateinamen ab; der sichtbare Labelname wird anhand von
`labelId` aufgelöst.

### `date` und `publishedAt`

`date` ist redaktionell und kann unabhängig von der technischen
Erstveröffentlichung gewählt werden. `publishedAt` bleibt dagegen der
kanonische Zeitpunkt der ersten erfolgreichen Veröffentlichung. Normale spätere
Artikeländerungen dürfen diesen Zeitpunkt nicht neu starten.

### „Neu“

Die „Neu“-Markierung ist kein manuell gepflegtes `isNew`-Feld. Sie wird im
Browser ausschließlich aus `publishedAt` berechnet und ist exakt im Intervall

```text
[publishedAt, publishedAt + 14 Tage)
```

sichtbar. Nach Ablauf wird das Badge zur Laufzeit ausgeblendet; dafür ist kein
erneuter Content-Commit oder tägliches Deployment erforderlich. Fehlt ein
gültiges `publishedAt`, erscheint kein „Neu“-Badge. Es gibt keinen Fallback auf
`date`.

### Featured

Nur `featured: true` bedeutet eine redaktionelle Hervorhebung. Gibt es keine
explizit hervorgehobenen Artikel, zeigt die Website stattdessen die neuesten
Beiträge neutral als „Aktuelle Updates“ an. `featured` wird weder aus `date`
noch aus `publishedAt` abgeleitet.

### Medien

Artikelbezogene Medien liegen unter `public/media/blog/<slug>/` und werden aus
Markdown oder Frontmatter über öffentliche Pfade wie
`/media/blog/<slug>/hero.webp` referenziert. Weitere Hinweise stehen in
[`public/media/blog/README.md`](public/media/blog/README.md).

## Lokale Entwicklung

Astro 7 benötigt Node.js 22.12.0 oder neuer. Für eine reproduzierbare lokale
Installation und die im Repository vorhandenen Skripte:

```powershell
npm ci
npm run dev
npm test
npm run build
npm run preview
```

`npm run build` erzeugt die statische Ausgabe unter `dist/`. Das Repository
definiert derzeit keine eigenen `lint`- oder `typecheck`-Skripte.

## Projektstruktur

```text
.github/workflows/   CI und Azure-Deployment
public/              öffentliche Assets
src/components/      wiederverwendbare Astro-Komponenten
src/content/         Content-Schema und Blog-Content
src/layouts/         gemeinsame Seitenlayouts
src/pages/           statisch erzeugte Routen
src/styles/          globale Styles und Design-Tokens
test/                Tests der Darstellungslogik
```

## Repository- und Workflow-Schutz

Für `main` gilt ein aktives GitHub-Ruleset:

- Änderungen gelangen über Pull Requests nach `main`.
- `Validate Astro build` ist ein verpflichtender Status Check.
- Der Branch muss vor dem Merge auf dem aktuellen Stand sein.
- Branch-Löschung und Force Pushes sind blockiert.
- Als Merge-Methode sind normale Merge-Commits zugelassen.

Die GitHub-Workflows verwenden explizite read-only Permissions. Actions sind
auf vollständige Commit-SHAs gepinnt; zugelassen sind GitHub-eigene Actions und
die explizit gepinnte Azure Static Web Apps Deployment Action. Solche Pins
müssen bei geplanten Action-Updates bewusst aktualisiert werden.

Workflow-Ausführungen aus Pull Requests externer Contributors benötigen eine
Freigabe durch Maintainer. Ein Pull Request führt nur die Site-CI aus; das
Production-Deployment läuft bei einem Merge beziehungsweise Push nach `main`
und kann zusätzlich von berechtigten Maintainern manuell gestartet werden.

Für das öffentliche Repository sind Secret Protection einschließlich Push
Protection, Dependabot Alerts und Security Updates sowie CodeQL Default Setup
aktiviert. Diese Kontrollen reduzieren Risiken, garantieren aber weder einen
schwachstellenfreien Dependency-Stand noch vollständige Sicherheit.

## Issues und Contributions

Issues und Pull Requests sind öffentlich sichtbar. Externe Pull Requests sind
willkommen, durchlaufen jedoch die beschriebenen Freigabe- und CI-Grenzen. Ein
Merge nach `main` ist erst nach erfolgreichem Required Check möglich.

## Public visibility and license

Dieses Repository ist als Teil des Build-in-Public-Ansatzes von ForgePool
öffentlich sichtbar. Sofern nicht ausdrücklich anders angegeben, wird derzeit
keine Open-Source-Lizenz gewährt. Öffentliche Sichtbarkeit allein erteilt keine
Open-Source-Nutzungsrechte.
