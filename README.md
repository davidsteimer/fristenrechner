# Fristenrechner Schweiz

**MVP 0.6, 1. Oktober 2026:** AP20C1–C3 und die [zusammengeführte Quellenprüfung einschliesslich Wiederverwendung und Vorbehalten](docs/fachrecht/abnahme-quellen-mvp06.md) sind abgenommen. Die lokale Datenübernahme und der definitive Artefaktbau sind [abgeschlossen und geprüft](docs/betrieb/releaseartefakte-mvp-06.md). Der [neue Datenrelease](data/releases/2026-10-01-mvp-06-approved.1/README.md) enthält 44 nationale Sozialverfahrensregeln und 50 ausschliesslich bernische Anbindungen. Die vier bestehenden E-/Q-Installationen sind inzwischen aktualisiert. Die [Lesbarkeitskorrektur mit Paket 0.6.0.1 und bestandenen Live-Nachtests](docs/betrieb/spfx-korrekturkandidat-mvp06-0601.md) ergänzt die ursprüngliche technische Hostprüfung. [Manuelle Q-Abnahme, Gastbestätigung und begründete Outlook-Wiederverwendung](docs/betrieb/abnahme-q-mvp06.md) sind dokumentiert. Der [Deploymentplan](docs/betrieb/deployment-mvp-06.md) trennt den internen Prüfstand vom unveränderten öffentlichen Betrieb mit MVP 0.5. Keine GitHub-Veröffentlichung oder P-Änderung für MVP 0.6.

Der Fristenrechner Schweiz ist eine vollständig webbasierte Anwendung zur nachvollziehbaren Berechnung verfahrensrechtlicher Fristen. Die Lösung ist für Microsoft 365 konzipiert und soll auf modernen SharePoint-Seiten sowie als Registerkarte in Microsoft Teams funktionieren.

> **Letzter dokumentierter öffentlicher Stand:** MVP 0.5 wurde am 28. September 2026 auf GitHub veröffentlicht und auf P bereitgestellt. Der [Produktionsnachweis](docs/betrieb/produktionsbereitstellung-mvp05-2026-09-28.md) dokumentiert die begrenzt akzeptierten Header-/Cacheabweichungen und die noch offene direkte Storage-Wertkontrolle D10. Die vier E-/Q-Instanzen sind inzwischen auf MVP 0.6 aktualisiert. Die historischen MVP-0.5-Nachweise bleiben unverändert.

