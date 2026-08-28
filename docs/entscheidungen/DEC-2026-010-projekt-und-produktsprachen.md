---
id: DEC-2026-010
titel: "Sprache der Projektführung und der Produkttexte"
status: beschlossen
entscheidungsdatum: 2026-08-28
klasse: A
entschieden_durch: David Steimer
quelle:
  - "Freigabe vom 28. August 2026"
  - "Projekt- und Realisierungsplan, Version 1.0"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-010: Sprache der Projektführung und der Produkttexte

## Ausgangslage

Die verbindlichen Produktsprachen Deutsch und Französisch sind mit DEC-2026-006 festgelegt. Zusätzlich war zu entscheiden, ob auch interne Projektführung und technische Dokumentation vollständig zweisprachig geführt werden.

## Geprüfte Optionen

1. **Interne Projektführung auf Deutsch, Produkttexte auf Deutsch und Französisch**
   - Vorteil: Die Einpersonenführung bleibt schlank, während das Produkt vollständig zweisprachig ist.
   - Nachteil: Interne Projektdokumente stehen nicht automatisch auf Französisch zur Verfügung.
2. **Sämtliche Projekt- und Produktunterlagen zweisprachig führen**
   - Vorteil: Alle Inhalte wären in beiden Sprachen verfügbar.
   - Nachteil: Der laufende Übersetzungs- und Pflegeaufwand wäre für die Einpersonenphase unverhältnismässig.
3. **Projekt und Produkt zunächst nur auf Deutsch führen**
   - Vorteil: Geringster kurzfristiger Aufwand.
   - Nachteil: Dies widerspräche der beschlossenen vollständigen Zweisprachigkeit des Produkts.

## Entscheid

Interne Projektführung und technische Dokumentation erfolgen zunächst auf Deutsch. Benutzeroberfläche, Benutzertexte und freizugebende Fachbegriffe des Produkts werden vollständig auf Deutsch und Französisch geführt. Eine französische Fassung interner Projektdokumente entsteht nur bei konkretem Bedarf.

## Begründung

Die Trennung konzentriert die zweisprachige Qualitätssicherung dort, wo sie für Benutzerinnen und Benutzer nötig ist. Sie vermeidet eine doppelte Pflege rein interner Arbeitsunterlagen.

## Folgen

### Auswirkungen

- Issues, Commits, DEC-Dateien und interne technische Dokumentation dürfen auf Deutsch geführt werden.
- Produktbezogene Akzeptanzkriterien müssen beide Sprachen abdecken.
- DEC-2026-006 bleibt für den Umfang der Produktlokalisierung massgebend.

### Risiken und Grenzen

- Externe französischsprachige Projektbeteiligte könnten später Übersetzungen interner Grundlagen benötigen.
- Die Sprachtrennung darf nicht dazu führen, französische Produkttexte als nachgelagerte Kür zu behandeln.

### Folgearbeiten und Rückabwicklung

- Ein konkreter Bedarf nach französischen Projektdokumenten wird als eigenes Arbeitspaket geplant.
- Eine Änderung der internen Führungssprache oder des zweisprachigen Produktumfangs benötigt einen neuen Klasse-A-Entscheid. Bei einer Änderung des Produktumfangs ist auch DEC-2026-006 abzulösen.

## Nachweise

- [Projekt- und Realisierungsplan Version 1.0](../../outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf), Beschluss zur Sprache und Anhang A
- [Konzept Version 1.0](../../outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf), Abschnitt 5.5
- [DEC-2026-006](DEC-2026-006-produktsprachen-deutsch-und-franzoesisch.md)
- [Projektübersicht](../../README.md), Abschnitte «MVP-Umfang» und «Projektführung»
- [Projektdokumentation](../README.md)
- [Arbeitspaket AP3](https://github.com/davidsteimer/fristenrechner/issues/11)

## Verantwortlichkeit

Entschieden durch David Steimer. Der Entscheid ist wegen seiner Wirkung auf Projekt- und Produktkommunikation der Klasse A zugeordnet.
