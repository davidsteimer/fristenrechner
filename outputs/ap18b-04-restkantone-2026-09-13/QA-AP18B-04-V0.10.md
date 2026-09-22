# QA AP18B-04, Gesamtmappe V0.10

Prüfdatum: 13. September 2026. Arbeitsmappenvertrag 0.5.0 unverändert. Die Datei ist ein lokaler Erfassungs- und Prüfkandidat, keine Fach- oder Produktfreigabe.

## Unveränderte Herkunft und Umfang

Referenz V0.9 mit SHA-256 `a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12`. Ihre [Abnahme](../../docs/fachrecht/abnahme-ap18b-03.md) und der Entscheid zum Solothurner Halbtag bleiben erhalten. Die Referenzdatei wurde weder überschrieben noch rückwirkend umetikettiert.

Der Kandidat umfasst neun Blätter, acht native Excel-Tabellen, 474 Regelzeilen, 483 Kalenderzeilen, 49 Geltungsprofile, 84 Quellen, 92 Verfahrensbezüge, 85 Quellenprüfeinträge und 95 Gebietszuordnungen. 282 Regelzeilen betreffen die neuen 18 Kantone. Die 192 bisherigen Regeln und ihre Metadaten bleiben erhalten. Die vier Sprachspalten stehen weiterhin nebeneinander.

## Technische Ergebnisse

- 347 Modelltests bestanden. Darunter 77 neue Tests für die drei Kantonsgruppen und die unveränderte konsolidierte Referenz, einschliesslich 846 unabhängiger Datumserwartungen für die 282 neuen Regeln in 2026–2028.
- Die tatsächliche gespeicherte Zielkopie wurde erneut eingelesen. Jahreswechsel 2026, 2027, 2028 und wieder 2026 bestanden, danach Rückkehr zum gespeicherten Anzeigejahr 2027. 1896 Regel-Datumsvergleiche und 1932 Kalendervergleiche sowie 23 gezielte Formelproben bestanden.
- Unabhängige Auswertung der gespeicherten W-/X-Formeln mit 2844 Vergleichen gegen einen getrennten Datumsrechner bestanden. Nicht bloss Vergleich bereits gespeicherter Ergebnisse.
- Alle 5811 Formelzellen haben gespeicherte Ergebnisse und sind geschützt. Formelfehlersuche ohne Treffer. Keine Makros, externen Datenverbindungen oder fremden Berechnungslinks.
- Native Tabellen, Filter, bedingte Formate, erweiterte Datenvalidierungen mit abweisenden Fehlermeldungen, Zellschutz, Osterhilfsblock und 84 HTTPS-Quellenverknüpfungen geprüft. Die Stildefinitionen bleiben bytegleich zur Referenz.
- Der native Adapter erhält 9453 Zellen ausserhalb deklarierter Änderungen. Der unabhängig abgegrenzte Prüfer bestätigt 11038 erhaltene Referenzzellen. Diese Zählweisen haben unterschiedliche Mengen und werden nicht addiert.
- Sieben absichtlich beschädigte In-Memory-Kopien werden vom unabhängigen Prüfer verworfen. Keine beschädigten XLSX-Testdateien wurden ausgeliefert.

Die gespeicherte Mappe wurde mit dem Spreadsheets-Skill über den bestehenden Builder und die gebündelte Tabellenbibliothek erstellt. Der enge OOXML-Adapter übernimmt nur dort verfasste Werte und Formeln in die native Struktur, er ist kein zweiter Inhaltsgenerator. Der Paketprüfer ist rein lesend und verwendet die Autorbelege nicht als Ersatz für den tatsächlichen Dateiabgleich.

## Sichtprüfung

Alle 122 Standardansichten und 16 ergänzenden Ansichten der tatsächlich gespeicherten Mappe wurden geöffnet und visuell geprüft. Insgesamt 138 Ansichten ohne korrekturbedürftige Beschneidung oder Überlagerung. Die zusätzlichen Ausschnitte zeigen die acht neu eingeführten Feiertagsdefinitionen mit ihren vier Sprachbezeichnungen und den jeweiligen Kalenderzeilen.

Die aufgeteilten Sichtprüfungen decken zusammen die Standardansichten 1–122 lückenlos ab. Lange technische Kennungen umbrechen teilweise innerhalb eines Wortes, bleiben aber vollständig lesbar. Die dichten Quellenhinweise, die Warnungen zu unvollständigen Datumsprofilen und die beiden Solothurner Halbtagsansichten sind lesbar. Es wurden keine neuen Korrekturen an der geprüften XLSX erforderlich.

Die Zielkopie wurde nach Abschluss erneut auf Paketintegrität und Hash geprüft. Der aktuelle Quellcode erzeugt dasselbe Modell wie die beim Erstellen gespeicherte Modellreferenz. Die gespeicherte V0.9 ist weiterhin bytegleich.

Finale SHA-256 der geprüften V0.10: `bba15a8f6e7b6956662d00bb1b7efb51903ad19aa2b2d1dc29c42a7fd9361e4e`.

Die lokalen maschinenlesbaren Nachweise und vier Sichtprüfvermerke liegen unter `.work/ap18b-04/batch/`. Diese technischen Artefakte sind kein zusätzlicher Freigabeentscheid.

## Grenzen des Nachweises

- Die Prüfungen sind keine native Excel-Bedienprüfung. Ein neuer Test mit Microsoft Excel wird nicht behauptet.
- Die HTTPS-Verknüpfungen sind paketstrukturell geprüft. Nicht jeder Endpunkt ist jederzeit direkt erreichbar. Die Quellenpakete dokumentieren insbesondere die SG-Zugriffsgrenze und die alternativen Normvolltextabgleiche für dynamische Portale.
- Provisorische Übersetzungen sind nicht sprachlich abgenommen. Der Bezug von Normlisten auf konkrete Verfahren bleibt gesondert zu prüfen.
- Fünf bekannte Prüffragen in AR, AI, GL und NE bleiben sichtbar offen. Die Datei ist trotz Einträgen für alle Kantone kein vollständig freigegebener ewiger Fristenkalender.
- Es wurden keine produktiven Daten, Releases, SPFx-Pakete oder E-/Q-/P-Bereitstellungen verändert und keine Commits veröffentlicht.

## Reproduktion

Mit den gebündelten Node-/Python-Runtimes und der vorhandenen auf diese Bibliotheken gerichteten Task-Verknüpfung:

```text
node scripts/build-ap18a-workbook.mjs --batch-04
python3 scripts/finalize-ap18b-03.py --batch-04
node scripts/build-ap18a-workbook.mjs --batch-04 --verify
node scripts/build-ap18a-workbook.mjs --batch-04 --verify --inspect-special
python3 scripts/check-ap18b-03-workbook.py --batch-04 --self-test
```

Das vorhandene Buildermodul wird wiederverwendet. Frühere Modi und Modelle bleiben reproduzierbar. Der unabhängige V0.9-Prüfer wurde nach den gemeinsamen Prüferanpassungen ebenfalls erneut erfolgreich ausgeführt.

[Erfassungsbericht und offene Fälle](../../docs/architektur/erfassung-ap18b-04.md)
