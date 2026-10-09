# Deterministischer Rechenkern

> **Status:** Version 0.1 wurde am 29. August 2026 durch David Steimer fachlich und technisch abgenommen. Die AP11B-Erweiterung für Spezialregime wurde am 30. August 2026 abgenommen. Der AP12B-Generator und die AP12C-Format-3-Integration für regelbasierte Kalender wurden am 31. August 2026 fachlich-technisch abgenommen.

Der Rechenkern aus AP8 berechnet Tagesfristen ausschliesslich aus vollständig validierten, providerneutralen Datenobjekten. AP11B ergänzt dieselbe hostneutrale Schicht um typisierte Spezialregime. Der Kern kennt weder React noch SPFx, SharePoint, Teams, GitHub, Netzwerkzugriffe oder Browserpersistenz.

## Öffentliche Schnittstelle

Der Einstiegspunkt ist [`index.ts`](index.ts). Die zwei zentralen Funktionen sind:

```ts
const data = createCalculationData(validatedRelease)
const result = calculateDeadline(input, data)
const specialResult = calculateSpecialDeadline(specialInput, data)
const generatedCalendar = generateCalendarFromRules(ruleSets, calendarId, requestedRange)
```

`createCalculationData` übernimmt die strukturellen Objekte eines bereits vollständig validierten Format-1-, Format-2- oder Format-3-Release. Die Schnittstelle entspricht absichtlich nur den hostneutralen Feldern von `IValidatedRelease` aus der SPFx-Schicht. Schema-, Prüfsummen- und Netzwerkvalidierung bleiben Aufgabe der vorgelagerten Releasevalidierung.

`calculateDeadline` ist synchron, frei von Seiteneffekten und deterministisch. Gleiche Eingaben und derselbe Datenrelease ergeben bytegleiches JSON. Das Ergebnis ist entweder:

- `calculated` mit rechtlich massgebendem Datum, Fristbeginn, rechnerischem Ende, endgültigem Ende, Stillstand, Endverschiebung und Rechenspur
- `blocked` mit Sperrgründen und ohne Fristende

`calculateSpecialDeadline` verarbeitet die in Format 2.0.0 enthaltenen Spezialregime. Die Eingabe nennt das Regime, die Fristdefinition, typisierte Datums-, Uhrzeit- und Ganzzahlwerte sowie die automatisch aufgelösten Komponentenprofile. Das Ergebnis ist:

- `calculated` für eine vollständig berechnete Frist
- `manualReview` für eine berechnete, aber mit der konkreten Wahlanordnung abzugleichende feste Frist
- `blocked` bei offenen, gesperrten, unvollständigen oder widersprüchlichen Konfigurationen

Das Spezialresultat enthält zusätzlich Einreichungsmodus, zulässige Kanäle, Nachweise, Originalerfordernis, Annahmeschluss, Zeitzone, Gate-Ergebnisse, Übersteuerungen und einen vollständigen Komponentenbezug. `ruleId` bleibt im API als kompatibler Eingabename erhalten. Im Datenmodell heisst dasselbe Identifikationsfeld `deadlineDefinitionId`.

## Berechnungsablauf

1. Eingabe, Datenabdeckung, Rechtsprofil, Kalender und Selektoren prüfen
2. rechtlich massgebendes Zustell- oder Ereignisdatum auflösen
3. unbestätigte Zustellfiktionen und ungeklärte Rechtsfragen blockieren
4. Fristbeginn auf den Folgetag setzen
5. Kalendertage zählen und anwendbare Stillstandsperioden auslassen
6. ein Ende am Samstag, Sonntag oder Feiertag auf den nächsten Werktag verschieben
7. geordnetes Ergebnis mit angewandten Regel-IDs und Rechenspur zurückgeben

Die Datumsarithmetik in [`date.ts`](date.ts) arbeitet als reine gregorianische Kalenderrechnung. Sie erzeugt keine JavaScript-`Date`-Objekte, Uhrzeiten oder Zeitzonenwerte.

## Spezialregime in AP11B

Der abgenommene AP11B-Kern unterstützt vier Rechenarten:

1. `R1_RELATIVE` für relative Tages- und Monatsdauern
2. `R2_OFFSET` für einen festen Kalendertagsabstand vor oder nach einem Ereignis
3. `R3_WEEKDAY` für einen bestimmten Wochentag vor oder nach einem Ereignis
4. `R4_DUAL` für zwei konkurrierende Anknüpfungen mit frühester oder spätester Frist

Ein von einer Behörde festgelegter Termin trägt die Herkunft `AUTHORITATIVE`. Er besitzt keine Rechenoperation und wird vom Kern stets ohne Fristresultat blockiert. Der Datenvertrag verlangt zusätzlich `uiExposure: hidden`. Damit wird insbesondere verhindert, dass eine eingegebene Behördenfrist unverändert als angeblich berechnete Frist ausgegeben wird.

Art. 16 PRG und Art. 8a VPR sind komponentenweise aufgeteilt. Der gesetzlich berechenbare Grundtermin bleibt nutzbar. Eine kommunale Verlängerung, eine Leerungszeit oder der kantonal festgelegte Wahlanmeldeschluss bleiben quellenpflichtige Hintergrundwerte. Art. 21 BPR ist vollständig als solcher Hintergrundwert modelliert.

