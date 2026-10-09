# MVP 0.7 · Vorschlag zur Wiederverwendung der Outlook-Nachweise

Stand: 9. Oktober 2026. **Technisch begründeter Vorschlag, noch keine Wiederverwendungsabnahme durch David Steimer.** Die lokale Prüfung findet keinen technischen Hinderungsgrund, die gebundenen früheren Outlook-Importnachweise für den unveränderten Terminvertrag wiederzuverwenden. Die [Q-Abnahme MVP 0.7](abnahme-q-mvp07.md) enthält diesen gesonderten Entscheid nicht.

## Gegenstand und Vorbelege

Geprüft ist Anwendung `0.7.0`, SPFx-Paket `0.7.0.2`, SHA-256 `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db`, mit Datenrelease `2026-10-08-mvp-07-approved.1` und Manifest SHA-256 `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597`.

Der [Outlook-Nachweis MVP 0.5](outlook-pruefung-mvp05.md) dokumentiert den tatsächlichen Webimport einer Q-Teams-Datei, die gespeicherten Terminfelder und die anschliessende gezielte Bereinigung. Die Originaldatei mit 664 Bytes und SHA-256 `de0dac98c87cac07637b745c369d48f85bd5bc6234fbef121dc6cd745298717c` wurde jetzt erneut zugeordnet und gehasht. Der historische Datensatz bestätigt den ganztägigen 28.09.2026, exklusives Ende am 29.09.2026, freie Verfügbarkeit und 6’720 Erinnerungsminuten. Die damalige sichtbare Ereignisansicht bestätigt die Kategorie `Fristablauf`. Die damalige Desktop-Prüfung bleibt Davids manueller Benutzernachweis mit dessen ursprünglicher Detailtiefe.

Die [MVP-0.6-Abnahme](abnahme-q-mvp06.md) enthält eine ausdrückliche releasebezogene Wiederverwendung dieser Vorbelege. Dieser Entscheid wird nicht automatisch auf MVP 0.7 übertragen. Die damals gebundenen Belegdateien sind unverändert. Zusätzlich stimmen alle 28 archivierten MVP-0.6-Exportdateien weiterhin mit ihren damaligen Prüfsummen und Bytezahlen überein. Das ist eine heutige lokale Archivkontrolle, kein erneuter Hostexport oder Outlookimport.

## Tatsächlicher Codevergleich

Verglichen wurden die damalige kopierte SPFx-Produktquelle von MVP 0.5 sowie die eingefrorenen Baueingänge von MVP 0.6.0.0, 0.6.0.1, 0.7.0.0 und 0.7.0.2. Keine auf heutige Quellen zeigende historische Verknüpfung wurde als Altbeleg verwendet. Die folgenden Bestandteile sind in allen fünf Ständen bytegleich:

| Bestandteil | Bytes | SHA-256 |
| --- | ---: | --- |
| `calendarExport.ts`, einschliesslich lokalem Download | 4’934 | `aaec9be40831ef89b194477c1295ecb1019f6eb06e255d030404872a2ba59984` |
| Verwendete Datumshilfe `core/date.ts` | 4’847 | `0d8d57c2ae860df8f323191a6d0ae86734977d23474b00e18ac5abb6827074dc` |
| Extrahierter Funktionsblock `CalendarExportTile` | 1’702 | `33c7349039aebb42e5b7c6f0d1090746c9749d781b2f05663a281288fc330a45` |
| 18 Kalender-Textzeilen DE/FR, mit LF verbunden | 1’426 | `94b2479cda7dba9133c3118450a50eac8f158bcc5df8ad33d9840dc94c3b7a58` |

Die Kachel erhält weiterhin das berechnete `finalEnd` beziehungsweise `finalDeadline.date`, Sprache und optionale Referenz. Der Termin bleibt ganztägig mit exklusivem Folgetag, transparent/frei, Kategorie `Fristablauf` und relativer Erinnerung `-PT112H`. Die Übertragung bleibt eine lokale ICS-Datei ohne Graphzugriff, Teilnehmende oder Einladung.

**Nicht unverändert ist die gesamte Anwendung.** MVP 0.7 ergänzt die qualifizierte Kalenderbindung und Exportfreigabe sowie die neue Datumseingabe. Der gebundene Ergebnisweg verlangt `calendarExportAllowed` und schliesst reine Referenzresultate aus. Geänderte Datumstexte verwerfen Resultat und Referenz unmittelbar. Beim Berechnen werden die montierten Datumsfelder zuerst zu einem konsistenten Eingabestand zusammengeführt. Diese vorgelagerten Änderungen sind nicht durch einen alten Outlookimport abgedeckt. Sie werden durch die neuen [E-/Q-Hostnachweise](eq-vollzugsnachweis-mvp07-0702.md) und die nachstehenden lokalen Prüfungen gestützt. Fachliche Berechnung, Datenbindung und Exportberechtigung bleiben eigenständige Prüfumfänge.

## Aktuelle Dateiexporte und lokale Tests

Alle acht tatsächlich gespeicherten E-/Q-Dateien wurden nochmals mit dem unveränderten ICS-Prüfer gegen ihre eigenen Prüfberichte kontrolliert. Geprüft wurden die exakten Titel und Referenzen, Ganztagesdaten und exklusiven Enddaten, UID/DTSTAMP, UTF-8, CRLF, Zeilenfaltung, freie Verfügbarkeit, Kategorie, Erinnerung und das Fehlen unerwarteter Teilnehmender, Anlagen oder Wiederholungen.

