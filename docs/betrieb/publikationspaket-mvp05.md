# MVP 0.5 · Abschluss des lokalen Publikationspakets

Stand: 28. September 2026. **Lokal abgeschlossen und prüfsummengebunden, nicht veröffentlicht.** Der positive Outlook-Webtest erfüllt die Bedingung des Auftrags zum Paketabschluss. Keine GitHub-Push-, Deploy-Key-, P-Bereitstellungs- oder P-Betriebsfreigabe.

## Gegenstand und Nachweise

Das Paket verbindet die abgenommene AP19-Tranche, deren Quellenfreigabe, die definitive Datenpromotion, den geprüften Produktstand und die nachgeführten Betriebs-/IT-Unterlagen. 24 nationale Sozialregeln und 28 Berner Anbindungen bleiben sachlich, örtlich und zeitlich begrenzt. Es entsteht keine Freigabe zusätzlicher Kantone oder nicht modellierter Verfahren.

| Nachweis | Tatsächlicher Status |
| --- | --- |
| Quellen, AP19C1/C2/C3 und Datenübernahme | Abgenommen, unverändert gebunden |
| E/Q | Vier bestehende Instanzen mit Paket `0.5.0.0` und jeweils elfteiligen SharePoint-Mirrors installiert, 123 technische Prüfpunkte bestanden |
| Q-Fachabnahme und bestehender B2B-Gast | Durch David bestätigt, [menschlicher Nachweis](abnahme-q-mvp05.md) getrennt von technischen Tests |
| Outlook Desktop | Durch David manuell geprüft bestätigt, kein erfundener Codex-Desktopnachweis |
| Outlook Web | Tatsächlicher Import, gespeicherte Eigenschaften und anschliessende Entfernung genau des Testtermins verifiziert. [Outlook-Abschluss](outlook-pruefung-mvp05.md) |
| Historischer AP5-Stand | Alter Datenpin erhalten, Kompatibilität mit gemeinsamem neuen Code geprüft |
| Öffentliche Publikation und P | Nicht ausgeführt, weiterhin gesonderte Haltepunkte |

Die [maschinenlesbare Paketbindung](../../outputs/publication-mvp05-final-2026-09-28/publication-package.json) nennt jeden neu vorgesehenen oder geänderten öffentlichen Dateipfad mit Bytezahl und SHA-256. Sie bindet zusätzlich die zwölf Dateien des bereits lokalen Datencommits. Ihr eigenes Inventar nimmt sie zur Vermeidung einer zirkulären Prüfsumme ausdrücklich aus. Das Inventar ist ein lokaler Dateisnapshot, keine Behauptung einer bereits veröffentlichten oder vollständig committed Produktversion.

## Unveränderte Auslieferungsartefakte

| Datei im Release-Artefaktordner | Bytes | SHA-256 |
| --- | ---: | --- |
| `fristenrechner-schweiz-0.5.0.0.sppkg` | 222’393 | `f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39` |
| `fristenrechner-mvp05-sharepoint-mirror.zip` | 105’987 | `17baf1b097335c318b366b75ca53d5b64ca1ad713805d7370116a1d6db4cf9fa` |
| `fristenrechner-mvp05-steimer-web.zip` | 484’549 | `be2d81b9a0730ebad9fb3b47a37923f2c0c0aaa2c58c57422dc6b0f53e5a1fa8` |

Verbindlicher Pfad: [`outputs/release-mvp05-2026-09-28/artifacts/`](../../outputs/release-mvp05-2026-09-28/artifacts/). Kein Neubau und keine neue Version wegen des Dokumentationsabschlusses. Die drei Dateien wurden erneut gegen den archivierten Artefaktnachweis geprüft. Das historische SPPKG am älteren Standardpfad bleibt absichtlich `0.4.0.1`.

Datenpin: `3109c39730f10d31cb6c57200b36dd5091d7bcd1`, unverändert und noch nicht öffentlich verifiziert. Manifest SHA-256: `3aa09c80c93ef56d472748c4a5496d439537272d96491497b2c678e3c7e20715`. Alle elf Laufzeitdateien stimmen mit diesem lokalen Datencommit überein. Der Mirror ist vor der GitHub-Publikation zwingend explizit zu konfigurieren. Das statische P-Paket enthält seine Daten lokal, sein lokaler Erfolg ersetzt keine Hostingvorprüfung.

## Schutz des Publikationsumfangs

Kein pauschales `git add .`. Private Websitebackups, `Userinput/`, `.work/`, Arbeitskopien, Schlüssel und die vorbestehende Benutzeränderung am historischen Word-Projektplan werden ausgeschlossen. Der neue Dateiumfang wird über das explizite Inventar gebunden. Der Wordplan und die zwei vorhandenen privaten ZIP-Backups wurden nicht verändert. Historische hashgebundene Quellen-, Abnahme-, Build- und Prüfberichte behalten ihre damaligen Status und werden durch neue Abschlussnachweise ergänzt.

