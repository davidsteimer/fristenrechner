# AP22C2 lokale Browserprüfung

Datum: 8. Oktober 2026. Prüfumgebung: Codex In-App-Browser auf macOS, `http://127.0.0.1:8797/?candidate=ap22c2`, gemeinsamer React-Vorschaubuild. Kein SharePoint-, Teams-, iOS- oder Produktionsnachweis.

## Tatsächlich ausgeführte Interaktionen

| Prüfung | Beobachtung |
| --- | --- |
| Frischer Aufruf | Empfangsdatum leer und bedienbar, Rolle und Feiertagskanton nicht erfunden, Frist zehn Tage, Stellenfeld statisch beschriftet |
| StPO, Rolle Partei ohne Vertretung, Feiertagskanton BE, Zustellung 16.09.2026, zehn Tage | Prüfergebnis 28.09.2026, Beginn 17.09.2026, nominelles Ende 26.09.2026, kein Kalenderexport |
| Wechsel des Feiertagskantons | Vorheriges Resultat entfernt |
| StPO, SG, Zustellung 01.01.2029, ein Tag | Kein definitives Fristdatum. Beide Varianten in der Rechenspur: Ablauf ohne die gebundene Januarregel 02.01.2029, mit Regel 03.01.2029 |
| Januarvergleich auf Französisch | Sperrhinweis und beide Varianten übersetzt, weiterhin kein definitives Resultat und kein Export |
| AI ohne regionale Antwort | Berechnung gesperrt, fehlende Antwort nicht als Nein behandelt |
| AI mit bewusst gewähltem Nein, Standards speichern und neu laden | Rolle und Kanton erhalten. Regionalantwort wieder «Bitte wählen», Datum leer, kein altes Resultat |
| Wechsel von StPO zu ZPO | Rolle «Sitz des Gerichts» fest angezeigt, kein Dropdown ohne echte Auswahl. Feiertagskanton neu zu wählen |
| ZPO in DE und FR | Zweispaltige Reihen auf Desktop, statische Stellenbeschriftung, Datum weiterhin bedienbar |
| Schmale Ansicht, angeforderte Breite 390 Pixel, tatsächliche Dokumentbreite 375 Pixel | Formular und Schaltflächen entsprechend dem bestehenden responsiven Verhalten einspaltig, kein seitlicher Seitenüberlauf |
| Schmale Rechenspur mit vollständigem Hash und Vergleichstabelle | Zunächst Überlauf durch den untrennbaren Hash festgestellt und korrigiert. Nach Neuladen und Wiederholung in DE sowie FR beträgt die Dokumentbreite und Scrollbreite jeweils 375 Pixel. Die breite Vergleichstabelle besitzt einen eigenen horizontalen Scrollbereich |
| Abschluss | Teststandards über die App entfernt, temporäre Viewportvorgabe zurückgesetzt, Vorschau frisch geladen und für David offengelassen |

Der erste Versuch einer DOM-basierten Datumseingabe wurde vom nativen Datumsfeld nicht dauerhaft übernommen. Die Prüfung wurde mit der nativen Eingabemethode wiederholt und der tatsächliche Zustand vor der Berechnung kontrolliert. Es wurde dafür keine Datumslogik verändert. AP21 bleibt ein separates Paket.

Beim Footer wurde während der Prüfung die irreführende Anzeige der alten Basisabdeckung korrigiert. Für die neuen Bundesprüfrechnungen erscheint jetzt ausdrücklich «Produktfenster Kalenderprüfung: 29.08.2026 – offen, unter Vorbehalt der Quellenprüfung». VRPG behält seine bisherige Abdeckung.

## Prüfbilder

- [Zweispaltige Oberfläche, DE](oberflaeche-de.jpg)
- [Vollständiger Januarvergleich, DE](januarvergleich-de.jpg)
- [Korrigierter Hashumbruch in der schmalen FR-Rechenspur](rechenspur-fr-schmal.jpg)

Die Browserprüfung ist eine Stichprobe der lokalen Oberfläche. Die maschinellen Tests prüfen zusätzlich alle Bindungen, regionalen Kalenderdifferenzen, vier Januargrenzen, Defaultmigrationen und Fehlerpfade. Sie ersetzt weder eine juristische Abnahme noch die spätere C3-Prüfung auf den tatsächlichen Hosts. Es wurden keine Kalenderdateien exportiert, Termine angelegt oder externen Daten verändert.

Der [separate Prüfsummennachweis](browser-qa-integrity.json) bindet diesen Bericht, die Prüfbilder, den korrigierten CSS-Stand und das erfolgreich abgeschlossene maschinelle QA-Protokoll. Der erste fehlgeschlagene UI-Gesamttest wurde wie im Umsetzungsdokument erläutert korrigiert. Der abschliessende Gesamtlauf ist ohne übersprungene Tests bestanden.
