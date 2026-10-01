# MVP 0.6 · Definitive lokale Releaseartefakte

Stand: 1. Oktober 2026. **Kontrollierte lokale Datenübernahme und definitive Builds abgeschlossen. Noch keine Installation, Veröffentlichung oder Änderung des P-Betriebs.**

Grundlage ist die ausdrückliche [Quellenabnahme und lokale Baufreigabe von David Steimer](../fachrecht/abnahme-quellen-mvp06.md). Sie schliesst die dokumentierte Wiederverwendung und die fortbestehenden Vorbehalte ein. Der Auftrag wurde ausschliesslich lokal vollzogen. Der letzte dokumentierte E-/Q-/P-Betriebsstand bleibt MVP 0.5 gemäss [Produktionsnachweis vom 28. September](produktionsbereitstellung-mvp05-2026-09-28.md), ohne neue Livebestandsaufnahme in diesem Arbeitsschritt.

## 1. Zusammengehöriger Release

| Gegenstand | Gebundener Stand |
| --- | --- |
| Anwendung / SPFx-Solution und Feature | `0.6.0` / `0.6.0.0`, bisherige Produkt-IDs unverändert |
| Datenrelease | `2026-10-01-mvp-06-approved.1` |
| Manifest / Mindestconsumer | `6.0.0` / `6.0.0` |
| Sozialverfahrenskatalog | `2.0.0`, 44 nationale Regeln und 50 ausschliesslich bernische Anbindungen |
| Neue Erlasse | EOG, FamZG, FLG, MVG und ÜLG im jeweils abgenommenen begrenzten Umfang |
| Zeitliche Abdeckung der Sozialfreigaben | 01.01.2026–31.12.2027, eigenständige rechtliche Zeitanker unverändert |
| Manifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Quellenfreigabe SHA-256 | `10f43005757c54a445f009d702b17a37f04e2dad530241201dbf6c4eebfc2cbb` |
| Lokaler Datencommit | `19b37336974f3ba7c72333763e1272425239b8cd`, ausschliesslich elf neue Laufzeitdateien, kein Push |
| Produktquellstand | Lokaler Arbeitsstand, über 117 archivierte Build-Eingaben gebunden. Noch kein vollständiger Produktcommit und keine Behauptung eines bereits öffentlich reproduzierbaren Checkouts |

Der [Promotionsnachweis](../../outputs/release-mvp06-2026-10-01/data-promotion.json) bestätigt neun byteidentische übrige Komponenten und den ausschliesslich auf Status-/Freigabemetadaten begrenzten Sozialkatalogwechsel. Die bisherigen 24 Regeln und 28 Berner Anbindungen bleiben unverändert. Nur die 20 neuen Regeln und 22 neuen Anbindungen wechseln kontrolliert von `candidate` auf `reviewed`. Alle 50 Freigabeverknüpfungen sind an die neue tatsächliche Quellenabnahme gebunden. Fachlogik, Ausschlüsse, Zuständigkeitsmerkmale, Zeitanker und Referenztermine sind nicht verändert.

Das Quellenregister umfasst jetzt 81 Einträge. Die bisherigen 57 bleiben unverändert, 24 sind ergänzt. Das neue Prüfereignis deckt 77 Manifestreferenzen ab. Die 82 ausschliesslichen Feiertagskatalogquellen behalten ihren historischen Prüfstand vom 22. September. AI-Konflikt, AVIV-Option B, OF-001, NE-Vorbehalt und die übrigen fachlichen Grenzen gelten fort. Die Übernahme ersetzt nicht die ordentliche periodische Prüfung.

## 2. Fertige Auslieferungsdateien

Alle drei Dateien liegen im [Artefaktordner](../../outputs/release-mvp06-2026-10-01/artifacts/).

| Datei | Grösse | SHA-256 |
| --- | --- | --- |
| [SPFx-Paket 0.6.0.0](../../outputs/release-mvp06-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.0.sppkg) | 227’954 Bytes | `85dd933ba08c9810e9f0cf4954b9cbc0d12ef4b8ad972f525d9a929023bbc681` |
| [SharePoint-Mirror](../../outputs/release-mvp06-2026-10-01/artifacts/fristenrechner-mvp06-sharepoint-mirror.zip) | 117’005 Bytes | `1ebe748393d80206ea38d020e4e1a58ce432458a3b273e5972cfcbc8627153f3` |
| [Statisches Webpaket für steimer.ch](../../outputs/release-mvp06-2026-10-01/artifacts/fristenrechner-mvp06-steimer-web.zip) | 499’092 Bytes | `3b54e098124649e18036303d38747f41b6374d913182766197fe65d34789d2ae` |

