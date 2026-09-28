# AP19C1 · Integrations- und Prüfnachweis

Stand: 25. September 2026. Lokaler Integrationskandidat zur gesonderten Prüfung durch David Steimer. **Keine bereits erteilte Kandidaten-, Release- oder Betriebsfreigabe.**

Nachtrag vom 27. September 2026: Die anschliessend beauftragte Formularvereinfachung und ihre erneuten Prüfungen sind im [separaten UI-Nachweis](ui-vereinfachung-ap19c1-2026-09-27.md) dokumentiert. Die folgenden Testzahlen und Paketprüfsummen bleiben der historische Nachweis vom 25. September, nicht der Nachweis des geänderten UI-Bundles.

Nachtrag vom 28. September 2026: Der beschlossene Umfang und der Prüfnachweis der [frühen Datumseingabe](datumseingabe-ap19c1-2026-09-28.md) ergänzen AP19C1. Auch diese Bedienkorrektur verändert weder den Datenkandidaten noch dessen Freigabestatus.

## Ergebnis und Umfang

AP19C1 implementiert den beschlossenen Sozialverfahrenskatalog 1.0.0 und Manifest-/Consumerformat 5.0.0. Zwölf bisherige IVG-/AHVG-/UVG-Pfade sind kontrolliert in nationale Bundesregeln und getrennte Berner Anbindungen überführt. Vier ELG-Pfade sind zusätzlich in Rechenkern und gemeinsamem DE-/FR-UI integriert. AVIG und KVG sind nicht Bestandteil dieses Teilpakets.

Die 33 übrigen Definitionen und 40 Regime sind tiefenidentisch erhalten. Drei bisherige Sozial-Sperren sind mit ihren Kennungen und Quellen in `excludedPaths` überführt, die Beschaffungssperre bleibt im Restkatalog. Acht nicht migrierte Artefakte sind byteidentisch zum MVP-0.4-Ausgangsbestand. Die alte allgemeine ATSG-Auswahl kann die neue Qualifikation in Format 5 nicht umgehen.

Details: [Implementierungsnachweis](../architektur/implementierung-ap19c1.md), [erneuter Quellenabgleich](quellenabgleich-ap19c1.md), [zeitliche Bindung](zeitliche-bindung-ap19c1.md) und [Buildnachweis](../../outputs/ap19c1-2026-09-25/build-verification.json).

## Gebundener Kandidat

| Merkmal | Wert |
| --- | --- |
| Release-ID | `2026-09-25-ap19c1-candidate.1` |
| Manifest | [Lokaler Kandidat](../../data/candidates/2026-09-25-ap19c1/manifest.json) |
| Manifest-SHA-256 | `eae74fc823128e96a42980cd4eeac448e24dece60514b426d92eb698abb49524` |
| Bundesregeln / Berner Anbindungen | 16 / 16 |
| Fachlicher und technischer Status | `candidate`, alle Genehmigungen `null` |
| Fall- und Rechenabdeckung der Sozialpfade | 01.01.2026–31.12.2027, einschliesslich Stillstand und Endverschiebung |

Die echte Vorschau verwendet genau diesen nicht freigegebenen Kandidaten. Sie liefert daher für die Sozialpfade bewusst kein Enddatum. Positive Rechenprüfungen verwenden ausdrücklich synthetische Genehmigungen ausschliesslich im Arbeitsspeicher der Tests. Weder die Kandidatendateien noch die Vorschau enthalten einen Freigabe-Bypass.

## Automatisierte Prüfung

Unter Node 22.23.2 und mit den vorhandenen Projektabhängigkeiten ausgeführt:

