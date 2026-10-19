# MVP 0.9 Q-Abnahme und Outlook-Entscheid

Datum: 19. Oktober 2026. Entscheider und manueller Prüfer: David Steimer.

**David Steimer bestätigt die bestandene Geräteprüfung und den Gastzugriff, nimmt Q für MVP 0.9 ab und bestätigt die begrenzte Wiederverwendung der Outlook-Nachweise. Damit ist R09-C einschliesslich C08 abgeschlossen. R09-D beginnt mit der lokalen Publikationsvorprüfung.**

## Erklärung und gebundener Stand

Nach Übergabe des technischen E-/Q-Gesamtnachweises erklärte David Steimer:

> Geräteprüfung und Gastzugriff sind bestanden. Ich nehme Q für MVP 0.9 ab und bestätige die begrenzte Wiederverwendung der Outlook-Nachweise. Bitte starte R09-D mit der lokalen Publikationsvorprüfung.

Die Erklärung bezieht sich auf den zuvor übergebenen Stand:

| Gegenstand | Abgenommener Stand |
| --- | --- |
| Anwendung / SPFx-Paket | `0.9.0` / `0.9.0.0` |
| Paketdatei | `fristenrechner-schweiz-0.9.0.0.sppkg` |
| Paketgrösse und SHA-256 | 327’130 Bytes, `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331` |
| Datenrelease | `2026-10-18-mvp-09-approved.1`, 42 Laufzeitdateien |
| Manifest SHA-256 | `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265` |
| E-Ziele | Die bestehenden Rechnerinstanzen «Fristenrechner Test» und «Entwicklungsumgebung» |
| Q-Ziele | Die bestehende SharePoint-Rechnerseite «Fristenrechner Gastdemo» und die bestehende Rechnerregisterkarte «Fristenrechner Gastdemo Teams» |
| Technischer Nachweis | [E-/Q-Vollzugsnachweis](eq-vollzugsnachweis-mvp09.md), [Prüfmatrix](pruefmatrix-mvp09.md) und [Installationsvorlage](eq-installationsvorlage-mvp09.md) |
| Outlook-Grundlage | [Begrenzter Wiederverwendungsvorschlag vom 18. Oktober](outlook-wiederverwendung-mvp09.md), ergänzt durch acht tatsächliche E-/Q-Kalenderdateien |

## Menschliche Abnahme

| Punkt | Abschluss und Nachweisart |
| --- | --- |
| M01 Geräte | Von David als bestanden bestätigt |
| M02 Gast | Gastzugriff von David als bestanden bestätigt. Die technischen Eigentümerprüfungen bleiben davon getrennt |
| M03 Q-Abnahme | Für das gebundene Paket und den Datenrelease ausdrücklich erteilt |
| M04 Outlook | Begrenzte Wiederverwendung ausdrücklich bestätigt |
| C08 | Mit diesen menschlichen Bestätigungen abgeschlossen |

Die Bestätigung enthält keine einzelnen Gerätemodelle, Betriebssystem- oder Appversionen, Eingabemethoden oder Gast-Einzelfallergebnisse. Diese Angaben werden nicht aus älteren Prüfungen ergänzt. Ein gesonderter VoiceOver-Nachweis bleibt offen. Die akzeptierte geringfügige iPad-Magic-Keyboard-Grenze bleibt erhalten.

Die bereits ausdrücklich akzeptierten Restpunkte T06-H01 zur technischen Datenquellenzeile und B11-H01 zum Zusatztext einer frühen Zeitgrenzsperre bleiben für den [Folgerelease](../ux/README.md) vorgemerkt. Die akzeptierte Zeitpunktabweichung der T07-Mischbetriebsprüfung bleibt dokumentiert. Die Q-Abnahme behebt diese Befunde nicht und verändert keine historischen Einzelbelege. Die Feldhöhenkorrektur #50 ist Bestandteil des abgenommenen MVP09-Pakets.

## Bestätigte Outlook-Wiederverwendung

Die bisherigen Importnachweise werden ausschliesslich für die unveränderten Termineigenschaften wiederverwendet: ganztägiger Termin, exklusiver Folgetag als Ende, freie Verfügbarkeit, Kategorie `Fristablauf`, relative Erinnerung `-PT112H` und lokaler ICS-Download ohne Teilnehmende oder Einladung.

Kalenderserialisierung, Datumsarithmetik und Sprachdatei sind nach dem gebundenen Vergleich mit MVP08 bytegleich. Die zusätzlichen administrativen Berechnungswege, die Qualifikationsbindung und die ergänzte rechtliche Herkunft sind durch die aktuellen lokalen und E-/Q-Prüfungen belegt. Acht tatsächliche Kalenderdownloads sind gespeichert und bytegeprüft. Ein neuer Outlook-Import wurde nicht durchgeführt.

Die Grenzen des ursprünglichen Vorschlags bleiben bestehen. Erinnerungszustellung, Sommerzeitverhalten, aktuelle Outlookversionen und die Darstellung der neuen Herkunftszeile wurden nicht erneut in Outlook beobachtet. Der Kategoriename erzwingt keine kontospezifische dunkelgrüne Farbe. Der ursprüngliche Vorschlag und sein maschinenlesbarer Vergleich bleiben als damaliger Entscheidungsgegenstand unverändert. Diese Notiz dokumentiert die anschliessende menschliche Annahme.

## Übergang zu R09-D

Die [lokale Publikationsvorprüfung](publikationsvorpruefung-mvp09.md) prüft die Quell- und Artefaktbindung, den notwendigen öffentlichen Dateiumfang, private Rohbelege und Sicherungen, die Portabilität der öffentlichen Prüfungen sowie die lebenden Einstiegs- und IT-Unterlagen. Rechenlogik, Rechtsdaten und die abgenommenen E-/Q-Artefakte bleiben erhalten.

Zusätzliche Commits, GitHub-Push, temporäre Schreibzugänge und P-Bereitstellung benötigen ihre gesonderten Freigaben. Die bisherige Header-/Cache-Risikoakzeptanz für MVP08 ist nicht automatisch auf MVP09 erweitert. Vor P sind frische Sicherung, Bestands- und Headerprüfung sowie die zielbezogene Prüfmatrix vorgesehen.

David Steimer nimmt Fachverantwortung und Abnahme in Personalunion wahr. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
