# SPFx-Machbarkeitsspike

Dieser Ordner enthält den Minimalprototyp aus `SPK-SPFX-01`. Er ist kein produktiver Fristenrechner. Der Spike prüft ein gemeinsames SPFx-WebPart für SharePoint Online und Microsoft Teams sowie den providerneutralen, vollständig validierten Bezug des AP5-Datenrelease.

## Gepinnte Toolchain

| Baustein | Version |
| --- | --- |
| Node.js | 22.23.2 |
| SPFx | 1.23.2 |
| React und React DOM | 17.0.1 |
| Fluent UI React | 8.106.4 |
| TypeScript | 5.8.x gemäss Generator |
| Heft | 1.2.17 |

## Lokaler Nachweis

```bash
nvm use
npm ci
python3 scripts/generate-teams-icons.py
npm test
npm run build
```

`npm run build` validiert zuerst die Kernlogik und erzeugt anschliessend das Paket `sharepoint/solution/fristenrechner-spfx-spike.sppkg` mit eingebetteten Client-Assets.

Die JSON-Schemas werden vor Test, Build und lokalem Start byteidentisch aus dem Repository-Stamm nach `src/core/schemas/` synchronisiert. Dieses generierte Verzeichnis wird nicht als eigenständige fachliche Quelle gepflegt.

Die Teams-Symbole werden mit einem Standardbibliotheks-Skript aus festen Steimer-Farben und Geometrien erzeugt. Die PNG-Dateien enthalten nur `IHDR`, `IDAT` und `IEND` und damit keine EXIF-, XMP- oder Herkunftsmetadaten.

## Konfiguration

Die WebPart-Eigenschaften enthalten:

- eine auf einen unveränderlichen Git-Commit gepinnte GitHub-Basisadresse
- einen konfigurierbaren SharePoint-Mirrorpfad

Der Mirrorpfad bezeichnet den serverrelativen Bibliotheksordner, in dem `manifest.json` und die im Manifest genannten Unterordner liegen. Der Abruf erfolgt mit `SPHttpClient` im Benutzerkontext. Das Paket beantragt keine Graph- oder Entra-API-Berechtigungen.

## Lizenz

Der Programmcode steht unter AGPL-3.0-only. Die übrigen Inhalte des Hauptprojekts behalten ihre jeweils ausgewiesene Lizenz.
