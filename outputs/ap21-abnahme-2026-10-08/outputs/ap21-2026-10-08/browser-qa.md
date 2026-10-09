# AP21 Lokale Browserprüfung

Prüfdatum: 8. Oktober 2026. Ausführung durch Codex im In-App-Browser auf macOS. Dies ist kein Nachweis für Safari, Chrome, ein reales iOS-Gerät oder einen M365-Host.

Prüfadresse: `http://127.0.0.1:8799/fristenrechner/`. Getrenntes Buildziel `.work/public-ap21`. Endgültiges JavaScript `app-C47NLQDG.js`, CSS `app-YH25TL6L.css`. Unveränderte AP22C3-Referenzdaten `2026-10-08-ap22c3-reference.1`. Kalenderexport für sämtliche Berechnungen gesperrt.

## Beobachtete Ergebnisse

| Prüfung | Beobachtung |
| --- | --- |
| Leerer Start und erneutes Laden | Leerer Textwert mit `TT.MM.JJJJ`, kein vorgegebenes Datum und kein früheres Resultat |
| Schrift und Ausrichtung | `type="text"`, berechnete Schriftgrösse 16 px, linksbündig. In FR `JJ.MM.AAAA` |
| `5` und Tab | `05.10.2026`, Fokus unmittelbar im Feld «Frist in Tagen» |
| `16.9` und Enter | `16.09.2026`, keine Berechnung durch Enter, Fokus bleibt im Datumsfeld |
| Kalenderauswahl | September 2026 geöffnet, 17. September ausgewählt und als `17.09.2026` übernommen |
| Kalendernavigation und Leeren | Monatswechsel von September auf Oktober, «Datum leeren» entfernt den Wert |
| Kalenderabbruch | Unbestätigter Entwurf `31.04` bleibt beim Öffnen und Schliessen mit Escape unverändert |
| Tastaturhilfe | Alt und Pfeil nach unten öffnet den Kalender, F1 die Hilfe. Escape schliesst den Dialog |
| Berechnung aus Kurzform | StPO, Partei ohne Vertretung, Feiertagskanton TI, Zustellung `16.9`, zehn Tage ergibt das Prüfergebnis `28.09.2026` |
| Änderung nach Berechnung | Bereits das Tippen von `31.04` entfernt das Ergebnis, vor erneutem Berechnen |
| Ungültiges Datum und Submit | `31.04` bleibt sichtbar. Zugeordnete Fehlermeldung, `aria-invalid="true"`, keine Rechnung mit dem früheren Datum |
| Sprachwechsel bei Fehler | FR-Fehlermeldung erscheint, Entwurf `31.04` bleibt erhalten |
| Französisches Kürzel | `a` und Enter ergibt `08.10.2026`, ohne Rechnung |
| Schmale FR-Ansicht | 390 px Ansichtsbreite, Text linksbündig bei 16 px, kein horizontaler Überlauf. Kein iOS-Nachweis |
| Rücksetzen und Neuladen | Wieder leerer DE-Startzustand, keine gespeicherten Testdaten oder Resultate |
| Browserkonsole | Bei der abgefragten lokalen Prüfung keine Warnungen oder Fehler |

Die Tastatur-, Abbruch-, Hilfe- und Auswahlprüfungen wurden zunächst auf `app-UZMJJJTF.js` durchgeführt. Die anschliessende Änderung ergänzte ausschliesslich die beiden fehlenden lokalen SVG-Navigationssymbole `Up` und `Down` im Standalone-Einstieg. Danach wurden Monatsnavigation, Leeren, Tab, Enter, Berechnung, Ergebnisinvalidierung, Fehler, Sprachwechsel, FR-Kürzel, schmale Ansicht und leerer Neustart auf `app-C47NLQDG.js` wiederholt. Die gemeinsame Datumskomponente blieb dabei byteidentisch.

## Visuelle Belege

- [Leere Oberfläche DE](oberflaeche-de.png)
- [Optionaler Kalender mit korrigierten Navigationssymbolen](kalender-de.png)
- [Berechnung aus der Datumseingabe](berechnung-de.png)
- [Sichtbare ungültige Eingabe ohne altes Resultat](ungueltiges-datum-de.png)
- [Schmale Oberfläche FR](franzoesisch-schmal.png)

Alle fünf Bilder zeigen den endgültigen Webbuild. Die Vorschau wurde im leeren Startzustand hinterlassen und die temporäre Ansichtsbreite zurückgesetzt.

## Korrekturen und offene Grenzen

Die erste Browserprüfung zeigte zwei vermeidbare Hilfsstopps in der Tab-Reihenfolge. Die Hilfsschaltflächen werden jetzt beim normalen Tab-Durchlauf übersprungen. Kalender und Hilfe bleiben über dokumentierte Tastenkürzel erreichbar. Ein weiterer visueller Befund waren fehlende Monatsnavigationssymbole im Standalone-Build. Diese werden nun lokal als SVG registriert, ohne zusätzliche Schrift- oder CDN-Anfragen. Beide Befunde sind in dieser lokalen Prüfung behoben.

Reale iOS-Tastatur, Touch, Screenreader, Zoom und M365-Einbettung bleiben Gegenstand der [Geräteprüfung](geraetepruefung.md). Bei Mausauswahl im Kalender kehrt der beobachtete Fokus auf die auslösende Kalenderschaltfläche zurück. Beim mit Tastatur geöffneten Dialog kehrte er zum Datumsfeld zurück. Die konkrete VoiceOver-Bedienbarkeit ist noch nicht nachgewiesen. Kein externes Deployment und keine AP21-Abnahme aus diesem Protokoll.