| Prüfung | Ergebnis | Aussagegrenze |
| --- | --- | --- |
| TypeScript `--noEmit` | bestanden | statische Typprüfung |
| Vollständige Kern-/UI-Suite | **816 bestanden, 0 fehlgeschlagen** | enthält alte Regression und neue C1-Tests |
| C1-Integrationsdatei | **91 bestanden** | Teilmenge der 816, nicht zusätzlich zählen |
| Python-Datenvertragssuiten | **44 bestanden** | einschliesslich 13 C1-Schema-/Migrationsprüfungen |
| Governance-Suite | **83 bestanden** | unveränderte A-/B-Vorlagen und bestehende Quellenfreigaben |
| Öffentliche Web-App-Tests | **7 bestanden** | keine Veröffentlichung und keine neue P-Abnahme |
| SPFx-Transport | **67 bestanden** | einschliesslich 19 C1-Transportprüfungen, lokaler Provider |
| Kompilierter ES5-Code und tatsächliches SPPKG-Bundle | **29 bestanden** | Paket ausgeführt, nicht auf M365 installiert |
| CSS-Bundleaudit und Produktionskompilierung | bestanden | zwei bestehende Lintwarnungen zu explizitem JSON-`null`, keine Buildfehler |
| Geschützte Ausgangsdateien | **23 Prüfsummen unverändert** | sieben A-, neun B-, vier Releaseartefakte und drei vorbestehende Benutzerdateien |

Die 91 Integrationsprüfungen umfassen die bisherigen gewöhnlichen und nicht sozialen Spezialverfahren, 15 positive migrierte Sozialreferenzen über sämtliche zwölf alten Pfade, acht positive ELG-Referenzen, alle 13 ELG-Sperrreferenzen aus AP19B sowie zwei zusätzliche Umgehungs-/Zuständigkeitsprüfungen. Die ELG-Sperren werden mit synthetisch genehmigten Daten geprüft. Ihr Erfolg kann damit nicht bloss aus dem Kandidatenstatus stammen.

Kernprüfungen decken zusätzlich geschlossene Eingabeverträge, RFC-8785-Kanonisierung, SHA-256-Gegenvergleich, ES5-Prototypidentität, Objektmanipulation, widersprüchliche Normintervalle, Quellenrückzug, Zeitlücken, fehlende Fallbefunde und ausserkantonale synthetische Anbindungen ab. Letztere belegen die Wiederverwendbarkeit der nationalen Regel, nicht die Freigabe eines weiteren Kantons.

## Acht ELG-Sollrechnungen mit der echten Engine

Die Sollwerte stammen unverändert aus der abgenommenen AP19B-Vorlage. Die Engine-Ergebnisse wurden dagegen verglichen. Zuständigkeit, Feiertagsanknüpfung und Genehmigung sind im Test ausdrücklich qualifizierte beziehungsweise synthetische Voraussetzungen, keine Aussagen über einen realen Einzelfall.

| Referenz | Pfad | Eröffnung | Tage | Geprüftes Fristende |
| --- | --- | --- | ---: | --- |
| R01 | Einsprache | 16.09.2026 | 30 | 16.10.2026 |
| R02 | Beschwerde, Osterstillstand | 20.03.2026 | 30 | 04.05.2026 |
| R03 | Angeordnete Verwaltungsfrist, Sommerstillstand | 10.07.2026 | 10 | 21.08.2026 |
| R04 | Beschwerdeverbesserung, Jahreswechsel | 15.12.2026 | 10 | 11.01.2027 |
| R13 | Angeordnete Verwaltungsfrist, Stillstandsbeginn | 28.03.2026 | 1 | 13.04.2026 |
| R16 | Angeordnete Verwaltungsfrist, Wochenende 2026 | 28.02.2026 | 1 | 02.03.2026 |
| R17 | Angeordnete Verwaltungsfrist, Wochenende 2027 | 28.02.2027 | 1 | 01.03.2027 |
| R20 | Angeordnete Verwaltungsfrist, Stillstandsende | 12.04.2026 | 1 | 13.04.2026 |

## Tatsächliche Browserprüfung

Die lokale Vorschau wurde im Codex-Browser geöffnet und bedient:

