# QA AP18B-03 – Arbeitsmappe V0.9

Prüfdatum: 13. September 2026. Ergebnis zum Zeitpunkt der technischen Prüfung: **technische Dateiprüfung bestanden, fachliche Abnahme damals noch offen**.

**Späterer Abnahmenachtrag vom 13. September 2026:** David Steimer hat die gesamte unveränderte V0.9 fachlich abgenommen und den Solothurner Halbtag als ohne Einfluss auf den Fristenlauf festgelegt. Die [Abnahmenotiz](../../docs/fachrecht/abnahme-ap18b-03.md) bindet dieselbe unten ausgewiesene Prüfsumme. Der technische Prüfzeitpunkt, Prüfumfang und alle folgenden Ergebnisse bleiben unverändert. Die gespeicherten offenen Status bezeichnen den damaligen Auslieferungsstand, nicht eine weiterhin ausstehende menschliche Fachabnahme.

## Datei und unveränderte Herkunft

| Merkmal | Wert |
| --- | --- |
| Arbeitskopie | [2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx](2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx) |
| SHA-256 V0.9 | `a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12` |
| Arbeitsmappenvertrag | 0.5.0, ausdrücklich bestätigt in [DEC-2026-021](../../docs/entscheidungen/DEC-2026-021-arbeitsmappenvertrag-050.md) |
| Referenz | Unveränderte Arbeitsmappe V0.8 aus AP18B-02 |
| SHA-256 V0.8 | `d3e3bac17464733fa7bc3c42e63db0b5b42502c177914d6dcd9800ba9320461f` |
| Interne Strukturkopie vor Erfassung | SHA-256 `26059e3ea57392468b6b08be58b759b25d9fac7c18cab868a865d53a4b3f411b` |
| Inhalt | 192 Regeln, 201 Kalenderzeilen, 21 Geltungsprofile, 37 Quellen, 37 Verfahrensbezüge, 38 Quellenprüfeinträge, 64 Gebietszuordnungen |
| Gespeichertes Anzeigejahr | 2027 |

Dateirevision V0.9 und Arbeitsmappenvertrag 0.5.0 sind unterschiedliche Versionsangaben. Die neue Struktur wurde mit 116 bestehenden Regeln und 125 Kalenderzeilen geprüft, bevor die 76 VS-/FR-/SO-/GE-Regeln erfasst wurden. Der [Erfassungsbericht](../../docs/architektur/erfassung-ap18b-03.md) beschreibt die Reihenfolge und den fachlichen Umfang.

## Durchgeführte Prüfungen

| Prüfung | Nachweis und Ergebnis |
| --- | --- |
| Struktur vor Erfassung | 248 Modelltests, 464 Datumsvergleiche, 500 Kalendervergleiche und 23 Formelproben bestanden. Gespeicherte Strukturkopie erneut eingelesen und berechnet |
| Gesamter Modellbestand | 270 Tests in 22 Gruppen bestanden, keine Fehler, Auslassungen oder abgebrochenen Tests. Darunter 47 neue Vertrags- und 22 neue Batchtests |
| Tatsächliche V0.9 wieder eingelesen | Exakte Regel-Eingaben und Überschriften geprüft. 768 Datums- und 804 Kalendervergleiche für 2026, 2027, 2028 und erneut 2026 bestanden |
| Gezielte Formelproben | 23 Proben zu Ganzzahligkeit, positiven/negativen Abständen, ungültigem fünften Wochentagsvorkommen, unpassenden Parametern, Gültigkeitsgrenzen und Tagesumfang bestanden. Nur temporäre In-Memory-Änderungen, Ausgangswerte wiederhergestellt |
| Unabhängiger Prüfer | 1152 Auswertungen der tatsächlich gespeicherten W-/X-Formeln gegen separat berechnete Daten 2026–2028 bestanden. Keine Autorenreceipts als Ergebnisbeweis verwendet |
| Formeln | Kein gefundener Formelfehler. Alle 2427 Formelzellen mit gespeicherten Werten und Zellschutz. Jahreswechsel wirkt auf Regel- und Kalenderansicht |
| Negative Prüferselbsttests | Sieben absichtlich beschädigte In-Memory-Kopien zurückgewiesen, unter anderem falsche Tabellenbreite, alter Hilfsverweis, fest verdrahtetes Jahr, ungeschützte Formel, nicht ganzzahliger Datumswert, fehlende Halbtagsvalidierung und veränderter RG-Altname |
| Native Excel-Strukturen | Neun Blätter, acht native Tabellen, Filter, Schutz, Sprachspalten D:G und Datenvalidierungen erhalten. Hilfsrechnung nach AC:AD verschoben. Tagesumfang in Regeln AA und Kalender O |
| Datenvalidierung | Vollständige Stop-Validierungen für I/J/K/L/AA. Schwächere Alt-/Teilbereichsvalidierungen werden erst nach nachgewiesener Vollabdeckung entfernt, nicht zusätzlich überlagert |
| Bestandswahrung | V0.8 unverändert, `styles.xml` byte-identisch. Adapter: 5833 Zellen ausserhalb deklarierter Änderungen erhalten. Unabhängiger Vergleich: 6954 Bestandszellen erhalten. Unterschiedliche Zähler wegen unterschiedlicher Abgrenzung der geprüften Zellen |
| Referenzdaten | Zwölf CH-/BE-Referenzregeln und acht provisorische V0.8-RG-Namen unverändert erhalten. Neue Tagesumfangsmetadaten übertragen keine alte Fachfreigabe |
| Links und Integrität | ZIP-Paketintegrität bestanden. 37 Quellen-Hyperlinks auf HTTPS und Übereinstimmung mit URL-Zellen geprüft. Keine Makros oder externen Datenverbindungen |
| Genf | Neun Regeln ohne 2. Januar oder generische Sonntagsersatzdaten. Genfer Bettag 10.09.2026, 09.09.2027, 07.09.2028 bestätigt |
| Solothurn | Genau zwei profilbezogene 1.-Mai-Regeln «Ab 12.00 Uhr», übrige Regeln ganztägig. Halbtagszusatz direkt in der Wochentagsspalte sichtbar |
| Visuelle Prüfung | 57 gerenderte Ansichten aus der gespeicherten Datei geprüft. Geänderte Struktur, neue Kantonsansichten, Gebietsnamen, lange Fachtexte, Quellen und Prüfeinträge lesbar. Keine erforderliche Höhenkorrektur |