| Stand | Bedeutung |
| --- | --- |
| Nächster Release, interne Prüfung | MVP `0.6.0`, SPFx-Korrekturpaket `0.6.0.1`, Daten `2026-10-01-mvp-06-approved.1`. Quellenabnahme, Datenübernahme, lokale Builds und begrenzte Live-Nachtests geprüft. [Korrektur- und Installationsnachweis](docs/betrieb/spfx-korrekturkandidat-mvp06-0601.md). E/Q abgenommen, R06-12 durch begründete Wiederverwendung abgeschlossen. [Lokale Publikationsvorbereitung](docs/betrieb/publikationspaket-mvp06.md) mit korrigiertem Webarchiv und getrennten öffentlichen Prüfungen. GitHub und P weiterhin ausstehend |
| Öffentlicher Betrieb | MVP `0.5.0` auf [steimer.ch](https://www.steimer.ch/fristenrechner/) gemäss [Produktionsnachweis vom 28. September](docs/betrieb/produktionsbereitstellung-mvp05-2026-09-28.md), mit den dort ausgewiesenen Header-/Cacheabweichungen und der offenen direkten Storage-Wertkontrolle D10. Die frühere Freigabe [DEC-2026-018](docs/entscheidungen/DEC-2026-018-freigabe-oeffentlicher-p-betrieb.md) bleibt historisch und wird nicht als Prüfung späterer Releases ausgegeben |
| Interner E-/Q-Stand | Anwendung `0.6.0`, SPFx-Paket `0.6.0.1`, Datenrelease `2026-10-01-mvp-06-approved.1`. Alle vier Instanzen verwenden ihren eigenen SharePoint-Mirror. Ursprüngliche Eigentümerprüfung plus bestandene begrenzte Nachtests einschliesslich AP5-Kompatibilität. Fachliche Q-Abnahme und reale Gastanmeldung für MVP 0.6 durch David bestätigt. [Abnahme und Outlook-Wiederverwendung](docs/betrieb/abnahme-q-mvp06.md). [Nachweis und Restpunkte](docs/betrieb/spfx-korrekturkandidat-mvp06-0601.md) |

Die Reihenfolge bleibt **E → Q → manuelle Abnahme durch David Steimer → GitHub → P**. E und Q verwenden vor der Veröffentlichung den vollständigen same-site SharePoint-Mirror. Das bestehende Berechtigungsmodell bleibt unverändert. Die reale Anmeldung mit dem bestehenden B2B-Gast ist für MVP 0.5 durch David bestätigt. Die dortigen Outlook-Importtests T15/T16 sind gemäss [Abschlussnachweis](docs/betrieb/outlook-pruefung-mvp05.md) erledigt, Web durch tatsächlichen Import mit Bereinigung und Desktop durch Davids manuelle Bestätigung. Für MVP 0.6 ist ihre begründete [Wiederverwendung ausdrücklich beschlossen](docs/betrieb/abnahme-q-mvp06.md). Die fachliche Q-Abnahme erteilt weder eine zusätzliche externe Q-Demofreigabe noch die anschliessend gesondert erforderlichen GitHub- und P-Freigaben. Der aktuelle [Deploymentplan MVP 0.6](docs/betrieb/deployment-mvp-06.md) dokumentiert die nächsten Grenzen. Die Fehler- und Rückfallhistorie des verworfenen Pakets `0.4.0.0` bleibt [unverändert erhalten](docs/betrieb/eq-vorpruefung-mvp04.md).

[AP17C](docs/architektur/vrpg-integration-ap17c.md) integriert die gestufte VRPG-Bedienung mit vier Bereichen, zweispaltigem Raster und 16 fachlich abgenommenen Zuordnungen für IVG, AHVG, UVG und bernisches Beschaffungsrecht. Vier Sammelpfade bleiben gesperrt. Die qualifizierten AP17-Fälle sind für 2026–2027 geprüft. Der Spezialregimekatalog `3.0.0` ist mit [DEC-2026-020](docs/entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) als technischer Produktvertrag bestätigt. Die früheren [AP17A-](docs/architektur/vrpg-bedienung-ap17a.md) und [AP17B-Nachweise](docs/fachrecht/vrpg-anwendbarkeit-ap17b.md) bleiben als Entwicklungsgeschichte erhalten.

[AP18C ist abgenommen](docs/fachrecht/abnahme-ap18c.md). Der mit [DEC-2026-023](docs/entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) beschlossene [Feiertagskatalog `1.0.0`](docs/architektur/feiertagskatalog-ap18c.md) integriert alle 479 Regeln aus V0.12. Manifest-/Consumerformat ist `4.0.0`, die Kalenderkomponente bleibt `2.0.0`. Die operative Ableitung ist weiterhin auf die zwölf bisherigen CH-/BE-Feiertagsregeln begrenzt. Es gibt keine zusätzlichen kantonalen Fristenprofile und keine Kalender-App. [Archivbestätigung und Arbeitskopientrennung](docs/fachrecht/archivbestaetigung-ap18.md) dokumentieren die Referenzgrundlage.

Der [vollständige Quellenabgleich für MVP 0.4](docs/fachrecht/quellenabgleich-mvp04.md) ist durch David Steimer [abgenommen](docs/fachrecht/abnahme-quellenpruefung-mvp04.md): 120 unterschiedliche Quellen-IDs, kein neuer Regeländerungsbedarf und ein weiterhin sichtbarer AI-Quellenkonflikt mit ausdrücklich unveränderter Behandlung. Der [Releaseplan](docs/betrieb/deployment-mvp-04.md) trennt lokale Prüfung, Veröffentlichung, Installation und Betriebsfreigabe. Die [vorbereiteten Releasehinweise](docs/betrieb/release-notes-mvp04.md) fassen Änderungen und Grenzen für Benutzende und IT zusammen. Historische Zielumgebungsprüfungen gelten nicht als Prüfung von MVP 0.4.

Die [Publikationsbereinigung P01/P02](docs/betrieb/publikationsbereinigung-mvp04.md) ergänzt die Releasevorbereitung. Historische V0.9-/V0.10-Originaldateien bleiben privat und unverändert. Für das öffentliche Repository sind [gesonderte, metadatenbereinigte Kopien](docs/fachrecht/publikationskopien-ap18.md) vorbereitet. Die damalige Publikationsbereinigung bleibt erhalten. Die lebenden Einstiegstexte und IT-Unterlagen sind inzwischen auf den abgenommenen internen MVP-0.6-Stand nachgeführt. Die Veröffentlichung bleibt gesondert freizugeben.

## Zweck

Das [lokale Publikationspaket MVP 0.6](docs/betrieb/publikationspaket-mvp06.md) bindet die vorgesehenen Dateien, das unveränderte SPFx-Paket und das korrigierte Webartefakt. [Releasehinweise](docs/betrieb/release-notes-mvp06.md) fassen Änderungen und Grenzen zusammen. Die lokale Fertigstellung ist keine Veröffentlichung.

Die Anwendung soll aus dem Empfangsdatum einer fristauslösenden Zustellung, der Fristdauer, dem anwendbaren Verfahrensrecht und dem massgebenden Gemeinwesen ein begründetes Fristende bestimmen. Sie zeigt die automatisch gewählten Parameter, verwendeten Datenstände und Rechenschritte sichtbar an. Automatische Auswahlen sollen kontrolliert übersteuert werden können.

Die berechneten Angaben sind ein Arbeitsmittel. Sie ersetzen weder die Prüfung der konkreten Zustellung noch eine juristische Beurteilung des Einzelfalls.

## MVP-Umfang

Der Rechner bleibt auch mit MVP 0.6 auf die freigegebenen Bundes- und Berner Konstellationen konzentriert und umfasst folgende Rechtsprofile:

- Schweizerische Strafprozessordnung, StPO
- Schweizerische Zivilprozessordnung, ZPO
- Bundesgerichtsgesetz, BGG
- Verwaltungsverfahrensgesetz des Bundes, VwVG
- Gesetz über die Verwaltungsrechtspflege des Kantons Bern, VRPG

Die Produktsprache ist Deutsch und Französisch. Die zusätzlichen italienischen und rätoromanischen Bezeichnungsfelder im Feiertagskatalog sind keine weiteren Oberflächensprachen. Persönliche Voreinstellungen werden nur lokal im Browser gespeichert. Es werden keine Fallakten, Namen oder Aktenzeichen benötigt.

## Technisches Zielbild

Implementiert ist eine clientseitige SharePoint-Framework-Lösung mit React und Fluent UI sowie eine statische öffentliche Webausprägung. Ein deterministischer TypeScript-Rechenkern bleibt von Oberfläche, Microsoft-365-Integration und Datenquelle getrennt. Die Datumsberechnung arbeitet ausschliesslich mit Kalenderdaten ohne Zeitzonenabhängigkeit. Uhrzeit und Zeitzone werden bei Spezialregimen getrennt als Einreichungsanforderung geführt und nicht über JavaScript-Zeitobjekte berechnet.

Die M365-Ausprägung bezieht versionierte Rechts- und Kalenderdaten wahlweise aus einem unveränderlich gepinnten GitHub-Datenrelease oder einem byteidentischen SharePoint-Mirror. Der neue MVP-0.6-Standardpin ist `19b37336974f3ba7c72333763e1272425239b8cd` und noch nicht veröffentlicht. Er ist daher noch keine öffentlich abrufbare Datenquelle. E/Q verwenden die bereits geprüften Mirrors. Der Rechenkern kennt die konkrete Datenquelle nicht. Die öffentliche Webausprägung bettet den Datenrelease beim Build ein.

Der in AP8 implementierte [Rechenkern v0.1](src/core/README.md) verwendet reine ISO-Kalenderdatumsarithmetik, verarbeitet die typisierten AP5-Regeleffekte und blockiert ungeklärte Eingaben ohne scheinbar plausibles Fristende. Die automatisierten TypeScript-Tests laufen zusätzlich zum unabhängigen Python-Testorakel aus AP6.

AP11B ergänzt vier typisierte Rechenarten für [VRPG-Spezialregime](docs/architektur/vrpg-spezialregime-datenmodell.md), Fristwahrungsprofile, Prüfschranken und versionierte rechtliche Übersteuerungen. Behördlich gesetzte Termine besitzen keine Rechenoperation, werden im Rechen-GUI verborgen und erzeugen kein Fristresultat. Der [Format-2-Referenzrelease](data/releases/2026-08-30-ap11b-approved.1/README.md) ist fachlich und technisch abgenommen. AP11C integriert diesen Vertrag in die Oberfläche und den SPFx-Consumer. Der daraus hervorgegangene [MVP-0.2-Datenrelease](data/releases/2026-08-31-mvp-02-approved.1/README.md) ist freigegeben. Der [AP11C-Nachweis](docs/architektur/mvp-02-spezialregime-ap11c.md) dokumentiert Umsetzung, Abnahme und Betriebsgrenzen.

AP12C ergänzt auf Basis des beschlossenen [ewigen Kalenders](docs/architektur/ewiger-kalender-ap12a.md) das Manifestformat 3.0.0 und den freigegebenen [MVP-0.3-Datenrelease `2026-08-31-mvp-03-approved.1`](data/releases/2026-08-31-mvp-03-approved.1/README.md). Feiertage und Gerichtsferien werden aus 15 versionierten Regeln für den konkret benötigten Zeitraum erzeugt. Der [AP12C-Nachweis](docs/architektur/ewiger-kalender-ap12c.md) dokumentiert Migration, Produktintegration, Sicherheitsgrenzen und lokalen Teststand. Der unveränderte [AP12C-Kandidat](data/releases/2026-08-31-ap12c-candidate.1/README.md) bleibt als Vorläufer erhalten.

AP13 ergänzt die [periodische Quellenprüfung](docs/betrieb/periodische-quellenpruefung-ap13.md) als eigenen Governance-Baustein. Ein vollständiges [maschinenlesbares Quellenregister und Prüfprotokoll](data/source-reviews/README.md) wird ausserhalb der unveränderlichen Datenreleases geführt. Ein generierter Index löst pro Quelle die betroffenen Rechtsprofile, Kalender, Regelkomponenten, Fundstellen und Releases auf. Das Ergebnis `unchanged` wird revisionsfähig dokumentiert, ohne einen inhaltsgleichen Datenrelease zu erzwingen.

Die in AP9 implementierte und mit AP11C erweiterte [MVP-Rechneroberfläche](src/ui/README.md) zeigt die zuständige Behörde, gefilterte Rechtsprofile, profilspezifische Merkmale, Spezialregime, automatische Parameter, kontrollierte Übersteuerungen, Resultate und die Rechenspur auf Deutsch und Französisch. Der kanzleiorientierte Hauptablauf führt von den Eingaben direkt zu den Aktionen und zum Resultat. Spezialregime blenden nur die fachlich benötigten Anker ein und weisen Fristwahrung, Annahmeschluss sowie Nachweise getrennt vom berechneten Datum aus.

Die abgenommene Funktion zu [Issue #18](docs/architektur/outlook-kalendereintrag-issue-18.md) erzeugt aus einem vollständig berechneten Fristablauf eine Outlook-kompatible `.ics`-Datei. Die Funktion sitzt im allgemeinen Ergebnisraster rechts unten, speichert die optionale Referenz nicht und benötigt weder Microsoft Graph noch zusätzliche Tenantberechtigungen. Die historische Release-2-Testmatrix einschliesslich Outlook ist abgeschlossen. Für MVP 0.5 sind die tatsächlichen Dateiexporte auf allen vier E-/Q-Instanzen geprüft. Der [Webimport samt Bereinigung und die manuelle Desktop-Bestätigung](docs/betrieb/outlook-pruefung-mvp05.md) sind separat dokumentiert. Frühere offene MVP-0.4-Angaben bleiben historische Nachweise.

Die [SPFx-Produktlösung](spfx/README.md) synchronisiert diese hostneutralen Quellen vor dem Build und bindet sie über einen dünnen Hostadapter ein. GitHub- und SharePoint-Provider liefern nach vollständiger Validierung dasselbe Datenmodell. Der MVP-0.6-Consumer akzeptiert die Formate 1 bis 6. Das Paket unterstützt `SharePointWebPart` und `TeamsTab`, enthält seine Client-Assets und beantragt keine zusätzlichen API-Berechtigungen. Der [MVP-0.6-Deploymentplan](docs/betrieb/deployment-mvp-06.md) führt die aktuellen Paketidentitäten, den vollständigen Format-6-Mirror sowie bestandene Zielumgebungsprüfungen und getrennte Publikationsfreigaben. Die [Release-2-Anleitung](docs/betrieb/deployment-release-2-mvp-03.md) bleibt der historische MVP-0.3- und Rückfallnachweis. Der öffentliche P-Rechner verwendet gemäss [Produktionsnachweis](docs/betrieb/produktionsbereitstellung-mvp05-2026-09-28.md) MVP 0.5.

Der [AP16-Ausführungsplan](docs/betrieb/oeffentliche-p-auspraegung-ap16.md) ergänzt diese M365-Zielarchitektur um eine rein statische öffentliche Ausprägung auf dem bestehenden steimer.ch-Hosting. Sie enthält den gleichen freigegebenen Kern, die Produktoberfläche und den Datenrelease direkt im Build. Der [Kandidatennachweis](docs/betrieb/oeffentliche-p-auspraegung-ap16-nachweis.md) weist P01 bis P15 aus. AP16 ist fachlich-technisch abgenommen und [DEC-2026-017](docs/entscheidungen/DEC-2026-017-statische-p-auspraegung-steimer-ch.md) ist beschlossen. Die erstmalige öffentliche Bereitstellung und die [Prüfmatrix D01 bis D12](docs/betrieb/produktionsbereitstellung-2026-09-01.md) sind abgeschlossen. Die [Deployment- und Rückfallanleitung](docs/betrieb/deployment-oeffentliche-p-auspraegung-ap16.md) dokumentiert das Verfahren. Es bestehen keine Laufzeitaufrufe an GitHub, SharePoint, Graph oder ein CDN. [DEC-2026-018](docs/entscheidungen/DEC-2026-018-freigabe-oeffentlicher-p-betrieb.md) gibt den öffentlichen P-Betrieb ausdrücklich frei.

Für eine IT-Freigabe in anderen Microsoft-365-Tenants stehen die [technische Kurzdokumentation](docs/architektur/technische-kurzdokumentation.md) und die [Voraussetzungen für Installation und Betrieb](docs/betrieb/installation-und-betrieb-dritttenants.md) mit einer konkreten SharePoint-Mirror-Anleitung bereit.

Der [AP14-Ausführungsplan](docs/betrieb/gastzugriff-demobetrieb-ap14.md) und das [Testprotokoll](docs/betrieb/gastzugriff-ap14-testprotokoll.md) dokumentieren den abgeschlossenen technischen Gastnachweis. Die App, Fachlogik, Zweisprachigkeit und der Kalenderexport funktionierten für den Gast. G13 und G17 bleiben nach der ursprünglichen Matrix historisch nicht bestanden. Das präzisierte Zielbild beurteilt in [AP15](docs/betrieb/e-q-p-zielarchitektur-ap15.md) jedoch das durch die Q-Aufnahme erzeugte Berechtigungsdelta statt sämtliche unabhängig begründeten Rechte der Testidentität. Ein zentraler Q-Zugriffsprinzipal soll Site, Team, read-only Mirror und den konkreten Paketordner gemeinsam begrenzen und widerrufbar machen.

Das [AP15-Testprotokoll](docs/betrieb/e-q-p-testprotokoll-ap15.md) dokumentiert 12 von 12 bestandenen Prüfungen des gruppenbasierten Q-Modells. Die [Betriebsanweisung](docs/betrieb/q-demobetrieb-ap15-betriebsanweisung.md) beschreibt Aufnahme, Update, Widerruf und Wiederaufnahme ohne direkte Einzelrechte. Der beschlossene Entscheid [DEC-2026-016](docs/entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md) gibt den begrenzten Q-Demobetrieb für vollständig freigegebene Releases frei. Die bei AP15 noch offene öffentliche Ausprägung wurde anschliessend mit AP16 umgesetzt.

Das [Datenrelease-Format](docs/architektur/datenrelease-format.md) verwendet JSON Schema Draft 2020-12, ISO-Kalenderdaten, ein unveränderliches Manifest und SHA-256-Prüfsummen. Format 1.0.0 bleibt für den AP5-Referenzbestand gültig. Format 2.0.0 ergänzt Spezialregime als eigene Manifestrolle. Format 3.0.0 ergänzt versionierte Regelkalender und eine nach oben offene Releaseabdeckung. Format 4.0.0 ergänzt den Schweizer Feiertagskatalog und dessen nachprüfbare, begrenzte Projektion in die operativen Kalender. Format 5.0.0 ergänzt den [Sozialverfahrenskatalog](docs/architektur/sozialversicherungsvertrag-ap19b.md) mit nationalen Regeln, kantonalen Anbindungen und expliziten Freigaben. Format 6.0.0 ergänzt den [beschlossenen AP20-Vertrag](docs/entscheidungen/DEC-2026-026-beschluss.md) und den Sozialverfahrenskatalog 2.0.0. Der MVP-0.6-Mirror enthält weiterhin elf Dateien: Manifest und zehn Nutzartefakte einschliesslich `holiday-catalogs/ch-holiday-catalog.json` und `social-procedures/ch-social-procedures.json`. GitHub, SharePoint-Mirror und manueller Import verwenden dieselben byteidentischen Release-Dateien.

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

**Aktueller Ausbau, 1. Oktober 2026:** [AP20A / #39](https://github.com/davidsteimer/fristenrechner/issues/39) und [AP20B / #40](https://github.com/davidsteimer/fristenrechner/issues/40) sind durch David Steimer abgenommen. Die [AP20B-Abnahmenotiz](docs/fachrecht/abnahme-ap20b.md) bindet die unveränderte Fach-/Vertragsvorlage, Quellenprüfung und Referenzen für EOG, FamZG, FLG, MVG und ÜLG. 20 neue Bundesregeln und 22 Berner Anbindungen sind als Vorlage bestätigt und inzwischen lokal integriert, noch nicht operativ freigegeben. [DEC-2026-026](docs/entscheidungen/DEC-2026-026-beschluss.md) ist anschliessend ausdrücklich beschlossen: Sozialkomponente 2.0.0 und Manifest-/Mindestconsumer 6.0.0. Der gebundene Entwurf bleibt erhalten, der separate Beschlussnachweis dokumentiert den aktuellen Status. [AP20C1](docs/architektur/implementierung-ap20c1.md) wurde anschliessend ausdrücklich gestartet und ist lokal zur Prüfung umgesetzt: Consumer 6, vier neue EOG-Regeln und sechs Berner Anbindungen, reduzierte DE-/FR-Bedienung. Die [fachlich-technische Abnahme von AP20C1](docs/fachrecht/abnahme-ap20c1.md) durch David Steimer ist am 1. Oktober 2026 bestätigt. Der gebundene Integrationsbericht bleibt als ursprünglicher Prüfstand unverändert. [AP20C2](docs/architektur/implementierung-ap20c2.md) wurde danach separat beauftragt und ist mit FamZG/FLG lokal umgesetzt und technisch geprüft. Der Kandidat umfasst 36 nationale Regeln und 42 Berner Anbindungen. Die [fachlich-technische Abnahme von AP20C2](docs/fachrecht/abnahme-ap20c2.md) durch David Steimer ist am 1. Oktober 2026 bestätigt. [AP20C3](docs/architektur/implementierung-ap20c3.md) wurde anschliessend gesondert beauftragt und ist mit MVG/ÜLG lokal umgesetzt und technisch geprüft. Damit sind alle fünf AP20-Erlasse im vereinbarten Umfang integriert, insgesamt 44 nationale Regeln und 50 Berner Anbindungen. Die [fachlich-technische Abnahme von AP20C3](docs/fachrecht/abnahme-ap20c3.md) ist am 1. Oktober 2026 bestätigt. Die [Releasevorbereitung MVP 0.6](docs/betrieb/deployment-mvp-06.md) ist gestartet und wird in [#44](https://github.com/davidsteimer/fristenrechner/issues/44) geführt. [#35](https://github.com/davidsteimer/fristenrechner/issues/35) führt die Folgearbeiten. Keine neue Produkt-, Publikations- oder Betriebsfreigabe. Der aktuelle öffentliche Betriebsstand ergibt sich aus dem [MVP-0.5-Produktionsnachweis](docs/betrieb/produktionsbereitstellung-mvp05-2026-09-28.md), nicht aus den vor der Veröffentlichung entstandenen E-/Q-Beschreibungen weiter oben.

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