DE/F01 betrifft den 28.09.2026 mit exklusivem Ende 29.09.2026, FR/F02 den 09.12.2026 mit exklusivem Ende 10.12.2026. Unterschiedliche Referenzen, UIDs und Erstellungszeitpunkte sind beabsichtigt. Die Dateien sind deshalb nicht untereinander oder mit der alten Importdatei bytegleich.

| Host / Sprache | Bytes | SHA-256 der tatsächlichen Archivdatei |
| --- | ---: | --- |
| E-SP DE | 690 | `7f20c717e5fadffe17bd44bfa2cb84afb89c3e48d406115d9eed98f8e8803276` |
| E-SP FR | 722 | `c46edad0c043c4f2f6db10817099d5a77cca54ebf774ade7c62e0813c260816a` |
| E-T DE | 688 | `14c5b3d1948115ce25a13caa524d3d7e2d363ba44ee06b4e4ced20e9397d0b26` |
| E-T FR | 720 | `fed9291369127e2e176bfd74aff62af4856527afd5a82283d5da63a88fde4112` |
| Q-SP DE | 684 | `3d97767a95bb78e5b43e5e935befe1a7aef842e86b1b3a0ff6069c540f65255c` |
| Q-SP FR | 716 | `a1e0f347845e0e78d7b78121976516947bafbd187d998c3e92920d2d175a7a7d` |
| Q-T DE | 682 | `49faaf681e67994119e00ff43dac5f2284dacc6b264d1bdb0a9098361ee6f45a` |
| Q-T FR | 714 | `7e3c596864b89610d99d173b857549ea06c76cb84bbf4a54cb5d2943adcedda4` |

Heute erneut ausgeführt und **27/27 bestanden**, keine übersprungenen Tests:

- Sieben Kalenderexporttests für Terminvertrag, Monats-/Jahres-/Schaltjahrgrenzen, DE/FR-Sonderzeichen, Zeilenfaltung, 112-Stunden-Trigger und den lokalen Blob-Download mit Test-DOM.
- Fünf Tests der atomaren Datumsübernahme, ungültiger bzw. gelöschter Eingaben und der zulässigen Datumsrollen.
- Fünfzehn Tests der Kalenderoberfläche, darunter Exportgates, Zustandsverwerfung, regionale Qualifikation und Januarvergleiche ohne definitives Resultat oder Export.

Die Testquellen stimmen mit dem archivierten MVP07-Prüfeingang überein. Alle 60 im Korrektur-Baubeleg aufgeführten Produktquelldateien unter `src/` stimmen mit dem tatsächlichen Archiv 0.7.0.2 und den für diese lokalen Tests verwendeten Quellen überein. Die lokalen Tests sind keine neuen Browser-, Geräte- oder Outlookprüfungen.

## Vorschlag und Grenzen

**Vorschlag an David:** Die früheren Outlook-Web- und Desktopnachweise für MVP 0.7 begründet und auf den unveränderten ICS-Terminvertrag begrenzt wiederverwenden. Ein erneuter Import ist aus dem geprüften Code- und Dateidelta nicht technisch erforderlich. Der Entscheid bleibt offen, bis David diese Wiederverwendung ausdrücklich bestätigt.

Dabei bleiben folgende Grenzen bestehen:

- Kein Nachweis aktueller Outlook-Oberflächen- oder Versionsidentität. Ein neuer Kompatibilitätsbefund oder geänderter Export-/Importvertrag verlangt eine neue Bewertung.
- Keine neu beobachtete tatsächliche Erinnerungszustellung und keine zusätzliche DST-Prüfung in Outlook. Der bisher akzeptierte Unterschied der lokalen Erinnerungszeit über Sommerzeitwechsel bleibt bestehen.
- Der Kategoriename in ICS erzwingt keine kontounabhängige dunkelgrüne Farbe. Keine Kategorien- oder Mailboxeinstellungen wurden verändert.
- Keine nachträgliche Ausweitung der früheren Desktop-Benutzerbestätigung. Kein zusätzlicher Importnachweis für die französische Outlook-Oberfläche wird erfunden.
- Neue E-/Q-Dateiexporte ersetzen keine P-Hostprüfung. Das spätere passende Webartefakt und dessen öffentliche Exportprüfung bleiben separat zu binden.
- Die offengelegten F08-/T09-Nachweisgrenzen und die Detailgrenzen der menschlichen Geräte-/Gastbestätigung bleiben unverändert. Diese Bewertung ergänzt weder eine materielle Rechtsfreigabe noch eine pauschale technische Q-Abnahme.

Der private strukturierte Nachweis bindet sämtliche Quell-, Datei- und Belegpfade sowie den lokalen Testlauf. Seine SHA-256 lautet `b607ab972be32818407805ded5eaf7408214e2063a4f118e9ac34e5febe017ae`. Private Rohbelege, Kontodaten und Ereigniskennungen gehören nicht zum öffentlichen Bericht. Es wurden kein Outlooktermin angelegt, verändert oder gelöscht, keine Netzwerk- oder Browseraktionen ausgeführt und keine bestehenden Nachweise verändert. Die Bewertung erteilt keine GitHub-, Deploy-Key- oder P-Freigabe und schliesst nicht den gesamten R07-D-Schritt ab.
