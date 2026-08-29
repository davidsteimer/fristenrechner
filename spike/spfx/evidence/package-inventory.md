# Paketinventar SPK-SPFX-01

## Zusammenfassung

| Merkmal | Wert |
| --- | --- |
| Dateiname | `fristenrechner-spfx-spike.sppkg` |
| SHA-256 | `558dd7c5c227650b251046e467e38a5c5ed2f59ad2b5147e09aebbf012d763f1` |
| Komprimierte Grösse | 135557 Bytes |
| Einträge | 21 |
| Unkomprimierte Nutzgrösse | 459785 Bytes |
| Client-Assets eingebettet | ja |
| Externe Skriptquelle | nein |
| Graph- oder API-Freigabe | nein |
| Domain-isoliert | nein |
| Unterstützte Hosts | `SharePointWebPart`, `TeamsTab` |

## Wesentliche Einträge

| Pfad | Grösse | Zweck |
| --- | ---: | --- |
| `AppManifest.xml` | 1218 | SharePoint-Appmanifest |
| `f5ceb063-e5dc-498e-93a6-60a8c5890279/WebPart_69cfde67-2e4a-4fed-83ea-5d7ceb8df239.xml` | 3347 | WebPart- und Hostmanifest |
| `ClientSideAssets/FristenrechnerSpikeWebPartStrings_de-de_*.js` | 519 | deutsche Property-Pane-Texte |
| `ClientSideAssets/FristenrechnerSpikeWebPartStrings_fr-fr_*.js` | 562 | französische Property-Pane-Texte |
| `ClientSideAssets/FristenrechnerSpikeWebPartStrings_en-us_*.js` | 514 | englische Rückfalltexte |
| `ClientSideAssets/fristenrechner-spike-web-part_f711ff9cbb44d3ce66d6.js` | 446487 | Produktionsbundle |
| `ClientSideAssets/fristenrechner-spike-web-part_f711ff9cbb44d3ce66d6.js.LICENSE.txt` | 821 | Lizenzhinweise der Bundleabhängigkeiten |
| `ClientSideAssets/69cfde67-2e4a-4fed-83ea-5d7ceb8df239_color.png` | 955 | metadatafreies Teams-Farbsymbol im Steimer-Design |
| `ClientSideAssets/69cfde67-2e4a-4fed-83ea-5d7ceb8df239_outline.png` | 197 | metadatafreies Teams-Kontursymbol |

`unzip -t` meldete für sämtliche Einträge `OK` und keine Fehler in den komprimierten Daten.

Beide Teams-Symbole werden mit dem versionierten Skript `scripts/generate-teams-icons.py` aus festen Farb- und Geometrieangaben erzeugt. Die Quelldateien und die eingebetteten Paketeinträge enthalten ausschliesslich `IHDR`, `IDAT` und `IEND`. EXIF-, XMP-, lokale Pfad- und Herkunftsmetadaten sind technisch nicht vorhanden.

Der technische `Name` im Appmanifest lautet `Fristenrechner Schweiz SPFx Machbarkeitsspike`. Diese Form erfüllt die SharePoint-`NameDefinition`. Der sichtbare WebPart-Titel `Fristenrechner Schweiz – Spike` bleibt davon unberührt.