Der Mirror enthält genau elf Laufzeitdateien in der vorgesehenen relativen Struktur. Das Webpaket enthält zwölf Dateien mit eingebetteten Freigabedaten, lokalen Bibliotheken, Lizenzen und unveränderter Hostingkonfiguration. Das SPFx-Paket enthält seine Client-Assets, unterstützt SharePoint und Teams und beantragt keine zusätzlichen API-Berechtigungen.

**Datenquelle vor der Publikation:** Beide SPFx-Standardpins zeigen auf den oben genannten lokalen Datencommit. Alle elf Dateien wurden gegen dessen tatsächliche Git-Blobs geprüft. Der Commit ist noch nicht veröffentlicht. E/Q müssen deshalb bis zur GitHub-Publikation ausdrücklich ihre neuen, vollständig verifizierten SharePoint-Mirrors verwenden. Der nicht erreichbare Standardpin oder ein alter Cache ist kein gültiger MVP-0.6-Nachweis. Dritt-Tenant-Auslieferung mit Standardquelle erst nach öffentlich verifiziertem Pin.

Das tatsächliche dokumentierte MVP-0.5-Rückfallpaket bleibt unverändert, SHA-256 `f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39`. Auch das historische MVP-0.4-Paket im Stamm-Solutionordner bleibt erhalten, SHA-256 `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346`. Die ältere Datei im Stammordner ist nicht mit dem aktuellen Rückfallpaket gleichzusetzen. Vor einer Installation ist der tatsächliche Tenantbestand frisch zu prüfen.

## 3. Tatsächlich ausgeführte lokale Prüfungen

| Bereich | Ergebnis |
| --- | --- |
| TypeScript | Typecheck bestanden |
| Rechenkern und Oberfläche | 2’046 Tests bestanden, keine Fehler, Abbrüche oder ausgelassenen Tests |
| Statische Webausprägung | Zwölf Tests sowie Vorschau- und normaler Produktionsbuild bestanden |
| Python-Datenprüfungen | 181 Tests bestanden, darin 27 Prüfungen der definitiven Auslieferungsartefakte |
| Quellen-Governance | 30 Python- und 230 Node-Tests sowie acht Validator-Negativfälle bestanden |
| SPFx-Quellen und Datenanbieter | 145 Tests bestanden, einschliesslich tatsächlicher Format-6-Freigaben und aller 50 Anbindungen |
| Kompilierter und paketierter SPFx-Consumer | 68 Tests, Produktionsbau, CSS-Audit und Paketierung bestanden |
| Artefaktarchiv | Elf Mirror- und zwölf Webdateien geprüft. Portable Archivprüfung auch ohne `.work`, Git-Verzeichnis oder aktuelle Produktquellen bestanden |
| Lokale Browserstichprobe | Chrome am entpackten definitiven Webpaket: StPO 28.09.2026, MVG und ÜLG 16.10.2026, DE/FR, Datumserhalt, bereinigte Auswahl, ausserkantonale Sperre und leerer Datumseinstieg nach Neuladen |

Die Suiten überlappen und werden nicht zu einer Zahl unabhängiger juristischer Fallabnahmen addiert. Die echten freigegebenen Daten werden gegen die unveränderten AP17B-, AP19B- und AP20B-Referenzgrundlagen geprüft. Sämtliche 50 Sozialanbindungen werden auch im tatsächlich gebauten Consumer ausgewertet. Drei neue Paketprüfungen wurden zusätzlich unabhängig am endgültigen Paket wiederholt.

Es bleiben zwei bekannte ESLint-Hinweise zu ausdrücklich mit `null` beschriebenen JSON-Vertragsfeldern. Der separate Heft-/Jest-Schritt enthält keine eigenen Jest-Suiten. Die ausgewiesenen 145 und 68 Tests stammen aus den explizit ausgeführten Quell- und Pakettests, nicht aus dem leeren Jest-Lauf.

