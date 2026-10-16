# Entscheidungsregister

**Aktuell, 15. Oktober 2026:** [AP23D2 samt UX-Nachtrag ist abgenommen](../fachrecht/abnahme-ap23d2.md), [AP23D3 ist ausdrücklich gestartet](../architektur/verwaltungsintegration-ap23d3.md). Der bestehende Beschluss DEC-2026-032 wird umgesetzt und nicht geändert. Kein neuer Architekturentscheid, keine Quellenrelease- oder Bereitstellungsfreigabe. Die nachfolgenden datierten Absätze bleiben historische Entscheidungsstände.

**UX-Nachtrag AP23D2, 15. Oktober 2026:** Der ausdrücklich freigegebene [UX-Nachtrag](../architektur/verwaltungsintegration-ap23d2-ux.md) ist lokal umgesetzt. Beschlossen sind unveränderte fachliche Rechenregeln und der bestehende zweispaltige Aufbau. UI-Abnahme offen. AP23D3 folgt erst nach dieser Abnahme. DEC-2026-032 und die bisherigen Nachweise bleiben unverändert.

**15. Oktober 2026:** [AP23D1 ist abgenommen](../fachrecht/abnahme-ap23d1.md). Die ausdrücklich beauftragte [AP23D2-Umsetzung](../architektur/verwaltungsintegration-ap23d2.md) liegt lokal zur Teilpaketabnahme vor. DEC-2026-032 bleibt unverändert. AP23D3, Quellenrelease und operative Bereitstellung sind nicht freigegeben. Die datierten älteren Einträge bleiben historische Entscheidungsstände.

Dieses Verzeichnis ist der dauerhafte Nachweis für materielle und architektonische Projektentscheide. Die freigegebenen Word- und PDF-Grundlagen bleiben unverändert. Die DEC-Dateien machen deren Entscheide einzeln auffindbar, vergleichbar und ablösbar.

## Verbindlichkeit und Pflege

- Die DEC-ID bleibt dauerhaft stabil.
- Zulässige Status sind `vorgeschlagen`, `beschlossen`, `verworfen` und `ersetzt`.
- Ein beschlossener Entscheid wird nicht inhaltlich überschrieben oder gelöscht.
- Eine Änderung erhält eine neue DEC-ID. Der frühere und der neue Datensatz verweisen gegenseitig aufeinander.
- Die Felder `ersetzt` und `ersetzt_durch` bilden die Entscheidungskette ab.
- Materielle Entscheide der Klasse A und architektonische Entscheide der Klasse B benötigen einen dokumentierten Entscheid von David Steimer.
- Reversible Detailentscheide der Klasse C können im Issue oder Commit dokumentiert werden, sofern sie keinen bestehenden DEC verändern.
- Die [Vorlage](DEC-TEMPLATE.md) ist für neue DEC-Dateien zu verwenden.

Die Klassen wurden bei der Übernahme des Startbestands anhand der im Projekt- und Realisierungsplan festgelegten Entscheidungsklassen zugeordnet. Diese Zuordnung verändert den bereits beschlossenen Inhalt nicht.

## Startbestand

