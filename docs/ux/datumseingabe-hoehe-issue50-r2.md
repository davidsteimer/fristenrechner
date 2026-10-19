# Datumseingabe mit angeglichener Desktop Schrift

Stand: 18. Oktober 2026. Zweiter lokaler Nachtrag zu Issue #50. **Davids Sichtabnahme steht weiterhin aus.**

David meldete nach der ersten Höhenkorrektur im InPrivate-Fenster weiterhin ein höher wirkendes Feld und grössere Schrift für `TT.MM.JJJJ`. Die erste Korrektur hatte nur die Rahmenhöhe berücksichtigt. Die Schrift unterschied sich tatsächlich weiterhin von den Nachbarfeldern.

## Nachmessung und zweite Korrektur

Das zugängliche Chrome-Fenster mit genau der gemeldeten lokalen URL lieferte bereits den ersten korrigierten Stylesheetstand aus. Vor dem zweiten Eingriff massen Datum und benachbarter Feldrahmen jeweils 32 CSS-Pixel mit identischen Ober- und Unterkanten. Eine weiterhin grössere Rahmenhöhe konnte in diesem Fenster nicht reproduziert werden. Eine Gleichsetzung dieses Fensters mit jeder vom Benutzer geprüften privaten Sitzung wird nicht vorgenommen.

Die Schrift unterschied sich dagegen nachweislich: Datum und Platzhalter verwendeten 16 Pixel in Segoe UI, die Nachbarfelder 14 Pixel mit der Aptos-Schriftfamilie.

Die gemeinsame Datumseingabe verwendet neu:

- Desktop: 32 Pixel Rahmenhöhe und `14px Aptos, Arial, Helvetica, sans-serif` für Inhalt und Platzhalter.
- Grober Zeiger: weiterhin 44 Pixel Rahmenhöhe und 16 Pixel Schrift.
- Unveränderte Linksbündigkeit, Parser-/Ereignislogik und Rechenregeln.

Der lokale Webbuild wurde neu erzeugt. In Chrome wurden nach dem Neuladen für Datum und Nachbarfeld dieselben 32 Pixel Rahmenhöhe sowie dieselbe Schriftfamilie und Schriftgrösse gemessen. Die Schriftanpassung betrifft nicht bloss den Platzhalter, sondern auch eingegebene Daten. Die vorhandenen Hilfsschaltflächen bleiben unverändert.

## Nachweise

- [Chrome-Messung](../../outputs/ux-50-2026-10-18-r2/chrome-messung.json) mit neuem Stylesheet `app-PQFJG2Q2.css`.
- [Chrome-Vergleichsansicht](../../outputs/ux-50-2026-10-18-r2/chrome-formular.png).
- Französisch bei 390 Pixel Breite lokal geprüft, kein horizontaler Seitenüberlauf. Kein realer iOS-Nachweis.
- 55 fokussierte Tests bestanden, keine Fehler oder übersprungenen Tests. [Prüfprotokoll](../../outputs/ux-50-2026-10-18-r2/focused-tests.txt).
- TypeScript und `git diff --check` bestanden.

Der bestehende AP21-Stiltest prüft die 16-Pixel-Schrift nun gezielt innerhalb der Touchregel. Die zusätzliche CSSOM-Prüfung unterscheidet ausdrücklich Desktop- und Touchtypografie. Damit bleiben die mobilen Anforderungen geprüft, ohne eine abweichende Desktop-Schrift festzuschreiben.

Die 2’544 Produkttests des ersten Nachtrags sind dessen unveränderter historischer Nachweis. Sie wurden für diese zusätzliche reine Schriftänderung nicht nochmals vollständig ausgeführt und werden nicht als neuer R2-Gesamtlauf ausgegeben.

## Grenzen

Die Vorschau läuft weiterhin unter `http://127.0.0.1:8801/fristenrechner/`. Normales Neuladen genügt zum Laden des neuen, anders benannten Stylesheets. Es wurden weder Browserdaten gelöscht noch Sicherheitseinstellungen verändert.

Sichtabnahme, spätere Host-/Geräteprüfung und Freigabe bleiben offen. E/Q/P, Rechtsdaten und gebundene MVP-0.8-Artefakte sind unverändert. Kein Quellcommit, Push oder Deployment.
