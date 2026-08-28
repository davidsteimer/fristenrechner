---
id: DEC-2026-005
titel: "AGPL-3.0 für den Programmcode"
status: beschlossen
entscheidungsdatum: 2026-08-28
klasse: A
entschieden_durch: David Steimer
quelle:
  - "Konzept Fristenrechner Schweiz, Version 1.0"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-005: AGPL-3.0 für den Programmcode

## Ausgangslage

Die App soll Open Source sein. Für den Programmcode war eine geeignete Lizenz zu wählen. Die ursprünglich genannte CC BY-SA 4.0 ist für Software nicht die passende Standardlizenz.

## Geprüfte Optionen

1. **GNU Affero General Public License Version 3.0**
   - Vorteil: Starke Copyleft-Wirkung einschliesslich netzbasierter Nutzung und etablierter Softwarelizenztext.
   - Nachteil: Weiterverwendende müssen die Lizenzpflichten und die Bereitstellung des korrespondierenden Quellcodes beachten.
2. **European Union Public Licence Version 1.2**
   - Vorteil: Europäisch ausgerichtete Copyleft-Lizenz mit amtlichen Sprachfassungen.
   - Nachteil: Die gewünschte Netzwerkklausel der AGPL steht nicht im selben Umfang im Zentrum.
3. **CC BY-SA 4.0 auch für den Programmcode**
   - Vorteil: Einheitliche Lizenzbezeichnung für alle eigenen Inhalte.
   - Nachteil: Creative-Commons-Lizenzen werden für Software nicht empfohlen.

## Entscheid

Der Programmcode wird unter der GNU Affero General Public License Version 3.0, ausschliesslich Version 3, veröffentlicht. Eigene Dokumentation sowie kuratierte Regel- und Kalenderdaten stehen unter CC BY-SA 4.0, soweit die Bedingungen der jeweiligen Primärquellen dies zulassen.

## Begründung

Die AGPL-3.0 ist eine für Software geeignete Copyleft-Lizenz und passt zum webbasierten Einsatz der Anwendung. Die getrennte Lizenzierung der Werktypen vermeidet, eine Inhaltslizenz zweckwidrig auf Programmcode anzuwenden.

## Folgen

### Auswirkungen

- Der vollständige AGPL-3.0-Text bleibt als `LICENSE` im Repository.
- Anwendung und Releases müssen einen gut sichtbaren Lizenz- und Quellcodehinweis enthalten.
- Dokumentation und kuratierte Daten werden getrennt als CC BY-SA 4.0 ausgewiesen.

### Risiken und Grenzen

- Abhängigkeiten und Drittmaterialien können zusätzliche oder abweichende Lizenzpflichten haben.
- Amtliche Texte, Zitate, Marken und Logos werden durch den Projektentscheid nicht neu lizenziert.

### Folgearbeiten und Rückabwicklung

- Abhängigkeiten und Releaseartefakte erhalten einen dokumentierten Lizenzcheck.
- Ein Wechsel der Codelizenz benötigt einen neuen Klasse-A-Entscheid und eine Prüfung bereits eingegangener Beiträge.

## Nachweise

- [Konzept Version 1.0](../../outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf), Abschnitt 8.5 und Quellen Q17 bis Q18
- [Projekt- und Realisierungsplan Version 1.0](../../outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf), initiales Entscheidungsregister und Lizenzrisiko
- [AGPL-3.0-Lizenztext](../../LICENSE)
- [Lizenzabgrenzung](../../LICENSES/README.md)
- [Projektübersicht](../../README.md), Abschnitt «Lizenzen»
- [Arbeitspaket AP3](https://github.com/davidsteimer/fristenrechner/issues/11)

## Verantwortlichkeit

Entschieden durch David Steimer. Der Entscheid ist als Lizenz- und Veröffentlichungsentscheid der Klasse A zugeordnet.
