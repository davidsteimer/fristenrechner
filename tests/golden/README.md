# AP6 Golden Cases

Dieser Bereich enthält die ersten maschinenlesbaren Referenzfälle für den Fristenrechner. Die Fälle verwenden ausschliesslich synthetische Daten und den freigegebenen AP5-Datenrelease `2026-08-29-ap5-approved.1`.

Die berechenbaren Erwartungen wurden am 29. August 2026 durch David Steimer fachlich abgenommen und tragen den Status `approved`. Offene und unvollständige Konstellationen liegen getrennt unter `unresolved/` und erzeugen ausdrücklich kein Fristende.

## Bestand

| ID | Profil | Schwerpunkt | Eingabe | Frist | Erwartung |
| --- | --- | --- | --- | --- | --- |
| `GC-STPO-START-001` | StPO | Beginn am Folgetag | 01.09.2026 | 1 Tag | 02.09.2026 |
| `GC-STPO-SATURDAY-002` | StPO | Ende am Samstag | 16.09.2026 | 10 Tage | 28.09.2026 |
| `GC-STPO-NATIONAL-DAY-003` | StPO | Bundesfeiertag und Sonntag | 22.07.2027 | 10 Tage | 02.08.2027 |
| `GC-STPO-EASTER-004` | StPO | Kein Stillstand über Ostern | 19.03.2027 | 10 Tage | 30.03.2027 |
| `GC-STPO-LEAP-YEAR-005` | StPO | Schaltjahr | 19.02.2028 | 10 Tage | 29.02.2028 |
| `GC-ZPO-WEEKEND-DELIVERY-006` | ZPO | Gewöhnliche Post am Samstag | 12.09.2026 | 10 Tage | rechtliche Zustellung 14.09.2026, Ende 24.09.2026 |
| `GC-ZPO-EASTER-SUSPENSION-007` | ZPO | Osterstillstand | 19.03.2027 | 10 Tage | 13.04.2027 |
| `GC-ZPO-SUMMARY-EASTER-008` | ZPO | Summarisches Verfahren ohne Stillstand | 19.03.2027 | 10 Tage | 30.03.2027 |
| `GC-BGG-SUMMER-SUSPENSION-009` | BGG | Sommerstillstand | 13.07.2027 | 10 Tage | 24.08.2027 |
| `GC-BGG-PROCUREMENT-010` | BGG | Beschaffung ohne Stillstand | 13.07.2027 | 10 Tage | 23.07.2027 |
| `GC-VWVG-YEAR-END-011` | VwVG | Jahreswechselstillstand | 16.12.2026 | 10 Tage | 11.01.2027 |
| `GC-VWVG-INTERIM-012` | VwVG | Vorsorgliche Massnahmen ohne Stillstand | 16.12.2026 | 10 Tage | 28.12.2026 |
| `GC-VRPGBE-BERN-HOLIDAY-013` | VRPG BE | Auffahrt im Kanton Bern | 26.04.2027 | 10 Tage | 07.05.2027 |
| `GC-VRPGBE-CORPUS-CHRISTI-014` | VRPG BE | Fronleichnam ausserhalb Berns | 18.05.2027 | 9 Tage | 27.05.2027 ohne Verschiebung |
| `GC-VRPGBE-BERCHTOLD-015` | VRPG BE | Ende am 2. Januar | 23.12.2026 | 10 Tage | 04.01.2027 |

Jeder Fall enthält:

- Datenrelease und Rechtsprofil
- synthetische Eingaben und explizite Selektoren
- Quellen- und Regel-IDs mit genauer Fundstelle
- rechtlich massgebendes Datum und Fristbeginn
- rechnerisches und endgültiges Fristende
- angewandte Stillstandsperioden und Verschiebungsgründe
- geordnete, maschinenlesbare Rechenspur
- Prüf- und Freigabestatus

## Getrennte Sperrfälle

| ID | Sperrgrund | Erwartetes Verhalten |
| --- | --- | --- |
| `OPEN-STPO-DELIVERY-FICTION-001` | Zustellfiktion nicht bestätigt | Berechnung blockieren |
| `OPEN-VRPGBE-SPECIAL-LAW-002` | mögliche Spezialregel ungeklärt | Berechnung blockieren |
| `OPEN-STPO-HOLIDAY-ANCHOR-003` | widersprüchliche kantonale Anknüpfung | Berechnung blockieren |

Diese Fälle sind keine freigegebenen Fristergebnisse. Sie sichern die Sicherheitsgrenzen aus AP4 und verhindern einen scheinbar plausiblen Standardwert.

Der Datensatz `invalid/missing-deadline-days.json` lässt die Fristdauer bewusst weg. Er muss bereits an der Schemavalidierung scheitern.

## Unabhängige Nachrechnung

Der Validator liest Rechtsprofile, Kalender, Vererbungen, Feiertage und Stillstandsperioden direkt aus dem AP5-Release. Er berechnet jedes erwartete Fristende neu und vergleicht es mit dem Golden Case. Die Produktionsimplementierung wird diesen Python-Code nicht verwenden. Er dient als unabhängiges Testorakel für den späteren TypeScript-Rechenkern.

Ausführung vom Repository-Hauptverzeichnis:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python tests/golden/validate_golden_cases.py
```

Erwartete Ausgabe:

```text
VALID: referenceCases=15, blockedCases=3, profiles=5, dataRelease=2026-08-29-ap5-approved.1
NEGATIVE FIXTURE: missing-deadline-days.json wurde wie erwartet abgewiesen
SEMANTIC NEGATIVE TESTS: falsches Fristende, unbekannte Quelle, doppelte Fall-ID, falscher Sperrgrund
```

## Quellenprüfung

Die Referenzerwartungen beruhen auf der geprüften AP4-Rechtsmatrix und wurden für AP6 nochmals gegen die konsolidierten Erlassstände kontrolliert. Massgebend sind insbesondere:

- [StPO, Art. 89 und 90](https://www.fedlex.admin.ch/eli/cc/2010/267/de)
- [ZPO, Art. 142, 145 und 146](https://www.fedlex.admin.ch/eli/cc/2010/262/de)
- [BGG, Art. 44 bis 46](https://www.fedlex.admin.ch/eli/cc/2006/218/de)
- [VwVG, Art. 20 und 22a](https://www.fedlex.admin.ch/eli/cc/1969/737_757_755/de)
- [VRPG BE, Art. 41](https://www.belex.sites.be.ch/app/de/texts_of_law/155.21)
- [Feiertagsgesetz BE, Art. 2](https://www.belex.sites.be.ch/app/de/texts_of_law/555.1)
- [VGer BE SH 200 2026 421 vom 26. Juni 2026](https://entscheidsuche.ch/docs/BE_Verwaltungsgericht/BE_VG_001_200-2026-421_2026-06-26.pdf)

Der Rechtsfall zu Fronleichnam verwendet nicht die echten Falldaten des Urteils. Er übernimmt ausschliesslich den abstrakten Grundsatz zur bernischen Feiertagsanknüpfung und verwendet ein anderes, synthetisches Datum.
