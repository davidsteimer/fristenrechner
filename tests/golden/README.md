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

## AP11A-Kandidatenfälle

Die acht Fälle unter [`candidates/ap11a-vrpg-be-special-cases.json`](candidates/ap11a-vrpg-be-special-cases.json) sind noch nicht Teil des abgenommenen AP6-Korpus. Sie verwenden den Kandidaten-Testvertrag 2.0, weil Spezialregime mehrere Datumswerte, Uhrzeiten, feste Abstände, Wochentage, konkurrierende Anknüpfungen, Fristwahrungsprofile und Prüfschranken benötigen.

Die Kandidatenprüfung läuft getrennt:

```bash
.venv/bin/python tests/special-regimes/validate_special_regime_candidates.py
```

Die bestehenden 15 Referenzfälle und drei Sperrfälle bleiben unter dem Testvertrag 1.0 unverändert.

## AP17B-Anwendbarkeitskandidat

Der separate [AP17B-Korpus](candidates/ap17b-anwendbarkeit.json) folgt der am 12. September 2026 durch David Steimer fachlich abgenommenen [Fachmatrix](../../docs/fachrecht/vrpg-anwendbarkeit-ap17b.md). Die [Abnahmenotiz](../../docs/fachrecht/vrpg-anwendbarkeit-ap17b.md#7-abnahme-vom-12-september-2026-und-verbleibende-grenze) bindet den unveränderten Korpus per SHA-256. Er ist weder ein Datenrelease noch Teil der produktiv freigegebenen Golden Cases. Als archivische Kandidatenfassung behält er unverändert `status: draft`, `approvedBy: null` und `runtimeActivation: false`. Die Fachabnahme ist separat dokumentiert und wird nicht in diese technischen Prüfmerkmale zurückgeschrieben.

Er umfasst vier Rechenprofile, 16 Kandidatenzuordnungen und vier ausdrücklich gesperrte Sammelpfade. 28 positive und 32 negative Fälle decken die Zuordnungen, 16 verschiedene Sperrgründe, Stillstandsgrenzen, Sonntage als erste Zähltage, Feiertagsverschiebungen und das Beschaffungs-Übergangsrecht ab. Die Ergebnisse sind **fachlich abgenommene Referenzerwartungen für die spätere Integration**, nicht der heutige Laufzeitstatus.

Ausführung mit Python 3.9 oder neuer, ohne Zusatzpakete:

```bash
python3 -B tests/golden/validate_ap17b_candidates.py
```

Am 11. September 2026 tatsächlich bestanden:

```text
VALID AP17B CANDIDATE: cases=60, positive=28, blocked=32, candidateMappings=16, blockedMappings=4, blockedReasons=16
NEGATIVE SELF-TESTS: 17 mutations rejected
DRAFT ONLY: no legal approval, no runtime activation, no production-core import
```

Der historische Prüftext vom 11. September 2026 bleibt unverändert. Auch eine erneute Ausführung des unveränderten Validators gibt die technische Kandidatenkennzeichnung aus. Sie bewertet keine spätere, separat dokumentierte Fachabnahme. Eine Umstellung des Korpus auf einen freigegebenen Produkt- oder Datenvertrag ist erst Gegenstand der kontrollierten Integration.

Zur Dokumentation des Abschlusses wurde die separate Kandidatenprüfung am 12. September 2026 erneut ausgeführt. Alle 60 Fälle und 17 negativen Selbsttests bestanden unverändert. Die SHA-256-Prüfsummen von Korpus und Validator stimmen mit dem Ausgangsstand vor der Abnahmenotiz überein. Die Prüfungen von Produktcode und SPFx wurden dabei nicht erneut ausgeführt.

Der Validator importiert keinen Produktcode und nicht das bestehende AP6-Orakel. Er prüft die Datumswerte durch tägliches Zählen sowie unabhängig davon durch Intervallschnittrechnung. Als feststehende Kalenderreferenz dient der freigegebene expandierte MVP-0.2-Kalender für CH und BE. Die relevanten Tage wurden gegen den MVP-0.3-Regelkalender abgeglichen. Das Fenster 2026–2027 ist ein synthetisches Testprojektionsfenster und keine zeitliche Rechtsfreigabe. Künftige Normstände müssen vor einem Datenrelease gesondert geprüft werden.

Die Strukturprüfung verlangt eindeutige IDs und Auswahlkombinationen, gültige Quellen- und Profilverweise, feste oder ausdrücklich eingegebene Dauer, alle 60 geplanten Fall-IDs und mindestens einen positiven Fall je Kandidatenzuordnung. Gesperrte Fälle dürfen kein Fristergebnis enthalten. 17 absichtliche Mutationen prüfen unter anderem falsches Ende, falsche Dauer, fehlenden Stillstand, unbekannte Quelle, Auswahlkonflikt, verlorene Fallabdeckung und eine unzulässige Aktivierung oder Freigabemarkierung.

Die fachlichen Voraussetzungen wie geklärte Eröffnung, korrekter Rechtsmittelweg und Feiertagsanknüpfung werden im Testvertrag ausdrücklich vorgegeben. Dieser unabhängige Kandidatentest ist kein Nachweis einer Produkt-, SPFx- oder Hostintegration. Die nachfolgende tatsächliche Integration wird separat im [AP17C-Nachweis](../../docs/architektur/vrpg-integration-ap17c.md) geprüft. `tests/core/ap17c-qualified.test.ts` führt alle 60 Fälle gegen den neuen Rechenkern aus, `tests/ui/ap17c-qualified.test.ts` prüft zusätzlich den UI-Adapter und seine Kontext- und Speichergrenzen. Der hier archivierte Korpus und sein Validator bleiben unverändert.
