# AP12A-Kandidat für regelbasierte Kalender

Dieser Kandidat überführt die endlichen Feiertags- und Stillstandslisten des freigegebenen MVP-0.2-Datenstands in versionierte Regeln. Er ist noch kein aktivierbares Datenrelease und wird von keinem Manifest referenziert.

## Bestand

| Artefakt | Inhalt | Regeln |
| --- | --- | ---: |
| `ch-federal-calendar.json` | Bundesfeiertag sowie Oster-, Sommer- und Jahreswechselstillstand | 4 |
| `be-public-holidays.json` | bernische feste, osterabhängige und wochentagsabhängige Feiertage | 11 |

Die beiden Artefakte verwenden das mit DEC-2026-015 beschlossene Kalenderkomponentenformat `2.0.0`. Der Kanton Bern erbt weiterhin den Bundeskalender. Die Regeln enthalten stabile IDs, Deutsch und Französisch, Gültigkeit, Priorität, rechtliche Wirkung und genaue Quellenverweise.

## Referenzgleichheit

Der unabhängige AP12A-Validator erzeugt aus den Regeln die Daten für den bisherigen Referenzzeitraum und vergleicht die fachlich relevanten Felder mit `2026-08-31-mvp-02-approved.1`.

- Bund: 3 konkrete Feiertage und 10 Stillstandsperioden
- Bern: 33 konkrete kantonale Feiertage
- Ergebnis: vollständige Gleichheit für 2026 bis 2028 beziehungsweise bei den randjahresübergreifenden Gerichtsferien vom 18. Dezember 2025 bis 2. Januar 2029

Die neue fachliche Satz-ID `ch-court-holidays` ersetzt erst bei der späteren Migration die zeitlich begrenzte ID `ch-court-holidays-2026-2028`. Die erzeugten Perioden-IDs wie `EASTER-2027` bleiben stabil.

## Ausführung

```bash
npm run test:data:ap12a
```

Der Validator prüft Schemata, Quellenreferenzen, Gemeinwesen, Kalendervererbung, Gültigkeit, Regeltypen, Referenzgleichheit, Jahrhundertgrenzen, Schaltjahre, Overrides und festgelegte Fehlerklassen.

## Status und Verantwortlichkeit

David Steimer hat AP12A mit Datenmodell und Referenzvertrag am 31. August 2026 abgenommen und DEC-2026-015 beschlossen. Die beiden Regelbestände sind damit die freigegebene fachliche und technische Referenz für AP12B. Sie bleiben bis zur Integration in ein vollständig validiertes Format-3-Datenrelease nicht aktivierbare Kandidaten und verändern weder den MVP-0.2-Datenstand noch den laufenden SharePoint-Mirror. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.
