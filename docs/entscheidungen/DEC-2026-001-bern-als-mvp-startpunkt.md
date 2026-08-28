---
id: DEC-2026-001
titel: "Bern als kantonaler Startpunkt des MVP"
status: beschlossen
entscheidungsdatum: 2026-08-28
klasse: A
entschieden_durch: David Steimer
quelle:
  - "Konzept Fristenrechner Schweiz, Version 1.0"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-001: Bern als kantonaler Startpunkt des MVP

## Ausgangslage

Der Rechner soll später mehrere Kantone abdecken. Für den MVP war zu entscheiden, ob bereits zwei unterschiedlich strukturierte Kantone umgesetzt werden oder ob das erste kantonale Profil auf den primären Einsatzort begrenzt wird.

## Geprüfte Optionen

1. **Mit Kanton Bern beginnen**
   - Vorteil: Der MVP konzentriert Fachrecherche, Kalenderdaten und Tests auf den primären Einsatzort.
   - Nachteil: Die Übertragbarkeit auf anders strukturierte Kantone wird erst nach dem MVP praktisch belegt.
2. **Bereits zwei Kantone umsetzen**
   - Vorteil: Kantonale Unterschiede würden früher sichtbar.
   - Nachteil: Rechtsrecherche, Datenpflege, Übersetzung und Tests würden den MVP deutlich vergrössern.

## Entscheid

Der MVP beginnt mit dem Kanton Bern. Bern ist das erste und vorerst einzige kantonale Profil. Die Bundesprofile StPO, ZPO, BGG und VwVG bleiben Bestandteil des MVP.

## Begründung

Der Rechner wird zunächst primär im Kanton Bern eingesetzt. Die Begrenzung senkt das Risiko unvollständiger kantonaler Spezialregeln und hält den MVP überprüfbar, ohne das langfristige Ziel einer schweizweiten Lösung aufzugeben.

## Folgen

### Auswirkungen

- Die erste kantonale Rechtsmatrix, die Feiertagsdaten und die Golden Cases werden auf Bern ausgerichtet.
- Architektur und Datenmodell müssen weitere Kantone zulassen, auch wenn sie noch nicht ausgeliefert werden.

### Risiken und Grenzen

- Ein zweites kantonales Profil ist kein Abnahmekriterium des MVP.
- Regionale Besonderheiten ausserhalb Berns werden im MVP nicht fachlich zugesichert.

### Folgearbeiten und Rückabwicklung

- Die Erweiterung auf einen weiteren Kanton benötigt ein eigenes Arbeitspaket und bei wesentlicher Scope-Änderung einen neuen Klasse-A-Entscheid.
- Diese DEC kann durch einen neuen Entscheid zum kantonalen Releaseumfang ersetzt werden.

## Nachweise

- [Konzept Version 1.0](../../outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf), Abschnitte 1.1, 2.4 und 10.2 sowie Anhang C
- [Projekt- und Realisierungsplan Version 1.0](../../outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf), initiales Entscheidungsregister und MVP-Abgrenzung
- [Projektübersicht](../../README.md), Abschnitt «MVP-Umfang»
- [Arbeitspaket AP3](https://github.com/davidsteimer/fristenrechner/issues/11)

## Verantwortlichkeit

Entschieden durch David Steimer als Auftraggeber, Product Owner und juristische Fachverantwortung. Der Entscheid ist wegen seiner Wirkung auf den Produktumfang der Klasse A zugeordnet.
