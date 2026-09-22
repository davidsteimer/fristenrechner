# AP18B-02 TI/GR: Prüfnachweis V0.7

Prüfdatum: 13. September 2026. Erfassungsentwurf zur fachlichen Prüfung durch David Steimer. Keine Fach-, Verfahrens-, Daten- oder Betriebsfreigabe. Codex ist Arbeitsinstrument und hat keine eigene Freigabeverantwortung.

## 1. Geprüfter Gegenstand

[Feiertagsmatrix Schweiz AP18B-02 TI/GR V0.7](2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.7.xlsx)

- SHA-256 V0.7: `a66bfff038a284c99f50337e02609a25718473b7a3d810c8e4c69ee455473c40`
- Ausgangsdatei: V0.6 des AG-Quellenpakets, unverändert erhalten.
- SHA-256 V0.6: `b1c88de49b33a2e702d8387eef150b16791fa30bbc7ce465e01ee30adb3965b2`
- Arbeitsmappenvertrag: weiterhin 0.4.0. Die Dateirevision erweitert Daten, nicht das Spaltenschema.
- Datenfenster: 2026–2028. Gespeichertes Auswahljahr: 2027.

Die Mappe enthält neun Arbeitsblätter und acht native Excel-Tabellen. Bestand: 116 Regeln, 125 Kalenderzeilen, 27 Gemeinwesen, 13 Geltungsbereiche, 31 Gebietszuordnungen, 17 Quellen, 18 Verfahrensbezüge und 18 Quellenprüfereignisse. Neu sind 26 Regeln, zwei Geltungsbereiche, zwei Gebietszuordnungen, elf Quellen, sieben Verfahrensbezüge und elf Prüfereignisse.

## 2. Fachliche Prüfbasis

Der [TI-Quellenvermerk](../../docs/fachrecht/quellenpaket-ap18b-02-ti-quellen.md) belegt alle 15 offiziellen Feiertage und ihre getrennte arbeitsrechtliche Einteilung in neun sonntagsgleiche und sechs weitere Tage. Alle 30 Datumswerte für 2026/2027 wurden anhand amtlicher UIL-Jahreslisten abgeglichen. Die 15 Werte für 2028 sind ausdrücklich regelbasierte Projektionen bei unverändertem Recht, keine behauptete amtliche Jahresliste. Die LPAmm-Zuordnung berücksichtigt Art. 1 Abs. 2 und den Ausschluss von Titel II nach Art. 1 Abs. 3.

Der [GR-Quellenvermerk](../../docs/fachrecht/quellenpaket-ap18b-02-gr-quellen.md) belegt zehn kantonale Anlässe und eine separate Anwendung der bestehenden Bundesfeiertagsgrundlage. Hohe Feiertage und Sonntagsüberschneidungen werden nicht doppelt erzeugt. Der Bettag 2026 ist amtlich als 20.09.2026 belegt. Die Daten 19.09.2027 und 17.09.2028 folgen aus der belegten Regel «dritter Sonntag im September». Der aktuelle VRG-Volltext ist als Version 3521 gesichert.

Die [bestätigte GR-Modellgrenze](../../docs/fachrecht/quellenpaket-ap18b-02-ti-gr-abgrenzung.md) bleibt erhalten. Art.-2-Behörden sind aus der begrenzten VRG-Zuordnung ausgeschlossen. Lokale Ruhetage werden nicht erhoben, ihre allgemeine rechtliche Irrelevanz wird nicht behauptet. `OF-008` bleibt offen. Kein Transfer auf andere Prozessordnungen und keine neue Gerichtsferienfreigabe.

DE/FR/IT/RG stehen weiterhin unmittelbar nebeneinander. Die 104 Sprachmetadatensätze unterscheiden amtliche beziehungsweise normalisierte Namen, Produktübersetzungen und fehlende Nachweise. Acht TI-RG-Werte bleiben leer. Der Kalender zeigt dort «Noch zu erfassen». Die gelbe Erfassungskennzeichnung bleibt erhalten.

## 3. Tatsächlich durchgeführte technische Prüfung

