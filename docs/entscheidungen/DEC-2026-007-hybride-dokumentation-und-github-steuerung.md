---
id: DEC-2026-007
titel: "Hybride Dokumentation und GitHub als operative Arbeitssteuerung"
status: beschlossen
entscheidungsdatum: 2026-08-28
klasse: A
entschieden_durch: David Steimer
quelle:
  - "Vereinbarung vom 28. August 2026"
  - "Projekt- und Realisierungsplan, Version 1.0"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-007: Hybride Dokumentation und GitHub als operative Arbeitssteuerung

## Ausgangslage

Nach Freigabe des Konzepts war zu klären, ob Folgeschritte ausschliesslich in Word oder in einer leichter versionierbaren Arbeitsumgebung dokumentiert werden. Die Einpersonenphase verlangt wenig Pflegeaufwand, Entscheide müssen trotzdem nachvollziehbar bleiben.

## Geprüfte Optionen

1. **Stabile Managementgrundlagen in Word und PDF, lebende Dokumentation und Arbeit in GitHub**
   - Vorteil: Freigabefähige Dokumente bleiben stabil, während Aufgaben und technische Inhalte versionierbar sind.
   - Nachteil: Die führende Ablage hängt von der Informationsart ab und muss klar bezeichnet werden.
2. **Sämtliche Folgeschritte in Word dokumentieren**
   - Vorteil: Einheitliches Office-Format.
   - Nachteil: Backlog, Codebezug, kleine Änderungen und Entscheidungsverläufe wären schwerfällig.
3. **Sämtliche Dokumentation nur im Repository führen**
   - Vorteil: Eine technisch einheitliche Versionshistorie.
   - Nachteil: Freigegebene Managementgrundlagen wären weniger bequem als Word- und PDF-Artefakte verfügbar.

## Entscheid

Freigegebenes Konzept und Projektplan werden als stabile Word- und PDF-Fassungen im Projektordner geführt. GitHub Issues und das GitHub Project bilden die einzige operative Aufgabenliste. Code, lebende technische Dokumentation, Fachregeln, Tests und einzelne DEC-Dateien werden versioniert im öffentlichen Repository gepflegt.

## Begründung

Die Aufteilung nutzt das geeignete Format für den jeweiligen Zweck. Sie hält die Einpersonenführung schlank und verhindert zugleich, dass Entscheide oder Änderungen nur in Chats oder laufend neu gespeicherten Word-Fassungen bestehen.

## Folgen

### Auswirkungen

- SharePoint Lists wird im MVP nicht zusätzlich als Projektaufgabenliste verwendet.
- Die führende Quelle wird je Informationsart ausdrücklich benannt.
- Protokolle und periodische Statusberichte werden erst bei weiteren Beteiligten oder externen Berichtspflichten eingeführt.

### Risiken und Grenzen

- Informationen können doppelt oder widersprüchlich werden, wenn die Ablagezuordnung nicht eingehalten wird.
- Chatnachrichten allein gelten nicht als dauerhafter Entscheidungsnachweis.

### Folgearbeiten und Rückabwicklung

- Repository-Struktur, Issues, Project-Felder und DEC-Register werden als Nachweis gepflegt.
- Eine andere operative Aufgabensteuerung oder ein neues führendes System benötigt einen neuen Klasse-A-Entscheid und eine dokumentierte Migration.

## Nachweise

- [Projekt- und Realisierungsplan Version 1.0](../../outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf), Abschnitte 1.2, 5, 6 und 10
- [Konzept Version 1.0](../../outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf), Abschnitt 10
- [Projektübersicht](../../README.md), Abschnitte «Repository-Struktur» und «Projektführung»
- [Projektdokumentation](../README.md)
- [GitHub Project «Fristenrechner Schweiz · MVP»](https://github.com/users/davidsteimer/projects/1)
- [Arbeitspaket AP3](https://github.com/davidsteimer/fristenrechner/issues/11)

## Verantwortlichkeit

Entschieden durch David Steimer. Der Entscheid ist wegen seiner Wirkung auf Governance und führende Ablagen der Klasse A zugeordnet.