| ID | Klasse | Status | Kurzentscheid | Ersetzt durch |
| --- | --- | --- | --- | --- |
| [DEC-2026-001](DEC-2026-001-bern-als-mvp-startpunkt.md) | A | beschlossen | Bern ist das erste und einzige kantonale Profil im MVP | – |
| [DEC-2026-002](DEC-2026-002-personalunion-der-menschlichen-rollen.md) | A | beschlossen | David Steimer nimmt derzeit alle menschlichen Rollen wahr | – |
| [DEC-2026-003](DEC-2026-003-github-feed-und-sharepoint-mirror.md) | B | beschlossen | GitHub-Feed im Pilot, später SharePoint-Mirror | – |
| [DEC-2026-004](DEC-2026-004-defaults-lokal-im-browser.md) | A | beschlossen | Persönliche Defaults bleiben im ersten Release lokal im Browser | – |
| [DEC-2026-005](DEC-2026-005-agpl-3-0-fuer-programmcode.md) | A | beschlossen | Programmcode steht unter AGPL-3.0 | – |
| [DEC-2026-006](DEC-2026-006-produktsprachen-deutsch-und-franzoesisch.md) | A | beschlossen | Release 1.0 wird auf Deutsch und Französisch bereitgestellt | – |
| [DEC-2026-007](DEC-2026-007-hybride-dokumentation-und-github-steuerung.md) | A | beschlossen | Stabile Grundlagen in Word und PDF, operative Steuerung in GitHub | – |
| [DEC-2026-008](DEC-2026-008-wip-limit-und-paketgroesse.md) | A | beschlossen | WIP-Limit 1 und höchstens fünf Nettoarbeitstage je Arbeitspaket | – |
| [DEC-2026-009](DEC-2026-009-aufwandband-mit-obergrenze.md) | A | beschlossen | 14 bis höchstens 19 Nettoarbeitswochen, 19 als Obergrenze | – |
| [DEC-2026-010](DEC-2026-010-projekt-und-produktsprachen.md) | A | beschlossen | Interne Projektführung Deutsch, Produkttexte Deutsch und Französisch | – |
| [DEC-2026-011](DEC-2026-011-codex-ohne-formelle-verantwortung.md) | A | beschlossen | Codex ist dokumentiertes Arbeitsinstrument ohne formelle Verantwortung | – |

## Laufende Ergänzungen

**14. Oktober 2026:** [AP23B ist mit Ergänzung abgenommen](../fachrecht/abnahme-ap23b.md). [DEC-2026-031](DEC-2026-031-behoerdensitz-kantonale-verwaltungsverfahren.md), Klasse A, dokumentiert die beschlossene allgemeine Behördenanknüpfung im kantonalen Verwaltungsrecht mit Vorrang von Bundes-/Spezialrecht und ausdrücklich abweichenden Verfahrensnormen. Anschliessend sind [AP23C abgenommen](../fachrecht/abnahme-ap23c.md) und [DEC-2026-032](DEC-2026-032-beschluss.md), Klasse B, ausdrücklich bestätigt worden. Die unveränderte Vertragsvorlage bleibt historisch erhalten. Die beauftragte [AP23D1-Kernintegration](../architektur/verwaltungsintegration-ap23d1.md) liegt lokal zur technischen Teilpaketabnahme vor. Keine operative Erweiterung von MVP 0.7.

**AP22B und AP22C1, 8. Oktober 2026:** David Steimer hat den Daten- und Migrationsplan einschliesslich sämtlicher acht Eckpunkte ausdrücklich bestätigt. [AP22B ist abgenommen](../fachrecht/abnahme-ap22b.md) und [DEC-2026-030 beschlossen](DEC-2026-030-beschluss.md). Katalog 2.0.0, Kalender 3.0.0, Manifest/Mindestconsumer 7.0.0, konkrete Zeitabdeckung und Migration sind bestätigt. Der prüfsummengebundene Entwurf bleibt unverändert. Der anschliessende ausdrückliche Startauftrag führt zur [lokalen AP22C1-Umsetzung](../architektur/kalenderintegration-ap22c1.md), die technisch geprüft und zur Teilpaketabnahme bereit ist. Kein neuer Vertragsentscheid, keine Produktaktivierung. AP22C2 ist noch nicht gestartet.

**8. Oktober 2026:** [DEC-2026-029](DEC-2026-029-begrenzte-behandlung-zweiter-januar.md), Klasse A, bestätigt die ergebnisabhängig begrenzte Behandlung des 2. Januar für SH/StPO und SG/StPO, SG/BGG, SG/VwVG. [AP22A ist damit abgeschlossen](../fachrecht/abschluss-ap22a.md). Die übrige Fachfreigabe nach DEC-2026-028 bleibt unverändert. AP22B folgt als gesonderter Vertragsauftrag. Keine Produktaktivierung oder Veröffentlichung. Der nachstehende Eintrag vom 2. Oktober dokumentiert den damaligen Zwischenstand.

