# Lokaler Prüfnachweis: AP18-Archiv und Fortsetzung AP18C

Datum: 22. September 2026. Technische Prüfung durch Codex, keine zusätzliche menschliche Fachabnahme. Node `22.23.2`, bestehende Projektabhängigkeiten und gebündelter Python-Interpreter.

| Prüfschritt | Ergebnis |
| --- | --- |
| Vier Originalpfade vor/nach Kopie, SHA-256 und Bytevergleich | Unverändert, alle vier Archivkopien entsprechen dem heutigen Ausgangsbestand |
| V0.9-/V0.10-Originalidentität | Nicht wiederhergestellt, beide historischen Abweichungen ausdrücklich erhalten |
| V0.11-/V0.12-Referenzidentität | Ursprüngliche Prüfsummen weiterhin exakt erfüllt |
| Lokaler Modus der vier neuen XLSX-Archivkopien | `0444`, keine Garantie eines revisionssicheren Speichers |
| Neue Arbeitskopie ab V0.12 | Bei Erstellung byteidentisch, Modus `0644`, von Git ausgeschlossen |
| Dedizierte Archivtests | 10 bestanden, keine übersprungen |
| Kalender-, Modell- und JavaScript-Importtests | 459 bestanden, keine übersprungen |
| Python-Paket- und Lesertests AP18C | 27 bestanden |
| Kern-, UI- und Public-App-Regression | 491 bestanden, keine übersprungen |
| TypeScript | `tsc --noEmit` ohne Fehler |
| Erneuter AP18C-Kandidatenbau aus Referenzkopie | Unveränderte Ausgabe, 1'437 Regel-/Jahreskombinationen und zwölf CH-/BE-Referenzregeln geprüft |
| Unveränderte produktive Referenzartefakte | Alle acht vom bestehenden Release manifestierten Dateien beim Kandidatenbau verifiziert |

Die 68 JavaScript-Importtests sind in den 459 Kalender-/Modelltests enthalten und werden nicht nochmals addiert. Zusammen mit den 27 Python-Tests bestehen unverändert 95 spezifische AP18C1-Tests. Die separate fachliche V0.12-Arbeitsmappenprüfung ist im bisherigen AP18C1-Nachweis dokumentiert und wird hier nicht als erneut durchgeführte Excel-Bedienprüfung ausgewiesen.

Der erste Aufruf der Kalendergesamtsuite ohne `--import tsx` scheiterte an einer nicht unterstützten TypeScript-Parameter-Property im AP18A-Testimport. Der korrekte bestehende TypeScript-Lader wurde im neuen Paketbefehl `test:calendar-models` ergänzt. Der anschliessende vollständige Lauf ergab die oben ausgewiesenen 459 bestandenen Tests. Keine fachliche Assertion wurde deswegen entfernt oder abgeschwächt.

Kandidaten-SHA-256 vor und nach Pfadtrennung:

```text
9553f483678bc5f209099703588402a7dd65cf4d9aac8a00aadb6f9dbe966099
```

Ein zusätzlicher lesender Implementierungsreview fand keinen blockierenden Befund. Er bestätigt insbesondere Nichtüberschreibung, ausschliesslichen Import der V0.12-Referenz und Erhalt der ursprünglichen Prüfsummensperre. Diese technische Gegenprüfung ist keine menschliche Zweitfreigabe.

**Ergebnis:** Die bestätigte Archivbehandlung und Arbeitskopientrennung sind umgesetzt. Funktionstests sind grün. Der historische Bytebeweis für V0.9/V0.10 bleibt ausdrücklich unerfüllt. AP18C kann auf der unveränderten V0.12 weitergeführt werden. Der vorgeschlagene neue Produktvertrag DEC-2026-023 ist noch nicht beschlossen oder implementiert.

Keine Arbeitsmappe wurde neu serialisiert. Kein Datenrelease, App-Bundle, SharePoint-Mirror, Tenant oder öffentlicher Betrieb wurde verändert. Keine Veröffentlichung und keine neue Excel-, SharePoint- oder Teams-Bedienprüfung in diesem Schritt.

[Archivbestätigung](../../../../docs/fachrecht/archivbestaetigung-ap18.md) · [AP18C-Nachweis](../../../../docs/architektur/import-ap18c.md) · [DEC-2026-023](../../../../docs/entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md)
