# Quellenprüfungen

Dieser Ordner trennt die fachliche Quellenprüfung von den unveränderlichen Datenreleases. Eine Prüfung mit dem Ergebnis `unchanged` wird vollständig dokumentiert, erzeugt aber keinen künstlichen Datenrelease.

| Artefakt | Zweck |
| --- | --- |
| `source-register.json` | Vollständiges Register der produktiven, unterstützenden und überwachten amtlichen Quellen für CH und BE |
| `events/*.json` | Append-only-Protokoll der einzelnen Prüfereignisse |
| `index.json` | Reproduzierbarer Suchindex mit dem jüngsten Prüfstand und den betroffenen Datenkomponenten |

## Initialbestand AP13

| Merkmal | Wert |
| --- | --- |
| Stand | 31. August 2026 |
| Quellen | 25 |
| produktiv verwendet | 21 |
| unterstützende Rechtsprechung | 2 |
| Änderungsmonitoring | 2 |
| Ergebnis | 25-mal `unchanged` |
| offene Weiterverfolgung | `OF-001` zum Inkrafttreten der Wochenend-Zustellungsregel |
| nächster ordentlicher Jahrestermin | spätestens 15. November 2027 |
| Status | fachlich-technisch abgenommen durch David Steimer am 31. August 2026 |

Das initiale Ereignis konsolidiert die am 29. und 30. August 2026 fachlich abgenommenen Prüfungen. Die beiden amtlichen Monitoringquellen zu BBl 2025 2891 wurden am 31. August 2026 gezielt erneut kontrolliert. Das Bundesamt für Justiz führt das Vorhaben weiterhin als laufendes Rechtsetzungsprojekt. Ein Inkrafttretensdatum ist im geprüften amtlichen Dossier nicht ausgewiesen. `OF-001` bleibt deshalb offen und die neue Regel wird nicht vorweggenommen. David Steimer hat AP13 und den initialen Governance-Bestand am 31. August 2026 fachlich-technisch abgenommen.

Das Ereignis nennt den AP12C-Kandidaten als geprüfte Vergleichsbasis. Der daraus am gleichen Tag abgeleitete MVP-0.3-Datenrelease verändert die Fach- und Quellenbezüge nicht. Die Promotion führt deshalb nicht zu einem zweiten inhaltsgleichen Prüfereignis. Das Quellenregister weist MVP 0.2 als Rückfallstand und MVP 0.3 als freigegebenen Zielstand aus.

## Append-only-Regel

Ein publiziertes Ereignis unter `events/` wird nicht inhaltlich überschrieben. Korrekturen, neue Erkenntnisse und spätere Freigaben werden als neues Ereignis mit neuer `reviewEventId` erfasst. Der Index darf neu erzeugt werden, weil er ausschliesslich eine abgeleitete Sicht ist.

Vor der Publikation eines Kandidaten dürfen offensichtliche Dokumentationsfehler noch im Kandidaten korrigiert werden. Mit der Freigabe und Veröffentlichung beginnt die Append-only-Wirkung.

## Index neu erzeugen und prüfen

```bash
npm run build:source-reviews
npm run test:source-reviews
```

Der Validator prüft JSON Schema, vollständige produktive Quellenabdeckung, amtliche Domains, Ergebnis- und Folgemassnahmen, den Termin 15. November sowie die bytegenau reproduzierbare Indexableitung. Acht Negativtests müssen gezielte Manipulationen abweisen.

Der Fristenrechner lädt diesen Ordner nicht zur Laufzeit. Ein SharePoint-Mirror kann ihn als Governance-Nachweis spiegeln, ohne den konfigurierten Releasepfad der App zu verändern.
