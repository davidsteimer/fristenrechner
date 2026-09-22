# AP18B-01: Prüfnachweis der Arbeitskopie Aargau

Stand: 13. September 2026. Technisch geprüfter Erhebungsentwurf, fachliche Abnahme ausstehend. Die Lieferung ist keine neue Freigabe eines Datenreleases oder Rechtsprofils.

## Dateiidentität

- Datei: `2026-09-13_Feiertagsmatrix_Schweiz_AP18B-01_AG_V0.5.xlsx`
- SHA-256: `29990c2b7f53112603f22c6ca9df5c127540907c104b992be81df3803ebdb825`
- Ausgangsdatei: unveränderte AP18A-Arbeitsmappe V0.4
- SHA-256 der V0.4: `11f47723d4bd9961e177bf0401c015899f41d847e56a32141d72bf82876cd597`
- Arbeitsmappenvertrag: weiterhin `0.4.0`. Die Dateirevision V0.5 erweitert den Erfassungsbestand, nicht das Spaltenschema.

## Umfang

90 Regelzeilen, davon zwölf unveränderte CH-/BE-Referenzregeln und 78 offene AG-Regeln. Die acht Normzweige von § 6 Abs. 1 EG ArR ergeben 64 arbeitsrechtliche Zuordnungen. § 21 Abs. 1 EG ZPO liefert 14 gesonderte prozessuale Zuordnungen. Drei AG-Regelobjekte sind unverändert aus dem Pilot übernommen, 75 weitere ergänzt.

Die neun Blätter enthalten acht native Excel-Tabellen, elf Geltungsbereiche, 29 Gebietszuordnungen, elf Verfahrenszuordnungen, sechs Quellen und sieben Quellenprüfereignisse. Die 99 Kalenderzeilen umfassen die bisherigen CH-/BE-Zeilen sowie acht arbeitsrechtliche AG-Ausprägungen zu je neun Tagen und eine prozessuale Liste mit 14 Tagen. Der Bundesfeiertag wird in der prozessualen Liste nicht doppelt gezählt.

## Durchgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Modell- und Referenztests | 142 bestanden, keine Fehler und keine übersprungenen Tests. 85 bisherige und 57 neue Tests |
| Unabhängige Normmengen | Acht getrennte ArG-Zweige und 14 prozessuale Tage gegen separat transkribierte Erwartungen geprüft |
| Unabhängige AG-Datumsreferenzen | 234 Vergleiche, 78 AG-Regeln für drei Jahre, gegen fest hinterlegte Datumsreferenzen. Amtliche Vergleichsbelege im Quellennachweis |
| Berechnung in der Tabellenbibliothek | 270 Regeldaten und 297 Kalenderdaten für 2026–2028 geprüft |
| Wiederimport der gespeicherten V0.5 | Erneut 270 Regeldaten und 297 Kalenderdaten geprüft. Ursprüngliche Jahreswahl 2027 wiederhergestellt, Prüfobjekt nicht zurückexportiert |
| Kalenderzuordnung | Neun Tage pro Arbeitsprofil, 14 prozessuale Tage. Keine doppelte Datumswirkung je Profil. Acht neue CH-Übernahmen nach AG ausdrücklich `open` |
| Sprachableitung | Temporärer IT-Prüftext einer neuen Regel erscheint in der passenden Kalenderzeile. Prüftext vor der Auslieferung entfernt |
| Fachfreigabesperren | Negative Tests für Regel, Gemeinwesen, Geltungsbereich, Quelle, Verfahrenszuordnung, Gebietszuordnung und Prüfereignis |
| Unabhängiger nativer Bestandsvergleich | 2577 Zellen ausserhalb der deklarierten Änderungen unverändert. Alle zwölf CH-/BE-Referenzregelzeilen einschliesslich ihrer 24 Formeln und gespeicherten Ergebnisse unverändert |
| Native Excel-Funktionen | Neun Blätter und acht Tabellen erhalten. Tabellenbereiche, Filter, Validierungen und bedingte Formatierungen für die zusätzlichen Zeilen erweitert. Fixierungen und Blattschutz erhalten |
| Format- und Schutzbestand | `xl/styles.xml` bytegleich. Neue Eingabezellen folgen exakt den bisherigen freigegebenen Eingabespalten. 1445 neue Eingabezellen editierbar. IDs und übrige geschützte Felder bleiben geschützt, Formeln bleiben gesperrt |
| Gebietszuordnungen | Alle 29 Zuordnungen `open`, alle 18 Erfassungsfelder editierbar. Amtliche Kennungen leer, keine behaupteten BFS-Codes |
| Quellen und Prüfereignisse | Sechs native HTTPS-Quellenlinks geprüft, BJ-Ziel und hinterlegter URL-Text konsistent. Vier frühere Prüfnotizen unverändert, drei neue Kandidaten ergänzt |
| Formel- und Paketprüfung | Keine Formel-Fehlerzellen. 1104 gespeicherte Formel-Ergebniswerte vorhanden. Paketverknüpfungen auflösbar, keine Makros und keine externen Datenverbindungen |
| Visuelle Prüfung | Zwölf gespeicherte Ansichten gerendert und geprüft. Alle neun Blätter mit ihren geänderten Ansichten einbezogen |
| Native Excel-Nutzerprüfung V0.5 | Noch nicht separat durchgeführt. Die Bestätigung der vorherigen Arbeitsmappe wird nicht als Test dieser Revision ausgegeben |

