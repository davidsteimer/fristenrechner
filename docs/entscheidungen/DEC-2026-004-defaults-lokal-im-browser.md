---
id: DEC-2026-004
titel: "Persönliche Defaults nur lokal im Browser"
status: beschlossen
entscheidungsdatum: 2026-08-28
klasse: A
entschieden_durch: David Steimer
quelle:
  - "Konzept Fristenrechner Schweiz, Version 1.0"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-004: Persönliche Defaults nur lokal im Browser

## Ausgangslage

Benutzerinnen und Benutzer sollen Verfahrensrecht, Gemeinwesen, Feiertagsort und Standardfrist vorbelegen können. Zu entscheiden war, ob diese Voreinstellungen lokal oder geräteübergreifend in SharePoint gespeichert werden.

## Geprüfte Optionen

1. **Lokale Speicherung im Browser**
   - Vorteil: Keine zusätzliche Berechtigung, Datenliste oder Benutzerzuordnung ist nötig.
   - Nachteil: Die Voreinstellungen werden nicht zwischen Geräten oder Browserprofilen synchronisiert.
2. **Geräteübergreifende Speicherung in SharePoint**
   - Vorteil: Die Voreinstellungen wären in mehreren Sitzungen verfügbar.
   - Nachteil: Berechtigungen, Datenhaltung, Löschung und Betrieb würden komplexer.
3. **Keine persönlichen Defaults**
   - Vorteil: Es würden keine Einstellungen gespeichert.
   - Nachteil: Wiederkehrende Eingaben wären unnötig aufwendig.

## Entscheid

Persönliche Defaults werden im ersten Release ausschliesslich lokal im Browser gespeichert. Eine Synchronisierung zwischen Geräten oder Browserprofilen gehört nicht zum MVP.

## Begründung

Die lokale Speicherung erfüllt den Bedienbedarf mit der kleinsten technischen und datenschutzrechtlichen Belastung. Für den MVP ist keine geräteübergreifende Funktion erforderlich.

## Folgen

### Auswirkungen

- Für Defaults wird keine SharePoint-Liste und keine Graph-Berechtigung benötigt.
- Die Funktion speichert keine Falldaten, Namen oder Aktenzeichen.
- Die Oberfläche muss die lokale Speicherung transparent erklären und eine Löschmöglichkeit anbieten.

### Risiken und Grenzen

- Defaults gehen beim Löschen des Browserspeichers verloren.
- Gemeinsam genutzte Browserprofile können Einstellungen sichtbar machen.
- Fallbezogene Inhalte dürfen nicht als Defaults angeboten werden.

### Folgearbeiten und Rückabwicklung

- AP5 und die UI-Umsetzung definieren zulässige Felder, Schema und Löschverhalten.
- Eine spätere Synchronisierung benötigt einen neuen Klasse-A-Entscheid mit Datenschutz- und Berechtigungskonzept.

## Nachweise

- [Konzept Version 1.0](../../outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf), Abschnitte 2.3, 5.3 und 7.4 sowie Anhang C
- [Projekt- und Realisierungsplan Version 1.0](../../outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf), initiales Entscheidungsregister
- [Projektübersicht](../../README.md), Abschnitte «MVP-Umfang» und «Qualitätsgrundsätze»
- [Sicherheitsrichtlinie](../../SECURITY.md)
- [Arbeitspaket AP3](https://github.com/davidsteimer/fristenrechner/issues/11)

## Verantwortlichkeit

Entschieden durch David Steimer. Der Entscheid ist wegen seiner Wirkung auf Datenschutz und Produktumfang der Klasse A zugeordnet.