**2. Oktober 2026:** [DEC-2026-027](DEC-2026-027-schrittweiser-schweizausbau.md), Klasse A, bestätigt den schrittweisen Releaseumfang. Der anschliessende [DEC-2026-028](DEC-2026-028-operative-freigabe-kalenderzuordnungen.md), ebenfalls Klasse A, dokumentiert die ausdrückliche fachliche Freigabe der offenen Kalenderzuordnungen zur operativen Verwendung, einschliesslich GR-Abgrenzung und SO-Ergänzung. Für 73 bisherige Prüfaufträge bleiben konkrete Wirkungsdefinitionen auszuarbeiten. [AP22A](../architektur/kalenderaktivierung-ap22a.md) ist noch nicht insgesamt abgeschlossen. Keine neue Format-, Installations- oder Publikationsfreigabe. Zusätzliche Sozialanbindungen und IT/Rumantsch Grischun bleiben gesonderten Prüfungen vorbehalten.

| ID | Klasse | Status | Kurzentscheid | Ersetzt durch |
| --- | --- | --- | --- | --- |
| [DEC-2026-012](DEC-2026-012-providerneutrales-datenrelease-format.md) | B | beschlossen | Strikte JSON-Schemata und manifestbasierte, providerneutrale Datenreleases | – |
| [DEC-2026-013](DEC-2026-013-spfx-zielarchitektur.md) | B | beschlossen | Gemeinsames SPFx-WebPart für SharePoint und Teams, gestützt auf den erfolgreichen Tenant-Spike | – |
| [DEC-2026-014](DEC-2026-014-komponentenweise-fachdatenformatevolution.md) | B | beschlossen | Komponentenmodell, getrennte Terminherkunft und neue Format-Hauptversion für Spezialregime | – |
| [DEC-2026-015](DEC-2026-015-regelbasierte-kalenderkomponente.md) | B | beschlossen | Regelbasierte Kalenderkomponente 2.0 mit Manifest-Hauptformat 3 als sichere Consumergrenze | – |
| [DEC-2026-016](DEC-2026-016-gruppenbasierter-q-demobetrieb.md) | B | beschlossen | Gruppenbasierter Q-Demobetrieb über die Microsoft-365-Gruppe des privaten Q-Teams | – |
| [DEC-2026-017](DEC-2026-017-statische-p-auspraegung-steimer-ch.md) | B | beschlossen | Statische öffentliche P-Ausprägung auf der bestehenden steimer.ch-Hosting-Infrastruktur | – |
| [DEC-2026-018](DEC-2026-018-freigabe-oeffentlicher-p-betrieb.md) | A | beschlossen | Öffentlicher P-Betrieb des Berner Fristenrechners auf steimer.ch freigegeben | – |
| [DEC-2026-019](DEC-2026-019-gestufte-vrpg-bedienung.md) | A | beschlossen | Gestufte VRPG-Bedienung mit vier Bereichen und zweispaltigem Raster, getrennt von Fach- und Releasefreigaben | – |
| [DEC-2026-020](DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) | B | beschlossen | Spezialregimekatalog 3.0.0 als technischer Produktvertrag bestätigt, Datenpromotion und Bereitstellung separat | – |
| [DEC-2026-023](DEC-2026-023-schweizweiter-feiertagskatalog.md) | B | beschlossen | Eigener Feiertagskatalog 1.0.0 mit Manifest-/Consumerformat 4.0.0 und begrenzter CH-/BE-Projektion. Lokale Umsetzung beauftragt, keine Release- oder Betriebsfreigabe | David Steimer |
| [DEC-2026-024](DEC-2026-024-nationales-sozialversicherungsmodell.md) | B | beschlossen | Weitere Sozialversicherungsregeln national modellieren. Kantonale Anbindung und zunächst bernische Produktfreigabe getrennt führen. Noch kein neuer Formatvertrag oder freigegebener Berechnungspfad | – |
| [DEC-2026-025](DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md) | B | beschlossen | Eigenständiger Sozialverfahrenskatalog 1.0.0 mit Manifest-/Consumerformat 5.0.0 und expliziter Migration. AP19B einschliesslich AVIV-Option B und statischer UI-Folge abgenommen, keine Laufzeitfreigabe | – |
| [DEC-2026-026](DEC-2026-026-beschluss.md) | B | beschlossen | AP20-Nachtrag mit Sozialverfahrenskatalog 2.0.0 und Manifest-/Mindestconsumer 6.0.0. 20 neue Bundesregeln, 22 Berner Anbindungen. Gebundener Entwurf bleibt erhalten, keine Produktaktivierung | – |
| [DEC-2026-027](DEC-2026-027-schrittweiser-schweizausbau.md) | A | beschlossen | Schrittweiser Schweiz-Ausbau. Zuerst Kalenderaktivierung für geprüfte Bundesprofile und AP21, kantonale Verwaltungsverfahren als Folgetranchen | – |
| [DEC-2026-028](DEC-2026-028-operative-freigabe-kalenderzuordnungen.md) | A | beschlossen | Offene Kalenderzuordnungen fachlich zur operativen Verwendung freigegeben. GR bewusst begrenzt, SO-Prozessliste eingeschlossen, konkrete Wirkungsdefinitionen und technische Aktivierung getrennt | – |
| [DEC-2026-029](DEC-2026-029-begrenzte-behandlung-zweiter-januar.md) | A | beschlossen | Vier Jan.-2-Verbindungen bleiben verwendbar, bei Ergebnisunterschied Einzelfallklärung statt definitivem automatischem Fristresultat. AP22A abgeschlossen, Umsetzung separat | – |
| [DEC-2026-030](DEC-2026-030-beschluss.md) | B | beschlossen | Katalog 2, Kalender 3 und Manifest/Consumer 7 mit expliziten Verfahrensbindungen, Januarvergleich, Zeitabdeckung und kontrollierter Migration. Gebundener Entwurf bleibt erhalten | – |
| [DEC-2026-031](DEC-2026-031-behoerdensitz-kantonale-verwaltungsverfahren.md) | A | beschlossen | Feiertagsanknüpfung im kantonalen Verwaltungsrecht am zuständigen Behördensitz, besondere Bundesregeln und ausdrückliche Verfahrensabweichungen vorbehalten. Keine pauschale Kantonsfreigabe | – |
| [DEC-2026-032](DEC-2026-032-beschluss.md) | B | beschlossen | Kantonalverfahrenskatalog 1, Manifest/Mindestconsumer 8 und geschützte Defaults 5 für die zwölf TI-/GR-Pfadgruppen. Bestandskomponenten erhalten, operative Freigabe getrennt | David Steimer, 14.10.2026 |

