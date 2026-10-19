# MVP 0.9 Releaseplan

## Aktueller Vollzug am 19. Oktober 2026

**R09-C ist mit der [Q-Abnahme vom 19. Oktober 2026](abnahme-q-mvp09.md) einschliesslich C08 abgeschlossen.** C01 bis C07 sind im [fortgeschriebenen Vollzugsnachweis](eq-vollzugsnachweis-mvp09.md) dokumentiert. Die vier bestehenden E-/Q-Apps verwenden Paket `0.9.0.0` und ihre gebundenen MVP09-Mirrors. Geräteprüfung und Gastzugriff sind von David bestätigt, die begrenzte Outlook-Wiederverwendung ist angenommen. T06-H01 und B11-H01 bleiben begrenzt akzeptierte Darstellungsbefunde, T07 bleibt eine ausdrücklich akzeptierte Zeitpunktabweichung.

**Die [lokale Publikationsvorprüfung R09-D](publikationsvorpruefung-mvp09.md) ist durchgeführt.** Die anschliessend beauftragte Bereinigung P09-01 bis P09-03 ist im [konkreten Publikationspaket](publikationspaket-mvp09.md) mit separaten öffentlichen Nachweiskopien, exakter Dateiauswahl und aktualisierten Einstiegs-/IT-Unterlagen zusammengeführt. Typ-, Produkt-, Governance- und Integritätsprüfungen sowie die tatsächliche Exportprüfung sind dort gebunden. Die abgenommenen Artefakte bleiben unverändert. Commit, GitHub und steimer.ch-P bleiben gesondert freizugeben.

## Historische Ausgangsplanung vom 18. Oktober 2026

Die folgenden Planstände bleiben als damalige Ausgangslage erhalten. Für den aktuellen Vollzugsstatus ist der vorstehend verlinkte Nachweis massgebend.

Stand: 18. Oktober 2026. Auftrag: [AP23E3 fachlich-technisch abgenommen, Releasevorbereitung gestartet](../fachrecht/abnahme-ap23e3.md).

**R09-C ist lokal vorbereitet.** Die [Installationsvorlage](eq-installationsvorlage-mvp09.md), der [gebundene Rückfallweg](rueckfall-mvp09.md) und die [Sollmatrix](pruefmatrix-mvp09.md) konkretisieren den nächsten Übergang. R09C-U01, H01 und I01 sind noch nicht freigegeben. Es gab keinen Remotezugriff, Upload, Installationsversuch oder zusätzlichen Commit. Die historischen R09-B-Berichte und Artefakte bleiben unverändert.

**R09-A2 ist durch David Steimer [abgenommen](../fachrecht/abnahme-quellen-mvp09.md). R09-B ist gemäss [Ausführungsfreigabe](freigabe-r09-b.md) und [begrenztem Validatornachtrag](freigabe-r09-b-quellenvalidator.md) lokal vollständig ausgeführt und geprüft.** Die 42 Laufzeitdateien sind ausschliesslich im Datencommit `0ccc4b9` gesichert. [Definitive Artefakte, Prüfungen und Recovery-Rundlauf](lokaler-releaseabschluss-mvp09.md) sind abgeschlossen. Der frühere [Zwischenstand](zwischenstand-r09-b.md) bleibt historisch erhalten. Installation, Uploads und Publikation bleiben ausgeschlossen. Der dokumentierte Ausgangsbetrieb ist [MVP 0.8 vom 16. Oktober 2026](produktionsbereitstellung-mvp08-2026-10-16.md). Keine frische Onlinebestandsaufnahme.

## 1. Begrenzter Releaseumfang