Die ersten Gesamtprüfungen deckten veraltete Erwartungen an den normalen MVP-0.5-Einstieg und eine historische AP20B-Testbindung auf. Sie wurden [eng begrenzt fortgeschrieben](../architektur/mvp06-testvertrag-fortschreibung.md), die Originale bleiben archiviert. Ein weiterer SPFx-Versuch überschritt unter gleichzeitiger Last mehrerer grosser Suiten Testzeitlimits. Der abschliessende separate Lauf bestand ohne Verlängerung der Zeitlimits. Frühere Fehlversuche werden nicht als erfolgreiche Nachweise verwendet.

Die [Browsernotiz](../../outputs/release-mvp06-2026-10-01/browser-verification.md) trennt sichtbare Erfolge von Steuerungsgrenzen. Native Datumsteile konnten gezielt gesetzt werden, generische Eingabeaufrufe waren zunächst unzuverlässig. Gespeicherte Kalenderdateien, Outlook, direkte Browserstorage-Werte, mobile Hostdarstellung, Mirrorabrufe und Gastzugriff wurden hier nicht erneut live geprüft. Der lokale HTTP-Testserver weist auch keine Green-Headerwirkung nach.

## 4. Dauerhafte Nachweise

- [Artefaktinventar und Prüfung](../../outputs/release-mvp06-2026-10-01/artifact-verification.json), SHA-256 `b1605744fe22e21aa012a78cb941ea5573fe4962fb1e11ad09b6331116f752ad`
- [Zusammengeführter lokaler Prüfnachweis](../../outputs/release-mvp06-2026-10-01/local-verification.json), SHA-256 `0bc6261ca5c898706a4ad74fbb229c871bee8655a72fc738e8246881c12bd6d4`
- [SPFx-Baunachweis](../../outputs/release-mvp06-2026-10-01/build-evidence/spfx-verification.json) mit 117 Eingabesnapshots und fünf archivierten Bauprotokollen. Insgesamt 123 archivierte Dateien, Original- und bereinigte Loghashes unterscheidbar
- [Lokale Gesamtprüfungen](../../outputs/release-mvp06-2026-10-01/local-check-evidence/), deren tatsächliche Rückgabecodes, Testzahlen und Loghashes der zusammengeführte Nachweis bindet
- [Quellenregisterübernahme](../../outputs/release-mvp06-2026-10-01/source-governance-adoption.json), [Datenpromotion](../../outputs/release-mvp06-2026-10-01/data-promotion.json) und [lokaler Datenpin](../../outputs/release-mvp06-2026-10-01/local-data-pin.json)

Der erneute Verpackungslauf war byteidentisch. Ein neuer SPFx-Kompilierungslauf ist wegen Buildmetadaten nicht pauschal als bytegleich zugesagt. Massgebend bleibt das konkrete oben gebundene Paket. Abweichende bereits bestehende Artefakte werden vom Packer nicht überschrieben.

```sh
npm run check:source-approval:mvp06
npm run test:data:mvp06
npm run test:artifacts:mvp06
npm run test:source-reviews
npm run check
```

Der vollständige Quellenaudit benötigt derzeit lokale Rohbelege. Der in [P06-01](deployment-mvp-06.md) beschriebene Abgleich zwischen privatem Vollaudit und öffentlich ausführbaren Prüfungen bleibt vor dem Push erforderlich. Portable Artefaktprüfung bedeutet nicht, dass bereits sämtliche Quellenprüfungen in einem öffentlichen frischen Checkout ausführbar sind.

## 5. Nächster Schritt

Die [E-/Q-Prüfmatrix](pruefmatrix-mvp06.md) ist vorbereitet, sämtliche Zielumgebungstests darin sind noch offen. Nächster Entscheid ist die ausdrücklich begrenzte Installation dieses Pakets und der neuen Mirrors in den vier bestehenden E-/Q-Instanzen. Die Freigabe muss die gemeinsame Codewirkung des Tenant-App-Katalogs einschliesslich historischer AP5-Ansicht und weiterer verbundener Instanzen nennen. Die AP5-Datenkonfiguration bleibt erhalten, keine zusätzliche Siteinstallation und keine Berechtigungsänderung.

Danach folgen technische E-/Q-Prüfung, manuelle Q-Abnahme und die getrennten GitHub- und P-Freigaben. Vor P sind der aktuelle Header-/Cachebefund, Rückfallstand und die direkte Storage-Kontrolle zu behandeln. Die auf MVP 0.5 beschränkte Risikoakzeptanz wird nicht automatisch übertragen. Neue Infrastruktur, weitere Kantone und eine Kalender-App bleiben ausserhalb dieses Releases.
