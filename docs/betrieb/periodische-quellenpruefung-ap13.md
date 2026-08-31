# AP13: Periodische Quellenprüfung

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP13 |
| Backlog | [GitHub-Issue #27](https://github.com/davidsteimer/fristenrechner/issues/27) |
| Stand | 31. August 2026 |
| Status | fachlich-technisch abgenommen am 31. August 2026 |
| Fachverantwortung | David Steimer |
| Methode | schlanker HERMES-2022-agil-kompatibler Kontrollprozess |

## 1. Ergebnis in Kürze

AP13 führt einen revisionsfähigen, aber bewusst schlanken Prozess für Feiertags- und Fristenquellen ein. Die fachliche Prüfung wird von Datenrelease, App-Paket und SharePoint-Mirror getrennt.

Der Nachweis besteht aus drei Ebenen:

1. Das Quellenregister beschreibt die stabilen amtlichen Quellen und ihren Verwendungsstatus.
2. Append-only-Prüfereignisse halten fest, wann, weshalb, durch wen, gegen welchen Stand und mit welchem Ergebnis geprüft wurde.
3. Ein reproduzierbarer Index zeigt pro Quelle den jüngsten Prüfstand und löst die betroffenen Profile, Kalender, Regelkomponenten, Fundstellen und Datenreleases auf.

Die Anwendung benötigt diesen Index nicht. Sie rechnet weiterhin ausschliesslich mit einem lokal validierten und freigegebenen Datenrelease. AP13 ändert daher weder die Laufzeitarchitektur noch das GUI und benötigt keinen neuen Architekturentscheid.

## 2. Rollenmodell

| Funktion im künftigen Betrieb | Aufgabe | Heutige Wahrnehmung |
| --- | --- | --- |
| juristische Fachverantwortung | Quellen inhaltlich prüfen und fachliche Folgen beurteilen | David Steimer |
| Datenpflege | Prüfereignis, Regeländerung und Testfälle vorbereiten | David Steimer mit Codex als dokumentiertem Arbeitsinstrument |
| technische Qualitätssicherung | Schemata, Referenzen, Index und Regression prüfen | David Steimer mit Codex als dokumentiertem Arbeitsinstrument |
| Freigabe | Quellenprüfung oder Datenrelease formell freigeben | David Steimer |

Die Rollen bleiben im Hinblick auf ein künftiges Betriebskonzept getrennt beschrieben. Im aktuellen Einpersonenprojekt werden sie durch David Steimer in Personalunion wahrgenommen. Ein formelles Vieraugenprinzip besteht derzeit nicht. Codex hat keine Freigabe-, Haftungs- oder juristische Entscheidverantwortung.

## 3. Prüfgegenstand

Pro produktivem Gemeinwesen und Rechtsprofil werden mindestens geprüft:

- geltende Feiertagsregelungen und kommunale Vorbehalte
- Zustellung und rechtlich massgebendes Ausgangsdatum
- Fristbeginn und Zählweise
- Verschiebung des Fristendes
- Fristenstillstand, Ausnahmen und Übersteuerungen
- bekannte Spezialfristen und Einreichungsbedingungen
- Änderungserlasse, Inkrafttreten, Aufhebung und Übergangsrecht
- fachlich relevante neue Rechtsprechung

Amtliche konsolidierte Erlasse, Änderungspublikationen, amtliche Materialien und amtlich publizierte Rechtsprechung sind Primärnachweise. Technische Spiegel und nichtamtliche Zusammenfassungen dürfen die Recherche erleichtern. Sie ersetzen keine amtliche Rechtsgrundlage. Wo für bernische Rechtsprechung keine stabile amtliche Direktadresse verfügbar ist, hält das Register die amtliche Entscheidbezeichnung und einen getrennt gekennzeichneten Abrufpfad fest.

## 4. Auslöser und Termin

Eine Quellenprüfung erfolgt:

1. jährlich spätestens am 15. November
2. vor jedem neuen produktiven Datenrelease
3. bei einer amtlich angekündigten oder publizierten Änderung
4. vor Aufnahme eines neuen Gemeinwesens oder Rechtsprofils
5. nach einem fachlich relevanten Fehlerbericht, Gerichtsentscheid oder begründeten Zweifel

Eine vollständige Jahresprüfung vor dem 15. November erfüllt den Jahrestermin. Der initiale Vollabgleich 2026 wurde bis 31. August 2026 dokumentiert. Der nächste ordentliche Jahrestermin ist deshalb spätestens der 15. November 2027. Ein früher eintretender anderer Auslöser geht vor.

## 5. Zulässige Ergebnisse

| Ergebnis | Bedeutung | Konsequenz |
| --- | --- | --- |
| `unchanged` | Die relevante Rechts- oder Quellenlage ist gegenüber der Vergleichsbasis unverändert | Prüfereignis publizieren, keinen neuen Datenrelease erzeugen |
| `changed` | Eine relevante Änderung ist festgestellt | Auswirkung analysieren, Issue und gegebenenfalls DEC anlegen, Regeln und Tests ändern, separat freigeben |
| `unclear` | Geltung, Auslegung oder Auswirkung kann nicht verlässlich bestimmt werden | keine automatische Übernahme, Risiko dokumentieren, betroffene Funktion nötigenfalls warnen oder sperren |
| `unavailable` | Die massgebliche amtliche Quelle ist nicht erreichbar oder nicht mehr belastbar zugänglich | Wiederholungsversuch und Risikobeurteilung, betroffenen Umfang nötigenfalls warnen oder sperren |

Ein Hash oder Abrufzeitstempel einer dynamischen Webseite ist kein fachlicher Nachweis. Bei einem stabilen amtlichen PDF kann ein SHA-256-Wert ergänzend erfasst werden. Er ersetzt die inhaltliche Prüfung nicht.

## 6. Schlanker Arbeitsablauf

1. Prüfereignis mit eindeutiger ID und Auslöser als Kandidat anlegen.
2. Betroffene amtliche Quellen öffnen und die relevanten Bestimmungen gegen den letzten freigegebenen Stand vergleichen.
3. Ergebnis, Begründung, Fundstellen, Prüfdatum, verantwortliche Person und Vergleichsrelease pro Quelle dokumentieren.
4. Bei `changed`, `unclear` oder `unavailable` eine konkrete Folgemassnahme referenzieren.
5. Index erzeugen und Validator samt Negativtests ausführen.
6. Fachliche Abnahme dokumentieren und den Ereignisstatus vor Veröffentlichung auf `approved` setzen.
7. Ereignis, Register und Index veröffentlichen. Bei tenantinternem Betrieb dieselben Dateien in den Governance-Bereich des SharePoint-Mirrors übernehmen.

Die maximale Paketgrösse von fünf Nettoarbeitstagen und das WIP-Limit von einem wesentlichen Arbeitspaket gelten weiter. Die Quellenprüfung wird nicht durch zusätzliche Sitzungs- oder Freigabeformulare aufgebläht. Revisionsfähigkeit entsteht durch klare Datenfelder, unveränderliche Ereignisse und Git-Historie.

## 7. Trennung von Prüfung und Datenrelease

```text
Amtliche Quelle
      ↓
Prüfereignis ── unchanged ─────────────→ Index aktualisieren
      │
      ├── changed ─→ Fachanalyse ─→ Regel und Tests ─→ neuer Datenrelease
      ├── unclear ─→ Risiko und Sperre oder Warnung
      └── unavailable ─→ Wiederholung und Risikobeurteilung
```

Nur eine fachlich relevante, verstandene und freigegebene Änderung führt zu einem Datenrelease. Ein Datenrelease bleibt unveränderlich. Das Prüfprotokoll bleibt append-only. Der generierte Index darf aktualisiert werden.

## 8. Initialer Nachweis CH und BE

Das initiale Ereignis `2026-08-31-initial-consolidation.1` umfasst:

- alle 21 im AP12C-Vergleichsrelease produktiv referenzierten Quellen
- zwei unterstützende Rechtsprechungsnachweise
- zwei amtliche Monitoringquellen zur Wochenend-Zustellungsregel
- fünf Rechtsprofile und zwei Regelkalender
- den aktuellen offenen Monitoringpunkt `OF-001`

Alle 25 Prüfpositionen haben das Ergebnis `unchanged`. Damit ist kein Datenrelease allein aus AP13 erforderlich. Die beiden Monitoringquellen und BGer 1C_592/2025 verweisen weiterhin auf `OF-001`.

David Steimer hat AP13, das Quellenregister und das initiale Prüfereignis am 31. August 2026 fachlich-technisch abgenommen. Register und Ereignis tragen den Status `approved`. Freigegebene Prüfereignisse werden nicht mehr überschrieben. Korrekturen und spätere Prüfungen erhalten eine neue `reviewEventId`.

## 9. SharePoint-Mirror und Datenschutz

Der Governance-Nachweis ist ohne Tenantadressen, Konten, Personendaten von Nutzerinnen und Nutzern oder Geheimnisse aufgebaut. Er kann unverändert öffentlich publiziert und tenantintern gespiegelt werden.

Empfohlene zusätzliche Mirrorstruktur:

```text
Fristenrechner/
├── releases/
│   └── <releaseId>/
└── source-reviews/
    ├── source-register.json
    ├── index.json
    └── events/
        └── <reviewEventId>.json
```

Der konfigurierte Laufzeitpfad der App zeigt weiterhin auf `releases/<releaseId>`. Der Ordner `source-reviews` ist ein Betriebs- und Revisionsnachweis, keine App-Datenquelle.

## 10. Standards und Abgrenzung

Die Ablage folgt den HERMES-Grundsätzen der nachvollziehbaren Ergebnisse, Rollen und Qualitätssicherung in einer für ein Einpersonenprojekt angemessen schlanken Ausprägung. Für den fachdomänenspezifischen Quellenprüfnachweis wurde kein unmittelbar anwendbarer eCH-Standard identifiziert. JSON Schema Draft 2020-12, ISO-Datumswerte und stabile Identifikatoren bilden deshalb einen projektspezifischen, offen dokumentierten Vertrag.

Eine automatische Rechtsprüfung durch Scraping ist nicht Teil von AP13. Technische Änderungserkennung kann später als Hinweis dienen. Sie darf keine fachliche Freigabe ersetzen.

## 11. Abnahmekriterien

- [x] vollständiges Quellenregister für den produktiven CH- und BE-Umfang
- [x] vier eindeutig definierte Prüfergebnisse
- [x] `unchanged` ohne Zwang zu einem Datenrelease
- [x] Trennung von Prüfprotokoll, Datenrelease und Laufzeit
- [x] append-only-fähiges, öffentliches und maschinenlesbares Protokoll
- [x] suchbarer Index nach Quelle, Gemeinwesen, Sachgebiet, Prüfdatum, Ergebnis und Release
- [x] initiale Prüfung aller registrierten CH- und BE-Quellen dokumentiert
- [x] Termin 15. November in Betrieb und Release-Checkliste verankert
- [x] Feiertage, allgemeine Fristenregeln und Spezialregime im selben Verfahren
- [x] tenantneutral spiegelbare Ablage
- [x] Personalunion und Rolle von Codex transparent ausgewiesen
- [x] Schema-, Semantik-, Reproduzierbarkeits- und Negativtests umgesetzt
- [x] fachlich-technische Abnahme von AP13 durch David Steimer am 31. August 2026
