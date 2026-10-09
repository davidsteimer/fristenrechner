---
id: DEC-2026-027
titel: "Schrittweiser schweizweiter Ausbau nach MVP 0.6"
status: beschlossen
entscheidungsdatum: 2026-10-02
klasse: A
entschieden_durch: David Steimer
quelle:
  - "Zustimmung zum vorgeschlagenen Releaseumfang und Startauftrag im Projektgespräch vom 2. Oktober 2026"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-027 Schrittweiser schweizweiter Ausbau nach MVP 0.6

## Ausgangslage

MVP 0.6 ist veröffentlicht. Der Feiertagskatalog für die Schweiz ist vorhanden, operativ werden jedoch weiterhin nur die freigegebenen CH-/BE-Kalender verwendet. Die Sozialversicherungsregeln sind national modelliert und bislang ausschliesslich über konkret geprüfte Berner Anbindungen freigegeben. Gleichzeitig ist die gemeinsame Datumseingabe als AP21 im Backlog erfasst.

## Geprüfte Optionen

1. **Ein gemeinsamer grosser Release** mit Kalenderaktivierung, allen weiteren kantonalen Verwaltungsverfahren, vier Produktsprachen und Datums-UX. Breite Abdeckung, aber der unmittelbare Nutzen würde vom letzten kantonalen oder sprachlichen Teilpaket abhängen.
2. **Schrittweise nutzbare Releases** mit zuerst schweizweiter Feiertagsnutzung für geprüfte Bundesverfahren und Datums-UX, danach kantonalen Verwaltungsverfahren in Tranchen. Zusätzliche Sozialanbindungen und Sprachen können bei abgeschlossener Prüfung früher hinzukommen.

## Entscheid

David Steimer hat den Vorschlag zu Option 2 bestätigt:

> Sehr gut, der Releaseumfang ist sinnvoll. Lass uns das so angehen.

Damit gilt für den nächsten Release nach MVP 0.6:

- Pflichtumfang sind die schweizweite Feiertagsnutzung für die konkret geprüften, bereits unterstützten Bundesverfahren sowie AP21 mit einheitlicher linksbündiger Datumseingabe, iOS-Korrektur und Eingabekürzeln.
- Zusätzliche Sozialversicherungs-Anbindungen aus #35 werden positiv abgegrenzt aufgenommen, sofern Fachprüfung und Integration abgeschlossen sind. Der übrige Restumfang von #35 wird nicht pauschal mitbeauftragt.
- Die vollständige Aufnahme aller kantonalen Verwaltungsverfahren ist keine Freigabehürde dieses Releases. Sie folgt nach einer Bestandsaufnahme in fachlich sinnvollen Tranchen.
- Italienisch und Rumantsch Grischun werden im weiteren Ausbau früh mitgeführt. Eine frühere Aufnahme ist möglich, aber keine zwingende Voraussetzung des ersten schweizweiten Releases. DE/FR bleiben bis zur ausdrücklichen Sprachenfreigabe die Produktsprachen.
- Kalender-App, Feiertagskarte und spielerische Anwendungen bleiben eigenständige spätere Vorhaben.

## Begründung

Der vorhandene Feiertagsbestand soll möglichst früh nutzbar werden. Die gemeinsame Bundesregel wird wiederverwendet, während örtliche Zuordnung, kantonale Anbindung und operative Freigabe eigenständig bleiben. So hängt eine begrenzte, geprüfte Erweiterung nicht von der vollständigen Erfassung aller kantonalen Spezialitäten ab.

## Folgen

### Auswirkungen

- Die [Releaseplanung](../planung/release-mvp07.md) führt den nächsten Release unter der Planungsbezeichnung MVP 0.7. Noch keine Versionsänderung an Anwendung, Paket, Manifest oder Datenkomponenten.
- AP22A beginnt mit Bestandsaufnahme, Verfahrensmatrix und Modellcheck. AP21 bleibt ein nachfolgendes eigenes Arbeitspaket. WIP-Limit 1 und die Obergrenze von fünf Nettoarbeitstagen gelten unverändert.
- Behördenort, Feiertagsanknüpfung und Verfügbarkeit eines allgemeinen kantonalen Verwaltungsprofils werden im Modellcheck getrennt behandelt.

### Risiken und Grenzen

- Ziel ist die schweizweite Verfügbarkeit der unterstützten Verfahrenskonstellationen, nicht die Abdeckung sämtlicher bundesrechtlicher oder kantonaler Fristen.
- Die bisherigen Fristarten, Zustellungs-, Zeit- und Spezialregimegrenzen bleiben bestehen, bis ein konkreter Folgeentscheid sie erweitert.
- Bundesrecht und kantonales Recht bleiben die fachliche Grundlage. Örtliche Unterschiede werden berücksichtigt, soweit sie daraus folgen. Eigenständige kommunale Erlasse bleiben ausgeschlossen.
- Die bestehenden AI-, SO-, GR- und NE-Festlegungen werden nicht durch einen allgemeinen Aktivierungsbeschluss aufgehoben.
- Der Startauftrag ist keine Abnahme der erst danach erstellten Fachmatrix oder eines neuen technischen Formatvertrags. Er erlaubt keine Datenpromotion oder Änderungen an E/Q/P, Mirrors, Hosting oder Berechtigungen.

### Folgearbeiten und Rückabwicklung

- AP22A erstellt die fachliche Aktivierungsmatrix und legt den technischen Änderungsbedarf zur Prüfung vor. Konkrete neue Formatversionen benötigen einen eigenen gebundenen Architekturentscheid.
- Danach folgen Referenz- und Vertragsarbeit, Integration und AP21 in nacheinander ausführbaren Paketen. Quellenabnahme, Releasebau und konkrete Bereitstellungsfreigaben bleiben getrennte Schritte.
- Dieser Entscheid ergänzt die bisherige MVP- und Bern-Erstplanung. Die historischen Erstfreigaben und Verträge werden nicht rückwirkend ersetzt oder erweitert. Bis zu einer neuen operativen Freigabe bleibt MVP 0.6 massgebend.

## Nachweise

- [Releaseumfang und Reihenfolge](../planung/release-mvp07.md)
- [AP22A Startbefund und Arbeitsauftrag](../architektur/kalenderaktivierung-ap22a.md)
- [AP22A in GitHub](https://github.com/davidsteimer/fristenrechner/issues/46)
- [AP21 Datumseingabe](https://github.com/davidsteimer/fristenrechner/issues/45)
- [DEC-2026-023 Feiertagskatalog](DEC-2026-023-schweizweiter-feiertagskatalog.md)
- [DEC-2026-024 Nationales Sozialversicherungsmodell](DEC-2026-024-nationales-sozialversicherungsmodell.md)
- [Produktionsnachweis MVP 0.6](../betrieb/produktionsbereitstellung-mvp06-2026-10-01.md)

## Verantwortlichkeit

David Steimer trifft Umfangs-, Fach- und Freigabeentscheide in Personalunion. Codex bereitet die Grundlagen und technischen Nachweise vor, ohne formelle Freigabe- oder Haftungsverantwortung.