- VRPG → Sozialversicherungsrecht → ELG → Beschwerde gewählt. IVG, AHVG, UVG und ELG sichtbar, keine AVIG-/KVG-Auswahl.
- Feste Modellfelder und zweispaltiger Desktopaufbau sichtbar geprüft.
- Empfangsdatum 16.09.2026 und eigenständiger Zuständigkeitszeitpunkt 01.10.2026 eingegeben, Gerichtskanton und Personenwohnsitz BE getrennt gewählt.
- Vollständiger Testfall ergibt die verständliche Kandidatensperre, ohne Enddatum und ohne Kalenderexport.
- Sprachwechsel auf Französisch, übersetzte Bedien- und Sperrtexte geprüft. Quellenlocator bleiben die Originalbezeichnungen der zitierten Quellen, teils deutsch.
- Schmale Darstellung mit 560-Pixel-Viewport geprüft. Bestehender einspaltiger Mobilumbruch, keine horizontale Überbreite. Gemessene Inhalts- und sichtbare Breite beide 545 Pixel. Temporäre Grössenvorgabe anschliessend aufgehoben.
- Keine protokollierten Browserfehler im geprüften Tab. Nach letztem Build neu geladen, Empfangsdatum wieder leer. Keine Testdaten als Standards gespeichert.

Die Browserprüfung ist ein lokaler Funktions- und Darstellungscheck, kein vollständiger Accessibility-Audit und kein neuer SharePoint-/Teams-Tenanttest. Die positiven Berechnungen und der Kalenderexport sind hier durch automatisierte Engine-/UI-Tests belegt, nicht durch eine künstlich freigeschaltete Vorschau.

## Paketprüfung ohne Überschreiben des Releasearchivs

Der neue [isolierte Buildprüfer](../../scripts/check-ap19c-spfx-build.mjs) erstellt eine eigene Arbeitskopie unter `.work`, verwendet die vorhandene Toolchain und führt Transporttests, Heft-Produktionskompilierung, CSS-Audit, Paketierung und die Tests am erzeugten Paket aus. Er prüft vor und nach dem Lauf die Prüfsumme des ursprünglichen SPPKG.

Der abschliessende Lauf liegt lokal unter `.work/ap19c-spfx-build-mU90zB`. Sein temporäres Testpaket hat SHA-256 `68d3741314f8d5dc40eee816d945600da562e604ebb1f17d2792d525bf10a09d`. Es trägt mangels Releaseauftrag weiterhin die bisherige Paketversion. **Dieses Testpaket ist ausdrücklich nicht zur Installation oder Publikation bestimmt.**

Die frühen Prüfläufe deckten einen fehlenden strikten Schematyp, alte Tests mit der inzwischen unterstützten Hauptversion 5 als vermeintlich unbekannter Version, eine ES5-unzulässige lokale Funktionsdeklaration sowie die fehlende komponentenübergreifende Quellenprüfung auf. Diese Punkte wurden korrigiert und in der abschliessenden Suite erneut geprüft. Zwei zusätzlich gegenlesene UI-Befunde, Gerichtsbeschriftung und Migration der alten Auswahlkennungen, sind ebenfalls behoben. Parallel eingesetzte KI-Prüfungen sind keine zweite menschliche Fachfreigabe.

## Reproduktion und nächster Haltepunkt

```sh
npm run typecheck
npm test
npm run test:ap19c
npm run test:ap19c:spfx
node scripts/check-ap19c-preservation.mjs
```

Der letzte Befehl prüft auch lokale, bewusst nicht publizierte Backup- und Archivdateien. Er ist ein lokaler Erhaltungsnachweis, kein von einer frischen GitHub-Kopie unabhängig ausführbarer CI-Test.

Die [maschinenlesbare QA-Zusammenfassung](../../outputs/ap19c1-2026-09-25/qa-verification.json) und der [Prüfsummennachweis](../../outputs/ap19c1-2026-09-25/preservation-verification.json) ergänzen diesen Bericht. AP19C1 wird David zur gesonderten Kandidatenprüfung vorgelegt. Danach folgt AP19C2 für AVIG mit der bereits abgenommenen Option-B-Nachweismethode. Eine Promotion des zusammengehörigen Datenstands, eine neue Paketversion und E-/Q-/P-Bereitstellung erfordern einen eigenen Auftrag.

Es gab keinen Commit, Push, Deploy-Key, Mirrorwechsel, App-Katalogeingriff oder Hostingzugriff. Die produktiven und archivierten Datenstände bleiben unverändert.
