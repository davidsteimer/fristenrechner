# MVP 0.5 · Abschluss der Outlook-Prüfungen

Stand: 28. September 2026. **T15 Outlook Web bestanden. T16 Outlook Desktop durch David als manuell geprüft bestätigt.** Diese Nachweise ergänzen die 123 technischen E-/Q-Punkte und werden nicht zu deren Zählung addiert.

## Auftrag und Bindung

David Steimer erklärte nach der Q-Abnahme:

> Outlook Desktop ist manuell geprüft. Die Outlook-Webprüfung ist freigegeben. Falls diese positiv, bitte das Paket abschliessen.

Die Erklärung bezieht sich auf den übergebenen Stand: SPFx `0.5.0.0` mit Datenrelease `2026-09-28-mvp-05-approved.1`. Der Paketabschluss ist lokal autorisiert. GitHub-Push, neue Schlüssel, P-Bereitstellung oder Hostingänderungen folgen daraus nicht.

## T15 · Tatsächlicher Import in Outlook Web

Verwendet wurde die bereits aus der tatsächlichen Q-Teams-Instanz heruntergeladene, unveränderte ICS-Datei für den StPO-Kontrollfall mit Zustellung 16.09.2026 und zehn Tagen. Dateibindung: 664 Bytes, SHA-256 `de0dac98c87cac07637b745c369d48f85bd5bc6234fbef121dc6cd745298717c`.

Der Test erfolgte über die reguläre Outlook-Web-Oberfläche im primären Kalender des bestätigten Eigentümerkontos. Vor dem Import lieferte die unabhängige exakte Betreffabfrage null Treffer. Die Vorschau allein wurde nicht als erfolgreicher Import gewertet. Erst der tatsächlich gespeicherte Kalenderdatensatz und seine geöffnete Ereignisansicht bilden den Nachweis.

| Eigenschaft | Beobachtung |
| --- | --- |
| Betreff | `Fristablauf (QA-MVP05-EQ)` |
| Datum | 28.09.2026, ganztägig |
| Exklusives Enddatum | 29.09.2026 im gespeicherten Datensatz |
| Verfügbarkeit | `Free` beziehungsweise `Verfügbar` |
| Kategorie | `Fristablauf` in der Kalender- und Ereignisansicht |
| Erinnerung | `4 Tage 16 Stunden vorher` im Ereignisformular, unabhängig 6’720 Minuten im Kalenderdatensatz bestätigt |
| Teilnehmende | Keine, keine Besprechungseinladung versandt |
| Bereinigung | Ausschliesslich der zugeordnete Testtermin über die normale Löschfunktion entfernt. Anschliessende exakte Kalenderabfrage: null Treffer, keine offene Pagination |

Die gespeicherten Terminfelder wurden nur gelesen. Keine Korrektur des importierten Datums, der Kategorie oder Erinnerung und keine Änderung von Mailbox- oder Kategorienfarbeinstellungen. Andere Termine und bestehende Erinnerungen wurden nicht bearbeitet. Der gelöschte Testtermin wurde nicht aus «Gelöschte Elemente» endgültig entfernt und kann gegebenenfalls über Outlook wiederhergestellt werden.

Die relative Erinnerung ist korrekt gespeichert. Eine zeitgesteuerte Erinnerungsauslieferung sowie die Anzeige über einen Sommerzeitwechsel wurden in diesem Importtest nicht neu beobachtet. Die bereits akzeptierte DST-Grenze bleibt unverändert. Ein Kategorie-Name in einer ICS-Datei erzwingt keine kontounabhängige Kategorienfarbe.

Private Nachweise binden Originaldatei, Ereigniskennung, Kalenderantwort, sichtbare Eigenschaften und erfolgreiche Bereinigung. Kontoadressen und Ereignis-IDs werden nicht in diesen öffentlichen Text übernommen.

## T16 · Outlook Desktop

David hat die manuelle Desktop-Prüfung ausdrücklich bestätigt. Sie wird als Benutzernachweis geführt, nicht als durch Codex erneut ausgeführter Desktop-Test. Der Nutzer hat keine einzelnen Desktop-Prüfschritte, Testreferenzen oder Bereinigungsdetails genannt. Diese werden nicht erfunden und nicht aus T15 übernommen.

## Ergebnis und Folge

Die Outlook-Restpunkte für MVP 0.5 sind mit diesen unterschiedlichen Nachweisarten abgeschlossen. Frühere MVP-0.4-Berichte mit offenen Importtests bleiben historische Momentaufnahmen. Die [Q-Abnahme](abnahme-q-mvp05.md), die [E-/Q-Prüfung](eq-installation-mvp05.md) und dieser Nachtrag bilden gemeinsam die Grundlage für den beauftragten lokalen Publikationspaketabschluss. Öffentliche Publikation und P bleiben gesonderte Haltepunkte.