| Prüfung | Ergebnis |
| --- | --- |
| Ausgangsdatei vor und nach Erstellung gehasht | V0.6 unverändert |
| Regelberechnung bei Erstellung und Wiederimport | Je 348 Prüfungen, 116 Regeln in drei Jahren, bestanden |
| Kalenderberechnung bei Erstellung und Wiederimport | Je 375 Prüfungen, 125 Zeilen in drei Jahren, bestanden |
| Kontrollzählung | 27 Gemeinwesen, zwölf unveränderte Referenzregeln, 104 offene Kantonsregeln |
| Sprachformel | Vorübergehender IT-Testwert in Regel F97 wird im Kalender G106 übernommen, danach ursprünglicher Wert und Jahr 2027 wiederhergestellt |
| Formelfehlersuche | Keine Treffer für REF, DIV/0, VALUE, NAME, N/A, NUM, NULL, SPILL oder CALC |
| Native Bestandserhaltung | 6'166 bestehende Zellen ausserhalb deklarierter Änderungen unverändert. Native Style-Datei bytegleich |
| Unabhängiger Native-XLSX-Prüfer | Bestanden. Alle 90 bisherigen Regelzeilen und 99 bisherigen Kalenderzeilen einschliesslich Formeln und gespeicherter Ergebnisse strikt unverändert. Rheinfelden C15/C16 erhalten |
| Unabhängige Datumsrechnung aus gespeicherten Parametern | 116 Regeltermine und 125 Kalenderdaten mit Wochentagen für 2027 bestätigt. 26 neue Daten zusätzlich gegen separat tabellierte Erwartungen geprüft |
| Gespeicherte Formelergebnisse | 1'390 Formelzellen ohne Fehlerwerte, vollständige Cache-Werte geprüft |
| Excel-Funktionen | Acht native Tabellen mit Filtern, erweiterte Gültigkeitsprüfungen und bedingte Formate. Bestehender Blattschutz und Sprachspaltenanordnung erhalten |
| Quellenhyperlinks | 17 HTTPS-Quellenziele im nativen Paket |
| Visuelle Kontrolle | 16 aus der gespeicherten Zielkopie gerenderte Ansichten über alle neun Arbeitsblätter geprüft. Keine abgeschnittenen neuen Inhalte festgestellt |
| Regressionstest AP18A/AG und neue TI-/GR-Modelltests | 197 Tests bestanden, davon 55 neue TI-/GR-Tests. Keine Fehler oder übersprungenen Tests |

Die neuen Regelzeilen stehen auf `open` und `blockedEffect`, ohne Freigabebasis. Neue Verfahrensbezüge sind `open` oder `blocked`. Neue Quellenprüfereignisse bleiben `candidate`. Weder eine bestehende Bundesquellenfreigabe noch eine Quellenprüfung bewirkt eine Freigabe der neuen Kantonsanwendung.

Die Bearbeitung erfolgte über den Spreadsheet-Skill und die öffentliche Tabellenbibliothek. Der begrenzte native Übernahmeadapter erhält die Excel-spezifischen Paketbestandteile. Der Wiederimport berechnet und prüft die tatsächliche Zielkopie, exportiert sie aber nicht erneut.

Der unabhängige Prüfer `scripts/check-ap18b-ti-gr-workbook.py` liest ausschliesslich die native ZIP-/XML-Struktur. Er prüft zusätzlich die erlaubten Änderungsbereiche, Tabellenreferenzen, Validierungsbereiche, bedingten Formate, den Schutzbestand und den Ausschluss von Makros und externen Datenverbindungen. Der gemeinsame Modelltestlauf enthält 78 separat tabellierte TI-/GR-Datumserwartungen für 2026–2028. Technische Datumsrichtigkeit ist nicht mit fachlicher oder künftiger gesetzlicher Freigabe gleichzusetzen.

## 4. Grenzen und nächste Prüfung

Eine erneute Bedienprüfung in Microsoft Excel durch den Nutzer ist noch nicht durchgeführt. Die automatisierte Prüfung und das Rendering werden nicht als native Excel-Interaktion ausgegeben. Amtliche URLs können sich nach dem Abruf ändern. Die gespeicherten Quellenstände, Fundstellen und Prüfnotizen sichern die Nachvollziehbarkeit des Erfassungsstands.

Die alte AG-Arbeitsmappe, die eingereichte Word-Rechtsabklärung sowie produktive Daten und Anwendungen bleiben unverändert. Es wurde kein JSON-Kandidat für die App exportiert, kein Commit veröffentlicht und keine E-/Q-/P-Installation verändert. Nach der Durchsicht kann David Steimer die begrenzte Erhebung separat abnehmen. Weitere Kantone und die kontrollierte technische Übernahme bleiben Folgearbeit in AP18B beziehungsweise AP18C.
