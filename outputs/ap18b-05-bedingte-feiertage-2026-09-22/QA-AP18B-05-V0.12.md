# QA AP18B-05, Arbeitsmappe V0.12

Prüfdatum: 22. September 2026. Fachvorgaben: David Steimer. Technische Umsetzung und Prüfung: Codex als Arbeitsinstrument, keine zusätzliche menschliche Zweitfreigabe.

## Lieferstand

| Gegenstand | Ergebnis |
| --- | --- |
| Datei | `2026-09-22_Feiertagsmatrix_Schweiz_AP18B-05_V0.12.xlsx` |
| Dateigrösse | 391’640 Bytes |
| SHA-256 | `d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65` |
| Ausgangsstand | V0.11, SHA-256 `37d33d4639cc839fc41c9850de8e6551d546167fe8b9ee7f10ea5f2c062d99fd` |
| Arbeitsmappenvertrag | `0.6.0`, technischer Kandidat gemäss vorgeschlagenem DEC-2026-022 |
| Umfang | 479 Regeln, 488 Kalenderzeilen, 49 Geltungsprofile, 84 Quellen, 90 Quellenprüfungen |
| Jahresauswahl | Unverändert 2026–2028, gespeichert mit 2027 |
| Struktur | Neun Blätter, acht native Tabellen, neue Spalte AB «Kalenderbedingung» |
| Sprachen | DE/FR/IT/RG vollständig. Neue Übersetzungen provisorisch |
| Produktstatus | Kein Runtime-Export, keine Veröffentlichung, kein Deployment |

## Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Spezifische Modelltests | 35 bestanden, 0 fehlgeschlagen |
| Reimport und Neuberechnung | 2’901 Datumsvergleiche für 479 Regeln und 488 Kalenderzeilen über 2026–2028 bestanden |
| Unabhängiger Saved-File-Audit | 2’874 W-/X-Formelvergleiche mit unabhängig berechneten Sollwerten bestanden |
| Bedingungsformeln | 2’000 isolierte Prüfungen der gespeicherten X-Formeln über 2000–2399 bestanden |
| Ungültige Eingaben | Unbekannte, leere und inkompatible Bedingungen werden abgewiesen. Keine stillen Ersatzdaten |
| GL-Gültigkeitsgrenzen | Gültigkeit wird nach der Verschiebung geprüft. 09.04.2026 wird korrekt berücksichtigt |
| Native Listenvalidierung | 514 neue Werte gegen die tatsächlichen Dropdown-Listen geprüft |
| Negative Prüferkontrollen | Neun gezielte Mutationen erkannt |
| Ausgangsmappe | V0.11 vor und nach Bearbeitung hash-identisch |
| Unveränderte Zellen | 21’271 Zellen ausserhalb der deklarierten Änderungen identisch |
| Bestand | Alle 474 bisherigen Regelparameter und Sprachfelder erhalten, Datumswerte unverändert |
| Prüfgeschichte | Alle 85 bisherigen Quellenprüfungen erhalten, fünf Nachträge angehängt |
| Excel-Funktionen | Stildatei, Zellschutz, Ansichten, Tabellen, native Validierungen und alle 84 Quellenlinks erhalten |
| NE-Abgrenzung | Acht feste LPA-Ergänzungen und Fronleichnam Le Landeron unverändert |
| Sicherheitsprüfung der Datei | ZIP/XML intakt, keine Fehlercaches, keine Makros oder neuen externen Verbindungen |
| Visuelle Prüfung | 24 Ansichten der tatsächlichen Zieldatei gerendert, geöffnet und kontrolliert. Neue Regeln, Kalender 2026–2028, Bedingungen, Quellen, Geltungsbereiche und Prüfnotizen lesbar |
| Native Excel-Bedienprüfung | In diesem Arbeitsschritt nicht durchgeführt |

Die 400-Jahre-Prüfungen sind technische Regeltests. Sie behaupten keine historische Rechtsgeltung für den gesamten Zeitraum und erweitern das Eingabefenster der gelieferten Mappe nicht.

### Referenzfälle

