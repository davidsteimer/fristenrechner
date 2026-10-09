# AP21 Geräteprüfung und Abnahmegrenzen

Stand: 8. Oktober 2026. Für die vollständige Abnahme noch offen. Lokaler AP21-Webbuild mit unveränderten AP22C3-Referenzdaten, kein freigegebenes Betriebspaket.

## Zielumgebungen

| Umgebung | Nachweisstatus |
| --- | --- |
| Codex In-App-Browser auf macOS | Lokaler Funktionsnachweis, siehe [Browserprüfung](browser-qa.md) |
| macOS Chrome | Noch ausstehend |
| macOS Safari | Noch ausstehend |
| iOS Safari | Noch ausstehend |
| iOS Edge | Noch ausstehend |
| iOS Chrome | Noch ausstehend |
| iOS Teams | Noch ausstehend |
| SharePoint und Teams in den bestehenden E-/Q-Umgebungen | Noch ausstehend, Installation separat freizugeben |
| VoiceOver und Zoom auf realen Geräten | Noch ausstehend |

Eine schmale Desktopansicht ist kein iOS-Nachweis. Ein simulierter DOM-Lauf prüft Zustands- und Ereignislogik, nicht native Tastatur, Touch, Screenreader oder M365-Einbettung. Es werden keine vorhandenen Nachweise aus MVP 0.6 als Prüfung der neuen Datumskomponente ausgegeben.

## Protokoll je Zielumgebung

Prüfperson, Datum, Geräte-/Betriebssystemversion, Browser-/Teamsversion und konkrete Buildkennung festhalten. Bei der Übernahme kurzer Eingaben das aktuelle Schweizer Referenzdatum notieren.

1. Leeres Feld mit sichtbarem Format, linksbündiger Schrift und direkter Tastatureingabe prüfen. Punkt und Buchstaben müssen erreichbar sein.
2. `5`, `16.9`, `h` und auf Französisch `a` übernehmen. Danach muss ein unveränderliches vollständiges Datum stehen.
3. Tab, Enter, Verlassen per Touch und direkten Berechnungsklick prüfen. Enter im Datum darf keine Rechnung starten.
4. `31.04`, `29.02.2027`, `16.9.26` und `h+10` müssen sichtbar bleiben und die Berechnung sperren. `29.02.2028` muss als Datum akzeptiert werden, unabhängig von nachgelagerten Rechts-/Freigabegrenzen.
5. Nach einer Berechnung ein Zeichen ändern. Resultat und Export müssen sofort verschwinden. Löschen darf keinen alten Wert wiederverwenden.
6. Kalender per Maus/Touch und Tastatur öffnen. Auswahl, Abbruch, Escape, Monat-/Jahreswechsel und Löschen prüfen. Abbruch muss den vorherigen Entwurf unverändert lassen.
7. Besondere Anker, Beschaffungsbeginn und zuständigkeitsrelevante Daten mitprüfen. Rollenwechsel und Standards zurücksetzen dürfen keine verdeckten Entwürfe zurückbringen.
8. DE/FR wechseln. Beschriftungen, Fehler, Hilfe und Kalender müssen verständlich bleiben. Es dürfen keine Datumswerte in persönlichen Standards gespeichert werden.
9. VoiceOver prüft Beschriftung, Pflichtfeld, Fehlerzuordnung, Kalendertage, Dialogfokus und Rückkehr zum Eingabefeld. Bei 200 Prozent Zoom und auf schmalem Bildschirm dürfen Eingabe, Schaltflächen und Fehler nicht abgeschnitten werden.

Die geprüfte Bereitstellung muss ausdrücklich als AP21-Prüfstand erkennbar sein. Für die spätere E-/Q-Prüfung gelten weiterhin die bestehenden Berechtigungs- und Datenquellengrenzen. Kein Auftrag zur Installation, öffentlichen Vorschau oder Freigabe eines Netzwerkports aus dieser Checkliste.
