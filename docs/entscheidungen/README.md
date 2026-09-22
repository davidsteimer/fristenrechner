# Entscheidungsregister

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

Stand des Registers: 22. September 2026