Der Spezialkern blockiert unter anderem:

- unbekannte oder nicht zum Regime gehörende Definitionen
- offene und gesperrte Regime
- behördlich gesetzte Termine
- fehlende, zusätzliche oder falsch typisierte Eingabewerte
- eine Verletzung einer Ankerbedingung, etwa ein anderes Datum als der 1. Januar für das Wahljahr
- widersprüchliche Kalender-, Stillstands- oder Einreichungsprofile
- unbekannte oder nicht bestätigte rechtliche Übersteuerungen
- nicht unterstützte Stillstandskombinationen und Kalenderüberschreitungen

Der Kern fällt nie still auf die allgemeine VRPG-Frist zurück.

## Regelbasierte Kalender in AP12B und AP12C

`generateCalendarFromRules` verarbeitet die mit AP12A abgenommenen Kalenderkomponenten `2.0.0`. Der hostneutrale Generator unterstützt Fixdaten, Osterabstände, bestimmte Wochentage, relative Perioden und explizite Add-, Suppress- und Replace-Overrides. Er löst Kalendervererbung, Gültigkeit, Prioritäten, IDs und Quellenbezüge deterministisch auf.

Das Resultat enthält einen vollständig aufgelösten `CalendarData`-Bestand sowie eine Regelspur. Fehler werden als `CalendarGenerationError` mit stabilem `reasonKey` ausgegeben. Einzelheiten dokumentiert der [AP12B-Nachweis](../../docs/architektur/ewiger-kalender-ap12b.md).

AP12C bindet diese Komponenten über Manifestformat `3.0.0` in den Datenadapter ein. Der Kern erzeugt pro Berechnung einen begrenzten Arbeitskalender aus den relevanten Eingabedaten. Format 3 besitzt deshalb eine nach oben offene Releaseabdeckung, ohne einen unbegrenzten Kalender im Speicher aufzubauen.

Relevante Feiertags- und Stillstandsregeln werden mit Datenrelease-ID, Kalender-ID, Regel-ID, Overrides und Quellenbezügen in die fachliche Rechenspur übernommen. Format 1 und Format 2 verwenden unverändert ihre endlichen, vorab erzeugten Kalenderlisten. Der [AP12C-Nachweis](../../docs/architektur/ewiger-kalender-ap12c.md) beschreibt Datenmigration, Sicherheitsgrenzen und Tests.

## Sicherheitsgrenzen

Der Kern liefert insbesondere kein Fristende bei:

- unbekanntem Rechtsprofil oder Kalender
- ungültigem Datum oder einer Fristdauer ausserhalb von 1 bis 365 Tagen
- fehlenden, unbekannten oder unzulässigen Selektoren
- Daten ausserhalb der freigegebenen Release- oder Kalenderabdeckung
- widersprüchlicher Feiertagsanknüpfung ohne Bestätigung
- unbestätigter Zustellfiktion
- unbekannter, bestätigter oder nicht geprüfter spezialgesetzlicher Abweichung
- mehrdeutiger oder unvollständiger Regelkonfiguration

Diese Sperren sind Produktverhalten. Fehler in einem angeblich bereits validierten Datenobjekt, etwa eine zyklische Kalendervererbung, lösen dagegen einen `CoreDataError` aus. Ein solcher Fehler darf nicht als fachliches Ergebnis dargestellt werden.

## AP6-Testvertrag

Die Tests unter [`tests/core/`](../../tests/core/) vergleichen alle fachlichen Ergebnisfelder und die maschinenableitbare Rechenspur mit den 15 abgenommenen Golden Cases. Die drei offenen AP6-Fälle müssen exakt mit ihren freigegebenen Sperrgründen blockieren.

Die AP6-Referenzspur des StPO-Osterfalls enthält zusätzlich den redaktionellen Hinweis `suspensionDisabled`. Dieser Hinweis beschreibt den Testschwerpunkt, ist aber weder Eingabewert noch aus dem gewählten StPO-Regelprofil fallbezogen ableitbar. Der Produktionstest neutralisiert ausschliesslich diesen Hinweis beim Spurvergleich. Fristdaten, Stillstand, Verschiebung, angewandte Regeln und alle übrigen Spurelemente werden unverändert geprüft.

Ausführung mit Node.js 22:

```bash
npm ci
npm run check
```

Das unabhängige Python-Orakel bleibt getrennt:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python tests/golden/validate_golden_cases.py
.venv/bin/python tests/special-regimes/validate_special_regime_release.py
```

## Fachliche und technische Grenzen

Der Rechenkern enthält keine Datenbeschaffung, Browserpersistenz oder produktive SPFx-Aktivierung. Fristen in Jahren oder Stunden sind nicht unterstützt. Monatsarithmetik wird ausschliesslich für gesetzlich modellierte Monatsdauern verwendet. AP11C integriert den Kern über separate Adapter in UI und SPFx, ohne diese Hostaufgaben in den Fachkern zu verschieben.