Die Schutzregel lautet nicht «jede neue Zelle ist frei bearbeitbar». In Feiertagsregeln bleiben beispielsweise IDs und Rechtskategorien geschützt, während Namen und bisher vorgesehene Rechenparameter editierbar sind. Bewusst weitergehende Änderungen erfordern wie bisher das Aufheben des passwortlosen Blattschutzes und eine erneute fachliche Prüfung.

Die Spreadsheet-Skill bestimmt die Bearbeitung über die Tabellenbibliothek, Wiederimport, Neuberechnung und Sichtkontrolle. Der begrenzte native Nachschritt übernimmt ausschliesslich die deklarierten Inhalte, Formeländerungen und Bereichserweiterungen in die ursprüngliche Paketstruktur. Der unabhängige Prüfer `scripts/check-ap18b-ag-workbook.py` kontrolliert die gespeicherte Lieferung lesend. Das ist kein allgemeiner Importvalidator für spätere manuelle Excel-Änderungen.

## Gerenderte Prüfbereiche

- [Übersicht](qa/saved-01-Übersicht.png)
- [Gemeinwesen](qa/saved-02-Gemeinwesen.png)
- [Neue Regeln und Sprachfelder](qa/saved-03-Feiertagsregeln.png)
- [Regeldaten und Quellen](qa/saved-04-Feiertagsregeln.png)
- [Kalender und Bundesfeiertagsübernahme](qa/saved-05-Feiertagskalender.png)
- [Geltungsbereiche](qa/saved-06-Geltungsbereiche.png)
- [Gebietsmitglieder](qa/saved-07-Gebietszuordnungen.png)
- [Gebietsgültigkeit und Fachstatus](qa/saved-08-Gebietszuordnungen.png)
- [Quellen](qa/saved-09-Rechtsquellen.png)
- [Verfahrensbezug](qa/saved-10-Verfahrensbezug.png)
- [Neue Prüfereignisse](qa/saved-11-Quellenprüfung.png)
- [Gebietshinweise](qa/saved-12-Gebietszuordnungen.png)

Der [fachliche Quellennachweis](../../docs/fachrecht/quellenpaket-ap18b-01-ag-entwurf.md) und der [AP18B-Arbeitsnachweis](../../docs/architektur/feiertagsquellen-ap18b.md) dokumentieren die Quellen, Reichweite und ausstehende Fachabnahme. App, Runtime-Verträge, produktive Daten, Mirror und Hosting bleiben unverändert. Kein Push und kein Deployment wurden ausgeführt.
