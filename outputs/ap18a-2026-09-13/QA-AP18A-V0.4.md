# AP18A V0.4: Strukturierte Gebietszuordnungen

Stand: 13. September 2026. David Steimer hat dem Vorgehen zugestimmt, die tabellarische Erfassung beizubehalten und Rechtsgeber von räumlichen Geltungsbereichen zu trennen. Dieser Beschluss ist keine Gesamt-Abnahme von AP18A und keine neue fachliche Freigabe der Pilotdaten.

## Identität und Herkunft

- Datei: `2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.4.xlsx`
- SHA-256: `11f47723d4bd9961e177bf0401c015899f41d847e56a32141d72bf82876cd597`
- Ausgangsdatei: tatsächlich gespeicherte V0.3, unverändert erhalten
- SHA-256 der V0.3: `7fc8663e35e5f579b951da75fdc57e364d6a3dff8758cbb9f564a0e2fed22bfc`
- Die V0.1 und V0.2 bleiben ebenfalls unverändert erhalten.

## Eng begrenzte Änderung

Das neue Blatt **Gebietszuordnungen** steht direkt nach **Geltungsbereiche**. Es enthält sechs vorbereitete Zuordnungen zu den fünf bestehenden CH-/BE-/AG-Geltungsbereichen. Die Einträge erfassen stabile interne Gebietskennungen, Gebietstyp, übergeordnetes Gebiet, Ein- oder Ausschluss, Gültigkeit, Quellenbezug und Prüfstatus. Die Sprachfelder stehen zusammenhängend in der Reihenfolge Deutsch, Französisch, Italienisch, Rumantsch Grischun.

Das Beispiel «Bezirk Baden ohne Bergdietikon» wird als Einbezug des Bezirks und ausdrücklicher Ausschluss der Gemeinde erfasst. Bergdietikon erhält im eigenen Geltungsbereich einen separaten Einbezug. Alle sechs neuen Zuordnungen stehen auf `open`. Amtliche Kennungen bleiben leer, solange sie nicht verifiziert sind. Die vorbehaltenen Typen Ortsteil und Gebietsgruppe ergänzen keine weiteren Pilotgebiete und bewirken keine automatische Gebietsauflösung.

Bestehende Texte ändern nur in vier Zellen: Übersicht A6, A30 und A36 sowie Rechtsquellen H11. Bei Rechtsquellen E11 bleibt die Beschriftung «Amtliche Quelle öffnen» erhalten, das native Hyperlinkziel wird auf die geprüfte neue BJ-Adresse gesetzt. Der Quellenbezeichner und das Datum des BJ-Dokuments bleiben unverändert. Es handelt sich weiterhin um methodische Hinweise von 2012, nicht um eine aktuelle Feiertagsvollerhebung.

Keine neuen kantonalen Feiertagsregeln, keine eigenständigen kommunalen Rechtsquellen, keine Ortssuche und keine automatische Fristenwirkung werden eingeführt. Die App, ihre Produktsprachen, Laufzeitdaten, Releases, Mirror und Hosting bleiben unverändert.

## Technische und visuelle Prüfung

| Prüfung | Ergebnis |
| --- | --- |
| Unabhängiger Bestandsvergleich | 3123 bestehende Zellen unverändert, genau vier gezielte Textänderungen |
| Formeln | Alle 210 bestehenden Formeln und ihre gespeicherten Ergebnisse unverändert |
| Native Bestandsfunktionen | Zellstile, Schutz, Validierungen, bedingte Formatierungen, Tabellen, Fixierungen und übrige Blattmetadaten erhalten |
| Neue Struktur | Neun Blätter, acht native Excel-Tabellen. Neues Blatt an der vereinbarten Position |
| Neue Eingaben | Sechs Zuordnungen, 18 Felder, 108 tatsächlich entsperrte Eingabezellen. Drei Listenvalidierungen und sieben Regeln für bedingte Formatierung |
| Quellenlinks | Fünf native Quellenhyperlinks erhalten. Nur das BJ-Linkziel geändert |
| Modelltests | 48 bestehende Modell- und Referenztests sowie 37 neue Zuordnungstests bestanden. 85 Tests, keine Fehler und keine übersprungenen Tests |
| Datumsergebnisse | 45 Vergleiche für 15 Regeln in den Jahren 2026–2028 bestanden. Nach Wiederimport der final gespeicherten Datei nochmals 45 Vergleiche bestanden |
| Übersichtsindikatoren | Weiterhin 27 Gemeinwesen, zwölf Referenzregeln und drei offene AG-Beispiele |
| Fehlerprüfung | Keine Formel-Fehlertreffer bei Berechnung und Wiederimport, keine gespeicherten Fehlerzellen |
| Paketintegrität | Interne Paketverknüpfungen auflösbar, keine Makros und keine externen Datenverbindungen |
| Sichtprüfung | Fünf Ansichten aus der gespeicherten Datei gerendert und geprüft |
| Native Excel-Interaktion V0.4 | Nicht separat durchgeführt. Die bisherigen Nutzerbestätigungen werden nicht auf die neue Fassung übertragen |

Die Spreadsheet-Skill bestimmt die Bearbeitung über die vorhandene Tabellenbibliothek sowie Wiederimport, Neuberechnung und Sichtprüfung der gespeicherten Datei. Ein begrenzter OOXML-Nachschritt erhält die nativen Bestandsmerkmale und ergänzt den Zellschutz des neuen Blatts. Der unabhängige, rein lesende Prüfer `scripts/check-ap18a-areas.py` vergleicht das Ergebnis mit der unveränderten V0.3.

Die Zuordnungstests prüfen den vorbereiteten Erfassungsstand. Sie sind kein vollständiger XLSX-Importer, kein Geocoder und kein Freigabevalidator für spätere manuelle Bearbeitungen.

## Gerenderte Änderungsansichten

- [Übersicht](qa-v04/saved-01-Übersicht.png)
- [Rechtsquellen](qa-v04/saved-02-Rechtsquellen.png)
- [Gebietszuordnungen: Gebiete und Einbezug](qa-v04/saved-03-Gebietszuordnungen.png)
- [Gebietszuordnungen: Gültigkeit und Nachweis](qa-v04/saved-04-Gebietszuordnungen.png)
- [Gebietszuordnungen: Hinweise und Abgrenzung](qa-v04/saved-05-Gebietszuordnungen.png)

Der Beschluss und die Felddefinitionen sind im [Arbeitsmappenvertrag V0.4](../../docs/architektur/feiertagsmatrix-ap18a.md) dokumentiert. Es wurden keine Commits veröffentlicht und keine Installations- oder Betriebsumgebungen verändert.
