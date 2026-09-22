# AP18A V0.3: Zusammenhängende Sprachspalten

Stand: 13. September 2026. David Steimer hat die Funktion der V0.2 bestätigt und angeregt, die zusätzlichen Sprachspalten frühzeitig direkt nach Französisch anzuordnen. Die Gesamt-Abnahme von AP18A wird dadurch nicht vorweggenommen.

## Identität und Herkunft

- Datei: `2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.3.xlsx`
- SHA-256: `7fc8663e35e5f579b951da75fdc57e364d6a3dff8758cbb9f564a0e2fed22bfc`
- Ausgangsdatei: tatsächlich gespeicherte V0.2, unverändert erhalten
- SHA-256 der V0.2: `a06db692fd466d1b6e553ea0e2a255a145aa7bc569c526868746e02f177e964f`
- Auch die V0.1 bleibt mit ihrer bisherigen Prüfsumme unverändert erhalten.

## Eng begrenzte Änderung

| Blatt | Neue Sprachgruppe | Weitere Auswirkungen |
| --- | --- | --- |
| Gemeinwesen | B bis E: Deutsch, Französisch, Italienisch, Rumantsch Grischun | Übrige Felder stehen anschliessend, Fachstatus neu H |
| Feiertagsregeln | D bis G: Deutsch, Französisch, Italienisch, Rumantsch Grischun | Rohdatum neu W, gültiges Datum X, Quellen-ID Y, Fundstelle Z. Osterhilfe AA:AB unverändert |
| Geltungsbereiche | C bis F: Gebiet, Französisch, Italienisch, Rumantsch Grischun | Bisher fehlendes französisches Namensfeld ergänzt, leer und bearbeitbar. Tabelle neu A6:M11 |
| Feiertagskalender | E bis H: Feiertag, Französisch, Italienisch, Rumantsch Grischun | Regel-ID neu K. Namensableitung weiterhin über diese stabile ID |
| Übersicht | A6 und A36 | Revision V0.3 und dokumentierte Nutzerbestätigung der V0.2 |

Keine Übersetzungen ergänzt. Fehlende IT-/RG-Namen bleiben in den Eingabeblättern leer und gelb, im Kalender erscheinen sie weiterhin als «Noch zu erfassen». Die neue französische Gebietsbezeichnung ist ebenfalls leer, gelb und unter Blattschutz bearbeitbar. Die App, ihre Produktsprachen, rechtliche Regeln, Laufzeitdaten und Hosting bleiben unverändert.

## Technische und visuelle Prüfung

| Prüfung | Ergebnis |
| --- | --- |
| Quellenbestand | V0.1 und V0.2 anhand SHA-256 unverändert |
| Formeln | Alle 210 Formeln erhalten. Zell- und Blattbezüge folgen den verschobenen Feldern |
| Unabhängiger Bestandsvergleich | 3121 bestehende Zellen einschliesslich 2909 Nichtformelwerten geprüft. Nur A6/A36 der Übersicht gezielt geändert. Alle Formeln separat tokenisiert und gegen eine unabhängige Positionsabbildung geprüft, ihre gespeicherten Ergebnisse sind unverändert |
| Native Funktionen | Acht Blätter, sieben Tabellen, fünf Quellenhyperlinks, 102 Spaltenmetadaten, Zellstile und Zellschutz, Validierungen, bedingte Formatierungen und Fixierungen erhalten. Neue französische Eingabefelder geprüft |
| Datumsergebnisse | 45 Vergleiche, 15 Regeln für 2026–2028 bestanden. Nach Wiederimport der final gespeicherten V0.3 erneut 45 Vergleiche bestanden |
| Übersichtsindikatoren | Weiterhin 27 Gemeinwesen, zwölf Referenzregeln, drei offene AG-Beispiele |
| Namensableitung | IT-/RG-Prüftexte erscheinen in CH- und geerbter BE-Zeile. Nach Rücksetzen wieder «Noch zu erfassen» |
| Fehlerprüfung | Keine Formel-Fehlertreffer bei Berechnung und Wiederimport, keine gespeicherten Fehlerzellen |
| Regressionssuite | 48 von 48 Modell- und Referenztests bestanden, keine übersprungenen Tests |
| Sichtprüfung | Fünf geänderte Ansichten aus der final gespeicherten Datei neu gerendert und geprüft |
| Native Excel-Interaktion V0.3 | Nicht separat durchgeführt. Die aktuelle Nutzerbestätigung betrifft V0.2 |

Die Bearbeitung nach der Spreadsheet-Skill umfasst Wiederimport, Neuberechnung und Sichtkontrolle der tatsächlich gespeicherten Datei. Weil die dokumentierte Tabellen-API keine strukturelle Spaltenverschiebung anbietet, übernimmt ein begrenzter OOXML-Adapter die Umordnung einschliesslich der nativen Tabellen-, Format-, Schutz- und Prüfmerkmale. Inhalte und Berechnung werden weiterhin mit der Tabellenbibliothek bearbeitet. Die berechneten Werte werden anschliessend unter Erhaltung dieser nativen Merkmale gespeichert. Der bisherige Finalizer mit alten Spaltenpositionen wird nicht verwendet.

## Gerenderte Änderungsansichten

- [Übersicht](qa-v03/saved-01-Übersicht.png)
- [Gemeinwesen](qa-v03/saved-02-Gemeinwesen.png)
- [Feiertagsregeln](qa-v03/saved-03-Feiertagsregeln.png)
- [Geltungsbereiche](qa-v03/saved-04-Geltungsbereiche.png)
- [Feiertagskalender](qa-v03/saved-05-Feiertagskalender.png)

Die Entscheidung und die neuen Spaltenpositionen sind im [Arbeitsmappenvertrag V0.3](../../docs/architektur/feiertagsmatrix-ap18a.md) festgehalten. Die Arbeitsdateien bleiben lokal, ohne Push oder Deployment.
