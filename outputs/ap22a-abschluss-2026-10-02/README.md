# AP22A Abschlussstand vom 2. Oktober 2026

Status: lokale Abschlussvorlage. Der neue gezielte Entscheid zu vier Verbindungen des 2. Januar steht noch aus. Die fachliche Freigabe gemäss DEC-2026-028 bleibt erteilt. Keine Produktaktivierung oder Publikation.

Führende Zusammenfassung: [AP22A Abschlussvorlage](../../docs/fachrecht/abschluss-ap22a.md).

## Inhalt

- `2026-10-02_Verfahrens-und-Gebietsmatrix_AP22A_V0.2.xlsx`: separate Folgefassung der kommentierten V0.1, fünf bestehende Blätter, 198 Matrixzeilen, 157 Quellenverweise und 22 zentrale Prüfaufträge.
- `matrix-data-v02.json`: Dokumentationsmodell. Kein importierbarer Release und kein neuer Produktvertrag.
- `regional/zuordnungen.json` und `weitere/zuordnungen.json`: begründete Konkretisierung aller 73 früher offenen Bindungen. 69 konkrete Auswahlen, vier Vorschläge mit `approved: false` im zusammengeführten Modell.
- `model-check.json` und `existing-regression.txt`: 14 Modellproben und 220 bestehende Regressionstests bestanden. Keine Behauptung bereits ausgeführter neuer Integrationstests.
- `workbook-build.json` und `workbook-qa.json`: Bau- und Rückleseprüfung der gespeicherten Arbeitsmappe.

## Arbeitsmappenprüfung

Die gespeicherte XLSX wurde mit dem Tabellenwerkzeug erneut eingelesen. Fünf Formeln zählen die Statusgruppen korrekt als 8, 160, 4, 4 und 22. Ein kontrollierter Statuswechsel änderte beide betroffenen Zähler, anschliessend wurde der Eingangswert wiederhergestellt. Keine Formel-Fehlerwerte gefunden.

Eine zusätzliche unabhängige Strukturprüfung mit einem zweiten XLSX-Leser bestätigt:

- Alle fünf Blattnamen und die Reihenfolge sind erhalten.
- Alle Benutzerbemerkungen in Verfahrensmatrix, Prüfpunkten und Quellen sind wertgleich übernommen, einschliesslich der vier GR-Einträge.
- Der vollständige Wertebereich A6:O55 des Blatts Geltungsräume ist gegenüber dem kommentierten Original unverändert.
- Fünf native Tabellen sind erhalten. Matrix A6:O204, Quellen A6:J163 und Prüfpunkte A6:I28 reichen bis zum tatsächlichen Ende.
- 157 native Quellenhyperlinks sind vorhanden. Diese Strukturprüfung ist kein erneuter HTTP-Erreichbarkeitstest sämtlicher Quellen. Zwei historische amtliche HTTP-Verweise sind mit dokumentierter Spiegelprüfung gekennzeichnet.
- Die Filterbedingungen und ausgeblendeten Filterzeilen sind ausschliesslich in der neuen Kopie zurückgesetzt. Die Originalansicht bleibt unberührt.

Die geänderten Blätter wurden aus der tatsächlich gespeicherten Datei gerendert und in repräsentativen Ausschnitten visuell geprüft. Die Prüfung umfasste Lesehilfe, Statuszählung, Listenverwendung, GR-Bemerkungen, die neuen begrenzten Grenzvorschläge, Prüfpunkte und angefügte Quellen. Eine erneute native Bedienprüfung in Microsoft Excel wurde nicht durchgeführt. Eine bestätigte Online-Synchronisation wird nicht behauptet.

SHA-256 V0.2: `25bf4999d63a3b2fabefe74bcd621e933c6bebed92d05ff9884cf200a0322c84`.

Die Originalarbeitsmappe bleibt bei SHA-256 `7e1ec29abc9a08e6c7627ebf745e3af011806f2ab4fe77d4021f294745aa531d`. Die Originalmatrixdaten bleiben bei SHA-256 `e39e56bfb892aff8bc57e0b8229454401e2d21bb610b2e637005ff4af7f47319`.

Der begrenzte zusätzliche KI-Gegencheck bestätigt die vollständige Übernahme der 198 Schlüssel, aller 73 Nachtragszuordnungen, der 20 negativen Listenbindungen, der vier GR-Grenzen und sämtlicher Quellenverweise. Er ersetzt keine menschliche fachliche Verantwortung und keine vollständige neue Rechtsquellenrevision.

## Reproduzierbarkeit und Schutz der Arbeitskopien

`scripts/check-ap22a-model.mjs` führt die begrenzten Bestandsprüfungen aus. `scripts/build-ap22a-completion.mjs` führt die Dokumentationsdaten zusammen. `scripts/complete-ap22a-matrix.mjs` erstellt ausschliesslich die separate V0.2 und besitzt einen reinen Rücklesemodus `--verify`. Die Originaldatei ist durch eine feste Eingangsprüfsumme gebunden.

Eine künftig von David bearbeitete V0.2 darf nicht durch erneuten Builderlauf überschrieben werden. Zuerst muss sie als neue Reviewkopie gebunden und eine nächste Folgefassung festgelegt werden. Die Python-Hilfe verändert ausschliesslich Filter-/Ansichtsmetadaten beziehungsweise native Linkbeziehungen, keine Zellwerte oder Formeln. Die Zellbearbeitung erfolgte mit dem Tabellenwerkzeug.

Keine Änderungen an Rechenkern, Releasekatalogen, Paketversionen, Mirrors, E/Q/P, M365-Berechtigungen oder GitHub. Private Sicherungen und anderweitige Benutzeränderungen sind nicht Bestandteil dieser Ablage.
