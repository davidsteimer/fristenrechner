# AP12A: Zielmodell für den ewigen Kalender

Stand: 31. August 2026

Status: AP12A am 31. August 2026 durch David Steimer abgenommen
Backlog: [GitHub-Issue #26](https://github.com/davidsteimer/fristenrechner/issues/26)

## 1. Ergebnis des Arbeitspakets

AP12A definiert den technischen Vertrag für einen regelbasierten Kalender. Die Anwendung soll benötigte Feiertage und Fristenstillstände lokal und deterministisch erzeugen, statt jährlich neue Datumslisten zu benötigen.

«Ewig» bedeutet in diesem Projekt nicht unveränderliches Recht. Eine Regel gilt nur innerhalb ihrer versionierten Gültigkeit und nur so lange, wie ihre Rechtsgrundlage unverändert freigegeben bleibt. Eine Rechtsänderung wird mit einem neuen Datenrelease wirksam. Die periodische Quellenprüfung bleibt eine eigenständige Governance-Aufgabe in GitHub-Issue #27.

AP12A verändert weder den produktiven Rechenkern noch das freigegebene MVP-0.2-Datenrelease. Es liefert:

- das Kandidatenschema `calendar-rules-v2.schema.json`
- zwei regelbasierte Datenkandidaten für Bund und Kanton Bern
- einen maschinenlesbaren Referenzvertrag mit 36 Fällen
- einen unabhängigen Kandidatenvalidator
- den beschlossenen Architekturentscheid DEC-2026-015

## 2. Ausgangslage

Das Kalenderformat `1.0.0` enthält Feiertage und Gerichtsferien als konkrete ISO-Daten. Der freigegebene MVP-0.2-Bestand deckt 2026 bis 2028 ab. Sein Bundeskalender enthält zusätzlich die über den Jahreswechsel reichenden Randperioden vom 18. Dezember 2025 bis 2. Januar 2029.

Dieses Modell ist für die Prüfung gut lesbar, hat aber ein künstliches Ablaufdatum. Die zugrunde liegenden Regeln sind stabil und algorithmisch eindeutig:

- feste Monats- und Tageskombinationen
- Abstände zum gregorianischen Ostersonntag
- ein bestimmter Wochentag innerhalb eines Monats
- wiederkehrende inklusive Perioden mit festen oder osterabhängigen Grenzen

Der vorhandene Rechenkern erwartet bereits einen aufgelösten Kalender. Diese Schnittstelle bleibt bestehen. Neu ist nur, wie der aufgelöste Kalender entsteht.

```text
Format-3-Manifest
  -> Kalenderartefakt 2.0 mit Regeln
  -> lokaler Kalendergenerator
  -> aufgelöste Feiertage und Stillstandsperioden
  -> bestehender Rechenkern und bestehende UI
```

## 3. Modellgrenzen

### 3.1 Kalenderartefakt

Ein regelbasiertes Kalenderartefakt enthält:

- stabile Kalender-ID und Gemeinwesen
- offenen Gültigkeitszeitraum mit Beginn und optionalem Ende
- geerbte Kalender
- Prüfmetadaten und amtliche Quellen
- eine abgeschlossene Liste typisierter Regeln

Das Artefakt behält `dataKind: calendar`. Seine Komponentenformatversion ist `2.0.0`. Das alte Schema bleibt unverändert für bereits veröffentlichte Releases erhalten.

### 3.2 Gemeinsame Regelangaben

Jede Regel enthält:

- stabile Regel-ID
- Kalender-ID und Gemeinwesen
- fachliche Bezeichnung in Deutsch und Französisch
- sprachneutralen `labelKey`
- Priorität
- Gültigkeitsbeginn und optionales Gültigkeitsende
- genaue Quellenverweise
- typisierte Berechnung
- typisierte rechtliche Wirkung

Kalender-ID und Gemeinwesen werden trotz der Einbettung in das Kalenderartefakt auf der Regel wiederholt. Der Validator verlangt exakte Übereinstimmung. Diese bewusste Redundanz macht einzelne Regeln bei Export, Rechenspur und Review selbstbeschreibend.

## 4. Abgeschlossene Regeltypen

| Typ | Parameter | Verwendung im Kandidaten |
| --- | --- | --- |
| `fixedMonthDay` | Monat und Tag | Bundesfeiertag, Neujahr, Berchtoldstag, Weihnachten, Stephanstag |
| `easterOffsetDays` | ganze Anzahl Tage vor oder nach Ostersonntag | Karfreitag, Ostern, Ostermontag, Auffahrt, Pfingsten, Pfingstmontag |
| `nthWeekdayOfMonth` | Monat, ISO-Wochentag und Vorkommen | dritter Sonntag im September für den eidgenössischen Bettag |
| `relativePeriod` | typisierte Anfangs- und Endanker mit Jahres- und Tagesversatz | Oster-, Sommer- und Jahreswechselstillstand |
| `explicitDateOverride` | konkretes Ziel- und allenfalls Ersatzdatum | einmalige Ergänzung, Unterdrückung oder Ersetzung |

Freie Formeln, Codefragmente und die Ableitung einer Rechenart aus einer Bezeichnung sind nicht zulässig. Ein unbekannter Typ führt zur vollständigen Ablehnung des Datenrelease.

## 5. Wirkungen und stabile Ergebnis-IDs

Eine wiederkehrende Feiertagsregel erzeugt die bestehende Wirkung `nonWorkingDayEquivalentToSunday`. Die Ergebnis-ID wird deterministisch gebildet:

```text
{Gemeinwesencode}-{ISO-Datum}-{resultIdSuffix}
```

Damit erzeugt `CH-CAL-HOL-NATIONAL-DAY` für 2027 weiterhin `CH-2027-08-01-NATIONAL-DAY`.

Eine `relativePeriod`-Regel erzeugt einen inklusiven Stillstandszeitraum. Die Perioden-ID besteht aus Präfix und betroffenem Jahr. Bei einem Jahreswechsel werden Anfangs- und Endjahr aufgenommen:

```text
EASTER-2027
SUMMER-2027
YEAR-END-2027-2028
```

Die fachliche Stillstandssatz-ID wird von `ch-court-holidays-2026-2028` zu `ch-court-holidays`. Rechtsprofile und Spezialregime werden erst mit dem späteren Format-3-Datenrelease atomar migriert. Ein Mischstand ist unzulässig.

## 6. Gültigkeit und benötigte Randjahre

Der Generator erhält einen benötigten Datumsbereich. Er erzeugt nur die dafür erforderlichen Jahre und Randjahre. Randjahre sind notwendig, weil eine Periode im Vorjahr beginnen und im relevanten Jahr enden kann.

Die Auflösung folgt diesen Grenzen:

1. Das angefragte Datum muss innerhalb der Gültigkeit des Kalenderartefakts liegen.
2. Eine Regel wird nur innerhalb ihrer eigenen Gültigkeit angewandt.
3. Bei Vererbung gilt die Schnittmenge der Kalendergültigkeiten.
4. Eine Periode wird einbezogen, wenn sie den angefragten Bereich schneidet.
5. Ein ungültiges Fixdatum, eine umgekehrte Periode oder eine Lücke im erforderlichen Kalender führt zur Sperre.

Eine offene Obergrenze wird als `to: null` modelliert. Sie ist kein Verzicht auf Quellenprüfung. Sie sagt nur aus, dass keine rein technische Jahresgrenze besteht.

## 7. Vererbung

Der bernische Kalender erbt weiterhin `ch-federal-calendar`. Dadurch wird der 1. August nicht kantonal dupliziert. Die Vererbung wird vor der Berechnung vollständig aufgelöst.

Der Resolver muss:

- unbekannte Elternkalender ablehnen
- Zyklen erkennen
- doppelte Regel- und Ergebnis-IDs erkennen
- die Gültigkeitsbereiche schneiden
- die Herkunft jeder erzeugten Wirkung erhalten

Mehrere rechtlich selbstständige Feiertagsgründe am gleichen Datum dürfen nebeneinander bestehen. Eine Kollision gleicher IDs oder widersprüchlicher Wirkungen ist dagegen ein Fehler.

## 8. Einmalige Overrides

Ein `explicitDateOverride` verändert keine Grundregel. Es ist eine eigene, befristete und quellenbelegte Regel mit höherer Priorität.

| Operation | Bedeutung |
| --- | --- |
| `add` | Fügt für ein konkretes Datum einen zusätzlichen Feiertag ein |
| `suppress` | Unterdrückt das Ergebnis einer bezeichneten Grundregel an einem konkreten Datum |
| `replace` | Ersetzt ein konkretes Ergebnis durch einen Feiertag an einem anderen Datum |

Die Auflösung erfolgt in dieser Reihenfolge:

1. aktive Grundregeln aus dem Zielkalender und seinen Eltern sammeln
2. benötigte Jahresergebnisse erzeugen
3. aktive Overrides nach Priorität und Regel-ID sortieren
4. Ziele und Daten der Overrides eindeutig auflösen
5. Overrides anwenden
6. Ergebnis-IDs, Wirkungen und Gültigkeit erneut prüfen

Ein nicht auffindbares Ziel blockiert. Zwei gleich priorisierte, widersprüchliche Overrides blockieren ebenfalls. Es gibt keinen stillen Gewinner aufgrund der Dateireihenfolge.

## 9. Format- und Migrationsentscheid

Die Umstellung ist nicht rückwärtskompatibel. Ein bisheriger Consumer kennt weder die Regeltypen noch die lokale Generierung. Würde er ein solches Artefakt als alten Kalender akzeptieren, könnte er Feiertage übersehen und falsche Fristen ausgeben.

Der beschlossene Entscheid lautet deshalb:

- Kalenderkomponentenformat `2.0.0`
- separates Schema `calendar-rules-v2.schema.json`
- erstes aktivierbares Gesamtrelease im Manifestformat `3.0.0`
- `minimumConsumerFormatVersion: 3.0.0`
- Ablehnung des Release durch ältere Consumer vor dem Laden einzelner Artefakte
- keine nachträgliche Änderung bestehender Format-1- oder Format-2-Releases

Die Providergrenze bleibt unverändert. GitHub, SharePoint-Mirror und manueller Import liefern weiterhin byteidentische, manifestgelistete JSON-Artefakte. Nur der validierte Consumer erzeugt daraus lokale Kalenderdaten.

## 10. Rechenspur und Benutzerinformation

AP12B und AP12C müssen pro angewandter Kalenderwirkung mindestens nachvollziehbar machen:

- Datenrelease-ID
- Kalender-ID
- erzeugtes Datum oder erzeugte Periode
- Regel-ID
- angewandte Override-ID
- Quellenverweis

Die bestehende Rechenspur kann die Kalenderregel-IDs in `ruleIds` übernehmen. Eine gesonderte `overrideRuleIds`-Eigenschaft ist nur nötig, wenn die Darstellung sonst mehrdeutig wird. Die UI soll diese technischen Angaben nicht in die Hauptbedienung drängen. Sie gehören in die aufklappbare Rechenspur und in den Datenstand.

## 11. Referenzvertrag

Der maschinenlesbare AP12A-Referenzvertrag enthält 36 Fälle:

- 2 Paritätsfälle gegen den freigegebenen MVP-0.2-Datenstand
- 20 Algorithmusfälle für die vier wiederkehrenden Regeltypen
- 4 Schaltjahresfälle für 1900, 2000, 2100 und 2400
- 3 Overridefälle für `add`, `suppress` und `replace`
- 7 Sperrfälle

Die Paritätsprüfung bestätigt:

- 3 eidgenössische Feiertage und 10 Stillstandsperioden im bisherigen Referenzbereich
- 33 bernische Feiertage von 2026 bis 2028
- identische IDs, Daten, Wirkungen, Bezeichnungen und Quellenverweise in den verglichenen Feldern

Der Kandidatenvalidator ist ein unabhängiges Python-Orakel. Der Produktgenerator von AP12B wird in TypeScript implementiert. Dadurch prüft nicht dieselbe Implementierung ihre eigenen Resultate.

## 12. Arbeitspakete und WIP

Issue #26 ist grösser als fünf Nettoarbeitstage und wird gemäss DEC-2026-008 zerlegt:

| Paket | Inhalt | Produktiver Effekt |
| --- | --- | --- |
| AP12A | Datenmodell, Schema, DEC, Kandidat und Referenzvertrag | keiner |
| AP12B | TypeScript-Generator, Resolver, breite Unit- und Negativtests | noch kein Datenreleasewechsel |
| AP12C | Migration der CH-/BE-Daten, Rechenspur, Manifestformat 3, Preview und SPFx | kontrollierter Releasekandidat |

Es bleibt stets nur ein wesentliches Paket gleichzeitig in Arbeit.

David Steimer hat AP12A mit Datenmodell und Referenzvertrag am 31. August 2026 abgenommen und DEC-2026-015 bestätigt. AP12B ist damit zur Umsetzung freigegeben. Diese Abnahme aktiviert noch keinen neuen Datenstand.

## 13. Risiken und Grenzen

- Ein algorithmisch richtig erzeugtes Datum kann auf einer überholten Rechtsregel beruhen. Deshalb bleibt die Quellenprüfung zwingend.
- Die Kandidatenregeln beginnen mit dem fachlich geprüften MVP-Zeitraum. Die Jahrhundertfälle prüfen Kalenderarithmetik, nicht die historische Geltung der heutigen Feiertagsgesetze.
- Gemeinden und weitere Kantone sind nicht abgedeckt.
- Die heute modellierten Gerichtsferien gelten nur für die durch Rechtsprofile und Spezialregime ausdrücklich bezeichneten Verfahren.
- Ein offenes Gültigkeitsende darf nie als Rechtsgarantie dargestellt werden.

## 14. Standards

Das Austauschformat verwendet JSON Schema Draft 2020-12 und ISO-Kalenderdaten nach RFC 3339. Für regelbasierte schweizerische Gerichts- und Feiertagskalender besteht kein unmittelbar passender eCH-Austauschstandard. Die projektspezifische Modellierung bleibt deshalb offen, plattformneutral und streng schema-validiert. Diese begrenzte Abweichung ändert nichts am Ziel, Datenportabilität und nachvollziehbare Zuständigkeiten nach den eCH-Grundsätzen zu erhalten.

## 15. Verantwortlichkeit

David Steimer nimmt in der gegenwärtigen Projektphase sämtliche menschlichen Rollen wahr. Das Modell ist im Hinblick auf ein späteres Betriebskonzept dennoch prüf- und freigabefähig strukturiert. Codex hat den Kandidaten vorbereitet und technisch geprüft, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.
