# Deterministischer Rechenkern

> **Status:** Version 0.1 wurde am 29. August 2026 durch David Steimer fachlich und technisch abgenommen.

Der Rechenkern aus AP8 berechnet Tagesfristen ausschliesslich aus vollständig validierten, providerneutralen Datenobjekten. Er kennt weder React noch SPFx, SharePoint, Teams, GitHub, Netzwerkzugriffe oder Browserpersistenz.

## Öffentliche Schnittstelle

Der Einstiegspunkt ist [`index.ts`](index.ts). Die zwei zentralen Funktionen sind:

```ts
const data = createCalculationData(validatedRelease)
const result = calculateDeadline(input, data)
```

`createCalculationData` übernimmt die strukturellen Objekte eines bereits vollständig validierten AP5-Release. Die Schnittstelle entspricht absichtlich nur den hostneutralen Feldern von `IValidatedRelease` aus dem SPFx-Spike. Schema-, Prüfsummen- und Netzwerkvalidierung bleiben Aufgabe der vorgelagerten Releasevalidierung.

`calculateDeadline` ist synchron, frei von Seiteneffekten und deterministisch. Gleiche Eingaben und derselbe Datenrelease ergeben bytegleiches JSON. Das Ergebnis ist entweder:

- `calculated` mit rechtlich massgebendem Datum, Fristbeginn, rechnerischem Ende, endgültigem Ende, Stillstand, Endverschiebung und Rechenspur
- `blocked` mit Sperrgründen und ohne Fristende

## Berechnungsablauf

1. Eingabe, Datenabdeckung, Rechtsprofil, Kalender und Selektoren prüfen
2. rechtlich massgebendes Zustell- oder Ereignisdatum auflösen
3. unbestätigte Zustellfiktionen und ungeklärte Rechtsfragen blockieren
4. Fristbeginn auf den Folgetag setzen
5. Kalendertage zählen und anwendbare Stillstandsperioden auslassen
6. ein Ende am Samstag, Sonntag oder Feiertag auf den nächsten Werktag verschieben
7. geordnetes Ergebnis mit angewandten Regel-IDs und Rechenspur zurückgeben

Die Datumsarithmetik in [`date.ts`](date.ts) arbeitet als reine gregorianische Kalenderrechnung. Sie erzeugt keine JavaScript-`Date`-Objekte, Uhrzeiten oder Zeitzonenwerte.

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
```

## Noch nicht enthalten

AP8 enthält keine Benutzeroberfläche, keine Datenbeschaffung, keine produktive SPFx-Integration und keine Fristen in Monaten, Jahren oder Stunden. Die Einbindung in die MVP-Oberfläche folgt in einem eigenen Arbeitspaket.