| Regel | 2026 | 2027 | 2028 |
| --- | --- | --- | --- |
| AR Stephanstag | Entfällt | 26.12.2027 | Entfällt |
| AI Stephanstag | Entfällt | 26.12.2027 | Entfällt |
| GL Näfelser Fahrt | 09.04.2026 | 01.04.2027 | 06.04.2028 |
| NE allgemeiner Ersatz nach Neujahr | Entfällt | Entfällt | Entfällt |
| NE allgemeiner Ersatz nach Weihnachten | Entfällt | Entfällt | Entfällt |

Positive Ersatzfälle sind zusätzlich am 02.01.2034 und 26.12.2033 geprüft. AR und AI wurden in allen sieben Wochentagslagen geprüft. Die festen NE-Verwaltungsdaten unterliegen nicht den allgemeinen Ersatzbedingungen.

## Gesonderter Befund zum historischen Gesamttest

Der umfassende Lauf mit `node --import tsx --test tests/calendar-rules/*.test.mjs` meldet 372 bestandene und acht fehlgeschlagene Prüfeinheiten. Die acht Abbrüche betreffen ausschliesslich das unveränderte Byte-Identitätsgate der älteren V0.9. Sie werden nicht als grün ausgegeben und nicht durch Änderung eines vertrauenswürdigen Hashs unterdrückt.

- Ursprünglicher V0.9-Hash: `a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12`
- Aktueller lokaler V0.9-Hash: `7663aacdca75d66c565ca6c049c9958dafad792ec46ec0d0515b4cb1505e8453`

Die zusätzliche reine Leseanalyse rekonstruiert den damaligen Native-Adapterstand im Speicher aus V0.8, dem aufbewahrten Autorenexport und den damaligen deklarierten Patches. Gegen diesen Stand wurden 12’004 Zellwerte ohne Unterschied sowie 2’427 Formeln ohne semantischen Unterschied verglichen. 383 Excel-Shared-Formula-Folger wurden aufgelöst. 1’152 unabhängige Datumsformelvergleiche für 2026–2028 sind bestanden. Tabellen, Datenvalidierungen, Schutz und Hyperlinks sind inhaltlich gleich. Zwei Prioritätsnummern bedingter Formatierungen auf disjunkten Bereichen wurden umnummeriert, ohne Änderung ihrer Bedingungen, Farben oder Bereiche.

Die Paketabweichungen mit zusätzlichen `docProps`-, `calcChain`- und Revisionsinformationen sind mit einer Excel-Neuspeicherung vereinbar. Ein fachlicher Daten- oder Rechenfehler wurde nicht gefunden. Eine byte-identische V0.9 wurde im begrenzten lokalen Inventar nicht gefunden. Als Nebenbefund weist auch V0.10 eine geänderte Paketprüfsumme auf, die hier nicht weiter untersucht wurde.

Für die neue Migration ist ausschliesslich die unveränderte, hash-gebundene V0.11 massgebend. Der validierte Rechenseed ist vom historischen V0.9-Dateiaufruf getrennt. Die Legacy-Prüfsummensperre bleibt intakt. Die historische Referenzarchivierung ist vor einem vollständigen grünen Regressionsnachweis ausdrücklich zu behandeln, ohne sie mit der fachlichen Bereinigung der fünf Fälle zu vermischen.

## Nachweise

Versionierte Umsetzung und Prüfer:

- `scripts/ap18b-05-conditions.mjs`
- `scripts/ap18b-05-workbook.mjs`
- `scripts/finalize-ap18b-03.py --batch-05`
- `scripts/check-ap18b-05-workbook.py`
- `tests/calendar-rules/ap18b-05-conditions.test.mjs`

Lokale Prüfprotokolle liegen unter `.work/ap18b-05/`: `conditional-tests.log`, `model-tests.log`, `checks.json`, `native-audit.json`, `independent-audit.json`, `reimport-audit.json` und `v09-drift-diagnostic.json`. Der [Umsetzungsnachweis](../../docs/architektur/erfassung-ap18b-05.md) enthält Fachquellen und Releasegrenzen.
