# AP11A-Kandidat: Spezialregime zum VRPG Bern

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP11A, GitHub-Issue #28 |
| Eltern-Item | #24 |
| Datenstatus | `candidate` |
| Fachstand | 30. August 2026 |
| Fachliche Freigabe | erteilt durch David Steimer am 30. August 2026 |
| Freigegebenes Basisrelease | `2026-08-29-ap5-approved.1` |

## Zweck

Dieser Bestand übersetzt die in AP11A geprüften Spezialbestimmungen in ein komponentenbasiertes Kandidatenmodell. Er ergänzt das freigegebene AP5-Release noch nicht. Der Bestand darf deshalb nicht durch die produktive Anwendung aktiviert werden.

Das fachliche Zielmodell trennt vier Rechenarten, zwei Terminherkünfte, sechs Arten der Fristwahrung, Kalender- und Stillstandsprofile, eine materielle Prüfschranke sowie rechtliche Übersteuerungen. Diese Trennung verhindert, dass beispielsweise «Originaleingang bis 12.00 Uhr» fälschlich als gewöhnliche Tagesfrist behandelt wird.

Der formale AP11A-Kandidat enthält noch drei Regeln vom Typ `R5_FIXED`. Sie bewahren den damaligen geprüften Quellenbestand, gelten aber nur als provisorisches Übergangsabbild für die Terminherkunft `AUTHORITATIVE`. Sie sind keine fünfte Rechenart und dürfen im MVP nicht als Fristtyp auf dem GUI erscheinen. AP11B hat diese Migration im getrennten Format-2-Referenzrelease umgesetzt. Der AP11A-Ausgangsbestand bleibt zur Reproduzierbarkeit unverändert.

## Inhalt

| Bestandteil | Anzahl | Bedeutung |
| --- | ---: | --- |
| Quellen | 16 | amtliche Erlasse, Materialien, Praxisnachweis und Rechtsprechung |
| Kalenderprofile | 4 | bernisch, BGG, Bundesverfahren und feste Termine mit Einzelfallprüfung |
| Stillstandsprofile | 4 | kein Stillstand, BGG, ATSG und VwVG |
| Einreichungsprofile | 6 | keine Eingabe, Aufgabe, Eingang, Originaleingang 12.00 Uhr, eingeschriebene Aufgabe, elektronische Quittung |
| Rechenregeln | 27 | R1 bis R4 sowie drei provisorische `R5_FIXED`-Hintergrundregeln |
| Regime | 34 | 24 unterstützt, 3 gesperrt, 7 offen |
| Prüfschranken | 1 | sofortige Anfechtung einer Vorbereitungshandlung |
| Übersteuerungen | 3 | leere Referenz, veralteter Querverweis, dynamische Behördenanordnung |

## Dateien

- [`catalog.json`](catalog.json) enthält den vollständigen Kandidatenkatalog.
- [`examples/r5-fixed.json`](examples/r5-fixed.json) ist ein positives Schema-Beispiel für das provisorische Hintergrundabbild eines autoritativ festgelegten Termins. Es beschreibt keine GUI-Funktion.
- [`examples/f3-original-1200.json`](examples/f3-original-1200.json) ist ein positives Schema-Beispiel für den Originaleingang bis 12.00 Uhr.
- [`../../../tests/golden/candidates/ap11a-vrpg-be-special-cases.json`](../../../tests/golden/candidates/ap11a-vrpg-be-special-cases.json) enthält acht synthetische Kandidatenfälle.

Die private Arbeitsmappe diente nur als Arbeitsinput. Sie und ihre SharePoint-Adresse werden nicht publiziert. Sämtliche ausführbaren Regeln sind im öffentlichen Bestand auf die nachgeprüften Quellen zurückgeführt.

## Ausführung der Kandidatenprüfung

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python tests/special-regimes/validate_special_regime_candidates.py
```

Erwartete Ausgabe:

```text
VALID: regimes=34, rules=27, filingProfiles=6, candidateCases=8
NEGATIVE FIXTURES: unknown-calculation-type.json, original-without-cutoff.json
SEMANTIC NEGATIVE TESTS: unbekannte Regel, doppelte Regel, unbekannter Anker, gesperrtes Rechenregime
```

## Freigabegrenze

Ein Schemaerfolg beweist nur die formale und technische Konsistenz. David Steimer hat den AP11A-Kandidatenbestand und anschliessend AP11B am 30. August 2026 abgenommen. Die Vorgaben von DEC-2026-014 sind im [Format-2-Referenzrelease](../../releases/2026-08-30-ap11b-approved.1/README.md) umgesetzt. Dieser AP11A-Ordner bleibt der unveränderte fachliche Ausgangsnachweis und wird nicht produktiv geladen.
