# Fristenrechner Schweiz

**MVP 0.8 ist auf den vier bestehenden E-/Q-Instanzen installiert und seit dem 16. Oktober 2026 abgenommen.** Geräteprüfung, Gastzugriff und die begrenzte Outlook-Wiederverwendung sind [bestätigt](docs/betrieb/abnahme-q-mvp08.md). Das [lokal bereinigte und geprüfte Publikationspaket](docs/betrieb/publikationspaket-mvp08.md) liegt zur Freigabe vor. Der letzte dokumentierte öffentliche Betriebsstand auf [steimer.ch](https://www.steimer.ch/fristenrechner/) bleibt **MVP 0.7 vom 9. Oktober 2026**, ohne neue Liveinventur. GitHub-Veröffentlichung und P-Bereitstellung von MVP 0.8 bleiben gesondert freizugeben.

Der Fristenrechner Schweiz ist eine vollständig webbasierte Anwendung zur nachvollziehbaren Berechnung verfahrensrechtlicher Fristen. Die Lösung läuft auf modernen SharePoint-Seiten, als Registerkarte in Microsoft Teams und als statische öffentliche Webanwendung.

> **Prüfstatus MVP 0.7:** Die funktionalen Produktionsprüfungen einschliesslich der tatsächlichen Storage-Prüfung D10 sind abgeschlossen. D04 ist wegen unverändert fehlender Sicherheitsheader bei bestimmten GET-Antworten nicht bestanden. D05 ist wegen der bekannten doppelten Cache-Altersangabe im strikten Test nicht bestanden. David Steimer hat die begrenzte Risikoakzeptanz ausdrücklich auf MVP 0.7 erstreckt. Die Abweichungen sind akzeptiert, nicht behoben. Es wird kein uneingeschränkter D01–D12-Pass behauptet.

| Stand | Bedeutung |
| --- | --- |
| Öffentlicher Betrieb | Anwendung `0.7.0`, Daten `2026-10-08-mvp-07-approved.1`. Bereitstellung und funktionale Prüfung gemäss [Produktionsnachweis vom 9. Oktober](docs/betrieb/produktionsbereitstellung-mvp07-2026-10-09.md) abgeschlossen, mit den akzeptierten Abweichungen D04/D05 |
| Interner E-/Q-Abnahmestand | Anwendung `0.8.0`, SPFx-Paket `0.8.0.0`, Daten `2026-10-15-mvp-08-approved.1` aus vier vollständigen SharePoint-Mirrors mit je 42 Dateien. [Technische Hostprüfungen](docs/betrieb/eq-vollzugsnachweis-mvp08.md), acht gespeicherte Kalenderdateien sowie [Geräte-/Gastbestätigung und Q-Abnahme](docs/betrieb/abnahme-q-mvp08.md) abgeschlossen |
| Lokaler MVP08-Datenpin | `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb`. Noch nicht veröffentlicht oder öffentlich als abrufbar bestätigt. [Artefakte und Prüfsummen](docs/betrieb/releaseartefakte-mvp-08.md) |
| Veröffentlichter Quellstand | Datenpin [`331ef3e`](https://github.com/davidsteimer/fristenrechner/commit/331ef3e19d43a6b51d91a502acd6b5443071599f), Publikationscommit [`37e2631`](https://github.com/davidsteimer/fristenrechner/commit/37e263156658498df350dd12989cd246f99cc219), anschliessender Produktionsnachweis [`24a22ec`](https://github.com/davidsteimer/fristenrechner/commit/24a22ec51beda7c8ff5de735c07dd262b0dba0b2). Dokumentationsnachträge ändern weder Produktbuild noch Datenrelease |

Die Reihenfolge **E → Q → manuelle Abnahme durch David Steimer → GitHub → P** bleibt verbindlich. Für MVP 0.8 ist der E-/Q-Schritt abgeschlossen. [Deploymentplan](docs/betrieb/deployment-mvp-08.md), [Publikationsvorprüfung](docs/betrieb/publikationsvorpruefung-mvp08.md) und [Releasehinweise](docs/betrieb/release-notes-mvp08.md) trennen Abnahme und Veröffentlichung. M365-Berechtigungen, Q-Demokreis, historische AP5-Pins, AP21-Testapps, Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben unverändert. Das gebilligte Wiederherstellungspaket `0.8.0.1` mit MVP07-Funktionsumfang wurde nicht eingesetzt.

Die [MVP08-Nachweisgrenzen](docs/betrieb/eq-vollzugsnachweis-mvp08.md) unterscheiden tatsächliche Hostabrufe, Cache-/Transferbefunde und menschliche Abnahme. Ein gesonderter VoiceOver-Nachweis bleibt offen. Frühere Outlookimporte werden nur für den unveränderten Terminvertrag wiederverwendet. Die neue administrative Herkunft im Kalenderexport ist durch aktuelle lokale und E-/Q-Prüfungen belegt, nicht durch alte Outlookimporte. Ein neuer Outlook-Import wurde nicht durchgeführt.

Frühere Nachweise bleiben als historische Stände erhalten, insbesondere [MVP 0.6](docs/betrieb/produktionsbereitstellung-mvp06-2026-10-01.md), die [AP17-Integration](docs/architektur/vrpg-integration-ap17c.md), die [AP18C-Abnahme](docs/fachrecht/abnahme-ap18c.md) sowie [Archivbestätigung und Arbeitskopientrennung](docs/fachrecht/archivbestaetigung-ap18.md). Ihre damaligen Vorbereitungs- und Freigabestände sind keine Aussagen über den heutigen Betrieb.

## Zweck

Die Anwendung soll aus dem Empfangsdatum einer fristauslösenden Zustellung, der Fristdauer, dem anwendbaren Verfahrensrecht und dem massgebenden Gemeinwesen ein begründetes Fristende bestimmen. Sie zeigt die automatisch gewählten Parameter, verwendeten Datenstände und Rechenschritte sichtbar an. Automatische Auswahlen sollen kontrolliert übersteuert werden können.

Die berechneten Angaben sind ein Arbeitsmittel. Sie ersetzen weder die Prüfung der konkreten Zustellung noch eine juristische Beurteilung des Einzelfalls.

## MVP-Umfang

MVP 0.8 ergänzt die [abgenommene AP23-Integration](docs/fachrecht/abnahme-ap23d3.md) für kantonale Verwaltungsverfahren in Tessin und Graubünden. Die [Kalenderintegration aus AP22](docs/fachrecht/abnahme-ap22c3.md) und [Datumseingabe aus AP21](docs/fachrecht/abnahme-ap21.md) bleiben enthalten. Für die unterstützten Bundesverfahren stehen die freigegebenen Feiertagszuordnungen aller Kantone zur Verfügung. Der Rechner umfasst folgende Bestandsprofile:

- Schweizerische Strafprozessordnung, StPO
- Schweizerische Zivilprozessordnung, ZPO
- Bundesgerichtsgesetz, BGG
- Verwaltungsverfahrensgesetz des Bundes, VwVG
- Gesetz über die Verwaltungsrechtspflege des Kantons Bern, VRPG

198 Herkunftsentscheide werden von 104 konkreten Verfahrensbindungen getrennt. Daraus entstehen 32 Kalender. Massgebend bleiben Verfahren, Rolle und Ort. Fehlende Fallfakten werden nicht durch einen Berner oder eidgenössischen Ersatzkalender ergänzt. Die Kalenderabdeckung beginnt am 29. August 2026 ohne pauschales Enddatum. Normgeltung, Gebietsstände, Profil- und Releasegrenzen sowie regelmässige Quellenprüfungen bleiben massgebend.

Die vier Januargrenzen gemäss [DEC-2026-029](docs/entscheidungen/DEC-2026-029-begrenzte-behandlung-zweiter-januar.md) betreffen SG/StPO, SG/BGG, SG/VwVG und SH/StPO. Bei unterschiedlichem rechtlichem Ergebnis der beiden vollständigen Berechnungen mit und ohne die konkret unsichere Regel gibt es weder ein definitives Fristresultat noch einen Kalenderexport. Die davon getrennten GR-/NE-Vorbehalte, die beschlossene AI-Behandlung und die begrenzte Rolle des historischen Freiburger Praxisbelegs bleiben gemäss [Quellenabnahme](docs/fachrecht/abnahme-quellen-mvp07.md) erhalten.

Hinzu kommen **fünf Verfahrenspfade nach LPAmm (TI) und sieben nach VRG (GR)**. Sie unterscheiden Verfahrensstadium, Handlung und notwendige Fallqualifikation. Die Feiertagsanknüpfung folgt dem Sitz der zuständigen kantonalen Stelle. Die Freigabe reicht vom 29. August 2026 bis zum 31. Dezember 2027 und muss den gesamten Berechnungszeitraum einschliesslich Endverschiebungen abdecken. TI-O2 bleibt gesperrt, wenn eine Endverschiebung in einen neu beginnenden Fristenstillstand führt. Für GR wird gerichtliche Dringlichkeit nur aufgrund einer ausdrücklichen Verfügung berücksichtigt. Die [Releasehinweise](docs/betrieb/release-notes-mvp08.md) erläutern Umfang und Grenzen.

Die 44 nationalen Sozialverfahrensregeln und 50 Berner Anbindungen bleiben fachlich unverändert und weiterhin nur für Bern sowie 2026–2027 freigegeben. Weitere Kantone, zusätzliche Sozialanbindungen und nicht modellierte kantonale Spezialverfahren sind nicht Bestandteil von MVP 0.8. Eigenständige kommunale Erlasse bleiben ausgeschlossen. Eine Kalender-App oder Feiertagskarte ist nicht enthalten.

Die linksbündigen Datumsfelder erlauben vollständige Daten sowie die Kurzformen für einen Tag im aktuellen Monat, Tag und Monat im aktuellen Jahr und `h` für heute. Enter, Tab und Verlassen des Felds übernehmen und prüfen die Eingabe. Ein Kalender bleibt optional verfügbar. Bearbeiten entfernt ein bisheriges Resultat und dessen Export sofort. Der geringfügige [iPad-Magic-Keyboard-Befund](docs/betrieb/ap21-ipad-magic-keyboard-tab-befund.md) bleibt als akzeptierte Umgebungsgrenze dokumentiert.

Die Produktsprache ist Deutsch und Französisch. Die zusätzlichen italienischen und rätoromanischen Bezeichnungsfelder im Feiertagskatalog sind keine weiteren Oberflächensprachen. Persönliche Voreinstellungen werden nur lokal im Browser gespeichert. Es werden keine Fallakten, Namen oder Aktenzeichen benötigt.

## Technisches Zielbild

Implementiert ist eine clientseitige SharePoint-Framework-Lösung mit React und Fluent UI sowie eine statische öffentliche Webausprägung. Ein deterministischer TypeScript-Rechenkern bleibt von Oberfläche, Microsoft-365-Integration und Datenquelle getrennt. Die Datumsberechnung arbeitet ausschliesslich mit Kalenderdaten ohne Zeitzonenabhängigkeit. Uhrzeit und Zeitzone werden bei Spezialregimen getrennt als Einreichungsanforderung geführt und nicht über JavaScript-Zeitobjekte berechnet.

Die M365-Ausprägung bezieht versionierte Rechts- und Kalenderdaten aus einem unveränderlich gepinnten GitHub-Datenrelease oder einem byteidentischen SharePoint-Mirror. E/Q verwenden den vollständigen MVP08-Format-8-Mirror mit 42 Dateien. Der neue Datenpin `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb` ist lokal gebunden, aber noch nicht veröffentlicht. Sein GitHub-Betrieb setzt Veröffentlichung und öffentlichen Rohbytevergleich voraus. Historische Datenpins bleiben erhalten. Der Rechenkern kennt die Datenquelle nicht. Die statische Webausprägung bettet den Datenrelease beim Build ein.

Der in AP8 implementierte [Rechenkern v0.1](src/core/README.md) verwendet reine ISO-Kalenderdatumsarithmetik, verarbeitet die typisierten AP5-Regeleffekte und blockiert ungeklärte Eingaben ohne scheinbar plausibles Fristende. Die automatisierten TypeScript-Tests laufen zusätzlich zum unabhängigen Python-Testorakel aus AP6.

AP11B ergänzt vier typisierte Rechenarten für [VRPG-Spezialregime](docs/architektur/vrpg-spezialregime-datenmodell.md), Fristwahrungsprofile, Prüfschranken und versionierte rechtliche Übersteuerungen. Behördlich gesetzte Termine besitzen keine Rechenoperation, werden im Rechen-GUI verborgen und erzeugen kein Fristresultat. Der [Format-2-Referenzrelease](data/releases/2026-08-30-ap11b-approved.1/README.md) ist fachlich und technisch abgenommen. AP11C integriert diesen Vertrag in die Oberfläche und den SPFx-Consumer. Der daraus hervorgegangene [MVP-0.2-Datenrelease](data/releases/2026-08-31-mvp-02-approved.1/README.md) ist freigegeben. Der [AP11C-Nachweis](docs/architektur/mvp-02-spezialregime-ap11c.md) dokumentiert Umsetzung, Abnahme und Betriebsgrenzen.

AP12C ergänzt auf Basis des beschlossenen [ewigen Kalenders](docs/architektur/ewiger-kalender-ap12a.md) das Manifestformat 3.0.0 und den freigegebenen [MVP-0.3-Datenrelease `2026-08-31-mvp-03-approved.1`](data/releases/2026-08-31-mvp-03-approved.1/README.md). Feiertage und Gerichtsferien werden aus 15 versionierten Regeln für den konkret benötigten Zeitraum erzeugt. Der [AP12C-Nachweis](docs/architektur/ewiger-kalender-ap12c.md) dokumentiert Migration, Produktintegration, Sicherheitsgrenzen und lokalen Teststand. Der unveränderte [AP12C-Kandidat](data/releases/2026-08-31-ap12c-candidate.1/README.md) bleibt als Vorläufer erhalten.

AP13 ergänzt die [periodische Quellenprüfung](docs/betrieb/periodische-quellenpruefung-ap13.md) als eigenen Governance-Baustein. Ein vollständiges [maschinenlesbares Quellenregister und Prüfprotokoll](data/source-reviews/README.md) wird ausserhalb der unveränderlichen Datenreleases geführt. Ein generierter Index löst pro Quelle die betroffenen Rechtsprofile, Kalender, Regelkomponenten, Fundstellen und Releases auf. Das Ergebnis `unchanged` wird revisionsfähig dokumentiert, ohne einen inhaltsgleichen Datenrelease zu erzwingen.

Die in AP9 implementierte und mit AP11C erweiterte [MVP-Rechneroberfläche](src/ui/README.md) zeigt die zuständige Behörde, gefilterte Rechtsprofile, profilspezifische Merkmale, Spezialregime, automatische Parameter, kontrollierte Übersteuerungen, Resultate und die Rechenspur auf Deutsch und Französisch. Der kanzleiorientierte Hauptablauf führt von den Eingaben direkt zu den Aktionen und zum Resultat. Spezialregime blenden nur die fachlich benötigten Anker ein und weisen Fristwahrung, Annahmeschluss sowie Nachweise getrennt vom berechneten Datum aus.

Die abgenommene Funktion zu [Issue #18](docs/architektur/outlook-kalendereintrag-issue-18.md) erzeugt aus einem vollständig berechneten Fristablauf eine Outlook-kompatible `.ics`-Datei. Die Funktion sitzt im allgemeinen Ergebnisraster rechts unten, speichert die optionale Referenz nicht und benötigt weder Microsoft Graph noch zusätzliche Tenantberechtigungen. Die historische Release-2-Testmatrix einschliesslich Outlook ist abgeschlossen. Für MVP 0.5 sind die tatsächlichen Dateiexporte auf allen vier E-/Q-Instanzen geprüft. Der [Webimport samt Bereinigung und die manuelle Desktop-Bestätigung](docs/betrieb/outlook-pruefung-mvp05.md) sind separat dokumentiert. Frühere offene MVP-0.4-Angaben bleiben historische Nachweise.

Die [SPFx-Produktlösung](spfx/README.md) synchronisiert die hostneutralen Quellen vor dem Build und bindet sie über einen dünnen Hostadapter ein. GitHub- und SharePoint-Provider liefern nach vollständiger Validierung dasselbe Datenmodell. Der MVP08-Consumer unterstützt Formate 1 bis 8, `SharePointWebPart` und `TeamsTab`. Das Paket enthält seine Client-Assets und beantragt keine zusätzlichen API-Berechtigungen. Die [definitiven MVP08-Artefakte](docs/betrieb/releaseartefakte-mvp-08.md) bleiben bytegleich zum abgenommenen E-/Q-Stand.

Der [AP16-Ausführungsplan](docs/betrieb/oeffentliche-p-auspraegung-ap16.md) ergänzt diese M365-Zielarchitektur um eine rein statische öffentliche Ausprägung auf dem bestehenden steimer.ch-Hosting. Sie enthält den gleichen freigegebenen Kern, die Produktoberfläche und den Datenrelease direkt im Build. Der [Kandidatennachweis](docs/betrieb/oeffentliche-p-auspraegung-ap16-nachweis.md) weist P01 bis P15 aus. AP16 ist fachlich-technisch abgenommen und [DEC-2026-017](docs/entscheidungen/DEC-2026-017-statische-p-auspraegung-steimer-ch.md) ist beschlossen. Die erstmalige öffentliche Bereitstellung und die [Prüfmatrix D01 bis D12](docs/betrieb/produktionsbereitstellung-2026-09-01.md) sind abgeschlossen. Die [Deployment- und Rückfallanleitung](docs/betrieb/deployment-oeffentliche-p-auspraegung-ap16.md) dokumentiert das Verfahren. Es bestehen keine Laufzeitaufrufe an GitHub, SharePoint, Graph oder ein CDN. [DEC-2026-018](docs/entscheidungen/DEC-2026-018-freigabe-oeffentlicher-p-betrieb.md) gibt den öffentlichen P-Betrieb ausdrücklich frei.

Für eine IT-Freigabe in anderen Microsoft-365-Tenants stehen die [technische Kurzdokumentation](docs/architektur/technische-kurzdokumentation.md) und die [Voraussetzungen für Installation und Betrieb](docs/betrieb/installation-und-betrieb-dritttenants.md) mit einer konkreten SharePoint-Mirror-Anleitung bereit.

Der [AP14-Ausführungsplan](docs/betrieb/gastzugriff-demobetrieb-ap14.md) und das [Testprotokoll](docs/betrieb/gastzugriff-ap14-testprotokoll.md) dokumentieren den abgeschlossenen technischen Gastnachweis. Die App, Fachlogik, Zweisprachigkeit und der Kalenderexport funktionierten für den Gast. G13 und G17 bleiben nach der ursprünglichen Matrix historisch nicht bestanden. Das präzisierte Zielbild beurteilt in [AP15](docs/betrieb/e-q-p-zielarchitektur-ap15.md) jedoch das durch die Q-Aufnahme erzeugte Berechtigungsdelta statt sämtliche unabhängig begründeten Rechte der Testidentität. Ein zentraler Q-Zugriffsprinzipal soll Site, Team, read-only Mirror und den konkreten Paketordner gemeinsam begrenzen und widerrufbar machen.

Das [AP15-Testprotokoll](docs/betrieb/e-q-p-testprotokoll-ap15.md) dokumentiert 12 von 12 bestandenen Prüfungen des gruppenbasierten Q-Modells. Die [Betriebsanweisung](docs/betrieb/q-demobetrieb-ap15-betriebsanweisung.md) beschreibt Aufnahme, Update, Widerruf und Wiederaufnahme ohne direkte Einzelrechte. Der beschlossene Entscheid [DEC-2026-016](docs/entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md) gibt den begrenzten Q-Demobetrieb für vollständig freigegebene Releases frei. Die bei AP15 noch offene öffentliche Ausprägung wurde anschliessend mit AP16 umgesetzt.

Das [Datenrelease-Format](docs/architektur/datenrelease-format.md) verwendet JSON Schema Draft 2020-12, ISO-Kalenderdaten, ein unveränderliches Manifest und SHA-256-Prüfsummen. Historische Formate bleiben erhalten. MVP 0.8 ergänzt gemäss [DEC-2026-032](docs/entscheidungen/DEC-2026-032-beschluss.md) den Verwaltungsverfahrenskatalog `1.0.0` und verwendet Manifest/Mindestconsumer `8.0.0`. Die 32 Regelkalender `3.0.0`, der Feiertagskatalog `2.0.0`, Rechtsprofile `1.0.0`, Spezialregimekatalog `3.0.0` und Sozialverfahrenskatalog `2.0.0` behalten ihre Formate. Der Laufzeitmirror umfasst 42 Dateien. Persönliche Standards verwenden bei Format 8 Version 5. Die Migration übernimmt stabile Auswahlen, aber keine fehlenden Fallfakten, Empfangsdaten oder Referenzen. Ein Resetmarker verhindert das Wiederaufleben alter Standards.

## Qualitätsgrundsätze

- Jede Fachregel erhält eine amtliche Quelle, einen Gültigkeitszeitraum und mindestens einen Testfall.
- Fristbeginn, rechnerisches Ende, Stillstände, Verschiebungen und endgültiges Ende bleiben als Rechenspur nachvollziehbar.
- Ungeprüfte oder widersprüchliche Daten werden nicht stillschweigend verwendet.
- Deutsch und Französisch werden für sämtliche Produkttexte gleichwertig gepflegt.
- Tastaturbedienung, verständliche Fehlermeldungen und WCAG 2.1 AA nach eCH-0059 sind Qualitätsziele.
- Releases nennen Codeversion, Datenrelease, Quellenstand und Prüfstatus.

## Repository-Struktur

| Pfad | Zweck |
| --- | --- |
| `src/` | Rechenkern, Oberfläche, Lokalisierung und Provider |
| `data/` | Versionierte Rechtsprofile, Kalender und getrennte Quellenprüfnachweise |
| `schemas/` | Maschinenlesbare Schemata für Regeln, Kalender, Releases und Quellenprüfungen |
| `tests/` | Unit Tests, Golden Cases, Daten-, Governance- und UI-Validierung |
| `spike/spfx/` | Zeitlich begrenzter SPFx-Minimalprototyp mit Build-, Paket- und Providernachweisen |
| `spfx/` | Produktive SPFx-Lösung und installierbares Paket für SharePoint und Teams |
| `public-app/` | Quellvorlage, Sicherheitsregeln und Gestaltung der statischen P-Webhülle |
| `docs/` | Architektur, Betrieb, Fachpflege und Entscheide |
| `outputs/` | Projektgrundlagen, Arbeitsmappen sowie technische Prüf- und Abnahmenachweise |
| `LICENSES/` | Lizenztexte und Abgrenzung der lizenzierten Werktypen |

Die technische Projektstruktur wurde mit dem im [AP7-Ausführungsplan](docs/architektur/spfx-machbarkeitsspike-ap7.md) abgegrenzten SPFx-Spike erfolgreich geprüft. Der [Ergebnisbericht](docs/architektur/spfx-spike-ergebnisbericht.md) und das [Testprotokoll](docs/architektur/spfx-spike-testprotokoll.md) dokumentieren die vollständige Evidenz. Der dauerhafte Quellcodebaum wird gestützt auf den beschlossenen Architekturentscheid DEC-2026-013 übernommen.

## Projektführung

**Aktuell, 16. Oktober 2026:** R08-C ist mit dem [technischen Gesamtnachweis](docs/betrieb/eq-vollzugsnachweis-mvp08.md) und [Davids Q-Abnahme](docs/betrieb/abnahme-q-mvp08.md) abgeschlossen. Der Katalog und die vier bestehenden Apps verwenden `0.8.0.0`, ihre aktuellen Mirrors Format 8. Historische AP5-Pins bleiben erhalten. P08-01 bis P08-03 aus der [Publikationsvorprüfung](docs/betrieb/publikationsvorpruefung-mvp08.md) sind lokal bereinigt und geprüft. Das [Publikationspaket](docs/betrieb/publikationspaket-mvp08.md) bindet die konkrete Auswahl. Weitere Commits, GitHub und P bleiben gesondert freizugeben. Die Feldhöhe des Empfangsdatums unter [#50](https://github.com/davidsteimer/fristenrechner/issues/50) wird im nächsten Release geprüft und nötigenfalls korrigiert. Die folgenden datierten Einträge sind historische Zwischenstände.

**Vorbereitungsstand R08-C, 15. Oktober 2026:** Die [konkrete E-/Q-Installationsvorlage](docs/betrieb/eq-installationsvorlage-mvp08.md) bindet das vorhandene Paket `0.8.0.0`, vier bestehende Instanzen und die neuen Mirrors. [Rückfall auf MVP 0.7 mit `0.8.0.1`](docs/betrieb/rueckfall-mvp08.md) und [Hostprüfmatrix](docs/betrieb/pruefmatrix-mvp08.md) sind lokal ausgearbeitet. Upload, Rückfallvollzug und Installation bleiben gesondert freizugeben. Keine frische Onlinebestandsaufnahme, kein Upload, keine Installation und kein zusätzlicher Commit. Der folgende R08-B-Eintrag bleibt der unveränderte lokale Bauabschluss.

**Releasevorbereitung, 15. Oktober 2026:** [AP23D3](docs/fachrecht/abnahme-ap23d3.md) und die [zusammengeführte Quellenprüfung R08-A2](docs/fachrecht/abnahme-quellen-mvp08.md) sind abgenommen. [R08-B ist ausdrücklich freigegeben](docs/betrieb/freigabe-r08-b.md) und lokal vollständig ausgeführt und geprüft. Datenrelease `2026-10-15-mvp-08-approved.1`, SPFx `0.8.0.0`, Mirror, Webpaket und Recovery `0.8.0.1` mit MVP07-Funktionalität sind gebaut und versiegelt. Genau ein lokaler Commit enthält ausschliesslich die 42 neuen Laufzeitdateien. Auch die vollständige Regression und der isolierte Standardtestbestand ohne private Rohbelege sind bestanden. [Artefakte, Prüfsummen und Abschlussnachweis](docs/betrieb/releaseartefakte-mvp-08.md). E/Q, GitHub und P bleiben gesonderte Schritte gemäss [Releaseplan](docs/betrieb/deployment-mvp-08.md). Keine Installation, kein Upload und kein Push. Produktiv bleibt der dokumentierte MVP-0.7-Stand, ohne neue Liveinventur. Die folgenden AP23-Zwischenstände beschreiben den Verlauf vor diesem Releaseauftrag.

**Projektstand, 15. Oktober 2026:** [AP21 / #45](https://github.com/davidsteimer/fristenrechner/issues/45) und AP22 sind abgenommen und mit MVP 0.7 ausgeliefert. [AP22A / #46](https://github.com/davidsteimer/fristenrechner/issues/46) ist mit der [Matrix und dem Modellcheck](docs/fachrecht/abschluss-ap22a.md) abgeschlossen. [AP22B](docs/fachrecht/abnahme-ap22b.md), [AP22C1](docs/fachrecht/abnahme-ap22c1.md), [AP22C2](docs/fachrecht/abnahme-ap22c2.md) und [AP22C3](docs/fachrecht/abnahme-ap22c3.md) dokumentieren Vertrag, Kern, Oberfläche und Hostintegration. Quellenprüfung, Produktübernahme, E/Q-Abnahme und öffentliche Bereitstellung sind nachfolgend durchgeführt worden.

Die [Abschlusskarte MVP 0.7 / #47](https://github.com/davidsteimer/fristenrechner/issues/47) bündelt AP22B/C und den damaligen Releasevollzug. Der [sozialversicherungsrechtliche Restumfang / #35](https://github.com/davidsteimer/fristenrechner/issues/35) bleibt offen. [Weitere kantonale Verwaltungsverfahren / #48](https://github.com/davidsteimer/fristenrechner/issues/48) werden in Tranchen umgesetzt. AP23A bis AP23D3 und [DEC-2026-032](docs/entscheidungen/DEC-2026-032-beschluss.md) sind abgenommen beziehungsweise beschlossen. Die zwölf TI-/GR-Pfade sind im abgenommenen MVP08-E-/Q-Stand aktiviert, nicht im dokumentierten öffentlichen MVP07-Betrieb. [Italienisch/Rumantsch Grischun als Oberflächensprachen / #49](https://github.com/davidsteimer/fristenrechner/issues/49) bleibt im Backlog. Kalender-App, Feiertagskarte und Print-/PDF-Produkte sind eigenständige Produktideen, keine Bestandteile von MVP 0.8.

**AP23D2-Abnahme und AP23D3, 15. Oktober 2026:** Der [UX-Nachtrag zur Feiertagsanknüpfung und Rechenspur](docs/architektur/verwaltungsintegration-ap23d2-ux.md) ist zusammen mit D2 abgenommen und in einer gesonderten Abnahmekopie gesichert. Die App leitet bekannte Anknüpfungen automatisch ab und fragt nur erforderliche Fallangaben ab. Lesbare Rechenschritte und fallbezogene Normlinks ersetzen technische Kennungen in der fachlichen Ansicht. Vollständige technische Nachweise bleiben aufklappbar. AP23D3 behält diesen zweispaltigen Aufbau, die Rechtsdaten und die Rechenregeln bei. Produktiv bleibt MVP 0.7.

Das Vorhaben wird schlank nach HERMES 2022 agil geführt. Es gilt ein WIP-Limit von einem wesentlichen Arbeitspaket. Ein Arbeitspaket umfasst höchstens fünf Nettoarbeitstage. Die [GitHub Issues](https://github.com/davidsteimer/fristenrechner/issues) und das öffentliche [GitHub Project «Fristenrechner Schweiz · MVP»](https://github.com/users/davidsteimer/projects/1) bilden die einzige operative Aufgabenliste.

David Steimer nimmt in der aktuellen Einpersonenphase alle menschlichen Projekt-, Fach-, Prüf- und Betriebsrollen wahr. Die Rollen bleiben als Zielmodell getrennt dokumentiert. Codex unterstützt als KI-Arbeitsinstrument, übernimmt aber keine formelle Freigabe-, Organ- oder Haftungsverantwortung.

Materielle Entscheide werden mit stabilen DEC-Nummern im [Entscheidungsregister](docs/entscheidungen/README.md) dokumentiert. Chatnachrichten allein gelten nicht als dauerhafter Entscheidungsnachweis.

Die fachliche Grundlage des MVP liegt in der [Rechtsmatrix](docs/fachrecht/rechtsmatrix-mvp.md). Das zugehörige [Quellenregister](docs/fachrecht/quellenregister.md), das [AP13-Prüfprotokoll](data/source-reviews/README.md) und die [offenen Fachfragen](docs/fachrecht/offene-fachfragen.md) verhindern, dass ungeklärte Annahmen als sichere Automatik in die Anwendung gelangen.

Der [AP6-Golden-Case-Korpus](tests/golden/README.md) bildet die fachlich freigegebenen Referenzerwartungen für den [implementierten Rechenkern](src/core/README.md). Berechenbare Referenzfälle und bewusst blockierte offene Konstellationen bleiben getrennt.

## Projektgrundlagen

- [Konzept Fristenrechner Schweiz, Version 1.0](outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf)
- [Projekt- und Realisierungsplan, Version 1.0](outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf)

Die editierbaren Word-Fassungen liegen im selben Verzeichnis.

## Mitwirken und Sicherheit

Beiträge sind willkommen. Vor einer grösseren Änderung bitte zuerst ein Issue eröffnen. Fachliche Änderungen benötigen amtliche Quellen und überprüfbare Testfälle. Einzelheiten stehen in [CONTRIBUTING.md](CONTRIBUTING.md).

Sicherheitslücken und sensible Befunde dürfen nicht in einem öffentlichen Issue offengelegt werden. Das Meldeverfahren steht in [SECURITY.md](SECURITY.md).

## Lizenzen

Der Programmcode steht unter der [GNU Affero General Public License, Version 3](LICENSE), ausschliesslich Version 3. Dokumentation sowie kuratierte Regel- und Kalenderdaten stehen unter [CC BY-SA 4.0](LICENSES/CC-BY-SA-4.0.txt), soweit die Rechte und Bedingungen der jeweiligen Primärquellen dies zulassen.

Amtliche Erlasstexte, Drittmaterialien, Quellenzitate, Marken und Logos werden durch diese Lizenzzuordnung nicht neu lizenziert. Abweichende Hinweise in einer Datei oder bei einem Datensatz gehen vor. Die genaue Abgrenzung ist in [LICENSES/README.md](LICENSES/README.md) festgehalten.

Copyright © 2026 David Steimer
