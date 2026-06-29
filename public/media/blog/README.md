# Blog-Medien

Artikelbezogene Bilder liegen jeweils in einem eigenen Slug-Ordner.

Beispiel:

```text
public/media/blog/meilenstein-1-abgeschlossen/
├── hero.webp
├── image-01.png
└── image-02.png
```

Markdown-Referenz:

```md
![Terraform-Auszug](/media/blog/meilenstein-1-abgeschlossen/image-01.png)
```

Empfehlung:
- Hero-Bilder: WebP, ca. 1600 px Breite
- Screenshots: PNG, vorher sensible Informationen entfernen
- Zielgröße pro Bild: möglichst < 300–500 KB
