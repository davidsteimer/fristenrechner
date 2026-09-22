# QA AP18B-04, Sprachergänzung V0.11

Prüfdatum: 13. September 2026. Rein sprachliche Ergänzung auf Nutzerauftrag. Arbeitsmappenvertrag 0.5.0, Rechtsregeln und produktiver Betrieb unverändert.

## Gebundene Dateien

- Ausgang V0.10, unverändert: SHA-256 `bba15a8f6e7b6956662d00bb1b7efb51903ad19aa2b2d1dc29c42a7fd9361e4e`
- Geprüfte Zielkopie V0.11: SHA-256 `37d33d4639cc839fc41c9850de8e6551d546167fe8b9ee7f10ea5f2c062d99fd`

Die ursprüngliche V0.10 wird nicht überschrieben. Die frühere V0.9 bleibt ebenfalls erhalten. Neun Blätter und acht native Excel-Tabellen unverändert.

## Sprachvollständigkeit

315 vorher leere Eingabesprachfelder ergänzt, davon 6 Gemeinwesen, 39 Geltungsbereiche, 84 Gebietszuordnungen und 186 Feiertagsregeln. Die bereits vorhandenen Übersetzungen bleiben erhalten. 204 abhängige Kalenderfelder erhalten über unveränderte Formeln die ergänzten Namen. Sieben Übersichtstexte dokumentieren Version, Sprachherkunft und Nutzerprüfung.

Der unabhängige Prüfer bestimmt die zulässigen Änderungen aus der tatsächlichen V0.10, nicht aus der Liste des Erzeugungsprozesses. Prüfung aller 2580 vorgesehenen Eingabesprachfelder und aller 1932 Kalender-Sprachfelder: keine Lücke, kein Platzhalter «Noch zu erfassen». Die 315 neuen Bezeichnungen sind als provisorische Produktübersetzungen ohne amtliche Sprachbehauptung dokumentiert.

## Tests und Erhaltung

- 356 Modelltests bestanden, darunter neun neue Tests für Sprachlücken, vorhandenen Wortschatz, Gemeindeaufzählungen, Elision und Erhaltungsgrenzen.
- Unabhängiger Prüfer akzeptiert eine korrekte In-memory-Testfassung und verwirft zwölf manipulierte Varianten. Keine manipulierten Arbeitsmappen ausgeliefert.
- Tatsächlich gespeicherte Zielkopie erneut mit der Tabellenbibliothek eingelesen. Sprachänderungsprobe wirkt in den abhängigen Kalenderfeldern und ist vollständig zurückgesetzt.
- Jahreswechsel auf 2028 geprüft, einschliesslich Bundesfeiertag, anschliessend Anzeigejahr 2027 wiederhergestellt. Formelfehlersuche ohne Treffer.
- Alle 5811 Formelausdrücke unverändert. Von ihren gespeicherten Ergebnissen ändern sich nur die 204 bezeichneten Sprachwerte. Die übrigen 5607 Formeln samt Ergebnissen bleiben unverändert.
- Alle 3536 Zahlen- und Datumszellen gegenüber der Referenz unverändert. Keine Änderung von Rechts-, Fach-, Freigabe- oder Exportstatus.
- Exakt 526 geänderte Zellen und 25668 unveränderte Zellen. Stile, Zeilenhöhen, Tabellen, Validierungen, Filter, Schutz, Namensdefinitionen und sonstige native Objekte erhalten. Sämtliche übrigen Paketbestandteile bytegleich.
- Keine Makros oder externen Datenverbindungen. Der unabhängige Prüfer schreibt ausschliesslich einen JSON-Prüfbeleg und verändert keine Arbeitsmappe.

Der Spreadsheets-Skill steuert die enge Bearbeitung im bestehenden Builder mit der gebündelten Tabellenbibliothek. Der bereits vorhandene native Adapter übernimmt ausschliesslich dort erzeugte Sprachwerte und Ergebnisse in die unveränderte Excel-Struktur. Kein unabhängiger zweiter Inhaltsgenerator.

## Sichtprüfung

Alle 52 Ansichten der geänderten Sprachbereiche, ihrer Kalenderabhängigkeiten und der Übersicht wurden aus der gespeicherten Zielkopie erzeugt und tatsächlich geöffnet. Die 14 Gebiets- und Übersichtsansichten, 18 Regelansichten und 20 Kalenderansichten sind visuell ohne Befund geprüft. Keine abgeschnittenen Namen, überlagerten Texte oder sichtbaren Formelfehler. Auch die mehrzeiligen Gemeindegruppen und längeren Genfer Feiertagsbezeichnungen sind vollständig lesbar. Keine zusätzliche Formatänderung erforderlich.

Die finalen Ziel- und Referenzhashes wurden nach Abschluss erneut überprüft und sind unverändert. Die drei lokalen Sichtprüfvermerke liegen mit den technischen Belegen unter `.work/ap18b-04-labels/`.

## Grenzen

Die technische Neuberechnung und Sichtprüfung sind kein neuer Bedienungstest in Microsoft Excel. Eine unabhängige Sprachabnahme, insbesondere der provisorischen RG-Bezeichnungen, wird nicht behauptet. Die deutsche Projektdokumentation und Fachhinweise werden nicht als vollständig übersetzt ausgewiesen.

Die fünf offenen Kalenderfragen in AR, AI, GL und NE bleiben sichtbar und unverändert. Die Sprachvollständigkeit ist weder eine Kalender-Vollständigkeitsfreigabe noch eine Produktaktivierung. Keine Veröffentlichung, kein produktiver Export und keine Änderung von SharePoint, Teams oder steimer.ch.

## Reproduktion

Mit den gebündelten Node-/Python-Runtimes und der vorhandenen auf diese Bibliotheken gerichteten Task-Verknüpfung:

```text
node scripts/build-ap18a-workbook.mjs --complete-languages
python3 scripts/finalize-ap18b-labels.py --complete-languages
node scripts/build-ap18a-workbook.mjs --complete-languages --verify
python3 scripts/check-ap18b-complete-labels.py
```

Die lokalen Nachweise liegen unter `.work/ap18b-04-labels/`. Bestehende Erfassungsmodelle, frühere Sprachergänzungen und Buildermodi bleiben unverändert reproduzierbar.

[Fachliche Rückmeldung und Sprachergänzungsauftrag](../../docs/fachrecht/sprachergänzung-ap18b-04.md)
