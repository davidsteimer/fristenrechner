---
id: DEC-2026-006
titel: "Deutsch und Französisch als Produktsprachen von Release 1.0"
status: beschlossen
entscheidungsdatum: 2026-08-28
klasse: A
entschieden_durch: David Steimer
quelle:
  - "Konzept Fristenrechner Schweiz, Version 1.0"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-006: Deutsch und Französisch als Produktsprachen von Release 1.0

## Ausgangslage

Für Release 1.0 war festzulegen, welche Sprachen vollständig unterstützt werden. Der MVP konzentriert sich auf Bern, soll aber eine erweiterbare Lokalisierungsstruktur erhalten.

## Geprüfte Optionen

1. **Deutsch und Französisch vollständig unterstützen**
   - Vorteil: Die beiden für den Berner Einsatz zentralen Sprachen sind ab Release 1.0 gleichwertig abgedeckt.
   - Nachteil: Fachbegriffe, Hilfetexte und Rechenspur benötigen zweisprachige Pflege und Prüfung.
2. **Nur Deutsch im ersten Release**
   - Vorteil: Der erste Implementierungs- und Prüfaufwand wäre kleiner.
   - Nachteil: Ein wesentlicher Teil des vorgesehenen Einsatzkontexts wäre ausgeschlossen.
3. **Deutsch, Französisch und Italienisch im ersten Release**
   - Vorteil: Drei Landessprachen wären früh verfügbar.
   - Nachteil: Der zusätzliche Übersetzungs- und Prüfaufwand passt nicht zum Bern-fokussierten MVP.

## Entscheid

Release 1.0 wird vollständig auf Deutsch und Französisch bereitgestellt. Dies umfasst Benutzeroberfläche, Benutzertexte, Hilfen, Fehlermeldungen, Rechenspur und freizugebende Fachbegriffe. Weitere Sprachen werden technisch vorbereitet, gehören aber nicht zum ersten Release.

## Begründung

Deutsch und Französisch decken den primären Einsatz im Kanton Bern sachgerecht ab. Die vollständige Zweisprachigkeit ist wertvoller als eine grössere Zahl nur teilweise gepflegter Sprachen.

## Folgen

### Auswirkungen

- Sämtliche Produkttexte liegen in externen Sprachkatalogen.
- Die M365-Spracheinstellung dient als Default und kann im Produkt übersteuert werden.
- Rechtlich relevante Texte werden in beiden Sprachen fachlich geprüft.

### Risiken und Grenzen

- Französische Fachtexte können terminologisch uneinheitlich werden.
- Fehlende Übersetzungen dürfen nicht unbemerkt in einen Release gelangen.
- Italienisch ist ausdrücklich nicht Teil von Release 1.0.

### Folgearbeiten und Rückabwicklung

- Entwicklung und Tests benötigen Vollständigkeitsprüfungen für beide Sprachkataloge.
- Die Aufnahme einer weiteren verbindlichen Produktsprache benötigt einen neuen Klasse-A-Entscheid zum Releaseumfang.

## Nachweise

- [Konzept Version 1.0](../../outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf), Abschnitte 1.1 und 5.5 sowie Anhang C
- [Projekt- und Realisierungsplan Version 1.0](../../outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf), Erfolgskriterien, Qualität und initiales Entscheidungsregister
- [Projektübersicht](../../README.md), Abschnitte «MVP-Umfang» und «Qualitätsgrundsätze»
- [Quellcodeverzeichnis](../../src/README.md)
- [Testverzeichnis](../../tests/README.md)
- [Arbeitspaket AP3](https://github.com/davidsteimer/fristenrechner/issues/11)

## Verantwortlichkeit

Entschieden durch David Steimer. Der Entscheid ist wegen seiner Wirkung auf Produktumfang und Releasefreigabe der Klasse A zugeordnet.
