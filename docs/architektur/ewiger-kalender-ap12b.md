# AP12B: Hostneutraler Generator für regelbasierte Kalender

Stand: 31. August 2026

Status: am 31. August 2026 durch David Steimer fachlich-technisch abgenommen
Grundlage: AP12A, DEC-2026-015 und GitHub-Issue #26

## 1. Ergebnis

AP12B implementiert den hostneutralen TypeScript-Generator für die mit AP12A abgenommenen Kalenderregeln. Er erzeugt aus den Kalenderartefakten `2.0.0` einen vollständig aufgelösten Kalender für einen ausdrücklich angefragten Datumsbereich.

Der Generator enthält keine Datenbeschaffung, keine Browserpersistenz, kein React, kein SPFx und keinen Netzwerkzugriff. Er verwendet keine JavaScript-`Date`-Objekte. Sämtliche Berechnungen erfolgen mit der bestehenden reinen gregorianischen ISO-Kalenderarithmetik des Rechenkerns.

AP12B verändert noch nicht:

- das Manifestformat
- den freigegebenen MVP-0.2-Datenstand
- den GitHub-Datenfeed
- den SharePoint-Mirror
- Preview, SharePoint oder Teams
- das SPFx-Paket `0.2.0.0`

Diese Integration bleibt AP12C vorbehalten.

## 2. Öffentliche Schnittstelle

Der Kern exportiert neu:

```ts
const generated = generateCalendarFromRules(
  ruleSets,
  'be-public-holidays',
  { from: '2026-01-01', to: '2028-12-31' }
)
```

Das Resultat enthält:

- den vollständig aufgelösten `CalendarData`-Bestand
- alle angewandten Regel-IDs
- alle angewandten Override-IDs
- eine geordnete Regelspur mit Quellenverweisen

Die Hilfsfunktionen `calculateGregorianEaster` und `calculateCalendarRuleOccurrence` sind ebenfalls öffentlich. Sie ermöglichen unabhängige Algorithmustests, ohne einen ganzen Datenrelease aufzubauen.

Fehler werden als `CalendarGenerationError` mit einem stabilen sprachneutralen `reasonKey` ausgegeben. AP12C ordnet diese Schlüssel den zweisprachigen Produktmeldungen und der atomaren Releaseablehnung zu.

## 3. Berechnungsablauf

```text
Regelbestände validieren
  -> Vererbung topologisch auflösen
  -> gemeinsame Gültigkeit bestimmen
  -> benötigte Jahre und Randjahre erzeugen
  -> Feiertage und Stillstandsperioden bilden
  -> Overrides nach Ziel und Priorität auflösen
  -> Ergebnis-IDs und Kollisionen prüfen
  -> Kalender und Regelspur zurückgeben
```

Die angefragte Abdeckung wird nicht auf feste Jahre erweitert. Der Generator erzeugt intern nur die notwendigen Ankerjahre. Für jahresübergreifende Regeln berücksichtigt er zusätzliche Randjahre.

## 4. Regelalgorithmen

### 4.1 Fixes Monatsdatum

`fixedMonthDay` setzt Monat und Tag in das angefragte Jahr ein. Ungültige Kombinationen wie der 30. Februar blockieren. Es gibt keine automatische Korrektur auf einen Monatsletzten.

### 4.2 Osterbezug

`easterOffsetDays` berechnet den gregorianischen Ostersonntag nach Meeus, Jones und Butcher und wendet anschliessend den freigegebenen Tagesversatz an.

Der unterstützte gregorianische Bereich beginnt 1583. Die produktiven CH- und BE-Regelbestände beginnen erst mit ihrer abgenommenen fachlichen Gültigkeit ab Ende 2025 beziehungsweise Anfang 2026. Die Tests für 1900, 2000, 2100 und 2400 prüfen ausschliesslich die Kalenderarithmetik.

### 4.3 Bestimmter Wochentag

`nthWeekdayOfMonth` verwendet den ISO-Wochentag 1 für Montag bis 7 für Sonntag. Ein verlangtes fünftes Vorkommen, das im betreffenden Monat nicht existiert, blockiert.

### 4.4 Relative Perioden

`relativePeriod` berechnet Anfang und Ende getrennt aus festen oder osterabhängigen Ankern. Jahres- und Tagesversatz werden ausdrücklich angewandt. Eine umgekehrte Periode blockiert.

Eine Stillstandsperiode wird aufgenommen, wenn sie den angefragten Bereich schneidet. Schneidet eine Periode ihre eigene Regelgültigkeitsgrenze, wird sie nicht still gekürzt. Der Generator blockiert, weil eine teilweise anwendbare Gerichtsferienregel fachlich geklärt werden muss.

## 5. Vererbung

Der Resolver besucht Elternkalender vor dem Zielkalender und jeden Kalender höchstens einmal. Dadurch bleibt eine spätere Mehrfachvererbung deterministisch.

Er blockiert:

- unbekannte Elternkalender
- Vererbungszyklen
- nicht überlappende Kalendergültigkeiten
- doppelte Regel-IDs über mehrere Kalender hinweg
- doppelte erzeugte Feiertags- oder Perioden-IDs
- widersprüchliche Rechtsprofile innerhalb desselben Stillstandssatzes

Das ausgegebene Kalenderobjekt ist vollständig aufgelöst und enthält deshalb `inherits: []`. Beim bernischen Kalender sind Bundesfeiertag und eidgenössische Stillstandssätze bereits enthalten.

## 6. Overrides

Ein Override wird nur angewandt, wenn sein konkretes Datum den angefragten Bereich betrifft. Bei `replace` wird auch ein ausserhalb des sichtbaren Bereichs liegendes Zieldatum intern erzeugt, sofern das Ersatzdatum in den angefragten Bereich fällt.

