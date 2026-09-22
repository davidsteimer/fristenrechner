# AP18B-02: Prüfnachweis der RG-Sprachergänzung V0.8

Prüfdatum: 13. September 2026. Ausschliesslich die vom Nutzer gewünschten acht provisorischen Übersetzungen samt zugehörigen Hinweisen. Der fachliche Datenstand und sämtliche Freigabestatus bleiben gegenüber V0.7 unverändert.

[Feiertagsmatrix Schweiz AP18B-02 TI/GR V0.8](2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.8.xlsx)

- SHA-256 V0.8: `d3e3bac17464733fa7bc3c42e63db0b5b42502c177914d6dcd9800ba9320461f`
- SHA-256 der unveränderten V0.7: `a66bfff038a284c99f50337e02609a25718473b7a3d810c8e4c69ee455473c40`
- Arbeitsmappenvertrag unverändert 0.4.0, Auswahljahr unverändert 2027.
- Sprachliche Herkunft und die Unterscheidung zwischen sechs belegten Verwendungen und zwei eigenen Vorschlägen stehen im [Sprachvermerk](../../docs/fachrecht/sprachergänzung-ap18b-02-rg.md).

## Tatsächlich durchgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Unabhängiger Vergleich der gespeicherten XLSX gegen V0.7 | Exakt 21 Textzellen und acht gespeicherte Text-Formelergebnisse geändert, 7'563 Zellen unverändert |
| Regel und Kalender | Alle acht RG-Werte stimmen zwischen Regelzelle und Kalenderanzeige überein. Alle acht Kalenderhinweise nennen die provisorische Produktübersetzung |
| Formelbestand | Alle 1'390 Formeltexte unverändert. 1'382 Formeln auch mit unverändertem Cache |
| Datums- und Rechtsbestand | 884 numerische und Datumszellen sowie 668 Status-, Freigabe- und Exportfelder unverändert |
| Native Excel-Struktur | Neun Arbeitsblätter und acht native Tabellen erhalten. Stile, Zeilenhöhen und alle übrigen Paketbestandteile unverändert |
| Wiederimport der definitiven Datei | Acht Namen und sämtliche deklarierte Textänderungen bestätigt. Keine Formelfehler |
| Dynamische Namensübernahme | Temporärer RG-Testwert in der ersten betroffenen Regel wird im Kalender übernommen, anschliessend ursprünglicher Wert wiederhergestellt. Kein erneuter Export beim Wiederimport |
| Visuelle Kontrolle | Sieben Ansichten aus der definitiven Datei kontrolliert. Namen, Kalenderhinweise, Übersicht und Quellenhinweise vollständig lesbar |
| Modell- und Regressionstests | 201 Tests bestanden, davon vier neue Tests für die provisorische Sprachergänzung. Keine fehlgeschlagenen oder übersprungenen Tests |
| Bestandsschutz | V0.7 nach Erstellung und Prüfung mit unverändertem SHA-256 bestätigt |

Die Bearbeitung und der Wiederimport folgen dem Spreadsheet-Skill. Der eng begrenzte native Übernahmeadapter erhält die Excel-spezifischen Paketbestandteile. Der separate, rein lesende Prüfer kontrolliert den tatsächlichen Unterschied zwischen V0.7 und V0.8, nicht nur das Erstellungsmodell.

Die V0.7-Fach- und Datumsprüfung wird nicht als neue Prüfung sämtlicher Rechtsquellen ausgegeben. Eine erneute native Bedienprüfung in Microsoft Excel wurde für V0.8 nicht durchgeführt. Die acht Namen bleiben provisorische Produktübersetzungen, auch soweit ein Sprachbeleg vorhanden ist. Keine App-Spracherweiterung, kein Runtime-Export, kein veröffentlichter Commit und keine Änderung an E, Q oder P.