## Prüfverfahren und Grenzen

Die Arbeitsmappe wird mit dem etablierten Artifact-Builder bearbeitet. Ein eng begrenzter OOXML-Adapter übernimmt dessen Inhalte und Formeln in die unveränderte native Ausgangsstruktur. Er erzeugt keine eigenen Rechtsdaten oder Datumsformeln. Der unabhängige Prüfer verwendet ausschliesslich lesende ZIP-/XML-Verarbeitung und eine getrennte, begrenzte Auswertung der gespeicherten Formeln.

Die Dateiprüfung ist **kein bereits durchgeführter Bedien- oder Neuberechnungstest in Microsoft Excel Desktop oder Excel Web**. Die sichtbaren Ansichten und Jahreswechsel wurden nach Wiederimport mit der Artifact-Rechenengine geprüft. Die HTTPS-Prüfung bestätigt die Struktur und Zuordnung der Links, nicht die dauernde Erreichbarkeit aller Webseiten. Aktuelle Quellenabrufe und deren Grenzen stehen in den [Quellenpaketen VS/GE](../../docs/fachrecht/quellenpaket-ap18b-03-vs-ge.md) und [FR/SO](../../docs/fachrecht/quellenpaket-ap18b-03-fr-so.md).

## Reproduktion

Voraussetzungen sind die Projektabhängigkeiten, Artifact Tool und Python 3. Alle Befehle werden im Projektverzeichnis ausgeführt. `node` bezeichnet die konfigurierte Laufzeit.

1. `node scripts/build-ap18a-workbook.mjs --batch-03`
2. `python3 scripts/finalize-ap18b-03.py`
3. `node scripts/build-ap18a-workbook.mjs --batch-03 --verify`
4. `python3 scripts/check-ap18b-03-workbook.py --self-test`
5. `node scripts/build-ap18a-workbook.mjs --batch-03 --with-cantons`
6. `python3 scripts/finalize-ap18b-03.py --batch`
7. `node scripts/build-ap18a-workbook.mjs --batch-03 --with-cantons --verify`
8. `python3 scripts/check-ap18b-03-workbook.py --batch --self-test`

Die sieben AP18-Testdateien unter `tests/calendar-rules/ap18*.test.mjs` bilden den 270-Test-Nachweis. Technische Zwischenstände und PNGs liegen lokal unter `.work/ap18b-03/structure/` beziehungsweise `.work/ap18b-03/batch/`. Sie sind keine zusätzlichen fachlichen Lieferdateien. Die vollständigen Modelltests, `checks.json`, `native-audit.json`, `reimport-audit.json` und `independent-audit.json` dokumentieren die jeweiligen Prüfschritte.

## Freigabegrenze

Neue Regeln bleiben `open`, ohne Freigabebasis und mit `blockedEffect`. Sprachergänzungen sind teilweise provisorisch, wenige VS-/GE-Sprachfelder noch leer. Die Wirkung des Solothurner Halbtags auf konkrete Tagesfristen ist nicht freigegeben. Kein produktiver JSON-Export, keine zusätzliche Kantonsauswahl, keine Quellenpromotion, kein Commit oder Push und keine Änderung an E, Q oder P.
