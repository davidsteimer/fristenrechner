# AP22C3 lokale Browserprüfung

Datum: 8. Oktober 2026. Codex In-App-Browser auf macOS, separater statischer Build unter `http://127.0.0.1:8798/fristenrechner/`. Kein SharePoint-, Teams-, Gast-, iOS- oder Produktionsnachweis.

## Tatsächlich ausgeführte Interaktionen

| Prüfung | Beobachtung |
| --- | --- |
| Frischer Aufruf des statischen Kandidaten | Datum leer und bedienbar, Rolle und Feiertagskanton nicht vorausgewählt, zehn Tage, statisches Stellenfeld, C3-Prüfhinweis |
| StPO, Partei ohne Vertretung, TI, Zustellung 16.09.2026, zehn Tage | Prüfergebnis 28.09.2026, Beginn 17.09.2026, nominelles Ende 26.09.2026. Kein Kalenderexport |
| Wechsel des Feiertagskantons auf SG | Vorheriges Resultat entfernt |
| StPO, SG, Zustellung 01.01.2029, ein Tag | Kein definitives Resultat. Vollständige Varianten in der Rechenspur: ohne Januarregel 02.01.2029, mit Regel 03.01.2029 |
| Wechsel nach VRPG und Sozialversicherungsrecht | Elf bestehende Sozialerlasse sichtbar, kein verlorener Sozialpfad durch Format 7 |
| ELG, Einsprache gegen Verfügung, Zustellung 16.09.2026, zuständiger Kanton BE, Partei in BE ohne Vertretung | Prüfergebnis 16.10.2026, 30 Tage, bisheriger ATSG-Stillstand. Kein Kalenderexport auch im Sozialzweig |
| Sprachwechsel auf Französisch | Kandidatenhinweis, Ergebnis, Anforderungen und Exportsperre übersetzt, Datum und Resultat erhalten |
| Schmale FR-Ansicht, angeforderte Breite 390 Pixel | Tatsächliche Dokumentbreite und Scrollbreite jeweils 375 Pixel, kein seitlicher Seitenüberlauf |
| Browserkonsole | Keine erfassten Fehler |
| Abschluss | Viewport zurückgesetzt, frischer Aufruf mit leerem Datum und ohne altes Resultat, keine Teststandards gespeichert |

Wie bereits im C2-Nachweis wurde die DOM-basierte Datumseingabe vom nativen Feld nicht dauerhaft übernommen. Mit der nativen Eingabemethode wurde der echte Datumzustand gesetzt und nach Folgeinteraktionen bestätigt. Dafür wurde keine Datumslogik verändert. AP21 bleibt ein separates Paket.

Die Prüfung erfolgte auf dem tatsächlichen gebauten C3-Einstieg, nicht mit eingespeisten Browserresultaten. Nach dem abschliessenden Build wurden die aufgeführten Berechnungsfälle, der Sprachwechsel und die schmale Ansicht erneut mit dem tatsächlich geladenen Asset `app-YXHQJ3KH.js` geprüft. Sämtliche Prüfbilder zeigen diesen abschliessenden Build. Es wurden keine Kalenderdateien exportiert, Termine angelegt oder Daten an externe Stellen übermittelt.

## Prüfbilder

- [Neutrale zweispaltige Oberfläche](oberflaeche-de.png)
- [Tessiner Prüfergebnis](tessin-pruefergebnis-de.png)
- [Sperrender Januarvergleich](januarvergleich-de.png)
- [Französische Sozialrechnung, schmale Ansicht](sozial-fr-schmal.png)

Die Prüfbilder, das Buildmanifest und die maschinellen Nachweise sind im [Abschlussregister](completion-integrity.json) gebunden. Reale E-/Q-Tests sowie Quellen- und Releasefreigabe bleiben separate Schritte.
