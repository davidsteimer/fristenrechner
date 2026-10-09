# MVP 0.7 lokale Browserprüfung

Am 8. Oktober 2026 wurde der normale statische Webbuild mit dem tatsächlichen freigegebenen Datenrelease `2026-10-08-mvp-07-approved.1` im Codex-In-App-Browser geprüft. Ausschliesslich synthetische Fälle. Der lokale Server war nur an `127.0.0.1:8807` gebunden. Keine SharePoint-, Teams-, Outlook- oder Produktionsaktion.

## Gebundene Testdateien

| Datei im geprüften Webbuild | SHA-256 |
| --- | --- |
| `build-manifest.json` | `912fc889fa04445bd0bc889089078acc5f97de855dfc2306c508b1ece17fe070` |
| `assets/app-JW7WZXR7.js` | `3c94fbc2fffca13ea3596f89ca6a7c5e6e2945142706bd230a722a7ca4421c03` |
| `assets/app-YH25TL6L.css` | `fa71eea91025c9e00e10774fb1f71b7d1aeac92e5eed0db83e4d0ac098b9263e` |

Die abschliessende unabhängige Artefaktprüfung bestätigt diese Bytes exakt im verpackten Webarchiv. Ein lokaler Server ist kein Nachweis der Headerwirkung beim Hostinganbieter.

## Sichtbar bestandene Stichproben

1. Der frische Einstieg zeigt den freigegebenen Release, ein leeres Empfangsdatum und keine erfundenen Feiertagsfakten.
2. `16.9.2026` wird bei Tab zu `16.09.2026`. StPO, zehn Tage, Partei ohne Vertretung, Feiertagskanton Bern ergeben den **28.09.2026**. Der Exportknopf ist sichtbar.
3. Das Bearbeiten des Datums zu `5` entfernt das bisherige Resultat und den Kalenderexport sofort. Tab ergänzt am Testtag den **05.10.2026**.
4. Der Sprachwechsel auf Französisch erhält das normalisierte Datum und übersetzt die Felder.
5. StPO, `01.01.2029`, ein Tag, Partei ohne Vertretung, St. Gallen: Die französische Oberfläche zeigt den divergierenden Januarvergleich mit **02.01.2029** und **03.01.2029**. Sie bietet weder ein definitives Fristresultat noch einen Kalenderexport an.
6. Die schmale lokale Ansicht wurde bei einem temporären Viewport von 390 × 844 geprüft. Die gemessene Dokumentbreite betrug 375 Pixel, kein horizontaler Überlauf. Das Datumsfeld war linksbündig. Der Viewport wurde danach zurückgesetzt. Dies ist kein iOS-Gerätetest.
7. Nach erneutem Laden des abgeschlossenen Normalbuilds war das Datum wieder leer. StPO, `07.12.2026`, ein Tag, Partei ohne Vertretung und Feiertagskanton Tessin ergeben den **09.12.2026**. Der 8. Dezember wird als Feiertag übersprungen. Im normalen Viewport ist der zweispaltige Aufbau erhalten, die Datumseingabe linksbündig.

Der [Screenshot des Tessiner Falls](browser-evidence/web-ti-result.png) und die [sichtbare Accessibility-Struktur](browser-evidence/web-ti-result-ax.txt) sind gespeichert. Screenshot SHA-256 `b80b425c7e7fff5cd90f5118b2cb5708c7b372e4facaad341b0e5703dba48ff9`.

## Grenzen und technische Zwischenbefunde

- Der Export wurde im Bern-Fall mit der synthetischen Referenz `QA-MVP07-LOCAL-DE` ausgelöst. Die Browserautomation erhielt jedoch kein Downloadereignis und konnte keine gespeicherte Datei bestätigen. In der Browserkonsole wurden keine Fehler oder Warnungen gemeldet. Es wird **kein bestandener gespeicherter ICS-Download** behauptet. Die tatsächlichen Hostdownloads bleiben Gegenstand von R07-C. Die automatisierten DE-/FR-Inhaltsprüfungen sind ein anderer Nachweistyp.
- Eine Berechnung wurde nach einem Steuerungszeitlimit anhand des frisch gelesenen Seitenstands erneut ausgelöst. Das bestätigte Ergebnis ist dokumentiert, der erste Versuch wird nicht als eigener Erfolg gezählt.
- Port 8797 war bereits belegt und wurde nicht verändert. Für die Prüfung wurde der freie Port 8807 verwendet.
- Keine Outlook-Importe, keine reale Gastanmeldung, keine SharePoint-/Teams-Netzwerkprüfung und keine direkte Kontrolle produktiver Browserstorage-Werte. VoiceOver, reale iOS-Teams-Geräte und 200-Prozent-Zoom bleiben in der späteren Hostmatrix offen.
