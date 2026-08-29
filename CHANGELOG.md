# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/). Veröffentlichte Softwarefassungen sollen [Semantic Versioning](https://semver.org/lang/de/) verwenden. Datenreleases erhalten zusätzlich eine eigene unveränderliche Release-ID.

## [Unreleased]

### Added

- Repository-Basis für Arbeitspaket AP1
- Projektübersicht und dokumentierte Grundstruktur
- GNU Affero General Public License Version 3 für Programmcode
- CC BY-SA 4.0 für eigene Dokumentation und kuratierte Daten, soweit zulässig
- Beitrags- und Sicherheitsrichtlinie
- Freigegebenes Konzept und freigegebener Projekt- und Realisierungsplan, jeweils Version 1.0
- Öffentliches GitHub Project für den MVP mit fünf Projektstatus, WIP-Limit 1 und den Planungsfeldern Priorität, Typ, Release, Rechtsgebiet, Gemeinwesen, Sprache, Aufwand und Entscheidbezug
- Neun MVP-Epics sowie die ausführungsbereiten Startpakete AP3 bis AP7
- Entscheidungsregister mit einheitlicher Vorlage und DEC-2026-001 bis DEC-2026-011
- Quellenbasierte Rechtsmatrix für StPO, ZPO, BGG, VwVG und VRPG Bern mit stabilen Arbeits-IDs
- Quellenregister mit amtlichen Primärquellen, Gültigkeitsständen und ergänzender Rechtsprechung
- Register der offenen Fachfragen und verbindlichen Sicherheitsgrenzen für AP5
- Fachlicher Startbestand für die Golden Cases in AP6
- JSON-Schemata für gemeinsame Datentypen, Rechtsprofile, Kalender und Release-Manifeste
- Providerneutrales AP5-Referenzrelease mit fünf Rechtsprofilen, zwei Kalendern, 47 Regeln, 36 Feiertagen und zehn Stillstandsperioden
- Quellen-, Gültigkeits-, Prüf- und Kompatibilitätsmetadaten in allen Datenartefakten
- SHA-256-Prüfsummen und Dateigrössen für sieben Releaseartefakte
- Automatisierte Schema-, Referenz-, Konsistenz-, Kalender- und Prüfsummenvalidierung mit sechs Negativtests
- Architekturvertrag für byteidentische GitHub-, SharePoint-Mirror- und manuelle Datenprovider
- Beschlossener Architekturentscheid DEC-2026-012 zum Datenrelease-Format
- Freigegebenes AP5-Referenzrelease `2026-08-29-ap5-approved.1` mit maschinenlesbaren Freigabemetadaten
- JSON-Schema für sprachneutrale Golden-Case-Suites mit Quellen, Eingaben, Rechenspuren und Erwartungen
- 15 synthetische, quellenbasierte AP6-Kandidatenfälle für alle fünf MVP-Rechtsprofile
- Fachlich abgenommene AP6-Referenzsuite mit unveränderten Erwartungen und dokumentierter Freigabe durch David Steimer
- Drei getrennte Sperrfälle für unbestätigte Zustellfiktion, unbekannte Spezialregel und widersprüchliche Feiertagsanknüpfung
- Erwarteter Negativdatensatz mit fehlender Fristdauer
- Unabhängiger AP6-Validator mit vollständiger Nachrechnung gegen den freigegebenen AP5-Datenrelease und vier semantischen Negativtests
- Ausführungsplan für den SPFx-Machbarkeitsspike mit Minimalprototyp, 14 Prüfungen, Tenantvoraussetzungen und 4,5-Tage-Zeitbox
- SPFx-1.23.2-Minimalprototyp mit gemeinsamer SharePoint- und Teams-Component-ID, Fluent UI React v8 sowie Deutsch und Französisch
- GitHub- und SharePoint-Mirrorprovider mit vollständiger Schema-, Prüfsummen-, Referenz- und Abdeckungsvalidierung
- Atomare IndexedDB-Aktivierung, lokaler Fallback und sechs automatisierte positive und negative Spike-Tests
- Reproduzierbarer Node-22-Build, geprüftes `.sppkg`, Paketinventar, lokaler Zwischenbericht und vorgeschlagener Entscheid DEC-2026-013
- Tenant-App-Katalog, dedizierte SharePoint-Testsite und tenantbereinigter Laufzeitnachweis für den SPFx-Spike
- Erfolgreiche Ausführung desselben Spike-Pakets in SharePoint Online und als Teams-Kanalregisterkarte
- Reale Validierung des byteidentischen AP5-Release über GitHub und einen SharePoint-Mirror
- Vollständiges Testprotokoll T01 bis T14 und technischer Ergebnisbericht mit Go-Empfehlung

### Changed

- Öffentliche Word- und PDF-Projektgrundlagen datensparsam bereinigt
- Projektstatus nach Abschluss von AP2 aktualisiert und operative Aufgabensteuerung mit GitHub verlinkt
- Projektstatus nach Abschluss von AP3 aktualisiert und dauerhaften Entscheidungsnachweis verlinkt
- Projektstatus nach Abschluss von AP4 aktualisiert und fachrechtliche Dokumentation verlinkt
- Projektstatus nach Abschluss von AP5 aktualisiert und maschinenlesbares Datenmodell verlinkt
- Abnahme des AP5-Referenzrelease und Beschluss von DEC-2026-012 dokumentiert, ohne den veröffentlichten Candidate rückwirkend zu verändern
- Projektstatus nach technischer Fertigstellung von AP6 auf fachliche Prüfung aktualisiert
- AP6 nach fachlicher Prüfung der Falltabelle abgenommen und Referenzerwartungen auf `approved` gesetzt
- AP7 nach Prüfung des ausführungsbereiten SPFx-Machbarkeitsspikes abgenommen
- `SPK-SPFX-01` technisch abgeschlossen, alle 14 Prüfungen bestanden und Zeitbox deutlich unterschritten
- Technischen SharePoint-Paketnamen nach realer App-Katalog-Validierung auf eine `NameDefinition`-konforme Form bereinigt

[Unreleased]: https://github.com/davidsteimer/fristenrechner/commits/main
