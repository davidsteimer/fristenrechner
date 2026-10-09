# AP22C3 – Format-7-Anbindung, Cache und Hosts

Stand: 8. Oktober 2026. Lokaler Integrationskandidat für die Teilpaketabnahme. Keine Quellenreleasefreigabe, Produktaktivierung oder Bereitstellung.

Grundlagen sind der beschlossene [AP22B-Vertrag](kalendervertrag-ap22b.md), [DEC-2026-030](../entscheidungen/DEC-2026-030-beschluss.md) und die [Abnahme von C2](../fachrecht/abnahme-ap22c2.md). Die C1-/C2-Abnahmekopien und bisherigen produktiven Releases bleiben unverändert.

## Ergebnis und Grenzen

Der gemeinsame Rechenkern verarbeitet jetzt ein vollständiges Format-7-Bündel: fünf Rechtsprofile, 32 Regelkalender im Format 3 und je einen Feiertags-, Spezialregime- und Sozialverfahrenskatalog. 40 Datendateien sind mit SHA-256 und Byteanzahl an ein Manifest gebunden. Der lokale Kandidat trägt die ID `2026-10-08-ap22c3-reference.1`.

Der Feiertagskatalog enthält weiterhin alle 479 Archivregeln, zwölf ergänzende SO-Prozessregeln, 198 Herkunftsentscheidungen und 104 terminale Verfahrensbindungen. Die 44 Sozialregeln und 50 Berner Anbindungen bleiben fachlich unverändert. Ihre neuen Komponentenbindungen sind Kandidaten, keine übernommenen Freigaben. Das Sozialfenster bleibt auf 2026–2027 und den freigegebenen Berner Verfahrenskontext beschränkt.

Die Produktversion, die öffentlichen Standarddaten, die SPFx-Pins und das bestehende Paket bleiben bei MVP 0.6. Es gibt weder eine neue ausserbernische Sozialfreigabe noch ein weiteres kantonales Verwaltungsverfahren. Die kantonalrechtlichen örtlichen Unterschiede, Januargrenzen und GR-/NE-Vorbehalte bleiben gemäss C2 erhalten. AP21 ist nicht Teil dieses Pakets.

## Ein Datenmodell, zwei ausdrücklich getrennte Betriebsarten

| Grenze | Umsetzung |
| --- | --- |
| Produktiver Datenconsumer | Nur `approved`, vollständig validierte Manifest-, Kalender- und Sozialbindungen desselben Releases. Kein PropertyPane- oder URL-Schalter für Kandidaten |
| Lokaler C3-Prüfstand | Eigenes Referenzschema, `candidate`, Quellenstatus `pending`, kein fingiertes Prüfdatum, global gesperrter Kalenderexport |
| Historische Formate 1–6 | Unveränderter Einstieg über `createCalculationData`, einschliesslich AP5 mit historischer Abdeckung |
| Format 7 | Neue Factory `createFormat7CalculationData` und Hostadapter `createCalculatorRuntime`, beide prüfen die tatsächlichen Bytes |
| C1-Datenreader | Bleibt ein Reader mit `runtimeReady: false`, nicht nachträglich ein Freigabeschalter |

Die CH-/BE-Basiskalender aus MVP 0.6 dienen nur als unveränderte normative Projektionseingaben. Die neue Rechnung verwendet keine alte Format-6-`CalculationData` als Ersatz. Eine von der Factory erzeugte und tief eingefrorene Laufzeitbindung kennzeichnet die bereits geprüften Daten. Allgemeiner, qualifizierter, sozialer und spezieller Rechenweg prüfen diese Bindung. Eine rohe Kalender-ID ersetzt bei den Bundesprofilen keine Rollen- und Gebietsqualifikation und umgeht den Januarvergleich nicht.

## Provider und lokaler Cache

Der Cache wird durch die normalisierte tatsächliche Konfiguration getrennt, nicht bloss durch einen sichtbaren Providernamen oder eine Release-ID.

| Provider | Bestandteil der Cacheidentität |
| --- | --- |
| GitHub | HTTPS-Basisadresse, Repository, vollständiger Commitpin und Releasepfad |
| SharePoint-Mirror | Tenant, aktuelle Site und konkreter Mirrorordner |

IndexedDB Version 2 speichert konfigurierte Releases getrennt. Historische originweite `active`-Einträge werden nicht gelöscht, aber durch den neuen Dienst nie als Ersatz einer konfigurierten Quelle verwendet. Selbst identische Release-IDs dürfen sich zwischen E, Q, AP5 und unterschiedlichen Pins nicht überschreiben.

Bei Fallback werden Manifest und Artefakte aus den gespeicherten Originalbytes neu validiert. Gespeicherte `parsed`-Objekte, Gültigkeitsbehauptungen und frühere Validierungszeitpunkte gelten nicht als Nachweis. Fehlende, zusätzliche, doppelte oder veränderte Artefakte sperren die Verwendung. Bei fehlender oder ungültiger Konfiguration wird gar kein alter Cache gesucht.

**Migrationseffekt:** Beim ersten Start des neuen Consumers muss eine konfigurierte Instanz einmal ihre eigene Quelle erfolgreich laden. Ein bloss vorhandener alter originweiter Cache reicht dafür bewusst nicht. Die normalen Browserdaten müssen nicht manuell gelöscht werden.

## Hostintegration

SPFx erzeugt den gemeinsamen Rechner aus dem vollständig validierten Release. Ein Wechsel von Datenquelle, Site, Mirror, Pin oder Manifesthash setzt die Rechnersitzung zurück. Bereits der erste Render mit abweichender Konfiguration blendet das vorige Ergebnis aus. Verspätete Antworten früherer Konfigurationen werden ignoriert.

