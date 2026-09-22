# AP18B-01: Darstellungsrevision V0.6

Stand: 13. September 2026. Nutzerauftrag: Gemeinden bei den beiden Rheinfelder Geltungsbereichen direkt aufführen, statt dort nur die Normgruppe zu bezeichnen.

Datei: `2026-09-13_Feiertagsmatrix_Schweiz_AP18B-01_AG_V0.6.xlsx`

SHA-256: `b1c88de49b33a2e702d8387eef150b16791fa30bbc7ce465e01ee30adb3965b2`

## Änderung

- `Geltungsbereiche!C15`: Gemeinden Hellikon, Mumpf, Obermumpf, Schupfart, Stein und Wegenstetten.
- `Geltungsbereiche!C16`: Gemeinden Kaiseraugst, Magden, Möhlin, Olsberg, Rheinfelden, Wallbach, Zeiningen und Zuzgen.
- `Übersicht!A6` und `Übersicht!A36`: neue Revisionsbezeichnung und Kurzbeschreibung.

Die Gemeindelisten werden aus den bereits erfassten Profilmitgliedern abgeleitet. IDs, Quellen-ID und Fundstellen bleiben erhalten. Kalenderbeschriftungen, Zuordnungen, Regeln und Fachstatus sind unverändert. Der Strukturvertrag bleibt 0.4.0. Keine neue Fachabnahme oder Releasefreigabe.

## Prüfung

- Ausgangsdatei V0.5 über SHA-256 verifiziert und unverändert erhalten.
- Vier Textzellen über die Spreadsheet-Bibliothek bearbeitet. Der begrenzte native Übernahmeadapter lässt alle anderen Zellen und Excel-Funktionen unverändert.
- 6504 übrige Zellen unverändert, darunter sämtliche 1104 Formeln mit gespeicherten Ergebnissen.
- Nur die XML-Inhalte der beiden bezeichneten Arbeitsblätter geändert. Nach Ausblendung der vier Textzellen sind auch diese strukturell identisch. Alle übrigen Paketbestandteile sind bytegleich, einschliesslich Styles, Tabellen und ihrer Filter. Zeilenhöhen, Validierungen und Schutz bleiben erhalten.
- Gespeicherte V0.6 neu eingelesen, vier Texte kontrolliert, neu berechnet und ohne gefundene Formelfehler geprüft. Die geprüfte Datei wurde dabei nicht erneut exportiert.
- Vier Ansichten der gespeicherten Datei visuell geprüft. Die vollständigen Gemeindelisten sind innerhalb der bestehenden Zeilenhöhen lesbar.
- Die 57 paketbezogenen Modelltests bestehen erneut, einschliesslich Gebietsmitgliedern und negativen Zuordnungsfällen.

Eine zusätzliche Bedienprüfung in der nativen Excel-App wurde für diese Darstellungsrevision nicht durchgeführt. Der umfassendere [V0.5-Prüfnachweis](QA-AP18B-01.md) bleibt als historischer Nachweis erhalten.

## Reproduktion

```bash
node scripts/build-ap18a-workbook.mjs --municipality-labels
python3 scripts/finalize-ap18b-labels.py
node scripts/build-ap18a-workbook.mjs --municipality-labels --verify
node --test tests/calendar-rules/ap18b-ag-model.test.mjs
```

Benötigt wird dieselbe gebündelte Spreadsheet-Laufzeit wie für V0.5. Es wurden keine Produktdaten, öffentlichen Repositories oder Betriebsumgebungen verändert.