## Abnahme AP20B und Beschluss DEC-2026-026

David Steimer hat am 30. September 2026 zunächst AP20B abgenommen und anschliessend DEC-2026-026 mit Sozialverfahrenskatalog 2.0.0 sowie Manifest und Mindestconsumer 6.0.0 ausdrücklich bestätigt. Die [Abnahmenotiz](../fachrecht/abnahme-ap20b.md) und der neue [Beschlussnachweis](DEC-2026-026-beschluss.md) halten diese Reihenfolge fest. Der [ursprüngliche Entwurf](DEC-2026-026-sozialverfahrenskatalog-v2.md) und die geprüften AP20B-Dateien bleiben unverändert. Der aktuelle Status ist **beschlossen**. Zum Zeitpunkt dieses Beschlusses war AP20C noch nicht gestartet. Der anschliessende ausdrückliche Startauftrag «Starte AP20C1» führt zur [lokalen Umsetzung](../architektur/implementierung-ap20c1.md), die David Steimer am 1. Oktober 2026 [fachlich-technisch abgenommen hat](../fachrecht/abnahme-ap20c1.md). Der Integrationsbericht bleibt als gebundener ursprünglicher Prüfstand unverändert. Der anschliessende gesonderte Auftrag für [AP20C2](../architektur/implementierung-ap20c2.md) ist lokal umgesetzt, technisch geprüft und am 1. Oktober 2026 durch David Steimer [fachlich-technisch abgenommen](../fachrecht/abnahme-ap20c2.md). Der beschlossene Formatvertrag bleibt unverändert. [AP20C3](../architektur/implementierung-ap20c3.md) wurde danach gesondert beauftragt und ist mit MVG/ÜLG lokal umgesetzt und technisch geprüft. Die [menschliche AP20C3-Abnahme](../fachrecht/abnahme-ap20c3.md) ist am 1. Oktober 2026 bestätigt. Die [lokale Releasevorbereitung MVP 0.6](../betrieb/deployment-mvp-06.md) ist gestartet, ohne Quellenreleasefreigabe oder operative Aktivierung. Kein zusätzlicher Formatentscheid erforderlich. Keine Produktaktivierung, Veröffentlichung oder Bereitstellung.