Der statische C3-Build besitzt einen separaten Einstieg und das Ziel `.work/public-ap22c3`. Sein Buildmanifest enthält `deployable: false`. Die normale öffentliche Version importiert weiterhin MVP 0.6. Der lokale Vorschauparameter `candidate=ap22c3` besteht ausschliesslich im Vorschauentry, nicht im öffentlichen Normalbuild oder SPFx.

Der C3-Prüfhinweis gilt auf Deutsch und Französisch für sämtliche Rechenwege. Auch VRPG- und Sozialresultate erzeugen in diesem lokalen Kandidaten keine Kalenderdatei. Die historische AP5-Oberfläche bleibt ohne neue Kalenderkontextfelder und ohne Kandidatenkennzeichnung.

## Eng begrenzte Quellenprovenienz

Der Bestand enthält zwei unterschiedliche Metadatenobjekte zu `SRC-BUNDESFEIERTAG-19940701`. Titel, URL und Normdatum sind gleich. Die Herkunft ist einmal der ursprüngliche Bundeskalender mit damaligem Status `verified`, einmal die archivische Kalenderprojektion als `officialDossier` mit `monitored`. Beide ursprünglichen Objekte bleiben unverändert. Der eine Prüfweg wird nicht als neue Prüfung des anderen ausgegeben.

Nur dieses bestehende Paar vollständiger kanonischer Objekthashes ist als Provenienzunterschied zulässig:

- `6d0730617db586d9cf2b635f297da787da4a9805dc3e5baf53c762684ddc1c4e`
- `048554e3a3b51cf34e421343f0aa0e2ef1546faeab8c4f20224e1c75faa92b7f`

Andere Same-ID-Konflikte, veränderte URLs, Normdaten, Reviewstatus oder Zusatzfelder sperren die Factory. Die Quellenmenge des Manifests muss exakt zur Komponentenmenge passen. Das ist eine technische Behandlung vorhandener Provenienz, keine neue juristische Feststellung oder Quellenreleasefreigabe.

## Nachweise

- [Maschineller C3-Nachweis](../../outputs/ap22c3-2026-10-08/QA-AP22C3.json): Core-, UI-, Host-, Produkt-, Schema- und unabhängige Python-Prüfungen, archivierte Abnahmen und gebundene Quelldateien.
- [Bündelintegrität](../../outputs/ap22c3-2026-10-08/bundle-integrity.json): vollständige Manifest-/Artefaktbytes, ausdrücklich Referenzkandidat.
- [Isolierter SPFx-Build](../../outputs/ap22c3-2026-10-08/spfx-build.json): Tests, Produktionskompilierung, Stylesheetprüfung, Paketierung und gebaute Regression. Das Testpaket ist kein freigegebenes Installationsartefakt.
- [Lokale Browserprüfung](../../outputs/ap22c3-2026-10-08/browser-qa.md) und [abschliessende Prüfsummenbindung](../../outputs/ap22c3-2026-10-08/completion-integrity.json).

Der ergänzende Codecheck fand zwei Anschlussfehler, die vor dem Abschluss korrigiert wurden: die Format-7-Auswahl der elf Sozialerlasse und die fehlende Laufzeitprüfung am Spezialrechner. Separate Regressionen prüfen beide. Der erste isolierte Paketbuild scheiterte zudem an einer Lint-Regel für die explizite Kontrolle von Steuerzeichen in Mirrorpfaden. Die inhaltlich gleiche Prüfung erfolgt jetzt ohne Steuerzeichen-RegExp. Die abschliessenden Nachweise sind massgebend, nicht diese fehlgeschlagenen Zwischenläufe.

Nach erfolgreicher Kompilierung und Paketierung erwartete der frühere Paket-Prüfadapter noch ein dauerhaftes Servicefeld am Host. C3 erzeugt den Service pro Ladelauf. Der Adapter wurde an die tatsächliche Instanzierung angepasst, ohne den Paketinhalt oder Validator zu ersetzen. Die anschliessende vollständige gebaute Regression besteht mit 72 Prüfungen. Darin sind vier neue Format-7-Prüfungen einschliesslich tatsächlichem UI-Submit und sperrendem Januarvergleich im paketierten Code enthalten. Dieser kontrollierte Hosttest ist kein Ersatz für eine Browserprüfung auf SharePoint oder Teams.

Automatisierte Tests mit synthetischen Freigaben arbeiten ausschliesslich im Arbeitsspeicher und sind als solche bezeichnet. Sie verändern keine Kandidatendatei und ersetzen keine menschliche Freigabe. Browserprüfung und Paketbuild sind lokale Nachweise. Reale SharePoint-/Teams-/Gastprüfungen erfolgen erst im separat freizugebenden E-/Q-Schritt.

## Reproduktion und nächster Schritt

Mit der Projekt-Toolchain Node 22:

```sh
npm run build:data:ap22c3:candidate
npm run test:ap22c3
npm run test:ap22c3:spfx
npm run build:public:ap22c3
FRISTENRECHNER_DATA_CANDIDATE=ap22c3 PUBLIC_APP_PORT=8798 node scripts/public-app-server.mjs
```

Nach C3-Abnahme kann AP21 folgen. Quellenprüfung, definitive Datenübernahme, neue Releaseartefakte und E-/Q-/P-Bereitstellung bleiben die nachgelagerten Freigabeschritte des geplanten MVP 0.7. GitHub und Betriebsumgebungen wurden durch AP22C3 nicht verändert.
