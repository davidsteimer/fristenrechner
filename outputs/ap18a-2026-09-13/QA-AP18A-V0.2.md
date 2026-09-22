# AP18A V0.2: Ergänzung der Sprachfelder

Stand: 13. September 2026. Der zusätzliche Sprachumfang folgt dem Auftrag von David Steimer. Die Gesamt-Abnahme von AP18A und die sprachliche Prüfung der künftigen Bezeichnungen werden damit nicht vorweggenommen.

## Identität und Herkunft

- Neue Datei: `2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.2.xlsx`
- SHA-256: `a06db692fd466d1b6e553ea0e2a255a145aa7bc569c526868746e02f177e964f`
- Unveränderte Ausgangsdatei: `2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.1.xlsx`
- SHA-256 der Ausgangsdatei: `3af259515c502ef563cc3097bce0c7e15147d5158ac9590f95c014bbebd81aa4`

David Steimer hat die erwartete Funktion und problemlose Excel-Interaktion der V0.1 bestätigt. Dieser Nutzertest ist im [ursprünglichen Nachweis](QA-AP18A.md) nachgetragen. Er wird nicht als bereits durchgeführter nativer Interaktionstest der ergänzten V0.2 ausgegeben.

## Eng begrenzte Änderungen

| Blatt | Neue Felder | Verhalten |
| --- | --- | --- |
| Gemeinwesen | H «Italienisch», I «Rumantsch Grischun» | Leere, bearbeitbare Namensfelder je Gemeinwesencode |
| Feiertagsregeln | Y «Italienisch», Z «Rumantsch Grischun» | Leere, bearbeitbare Namensfelder je Regel-ID |
| Geltungsbereiche | K «Italienisch», L «Rumantsch Grischun» | Leere, bearbeitbare Namensfelder je Geltungs-ID |
| Feiertagskalender | M «Italienisch», N «Rumantsch Grischun» | Namen aus Feiertagsregeln über die stabile Regel-ID, bei fehlendem Namen «Noch zu erfassen» |
| Übersicht | Revisionsbezeichnung und drei Hinweise | Sprachumfang, noch offene Erfassung und Abgrenzung zum bestätigten Excel-Test |

Die neuen Eingabefelder sind gelb markiert, solange sie leer sind, und unter Blattschutz bearbeitbar. Die neuen Kalenderfelder bleiben berechnete, geschützte Ausgaben. Der Rechtsstatus der Referenzregeln ist keine Übersetzungsfreigabe. Es wurden keine ungeprüften Übersetzungen eingesetzt.

Bestehende Spalten, DE-/FR-Namen, Regel-IDs, Rechtsfundstellen, Quellenlinks, Datumsformeln und Datumsstände bleiben unverändert. Die Osterhilfe AA:AB bleibt an ihrem bisherigen Platz. App, Produktsprachen, Seed-Referenzobjekte, produktive Daten und Hosting werden nicht geändert.

## Prüfergebnis

| Prüfung | Ergebnis |
| --- | --- |
| Originaldatei | SHA-256 unverändert |
| Bestandserhalt | 991 bereits belegte Zellen mit unveränderten Werten beziehungsweise Formeln und Zellstilen geprüft. Ausgenommen ist nur die ausdrücklich geänderte Revisionsbezeichnung A6 |
| Native Funktionen | Acht Blätter und sieben Tabellen erhalten. Bestehende Tabellenüberschriften, Tabellenstile, Validierungen, bedingte Formatierungen, Blattschutz und Fixierungen geprüft |
| Neue Felder | Zwei zusätzliche Tabellenspalten in vier Tabellen. Eingabefelder entsperrt, Kalenderausgaben geschützt |
| Regressionssuite | 48 von 48 Modell- und Referenztests bestanden |
| Datumsergebnisse | 45 Vergleiche für 2026–2028 bestanden, nach Wiederimport der gespeicherten V0.2 erneut bestätigt |
| Sprachabhängigkeiten | Temporäre IT-/RG-Prüftexte bei der Bundesfeiertagsregel erscheinen sowohl in der CH- als auch in der geerbten BE-Kalenderzeile. Nach Rücksetzen erscheint wieder «Noch zu erfassen» |
| Fehlerprüfung | Keine Formel-Fehlertreffer beim Build und Wiederimport, keine gespeicherten Fehlerzellen |
| ZIP/XML und Links | Paketintegrität bestätigt, fünf native Quellenhyperlinks geprüft, keine Makros oder externen Datenverbindungen |
| Sichtprüfung | Fünf geänderte Ansichten aus der final gespeicherten Datei neu gerendert und geprüft |
| Native Excel-Interaktion V0.2 | Nicht separat wiederholt. Der Nutzertestnachweis betrifft V0.1 |

Die Spreadsheet-Skill-Prüfung hat die Kontrolle des gespeicherten Ergebnisses und der unveränderten Struktur bestimmt. Die neue Headerformatierung wurde nach Sichtprüfung an den Bestand angepasst. Der begrenzte OOXML-Nachschritt ergänzt die Tabellenbereiche, die über die dokumentierte Tabellen-API nicht vergrössert werden konnten. Fachliche Daten und Berechnungen werden in diesem Nachschritt nicht verändert.

## Gerenderte Änderungsansichten

- [Hinweise auf der Übersicht](qa-v02/saved-01-Übersicht.png)
- [Gemeinwesen](qa-v02/saved-02-Gemeinwesen.png)
- [Feiertagsnamen und unveränderte Osterhilfe](qa-v02/saved-03-Feiertagsregeln.png)
- [Gebietsbezeichnungen](qa-v02/saved-04-Geltungsbereiche.png)
- [Abgeleitete Namen im Kalender](qa-v02/saved-05-Feiertagskalender.png)

Die Übersetzungen werden bei der weiteren Erhebung ergänzt und sprachlich geprüft. Diese Fassung schafft dafür die Felder, aber keine zusätzlichen Produktsprachen. Der [Arbeitsmappenvertrag V0.2](../../docs/architektur/feiertagsmatrix-ap18a.md) und der Kommentar in [Issue #36](https://github.com/davidsteimer/fristenrechner/issues/36#issuecomment-5652784219) dokumentieren den erweiterten Umfang. Die Arbeitsdateien bleiben lokal, ohne Push oder Deployment.

## Nachtrag: Nutzerprüfung und Folgeänderung

Am 13. September 2026 bestätigte David Steimer anschliessend auch für V0.2: «OK, die Mappe funktioniert». Er regte gleichzeitig an, Italienisch und Rumantsch Grischun direkt nach Französisch anzuordnen. Der oben dokumentierte Auslieferungsnachweis bleibt als historische Prüfung erhalten. Die neue Anordnung wird separat als V0.3 geliefert und im [QA-Nachweis V0.3](QA-AP18A-V0.3.md) geprüft. Die Nutzerbestätigung der V0.2 ist keine vorweggenommene native Prüfung der V0.3 oder Gesamt-Abnahme von AP18A.