MVP 0.9 verbindet ausschliesslich die abgenommene AP23E-Tranche für LU/ZG/AR mit der [lokalen UX-Korrektur #50](../ux/abnahme-datumseingabe-issue50-lokal.md). Die 13 neuen Verwaltungswege ergänzen die zwölf bestehenden TI-/GR-Wege. Fachliche Zeitfenster, Fallqualifikation und AR-O1 bleiben gemäss E1/E2/E3 begrenzt. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben auf ihre bisherigen Freigaben beschränkt. Weitere Kantone, neue Spezialverfahren, IT-/RG-Oberfläche, Kalender-App, Karte und Printprodukte sind nicht enthalten.

Der beschlossene Datenvertrag verwendet Verwaltungsverfahrenskatalog 2.0.0 sowie Manifest und Mindestconsumer 9.0.0. Die übrigen Komponentenformate und Standards 5 bleiben unverändert. Der übernommene Release umfasst 41 Komponenten und ein Manifest. Sämtliche neuen Releasebindungen sind zusammenhängend erstellt und geprüft, nicht nur der Status im Manifest.

Die unveränderte [R09-B-Vorlage](uebernahme-und-buildvorlage-mvp09.md) bindet Anwendung `0.9.0`, SPFx `0.9.0.0`, Recovery `0.9.0.1` mit MVP08-Funktionsumfang und Datenrelease `2026-10-18-mvp-09-approved.1`. Produktpins und Versionen sind lokal nachgeführt. Die [definitiven Prüfsummen](lokaler-releaseabschluss-mvp09.md) stammen aus den tatsächlichen Builds. Der GitHub-Datenpin ist noch nicht veröffentlicht.

## 2. Schlanker Ablauf mit klaren Haltepunkten

| Schritt | Ergebnis und Prüfung | Übergang |
| --- | --- | --- |
| R09-A1 | Abnahmearchiv, frische lokale Regression, vollständiges Quelleninventar, [technische Vorprüfung](vorpruefung-mvp-09.md) und [Quellenprüfplan](../fachrecht/quellenpruefplan-mvp09.md) | Lokale Vorbereitung. Noch keine neue inhaltliche Gesamtquellenprüfung |
| R09-A2 | [Zusammengeführter Bericht](../fachrecht/quellenabgleich-mvp09.md): 251 Quellen, 192 mit frischem Teilnachweis und 59 ausschliesslich begründet wiederverwendet. Keine Änderung einer verwendeten Regel, Vorbehalte bleiben | **Am 18.10.2026 abgenommen**, separater Entscheid, alte Berichte unverändert |
| R09-B | [Lokaler Abschluss](lokaler-releaseabschluss-mvp09.md): Datenübernahme, genau ein Datencommit, definitive Artefakte, Regression, nativer Browserzoom und tatsächlicher Recovery-Rundlauf bestanden | **Lokal abgeschlossen**, keine Installations- oder Betriebsfreigabe |
| R09-C | [Konkrete Vorlage lokal vorbereitet](eq-installationsvorlage-mvp09.md), mit vier gebundenen Zielen, beiden Mirrorinventaren, MVP08-Recovery und Sollmatrix. Frische Onlinebestätigung und Ausgangssicherung erst nach Freigabe | **R09C-U01, H01 und I01 offen**. Erst E-Gate, dann Q. Reale Geräte, bestehender Gast und manuelle Q-Abnahme durch David |
| R09-D | Lokale Publikationsvorprüfung, Positivliste, sensible/private Nachweise abgrenzen, aktuelle IT-Unterlagen und README, gebundener Publikationsstand | **Separate Commit-/GitHub-Freigabe**, temporärer Schreibzugang bei Bedarf separat |
| R09-P | Frische Sicherung, Bestands-/Header-/Cachevergleich, Stage, öffentliche Prüfmatrix und nötiger Rückfall | **Separate P-Bereitstellungsfreigabe und P-Betriebsfreigabe** |

Die Reihenfolge bleibt **E → Q → manuelle Abnahme → GitHub → P**. Es gibt jeweils ein wesentliches aktives Arbeitspaket. Teilpakete werden auf höchstens fünf Nettoarbeitstage begrenzt. David entscheidet und nimmt ab. Codex erstellt, prüft und dokumentiert ohne formelle Freigabe- oder Haftungsverantwortung.

## 3. Lokale Datenübernahme und definitive Artefakte

R09-B verwendet einen eigenen geprüften Format-9-Übernahmeweg. Das historische R08-Werkzeug ist auf zwölf Verwaltungspfade, Format 8 und frühere Freigaben festgelegt und wurde nicht nachträglich umgeschrieben.

Die kontrollierte Übernahme trennt erlaubte Metadaten- und Bindungsänderungen von unveränderten Fachdefinitionen. Geprüft sind insbesondere alle 25 Verwaltungswege und deren Qualifikations-/Referenzbindungen, 32 Kalenderprojektionen, 104 Bundesbindungen und 50 BE-Anbindungen. Quellen- und Übernahmefreigabe sind an die ausdrücklichen Entscheide gebunden, nicht aus synthetisch freigegebenen Testdaten abgeleitet.

Die definitiven Builds wurden isoliert erstellt und als tatsächliche ZIP-/SPPKG-Dateien geprüft. Die Abnahme des lokalen E3-Testbuilds wird nicht als Freigabe einer Installationsdatei verwendet. Historische Datenreleases, AP5 und E3-Belege bleiben bytegleich erhalten.

## 4. Rückfall auf den tatsächlichen MVP-0.8-Stand

**Das vorhandene Recovery `0.8.0.1` ist für R09 kein passender Rückfall.** Es stellt MVP 0.7 mit Format 7 wieder her. R09 braucht einen neu gebauten, höheren Paketstand mit dem tatsächlich archivierten MVP-0.8-Funktionsumfang und den gesicherten Format-8-Mirrors.

Die gültige lokale Ausgangsbasis ist das definitive Paket `outputs/release-mvp08-2026-10-15/fristenrechner-schweiz-0.8.0.0.sppkg` mit SHA-256 `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a` samt archivierten Baueingängen. Die alte Arbeitsdatei unter `spfx/sharepoint/solution/` enthält dagegen noch Version `0.4.0.1` und darf nicht als Betriebsbasis gelten. Der tatsächliche Katalogstand wird erst unmittelbar vor Installation frisch bestätigt.

Lokal ist das neue Recovery `0.9.0.1` mit tatsächlichem MVP08-Funktionsumfang gebaut und geprüft. Der sieben Fälle umfassende Rundlauf mit den tatsächlichen Paketmodulen ist bestanden. Die konkreten Tenantziele, Mirrors und Hostprüfungen müssen erst in R09-C gebunden und vor Vollzug frisch bestätigt werden.

Für R09-C massgebend:

- Tatsächliche Recovery-Paketdatei und Baueingänge prüfen, nicht nur die Konfigurationsversion.
- Neuen gemeinsamen Code mit bisherigen Format-8-Daten sowie historischen AP5-Pins prüfen.
- Rundlauf MVP09 → MVP08-Recovery → MVP09 mit den neuen LU-/ZG-/AR-Standards im unveränderten Speicherformat 5. Nicht unterstützte Präferenzen müssen geschützt bleiben, ohne Löschung, Überschreibung oder Wiederaufleben älterer Standards.
- Cache-/Mirrorwechsel und Hostprüfung für die vier bestehenden Instanzen sowie AP5 festlegen.
- Eine erneute reguläre Wiederaufnahme braucht nach eingesetztem Recovery wiederum einen höheren Paketstand.

Kein allgemeiner Browserdatenreset. Entfernung von Testapps, weitere Installationen oder Berechtigungsänderungen sind nicht Bestandteil des Rückfalls.

## 5. E-/Q- und Exportnachweise

Die spätere konkrete Vorlage bindet ausschliesslich die vier bestehenden Rechnerinstanzen «Fristenrechner Test», «Entwicklungsumgebung», «Fristenrechner Gastdemo» und «Fristenrechner Gastdemo Teams». Diese Namen sind noch keine frische technische Zielbestätigung. Der gemeinsame Paketcode kann auch unverändert konfigurierte Verbraucher erreichen, namentlich Q vor dessen Umstellung und die historische AP5-Ansicht. Diese Wirkung ist bei der Installationsfreigabe ausdrücklich zu benennen.

Neue Prüfungen umfassen LU/ZG/AR, AR-O1, fehlende und gewechselte Fallqualifikation, Invalidierung des Resultats/Exports, TI/GR und Bestandsverfahren, Defaults 5, Quellenwechsel, Cachefehlabruf, historische AP5-Pins sowie DE/FR. Die Datumsfeldkorrektur wird im tatsächlichen SharePoint-/Teams-Host, bei Zoom, in schmaler Ansicht und auf realen Geräten geprüft. Der bisherige lokale Nachweis ersetzt diese Prüfungen nicht.

Zwei tatsächliche Browserdownloads und zehn Exporte aus dem definitiven Paket sind lokal geprüft. Exporte aus den vier tatsächlichen Hosts folgen in R09-C. Der [begründete Outlook-Wiederverwendungsvorschlag](outlook-wiederverwendung-mvp09.md) ist vorbereitet. **Eine neue menschliche Bestätigung der begrenzten Wiederverwendung bleibt erforderlich.** Neue Verfahrensherkunft und Exportinvalidierung brauchen in jedem Fall frische Nachweise.

## 6. Öffentliche Bereitstellung

Hosting bleibt auf der bestehenden steimer.ch-Infrastruktur. Root-Webauftritt, Sitemap, DNS, E-Mail und Hostingkonfiguration sind nicht Bestandteil dieses Releaseauftrags.

Der aus MVP 0.8 dokumentierte Header-/Cachebefund ist akzeptiert, nicht behoben. Seine frühere versionsbezogene Risikoakzeptanz wird nicht automatisch auf MVP 0.9 erweitert. Vor P sind HEAD, tatsächliche GET-Antworten und Cacheheader erneut zu vergleichen. Ein unveränderter Befund wird samt konkretem MVP09-Risikoentscheid vorgelegt. Andere Fehler lösen den gebundenen Rückfall beziehungsweise Halt aus.

## 7. Jetzt nächster Schritt

Die konkrete [R09-C-Vorlage](eq-installationsvorlage-mvp09.md) liegt zur getrennten Entscheidung über manuellen Mirrorupload, bedingten Rückfall und Installation vor. Erst nach entsprechender Freigabe beginnt C01 mit der frischen Ausgangssicherung. Danach folgen der manuelle Upload durch David, vollständiger Rohbytevergleich, gemeinsamer Katalogwechsel und E-Gate vor Q. GitHub und E/Q/P bleiben bis zum ausdrücklich freigegebenen Vollzug unverändert. Die Outlook-Wiederverwendung bleibt gesondert zu bestätigen.
