# R10-P · Begrenzte Nacharbeit nach MVP 0.10

Stand: 30. Oktober 2026. Backlognachtrag aus der tatsächlichen P-Prüfung. David hat die beiden folgenden neuen Befunde einzeln begrenzt akzeptiert und die Fortsetzung mit dem unveränderten Paket erlaubt. Die endgültige P-Betriebsfreigabe hat er am 30.10.2026 gesondert unter ausdrücklicher Beibehaltung dieser Restbefunde erteilt. Anschliessend hat er die öffentliche Veröffentlichung dieses Eintrags zusammen mit dem Produktionsnachweis beauftragt. Die Nacharbeit bleibt offen. Keine Korrektur am abgenommenen Paket und keine neue GitHub-Karte durch diesen Eintrag.

## R10P-D08-H01 · Datierte Fedlex-Links

Drei in der Rechenspur tatsächlich angebotene Links führen nach dem Laden der Fedlex-Anwendung zu «Error Page (404)»:

| Erlass / bezeichnete Fassung | Betroffene Adresse |
| --- | --- |
| ELG, 01.01.2026 | `https://www.fedlex.admin.ch/eli/cc/2007/804/20260101/de` |
| AHVG, 01.01.2026 | `https://www.fedlex.admin.ch/eli/cc/63/837_843_843/20260101/de` |
| ATSG, 01.01.2024 | `https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de` |

HTTP 200 der JavaScript-Apphülle ist kein erfolgreicher Erlassabruf. Die tatsächlichen P-Berechnungen und Kalenderdateien funktionieren mit den eingebetteten Daten. Der aktuelle ATSG-Link lädt das richtige Dokument. Damit ist nur die begrenzte Fortsetzung gerechtfertigt, keine generelle Freigabe nicht erreichbarer Quellen.

Nacharbeit für den Folgerelease:

- Für jede betroffene Quellenbindung einen funktionierenden amtlichen Verweis auf die fachlich freigegebene Fassung ermitteln. Nicht blind durch «aktuelle Fassung» ersetzen.
- Erlassidentität, Fassungsdatum und referenzierte Normen prüfen. Falls eine andere Fassung oder Quellenbindung notwendig wird, fachliche und technische Datenfreigabe gesondert behandeln.
- Die tatsächlich gerenderte Zielseite beziehungsweise den amtlichen Volltext prüfen. HTTP-Status allein genügt nicht. Die drei Fehlseiten als Regression der Linkprüfung berücksichtigen.
- DE-/FR-Rechenspur und Herkunft in Kalenderdateien kontrollieren. Keine Änderung von Berechnung, Sperren oder zeitlicher Abdeckung durch die Linkkorrektur.

Abnahme: Die angebotenen Links führen zur nachvollziehbar bezeichneten amtlichen Grundlage, die verwendete Fassung bleibt eindeutig. Positive und gesperrte ELG-/AHVG-/ATSG-Fälle sowie Exportherkunft bleiben korrekt. Keine Heilung dieses Befunds durch blosses Unterdrücken der Links.

## R10P-D09-H01 · Kalenderdialog, Fokus und aria-hidden

Chrome meldet beim Öffnen beziehungsweise Schliessen des Fluent-UI-Kalenderdialogs einen Konflikt zwischen fokussiertem Datumsfeld und `aria-hidden` an dessen Vorfahren. Die Kalenderauswahl, Escape, Rückkehr des Fokus ins Datumsfeld und anschliessendes Tab zum nächsten Feld funktionieren im tatsächlichen P-Nachtest. Eine Auswirkung auf Screenreader ist damit nicht ausgeschlossen. Es liegt keine neue VoiceOver-Prüfung vor.

Nacharbeit für den Folgerelease:

- Tatsächliche Fokusfolge und Lebenszyklus des Dialogs untersuchen. Keine Ursache allein aus der Konsolenmeldung als bewiesen behandeln.
- Fokus so führen, dass kein fokussiertes Element in einem für assistive Technik verborgenen Teilbaum verbleibt. Dialog öffnen, Datum wählen, abbrechen und schliessen getrennt prüfen.
- Tastaturablauf mit Tab, Umschalt+Tab und Escape sowie die Fokusrückkehr verifizieren. Gezielt mit VoiceOver prüfen und verwendetes Gerät, Browser und Version dokumentieren.
- Bestehende Datumskurzformen, frühe Eingabe, Ungültigkeitsbehandlung, DE/FR, 32/14-Desktopmasse und 44/16-Touch-Sollwerte erhalten. Keine Änderung an Fristenregeln oder Kalenderexport.

Abnahme: Kein entsprechender Fokus-/`aria-hidden`-Konflikt im geprüften Ablauf, verständlich angekündigter Dialog und nachvollziehbarer Fokus mit Tastatur und Screenreader. Eine unauffällige Konsole allein ersetzt die Screenreaderprüfung nicht.

## Abgrenzung

Die beiden bekannten BL-/VD-Textbefunde bleiben im bestehenden [R10-C-Nachtrag](r10c-restbefunde.md). Der dokumentierte Header-/Cachebefund wird gemäss Betreiberentscheid nicht erneut geprüft. Alle vier Produktbefunde sind eng begrenzte Akzeptanzen für das unveränderte MVP-0.10-Paket, keine Dauerfreigabe oder bereits erledigte Korrektur. Der [Produktionsnachweis](../betrieb/produktionsbereitstellung-mvp10-2026-10-30.md) bindet Ergebnisse und Entscheidgrenzen.
