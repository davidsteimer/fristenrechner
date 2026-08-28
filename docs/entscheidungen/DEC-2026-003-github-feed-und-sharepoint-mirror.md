---
id: DEC-2026-003
titel: "GitHub-Datenfeed im Pilot und SharePoint-Mirror im Zielbetrieb"
status: beschlossen
entscheidungsdatum: 2026-08-28
klasse: B
entschieden_durch: David Steimer
quelle:
  - "Konzept Fristenrechner Schweiz, Version 1.0"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-003: GitHub-Datenfeed im Pilot und SharePoint-Mirror im Zielbetrieb

## Ausgangslage

Im steimer.ch-Pilot ist ein öffentlicher Datenfeed zulässig. Spätere Zieltenants werden voraussichtlich einen tenantinternen Mirror verlangen. Die Anwendung soll beide Betriebsarten unterstützen, ohne den Rechenkern an eine konkrete Plattform zu koppeln.

## Geprüfte Optionen

1. **GitHub im Pilot, mirrorfähige Provider-Architektur von Anfang an**
   - Vorteil: Der Pilot bleibt einfach und der spätere Wechsel ist technisch vorbereitet.
   - Nachteil: Zwei Provider müssen spezifiziert und getestet werden.
2. **Nur GitHub dauerhaft verwenden**
   - Vorteil: Geringster Implementierungsaufwand.
   - Nachteil: Restriktive Zieltenants könnten den Feed blockieren.
3. **Sofort ausschliesslich einen SharePoint-Mirror verwenden**
   - Vorteil: Der Zielbetrieb würde früh nachgebildet.
   - Nachteil: Der Pilot bräuchte unnötig früh tenantinterne Pflege und Verbindungen.

## Entscheid

Der steimer.ch-Pilot bezieht freigegebene Regel- und Kalenderdaten aus einem öffentlichen GitHub-Release. Für spätere Zieltenants wird ein SharePoint-Mirror vorgesehen. Beide Quellen liefern dasselbe versionierte und prüfbare Releaseformat über eine gemeinsame `ReleaseProvider`-Schnittstelle.

## Begründung

Der Entscheid hält den Pilot einfach, ohne die bekannte Tenantanforderung aufzuschieben. Die Provider-Abstraktion verhindert, dass Datenbeschaffung und Fristenberechnung technisch vermischt werden.

## Folgen

### Auswirkungen

- GitHub- und SharePoint-Provider müssen dasselbe Artefakt verarbeiten.
- Die Rechenspur zeigt Datenquelle, Release-ID und Prüfsumme.
- Schema-, Signatur-, Abdeckungs- und Gültigkeitsprüfungen gelten unabhängig von der Quelle.

### Risiken und Grenzen

- GitHub und Mirror können auseinanderlaufen.
- Tenant-DLP-Richtlinien können automatisierte Verbindungen blockieren.
- Der manuelle Mirror-Import bleibt als zulässiger Fallback vorzusehen.

### Folgearbeiten und Rückabwicklung

- AP5 konkretisiert Releaseformat und Prüfsummen.
- Ein späterer Wechsel der Pilotquelle oder der Provider-Architektur benötigt einen neuen Klasse-B-Entscheid.

## Nachweise

- [Konzept Version 1.0](../../outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf), Abschnitte 4.3, 6.3, 6.4 und 7.3
- [Projekt- und Realisierungsplan Version 1.0](../../outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf), Lieferobjekte, Risiken und initiales Entscheidungsregister
- [Projektübersicht](../../README.md), Abschnitt «Technisches Zielbild»
- [Datenverzeichnis](../../data/README.md)
- [Quellcodeverzeichnis](../../src/README.md)
- [Arbeitspaket AP3](https://github.com/davidsteimer/fristenrechner/issues/11)

## Verantwortlichkeit

Entschieden durch David Steimer. Der Entscheid ist wegen der Provider- und Betriebsarchitektur der Klasse B zugeordnet.