## Quellen des Startbestands

- [Konzept Fristenrechner Schweiz, Version 1.0](../../outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf)
- [Projekt- und Realisierungsplan, Version 1.0](../../outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf)
- [Arbeitspaket AP3](https://github.com/davidsteimer/fristenrechner/issues/11)

## Arbeitsmappenvertrag AP18

[DEC-2026-021: Arbeitsmappenvertrag 0.5.0](DEC-2026-021-arbeitsmappenvertrag-050.md), Klasse B, am 13. September 2026 durch David Steimer beschlossen. Begrenzte Strukturergänzungen vor der Erfassung VS/FR/SO/GE, keine neue Produkt- oder Fachfreigabe.

[DEC-2026-022: Begrenzte Kalenderbedingungen 0.6.0](DEC-2026-022-bedingte-feiertagsregeln.md), Klasse B, am 22. September 2026 durch David Steimer beschlossen. Bestätigt den technischen Vertragsnachtrag zur abgenommenen V0.12. Ergänzt DEC-2026-021, ohne diesen vollständig abzulösen. Keine neue Produktformat- oder Runtime-Freigabe.

## Fachabnahme AP18B-03

[Abnahme der gesamten Arbeitsmappe V0.9 und SO-Halbtagsfestlegung](../fachrecht/abnahme-ap18b-03.md), am 13. September 2026 durch David Steimer erklärt. Der Solothurner Halbtag hat keinen Einfluss auf den Fristenlauf. Die unveränderte Datei ist per SHA-256 gebunden. Kein neuer Struktur- oder Produktformatvertrag, keine produktive Aktivierung.

## Abnahme AP18B-05 und Beginn AP18C1

[Abnahme der gesamten Arbeitsmappe V0.12 und des Vertragsnachtrags 0.6.0](../fachrecht/abnahme-ap18b-05.md), am 22. September 2026 durch David Steimer erklärt. Die konkrete XLSX-Datei ist per SHA-256 gebunden. Die historischen Arbeitsstatus bleiben unverändert, der SO-Halbtagsentscheid und der zusätzliche NE-Vorbehalt gelten fort. AP18C1 beginnt mit dem kontrollierten, headerbasierten Import und einem eigenständigen, verlustfreien Fachkandidaten. AP18C ist nicht abgeschlossen. Keine Datenpromotion, Veröffentlichung oder Betriebsfreigabe.

Technischer Arbeitsnachweis: [AP18C1 Kontrollierter Arbeitsmappenimport](../architektur/import-ap18c.md).

## Archivbestätigung und Fortsetzung AP18C

David Steimer hat am 22. September 2026 die [Archivbestätigung und künftige Trennung der Arbeitskopie](../fachrecht/archivbestaetigung-ap18.md) bestätigt. Die vorhandene V0.9 wird mit ihrer heutigen Prüfsumme und dem ursprünglichen abweichenden Hash aufbewahrt. V0.10 ist als ebenfalls abweichender historischer Bestand mit eigenem Befund gesichert. Die ursprünglichen Byteidentitäten werden nicht als wiederhergestellt erklärt. AP18C verwendet nur die byteidentische, abgenommene V0.12-Referenz.

## Beschluss und lokale Umsetzung DEC-2026-023

David Steimer hat am 22. September 2026 dem vorgeschlagenen Produktvertrag ausdrücklich zugestimmt und die Umsetzung beauftragt. Der [Integrationsnachweis](../architektur/feiertagskatalog-ap18c.md) dokumentiert den lokal implementierten Katalog und die geprüften Consumer. Die Zustimmung ist der Architekturentscheid, nicht die vorweggenommene menschliche Abnahme der danach erstellten Implementierung. Releasepromotion, Veröffentlichung und Bereitstellung bleiben gesonderten Schritten vorbehalten.

## Abnahme AP18C und Start MVP 0.4

David Steimer hat anschliessend am 22. September 2026 erklärt: «AP18C ist abgenommen. Starten wir den Release.» Die [Abnahmenotiz](../fachrecht/abnahme-ap18c.md) bindet diesen Entscheid an den vorgelegten Kandidaten. Damit ist die lokale Implementierung abgenommen und die Releasevorbereitung als MVP 0.4 beauftragt. Der [Releaseplan](../betrieb/deployment-mvp-04.md) führt Quellenabgleich, Promotion, Builds und die noch offenen konkreten Publikations- und Bereitstellungsfreigaben. Es ist keine weitere Änderung des beschlossenen Datenvertrags.

## Abnahme der Quellenprüfung MVP 0.4

David Steimer hat am 22. September 2026 die vollständige Quellenprüfung für MVP 0.4 abgenommen und die bereits beschlossene Behandlung des AI-Quellenkonflikts ausdrücklich unverändert bestätigt. Die [Abnahmenotiz](../fachrecht/abnahme-quellenpruefung-mvp04.md) und der maschinenlesbare Nachweis binden den Entscheid an die vorgelegten 120 unterschiedlichen Quellen-IDs. Dies ist eine fachliche Freigabe, keine neue Architekturentscheidung. Es wird daher keine neue DEC-Nummer vergeben. Publikation, Installation und Betrieb bleiben gesondert freizugeben.

## AP19: nationale Modelle, begrenzte Erstfreigabe

David Steimer hat die nationale Wiederverwendbarkeit der weiteren Sozialversicherungsmodelle bei zunächst bernischer Freigabe ausdrücklich bestätigt und am 25. September 2026 den Start beauftragt. [DEC-2026-024](DEC-2026-024-nationales-sozialversicherungsmodell.md) dokumentiert diesen begrenzten Architekturgrundsatz. [AP19A](../fachrecht/sozialversicherungsrecht-ap19.md) legt Fachinventar, Quellenpakete und eine nicht produktive Strukturprobe zur Prüfung vor. Die danach entstandenen Fachregeln, konkreten Formate und Implementierungen sind dadurch nicht vorweg abgenommen.

Stand des Registers: 28. September 2026

David Steimer hat anschliessend ausdrücklich erlaubt, sein «OK, passt» als Abnahme von AP19A-Umfang und Modellstruktur zu verstehen und AP19B zu beginnen. Die [gebundene Abnahmenotiz](../fachrecht/abnahme-ap19a.md) dokumentiert diesen Schritt. Die konkreten neuen Formate wurden daraufhin mit DEC-2026-025 vorgeschlagen und waren nicht durch die AP19A-Abnahme mitbeschlossen.

Mit «OK. Inklusive Option B für AVIG abgenommen.» hat David Steimer anschliessend die vollständige AP19B-Vorlage bestätigt. [DEC-2026-025](DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md) ist damit beschlossen. Die [AP19B-Abnahmenotiz](../fachrecht/abnahme-ap19b.md) bindet die unveränderten Vorlagen und hält die AVIV-Nachweismethode sowie die statische Feldbeschriftung fest. Zum Zeitpunkt dieser AP19B-Abnahme war AP19C noch nicht gestartet. Keine neue Laufzeit-, Release- oder Betriebsfreigabe.

## Abnahme AP19C1 einschliesslich Bediennachträgen

Nach dem ausdrücklichen Startauftrag für AP19C hat David Steimer am 28. September 2026 den tatsächlich vorgelegten C1-Stand einschliesslich Formularvereinfachung und Datumseingabe-Nachtrag [fachlich-technisch abgenommen](../fachrecht/abnahme-ap19c1.md). Technische Grundlage, zwölf migrierte Sozialpfade und vier ELG-Pfade sind damit als lokaler Kandidat abgenommen. Zum Zeitpunkt dieser C1-Abnahme waren C2 für AVIG und C3 für KVG noch nicht gestartet. Die Abnahme ändert weder den Produktvertrag noch die Kandidatenflags und erteilt keine Publikations-, Installations- oder Betriebsfreigabe. Keine neue DEC-Nummer.

## Abnahme AP19C2 und Beibehaltung der Datumseingabe

Nach gesondertem Start hat David Steimer am 28. September 2026 [AP19C2 fachlich-technisch abgenommen](../fachrecht/abnahme-ap19c2.md). Vier nationale AVIG-ALE-Regeln und acht Berner Kassen-/Amtsstellenanbindungen sind damit als lokaler Kandidat abgenommen. Das zusätzliche Zuständigkeitsdatum bleibt vorerst unverändert. Die diskutierte Vereinfachung wird erst nach allfälligem Benutzerfeedback erneut beurteilt, nicht bereits umgesetzt oder terminiert. Keine Änderung des Produktvertrags und keine neue DEC-Nummer. Kandidatenflags bleiben unverändert, keine operative Freigabe.

## Start AP19C3

David Steimer hat am 28. September 2026 mit «Danke, dann starten wir mit AP19C3.» die [begrenzte KVG-/OKP-Integration](../architektur/implementierung-ap19c3.md) beauftragt. Der abgenommene AP19B-Vertrag bleibt unverändert. Der Wohnsitz im Verwaltungsstadium wird für die Produktgrenze auf den fristauslösenden Zustelltag bezogen, nicht als gesetzliche Zuständigkeitsnorm ausgegeben. Kein zusätzlicher Beschluss zur Formatänderung, keine vorweggenommene Kandidatenabnahme oder operative Freigabe.

## Abnahme AP19C3 und Abschluss der ersten Integrationstranche

Mit «AP19C3 ist abgenommen.» hat David Steimer am 28. September 2026 den vorgelegten KVG-/OKP-Stand [fachlich-technisch abgenommen](../fachrecht/abnahme-ap19c3.md). Zusammen mit C1 und C2 ist damit die erste AP19-Integrationstranche für ELG, AVIG und KVG abgeschlossen. Der zusammengehörige Kandidat umfasst 24 nationale Bundesregeln und 28 Berner Anbindungen. Die abgenommenen Fach-, Bedien- und Formatgrenzen bleiben unverändert. Keine neue DEC-Nummer, keine Datenpromotion oder operative Freigabe. Die Releasevorbereitung wird durch diese Abnahme nicht automatisch gestartet. Historische Implementierungs-, Quellen-, Build- und Prüfunterlagen bleiben unverändert, der aktuelle Abnahmestatus steht in der gebundenen Abnahmenotiz.