Die gezielte Textmusterprüfung findet im vorgesehenen neuen Textumfang keine konkreten Zugangsschlüssel, privaten Kontoadressen, Tenantadressen oder persönlichen lokalen Benutzerpfade. Quelltexte mit Redaktionsmustern und öffentliche Webpfade sind von tatsächlichen Geheimnissen unterschieden. Private relative Evidenzverweise in historischen Nachweisen bedeuten nicht, dass deren Ziele veröffentlicht werden.

Die neun neu hinzukommenden Quellen-PDFs wurden zusätzlich begrenzt geprüft: drei direkte amtliche Abrufe und sechs Gerichtstexte über den nichtamtlichen Mirror entscheidsuche.ch. Alle Originalhashes stimmen mit Abruf- und Quellenregister überein. Keine Verschlüsselung, Anhänge, JavaScript, zusätzliche Aktionen, Launch, RichMedia, XFA oder AcroForm gefunden. Das `OpenAction`-Seitenziel im IVöB-Dokument ist eine reine Anzeigeposition. Der unveränderte öffentliche HTTP-Link in den Wahlmaterialien ist kein Zugangsschlüssel. Die ersten Seiten wurden zur Identitätskontrolle gerendert und geöffnet. Keine erneute juristische Prüfung, keine visuelle Vollseitenkontrolle oder absolute Garantie für beliebig codierte Binärinhalte.

**Git-Metadaten bleiben separat:** Die lokale Historie einschliesslich Datencommit enthält die bestehende Autor-/Committerkennung mit lokaler Geräte-E-Mail. Sie wird nicht heimlich umgeschrieben. Vor einem späteren Push ist diese öffentliche Sichtbarkeit in die konkrete Freigabe einzubeziehen. Eine Dateiinhaltsprüfung anonymisiert keine Git-Historie.

## Frische Abschlussprüfungen

- 19 definitive Artefakttests bestanden, einschliesslich portablem Readback ohne private Arbeitsablage.
- Release-Datenprüfung bestanden: zehn Nutzartefakte, 24 nationale Regeln, 28 freigegebene Anbindungen, neun unveränderte Komponenten.
- 68 historische Bindungen und genau eine bereits dokumentierte Fortschreibung des lebenden Referenztests unverändert bestätigt.
- Drei Artefakte, elf Mirrordateien, zwölf Webdateien und zehn archivierte Baubelege erneut verifiziert.
- Private Host-/Abnahmeregister konsistent: technisch 123/123, Q-/Gast-/Desktop-Benutzernachweise und tatsächlicher Webimport separat abgeschlossen.
- Geänderte lokale Markdown-Linkziele und die finale Dateibindung geprüft. `git diff --check` ohne Befund.

Dies ist eine gezielte Abschlussprüfung bei unverändertem Produkt-/Artefaktstand. Die früher dokumentierten vollständigen Kern-/UI-/SPFx-Suiten bleiben frühere Buildnachweise. Kein neuer sauberer Git-Clone, keine frische Abhängigkeitsinstallation, kein erneuter vollständiger Build und keine umfassende Sicherheitsanalyse werden behauptet.

Die Dateibindung kann lokal erneut geprüft werden:

```sh
node scripts/verify-mvp05-publication.mjs
```

## Nächste getrennte Schritte

1. Konkrete GitHub-Publikation freigeben. Vorher den Snapshot erneut verifizieren und daraus eine ausschliesslich erlaubte Commitauswahl herstellen. Vollständiger Produktcommit beziehungsweise Nachweiscommit werden erst dann an das vorhandene Inventar gebunden. Der bereits gebaute Datenpin bleibt unverändert.
2. Einen allenfalls erforderlichen temporären Schreibschlüssel separat autorisieren. Nach Push den öffentlichen Datenpin und Artefaktbytes verifizieren und den Schlüssel wieder entfernen. Ein Push erzeugt nicht automatisch GitHub-Release-Anhänge.
3. Für P zunächst den offenen Hostingbefund belastbar klären. Danach eigene Bereitstellungsfreigabe, frische Sicherung, temporäre Vorprüfung, öffentliche Matrix und Betriebsentscheid. Keine Hostingänderung oder Supportnachricht aus diesem Paketabschluss.

Der lokale Abschluss ist erreicht. Öffentliche Betriebsfreigabe und Erweiterung des Q-Demokreises werden daraus nicht abgeleitet. [Releasehinweise](release-notes-mvp05.md) und [Dritt-Tenant-Anleitung](installation-und-betrieb-dritttenants.md) fassen Produktumfang und Installationsvoraussetzungen zusammen.
