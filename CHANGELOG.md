# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/). Veröffentlichte Softwarefassungen sollen [Semantic Versioning](https://semver.org/lang/de/) verwenden. Datenreleases erhalten zusätzlich eine eigene unveränderliche Release-ID.

## [Unreleased]

## [0.3.0] - 2026-08-31

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
- Hostneutraler TypeScript-Rechenkern v0.1 mit reiner ISO-Kalenderdatumsarithmetik, Fristbeginn, Stillständen, Endverschiebung, Sperrlogik und vollständiger Rechenspur
- Struktureller Adapter vom vollständig validierten AP5-Release auf providerneutrale Berechnungsdaten
- Automatisierte AP8-Tests für 15 freigegebene Golden Cases, drei Sperrfälle sowie zusätzliche Datums-, Zustell-, Stillstands- und Sicherheitsgrenzen
- Reproduzierbarer Root-Toolchain mit Node.js 22, TypeScript 5.8.3 und gesperrtem `package-lock.json`
- AP12A-Kandidatenschema für regelbasierte Kalender mit fünf abgeschlossenen Rechentypen, offener Gültigkeit, Vererbung und expliziten Overrides
- Regelbasierte CH- und BE-Kalenderkandidaten mit 15 quellenbelegten Regeln sowie deutschen und französischen Bezeichnungen
- Maschinenlesbarer AP12A-Referenzvertrag mit 36 Paritäts-, Algorithmus-, Schaltjahr-, Override- und Sperrfällen
- Unabhängiger AP12A-Validator mit nachgewiesener Gleichheit zum MVP-0.2-Kalenderbestand für 2026 bis 2028
- Beschlossener Architekturentscheid DEC-2026-015 zur Kalenderkomponente 2.0 und zur sicheren Manifest-Hauptversion 3.0
- Hostneutraler AP12B-TypeScript-Generator für regelbasierte Feiertage und Gerichtsferien ohne JavaScript-Date oder externe Kalenderdienste
- Deterministische Kalendervererbung, offene Gültigkeit, Randjahre, stabile Ergebnis-IDs und quellenbelegte Regelspur
- Add-, Suppress- und Replace-Overrides mit eindeutiger Prioritätsauflösung und defensiven Sperrklassen
- 41 AP12B-Tests für Parität, Jahrhundertgrenzen, Schaltjahre, Vererbung, Overrides, Determinismus und Negativfälle
- Manifestformat 3.0.0 mit offener Releaseabdeckung und verpflichtender Kalenderkomponente 2.0.0
- Reproduzierbarer AP12C-Datenkandidat `2026-08-31-ap12c-candidate.1` mit acht prüfsummengeschützten Artefakten
- Atomare Migration des Stillstandssatzes auf `ch-court-holidays` in fünf Rechtsprofilen und dem VRPG-BE-Spezialregimekatalog
- Dynamische Regelkalendererzeugung im allgemeinen und speziellen Rechenkern für Preview, SharePoint und Teams
- Rechenspur mit Datenrelease-, Kalender-, Regel-, Override- und Quellenbezug
- Format-3-Validierung im Python-Orakel und im SPFx-Consumer mit Kandidatensperre und Negativtests
- AP12C-Regressionsfälle bis zum Schaltjahr 2400 sowie zweisprachige Meldungen für sämtliche Generatorfehler
- AP13-Quellenregister mit 21 produktiven, zwei unterstützenden und zwei überwachten amtlichen Quellen für CH und BE
- Append-only-Prüfereignisse mit den Ergebnissen `unchanged`, `changed`, `unclear` und `unavailable`
- Reproduzierbarer Quellenprüfindex mit Auflösung auf Profile, Kalender, Regelkomponenten, Fundstellen und Datenreleases
- Initialer AP13-Prüfnachweis für alle 25 registrierten Quellen und dokumentierter Weiterverfolgung von `OF-001`
- Unabhängiger AP13-Validator mit vollständiger Quellenabdeckung, amtlichen Domains, Folgemassnahmen, Jahrestermin und acht Negativtests
- Betriebsprozess für die periodische Quellenprüfung und generische Release-Checkliste
- Rein clientseitiger Outlook-kompatibler `.ics`-Export für vollständig berechnete Fristabläufe aus Issue #18
- Optionale, nicht persistierte Referenz sowie ganztägiger freier Termin mit Kategorie `Fristablauf` und Erinnerung `-PT112H`
- Kalenderaktion in der bisher freien Resultatkachel rechts unten, zweisprachige Texte und dokumentierte Outlook-Grenzen für Farbe und Zeitumstellung

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
- DEC-2026-013 nach Prüfung des Tenant-Spikes beschlossen und SPFx als gemeinsame Zielarchitektur für SharePoint und Teams festgelegt
- Teams-Mirror als bewusst unkonfiguriert sowie Gastzugriffe als bewusst gesperrt dokumentiert
- Projektstatus nach technischer Umsetzung von AP8 auf Prüfung des Rechenkerns aktualisiert
- AP8 mit dem hostneutralen TypeScript-Rechenkern v0.1 am 29. August 2026 fachlich und technisch abgenommen
- AP12A mit Datenmodell und Referenzvertrag am 31. August 2026 durch David Steimer abgenommen
- AP12B mit hostneutralem Kalendergenerator und Resolverlogik am 31. August 2026 durch David Steimer fachlich-technisch abgenommen
- AP12C technisch umgesetzt, ohne den freigegebenen MVP-0.2-Datenstand, den SharePoint-Mirror oder das SPFx-Paket zu aktivieren
- AP12C mit Format-3-Integration des ewigen Kalenders am 31. August 2026 durch David Steimer fachlich-technisch abgenommen
- AP13 mit Quellenregister, Prüfprotokoll, Index und Betriebsprozess am 31. August 2026 durch David Steimer fachlich-technisch abgenommen, ohne Laufzeit, aktiven Datenrelease, SharePoint-Mirror oder SPFx-Paket zu verändern
- AP12C-Kandidat kontrolliert zum freigegebenen Datenrelease `2026-08-31-mvp-03-approved.1` hochgestuft
- Issue #18 nach funktionaler Prüfung durch David Steimer abgenommen
- Produktversion für Release 2 auf 0.3.0 angehoben

[Unreleased]: https://github.com/davidsteimer/fristenrechner/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/davidsteimer/fristenrechner/releases/tag/v0.3.0
