# MVP 0.5 · Lokale Browserstichprobe

Datum: 28. September 2026. Tatsächlicher statischer Releasebuild unter `http://127.0.0.1:8795/fristenrechner/`, Chrome. App `0.5.0`, sichtbarer Datenrelease `2026-09-28-mvp-05-approved.1`. Keine E-/Q- oder P-Prüfung.

| Prüfung | Beobachtung |
| --- | --- |
| Erstaufruf | Empfangsdatum leer. Freigegebene Release-ID sichtbar, kein Kandidatenbanner |
| StPO | Direkte Zustellung 16.09.2026, zehn Tage, Kanton Bern ergibt 28.09.2026. Rechnerisches Ende 26.09.2026, Fristbeginn 17.09.2026, Endverschiebung sichtbar |
| Erlasswechsel | Datum bleibt beim Wechsel StPO → VRPG → Sozialversicherungsrecht → ELG erhalten. Altes Resultat wird entfernt |
| ELG | Individuelle Bundes-Ergänzungsleistungen, Einsprache gegen Verfügung, geklärte individuelle Zustellung 16.09.2026, zuständiger Kanton BE, Partei BE ohne Vertretung, 30 Tage ergibt 16.10.2026 |
| Oberfläche | Zweispaltiges Formular und Ergebnisraster visuell geprüft. Vier Aktionen in zwei Zeilen. Keine redundante Dokumentauswahl oder zusätzliche Bestätigungscheckbox |
| Französisch | Sprachwechsel übersetzt Eingaben, Parameter und Ergebnis. Enddatum bleibt 16.10.2026 |
| Freigabegrenze | Im gleichen ELG-Fall zuständigen Kanton auf ZH geändert. Ergebnis wird verworfen. Erneute Berechnung liefert auf Französisch den konkreten Blockierungsgrund, kein Enddatum |
| Neuladen | Empfangsdatum wieder leer, kein Ergebnis, Ausgangssprache Deutsch. Keine Standards gespeichert oder zurückgesetzt |
| Konsole | Keine dem lokalen Appcode zugeordnete Warnung oder Fehlermeldung beobachtet. Ein Fehler aus einer installierten Chrome-Erweiterung (`Search engine null is not supported`) wird ausdrücklich nicht als fehlerfreie Gesamtkonsole ausgegeben |

## Grenzen und Werkzeugbefund

Der erste Versuch im eingebetteten Codex-Browser wurde wegen eines Absturzes beim nativen Datumsfeld abgebrochen. Auch die automatische Fill-Funktion befüllte das native Datumsfeld nicht zuverlässig. In Chrome funktionierte die normale segmentweise Tastatureingabe. Der unveränderte Build berechnete danach die genannten Fälle erfolgreich. Die Ursache des eingebetteten Browserabsturzes ist nicht abschliessend diagnostiziert. Dies ist keine pauschale Browserfreigabe.

AVIG und KVG sind hier keine zusätzlichen manuellen Browserfälle. Ihre tatsächlichen freigegebenen Daten und UI-Anbindungen werden durch die automatisierten Core-/UI-/SPFx-Tests geprüft. Kalenderexport und Outlookimport wurden in dieser Stichprobe nicht ausgeführt. Die vollständige E-/Q-Matrix einschliesslich nativer Datumseingabe und realem Dateiexport bleibt nach Installation auszuführen.

Keine Remoteinhalte, Benutzerstandards, M365-Rechte oder Hostingdateien verändert. Der temporäre lokale Server wurde nach der Prüfung beendet.
