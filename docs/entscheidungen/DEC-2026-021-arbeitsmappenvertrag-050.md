---
id: DEC-2026-021
titel: "Arbeitsmappenvertrag 0.5.0 für Feiertagsregeln"
status: beschlossen
entscheidungsdatum: 2026-09-13
klasse: B
entschieden_durch: David Steimer
quelle:
  - "Ausdrückliche Bestätigung des Arbeitsmappenvertrags 0.5.0 durch David Steimer im Projektchat"
  - "Modellcheck AP18B-03 vom 13. September 2026"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-021: Arbeitsmappenvertrag 0.5.0

## Ausgangslage

Der Modellcheck für VS, FR, SO und GE identifiziert zwei begrenzte Darstellungslücken der Erfassungsmappe 0.4.0: einen Monatswochentag mit Tagesabstand und gesetzlich bestimmte Halbtage. Die bestehende Gebietsstruktur bleibt ausreichend.

## Geprüfte Optionen

1. **Unveränderte Struktur mit Freitextbehelfen.** Wenig Umbau, aber unzureichend prüfbare Datums- und Tagesumfangsangaben.
2. **Begrenzter Vertrag 0.5.0.** Ausdrückliche Darstellung dieser beiden Fälle und gezielte strengere Validierung.
3. **Allgemeine Bedingungssprache und Stundenrechner.** Grösserer Aufwand ohne Erfordernis für den beauftragten Batch.

## Entscheid

David Steimer bestätigt Option 2 mit folgenden Grenzen:

- Neuer Rechentyp `nthWeekdayOffsetDays` mit Monat, ISO-Wochentag, Vorkommen und ganzzahligem Tagesabstand. Der Abstand ist auf −366 bis +366 Kalendertage begrenzt.
- Die bestehende Spalte `Osterversatz` heisst neu `Tagesabstand`. Alte Berechnungstypen werden nicht still umgedeutet.
- Neuer ausdrücklicher Tagesumfang `fullDay` oder `afternoonFromNoon`, lesbar als «Ganztägig» beziehungsweise «Ab 12.00 Uhr». Keine automatische Aussage über Fristwirkung.
- Neue Vertragsdaten weisen unbekannte und sachfremde Parameter ab.
- Abweichende Quellen-IDs für Norm und räumlichen Anwendungsbeleg sind nur mit einem geprüften, nachvollziehbaren Zusammenhang zulässig.
- Die Version der tatsächlichen Arbeitsmappe wird ausdrücklich ausgewiesen und gegen die Tabellenüberschriften geprüft.
- Reihenfolge verbindlich: zuerst Struktur, Migration und Tests, danach Erfassung VS, FR, SO und GE.

## Begründung

Der Vertrag macht die erforderlichen Unterschiede strukturiert prüfbar. Bestehende Gebietsebenen und vier zusammenhängende Sprachspalten bleiben erhalten. Es braucht weder zusätzliche Blätter noch einen allgemeinen Bedingungs- oder Stundenrechner.

## Folgen

### Auswirkungen

Die neue Arbeitskopie wird aus der unveränderten V0.8 erstellt. Bisherige Regeln erhalten den Tagesumfang nur nach Prüfung des tatsächlichen Bestands. Neue Angaben benötigen einen ausdrücklichen Wert.

### Risiken und Grenzen

Die Bestätigung ist keine Fachabnahme neuer Kantonsregeln, keine Festlegung einer ganztägigen Solothurner Fristwirkung und kein neuer Produktformatvertrag. Die Genfer Sonntagsfolgetagsregel wird nicht als allgemeine Fristenautomatik implementiert. Eigenständiges kommunales Recht bleibt ausgeschlossen.

### Folgearbeiten und Rückabwicklung

Struktur und Tests werden vor der Kantonerfassung abgeschlossen. Die bisherige V0.8 bleibt unverändert. Produktdaten, Kalenderkomponente 2.0.0, Manifest, Spezialregimekatalog, Mirror sowie E-, Q- und P-Umgebung werden nicht verändert. Ein späterer Import und Export benötigen AP18C. Eine Ablösung dieses Entscheids erfolgt mit neuer DEC-ID und gegenseitigen Verweisen.

## Nachweise

- [Modellcheck AP18B-03](../architektur/modellcheck-ap18b-03.md)
- [Umsetzung und Erfassung AP18B-03](../architektur/erfassung-ap18b-03.md)
- [AP18-Arbeitspaket](../architektur/feiertagsmatrix-ap18a.md)
- [Issue #36](https://github.com/davidsteimer/fristenrechner/issues/36)

## Verantwortlichkeit

Entschieden durch David Steimer. Codex ist Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

## Ergänzender Nachtrag vom 22. September 2026

David Steimer hat mit [DEC-2026-022](DEC-2026-022-bedingte-feiertagsregeln.md) die begrenzten Kalenderbedingungen des Arbeitsmappenvertrags `0.6.0` beschlossen und die zugehörige [Arbeitsmappe V0.12 abgenommen](../fachrecht/abnahme-ap18b-05.md). Der Nachtrag ergänzt diesen Entscheid, ohne seinen bisherigen Inhalt oder seine historischen Prüfgegenstände umzuschreiben. DEC-2026-021 bleibt beschlossen und wird nicht als vollständig ersetzt gekennzeichnet. Ein neuer Produktformatvertrag ist damit nicht beschlossen.
