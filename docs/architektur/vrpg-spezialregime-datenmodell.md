# Komponentenmodell für VRPG-Spezialregime

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP11A, GitHub-Issue #28 |
| Status | Architektur- und Datenmodellkandidat |
| Stand | 30. August 2026 |
| Basis | AP5-Format 1.0.0 und AP6-Testvertrag 1.0.0 |
| Entscheidbedarf | [DEC-2026-014, vorgeschlagen](../entscheidungen/DEC-2026-014-komponentenweise-fachdatenformatevolution.md) |

## 1. Ziel

Das Modell soll die bekannten Spezialregime zum bernischen VRPG abbilden, ohne den Rechenkern in eine Sammlung einzelner Gesetzesfälle zu verwandeln. Es trennt fachliche Auswahl, Berechnung, Kalender, Fristenstillstand, Fristwahrung, Warnungen und Sperren in eigenständig validierbare Komponenten.

## 2. Aufbau

```text
Spezialregime
  ├── Rechenregel R1 bis R5
  │     └── ein oder mehrere typisierte Anker
  ├── Kalenderprofil
  ├── Stillstandsprofil
  ├── Einreichungsprofil F0 bis F5
  ├── optionale Prüfschranke G1
  ├── optionale rechtliche Übersteuerung
  └── Quellen, Gültigkeit und Prüfstatus
```

Ein Regime ist eine Konfiguration dieser Bausteine. Die Rechenregel kennt nur die für die Berechnung erforderlichen Eingaben. Das Einreichungsprofil entscheidet getrennt, ob Aufgabe, Eingang, Originaleingang, eingeschriebene Aufgabe oder elektronische Quittung massgebend ist.

## 3. Schemata

| Schema | Vertrag |
| --- | --- |
| [`deadline-rule.schema.json`](../../schemas/deadline-rule.schema.json) | R1 bis R5, Anker, Ergebnisrichtlinie, Gates, Übersteuerungen und Quellen |
| [`filing-profile.schema.json`](../../schemas/filing-profile.schema.json) | Fristwahrungsmodus, Kanäle, Nachweise, Originalerfordernis, Uhrzeit und Zeitzone |
| [`special-regime-catalog.schema.json`](../../schemas/special-regime-catalog.schema.json) | vollständiger Kandidatenkatalog und alle lokalen Referenzen |
| [`special-golden-case-suite.schema.json`](../../schemas/special-golden-case-suite.schema.json) | Testvertrag 2.0 für mehrere Datumswerte, Uhrzeiten, Ganzzahlparameter, Gates und Fristwahrung |

Die Schemata verwenden JSON Schema Draft 2020-12 und weisen unbekannte Kernfelder sowie unbekannte Rechenarten ab.

## 4. Verhältnis zum AP5-Release

Das freigegebene AP5-Release `2026-08-29-ap5-approved.1` bleibt unverändert. Der AP11A-Katalog liegt unter `data/candidates/` und wird von keinem produktiven Provider geladen.

Eine spätere Integration erfolgt mit einer neuen Release-ID und einer neuen Format-Hauptversion. Das Manifest erhält dabei eine zusätzliche Artefaktrolle für Spezialregime. Alte Consumer müssen die unbekannte Hauptversion ablehnen. GitHub, SharePoint-Mirror und manueller Import bleiben byteidentische Provider desselben Releases.

## 5. Verhältnis zum ewigen Kalender

Die Spezialregeln referenzieren stabile Kalenderprofil-IDs. Sie speichern keine Feiertage und erzeugen keine konkreten Jahreskalender. Dadurch kann ein späterer ewiger Kalender die Implementierung hinter derselben Schnittstelle ersetzen, ohne die Spezialregime neu zu modellieren. AP11A nimmt den Entscheid zu Backlog-Item #26 nicht vorweg.

## 6. Testvertrag 2.0

Der AP6-Testvertrag 1.0 akzeptiert ein rechtlich massgebendes Datum und eine positive Frist in Tagen. Er kann folgende AP11A-Fälle nicht korrekt ausdrücken:

- Fristen vor einem Wahltag
- erster bestimmter Wochentag nach einem Ereignis
- zwei konkurrierende Anknüpfungen
- behördlich festgelegte Daten und Uhrzeiten
- Originaleingang bis zu einer bestimmten Uhrzeit
- eine materielle Prüfschranke nach dem berechneten Ergebnis

Das neue Kandidatenschema 2.0 erweitert deshalb nur den Spezialfall-Testvertrag. Es enthält benannte Datums-, Uhrzeit- und Ganzzahleingaben sowie getrennte Erwartungen für provisorisches und endgültiges Fristende, Fristwahrung, Gates und Rechenspur. Die 15 abgenommenen AP6-Fälle bleiben unverändert unter Version 1.0.

## 7. Validierung

Der Kandidatenvalidator prüft:

- alle Schemata gegen das Metaschema
- positive und negative Schema-Beispiele
- eindeutige IDs und auflösbare lokale Referenzen
- zulässige Kombinationen von Regimestatus und Rechenregel
- Anker, Kalender-, Stillstands-, Einreichungs-, Gate- und Übersteuerungsreferenzen
- die fünf Rechenarten unabhängig vom späteren TypeScript-Rechenkern
- Wochenend- und Feiertagsverschiebungen gegen das abgenommene AP5-Kalenderrelease
- Fristwahrung mit Datum, Uhrzeit und Originalerfordernis
- genau acht synthetische Kandidatenfälle
- semantische Negativtests für unbekannte Regeln, doppelte IDs, unbekannte Anker und gesperrte Regime

## 8. Aktivierungs- und Fehlerverhalten

| Zustand | Verhalten |
| --- | --- |
| `supported` | Berechnung zulässig, solange alle verlangten Eingaben vorliegen |
| `open` | keine abschliessende Berechnung, fehlende Voraussetzung sichtbar ausweisen |
| `blocked` | Berechnung verweigern und Sperrgrund anzeigen |
| feste Frist mit `manualReview` | Termin berechnen oder übernehmen, aber nicht als abschliessend ausgeben, bis die Wahlanordnung geprüft ist |
| Übersteuerung mit Warnpflicht | gesetzliche Abweichung anwenden und ihre Herleitung sichtbar anzeigen |

Das Modell enthält keinen stillen Fallback vom Spezialregime auf die allgemeine VRPG-Frist.

## 9. Standards

Für diesen spezialisierten Regelkatalog besteht kein unmittelbar passender eCH-Austauschstandard. Die Lösung verwendet deshalb JSON, JSON Schema Draft 2020-12, ISO-Datumswerte, IANA-Zeitzonen und sprachneutrale Schlüssel. Die Abweichung ist auf das interne Fachdatenformat begrenzt. Für Barrierefreiheit, Betrieb und spätere Verwaltungsschnittstellen bleiben einschlägige eCH-Standards massgebend.
