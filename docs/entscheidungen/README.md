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

## Quellen des Startbestands

- [Konzept Fristenrechner Schweiz, Version 1.0](../../outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf)
- [Projekt- und Realisierungsplan, Version 1.0](../../outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf)
- [Arbeitspaket AP3](https://github.com/davidsteimer/fristenrechner/issues/11)

Stand des Registers: 30. August 2026