Die drei Operationen sind umgesetzt:

| Operation | Wirkung |
| --- | --- |
| `add` | zusätzlichen quellenbelegten Feiertag erzeugen |
| `suppress` | eindeutiges Ergebnis einer Grundregel entfernen |
| `replace` | eindeutiges Grundregelergebnis entfernen und Ersatzdatum erzeugen |

Mehrere Overrides für dasselbe Ziel und Datum werden nach der höchsten numerischen Priorität aufgelöst. Gibt es auf der höchsten Stufe mehr als einen Kandidaten, blockiert `calendar.priorityConflict`. Die Dateireihenfolge entscheidet nie.

Ein Override mit unbekannter Zielregel wird bereits bei der Bestandsprüfung abgelehnt. Eine bekannte Zielregel, die am bezeichneten Datum kein Ergebnis erzeugt, blockiert bei der Anwendung mit `calendar.unmatchedOverride`.

## 7. Ergebnis-IDs und Rechenspur

Die mit AP12A beschlossenen ID-Konventionen sind umgesetzt:

```text
CH-2027-08-01-NATIONAL-DAY
BE-2027-05-06-ASCENSION
EASTER-2027
YEAR-END-2027-2028
```

Jeder Spureintrag enthält:

- Regel-ID
- Herkunftskalender
- Operation
- Quellenverweise
- erzeugte IDs
- entfernte IDs

Die Operationen lauten `generateHoliday`, `generateSuspensionPeriod`, `addHoliday`, `suppressHoliday` und `replaceHoliday`. Ein unterdrücktes Grundregelergebnis bleibt dadurch zusammen mit dem Override nachvollziehbar.

Die Datenrelease-ID ist noch nicht Teil dieses Generatoraufrufs. Sie wird in AP12C aus dem validierten Format-3-Manifest mit der Regelspur verbunden.

## 8. Stabile Fehlerklassen

AP12B verwendet insbesondere folgende `reasonKey`-Werte:

| Schlüssel | Bedeutung |
| --- | --- |
| `calendar.unknownRuleType` | unbekannter oder nicht unterstützter Regeltyp |
| `calendar.invalidFixedDate` | ungültiges Fix-, Anker- oder Ergebnisdatum |
| `calendar.invalidNthWeekday` | ungültiges oder nicht existierendes Wochentagsvorkommen |
| `calendar.duplicateRuleId` | doppelte Kalender- oder Regel-ID |
| `calendar.duplicateResultId` | doppelte erzeugte Feiertags- oder Perioden-ID |
| `calendar.inheritanceCycle` | zyklische Kalendervererbung |
| `calendar.unknownInheritedCalendar` | unbekannter Ziel- oder Elternkalender |
| `calendar.unmatchedOverride` | unbekanntes oder am Datum nicht vorhandenes Overrideziel |
| `calendar.priorityConflict` | mehrere gleichrangige Overrides für dasselbe Ziel |
| `calendar.outsideValidity` | Anfrage oder Regelwirkung ausserhalb der Gültigkeit |
| `calendar.inconsistentSuspensionSet` | widersprüchliche Profilzuordnung eines Stillstandssatzes |
| `calendar.invalidRuleConfiguration` | strukturell widersprüchliche typisierte Regel |

Die Fehler enthalten keine stillen Fallbacks. Ein fehlerhafter Regelbestand erzeugt nie einen scheinbar plausiblen Teilkalender.

## 9. Testnachweis

AP12B ergänzt 41 TypeScript-Tests:

- 20 abgenommene Algorithmusfälle
- 4 Schaltjahresfälle
- 2 zusätzliche Algorithmus- und Implementationsgrenzen
- 3 Paritäts- und Determinismustests
- 4 Overridefälle
- 8 Sicherheits- und Negativtests

Die Tests bestätigen insbesondere:

- vollständige Gleichheit des eidgenössischen und bernischen Referenzbestands 2026 bis 2028
- korrekte Randperioden vom 18. Dezember 2025 bis 2. Januar 2029
- 36 aufgelöste Feiertage im bernischen Kalender einschliesslich geerbtem Bundesfeiertag
- 10 geerbte Stillstandsperioden
- Jahrhundertregeln für 1900, 2000, 2100 und 2400
- bytegleiche Wiederholbarkeit
- Add-, Suppress- und Replace-Overrides
- Prioritätsauflösung und sämtliche festgelegten Sperrgrenzen
- vollständiges Fehlen von JavaScript-`Date` im Generator

Der bestehende Python-Validator bleibt das unabhängige Orakel. Der Produktgenerator übernimmt keinen Python-Code.

## 10. Übergabe an AP12C

AP12C muss:

1. Manifest- und Consumerformat `3.0.0` implementieren
2. Kalenderartefakte `2.0.0` über die bestehende Providerkette laden und schema-validieren
3. `ch-court-holidays-2026-2028` atomar zu `ch-court-holidays` migrieren
4. die Regelspur mit Datenrelease-ID und Produktmeldungen verbinden
5. denselben Generator in Preview, SharePoint und Teams verwenden
6. einen nicht produktiven Format-3-Releasekandidaten bauen
7. die vollständige lokale und anschliessend tenantbezogene Testmatrix vorbereiten

Bis AP12C abgenommen und der neue Datenstand ausdrücklich freigegeben ist, bleibt MVP 0.2 der einzige aktive Stand.

## 11. Verantwortlichkeit

Codex hat AP12B implementiert und technisch geprüft. David Steimer hat AP12B am 31. August 2026 fachlich-technisch abgenommen. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.
