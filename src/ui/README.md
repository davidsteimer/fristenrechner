# MVP-Rechneroberfläche

## Status

Dieses Modul ist die mit AP11C erweiterte funktionale MVP-Rechneroberfläche. Es verbindet den allgemeinen AP8-Rechenkern und den in AP11B freigegebenen Spezialregimekern mit React 17.0.1 und Fluent UI React v8.106.4. Die Komponente bleibt von SharePoint, Teams, SPFx und einem konkreten Datenprovider unabhängig.

Der AP9-Stand wurde von David Steimer als Grundlage für AP10 abgenommen. Die AP11C-Erweiterung ist ein lokal geprüfter MVP-0.2-Kandidat. Sie ist noch nicht fachlich abgenommen oder in einem Tenant installiert.

## Öffentliche Schnittstelle

Die Komponente wird aus [`index.ts`](index.ts) exportiert:

```tsx
import { FristenrechnerApp } from './ui';

<FristenrechnerApp data={validatedCalculationData} />
```

`data` ist ein vollständig validiertes `CalculationData`-Objekt aus dem hostneutralen Datenadapter. Datenbeschaffung, Releasevalidierung und atomare Aktivierung bleiben Aufgabe des Hosts. Dadurch verarbeitet die UI nur validierte Profile, Kalender und Spezialregimekataloge.

Die optionale `storage`-Eigenschaft erlaubt einem Host, einen kompatiblen lokalen Speicher bereitzustellen. Ohne diese Eigenschaft verwendet der Browser `localStorage`, sofern dieser verfügbar ist. `initialState` dient lokalen Vorschau- und Integrationstests und ist kein Ersatz für validierte Defaults.

## Bedien- und Sicherheitsmodell

Der häufige Bedienablauf für allgemeine Tagesfristen lautet:

1. Empfangsdatum oder das zur Zustellart passende Ereignisdatum
2. Frist in Tagen
3. zuständige Behörde
4. gefilterter Erlass beziehungsweise gefiltertes Verfahrensrecht
5. datengetriebene Zusatzmerkmale oder Fristtyp
6. Berechnung oder begründete Sperre
7. sichtbare automatische Parameter und allfällige kontrollierte Übersteuerung
8. kompakter Regel- und Kalenderstand am Seitenende

Beim VRPG-BE beginnt die Fristtyp-Auswahl mit `Bitte wählen`. Diese leere Auswahl kann ausdrücklich als persönlicher Standard gespeichert werden. Erst nach der Wahl der allgemeinen VRPG-Frist oder eines Spezialregimes erscheinen die dazugehörigen Eingaben. Nicht verfügbare Regime bleiben mit dem Status am Zeilenende zur Einordnung sichtbar, können aber nicht ausgewählt werden. Verfügbare Einträge tragen keine zusätzliche Statusetikette. Behördlich gesetzte Termine und reine Dokumentationseinträge bleiben aus dem Rechen-GUI entfernt.

Die bewusste Wahl der allgemeinen VRPG-Frist ersetzt die frühere zusätzliche Bestätigung, dass keine abweichende spezialgesetzliche Regel gilt. Bestätigungen für eine Zustellfiktion oder mehrere mögliche Feiertagsanknüpfungen bleiben davon unberührt.

Das Feld `Zuständige Behörde` unterscheidet zwischen `Bundesbehörde` und `Behörde des Kantons Bern`. Für die Bundesbehörde erscheinen nur Bundesprofile. Für die Behörde des Kantons Bern erscheinen Bundesprofile und das Profil `VRPG-BE`. Diese Filterung wird aus `jurisdiction.level` und `jurisdiction.code` des validierten Datenrelease abgeleitet. Der Feldwert beschreibt weiterhin das Gemeinwesen der Behörde und keinen geografischen Behördensitz.

Die vier Hauptaktionen stehen unmittelbar nach den Eingabefeldern in einem zweispaltigen Raster. Sie sind gleich breit wie die Eingabefelder und belegen zwei Zeilen. Auf schmalen Ansichten wechseln sie in eine Spalte. Ein berechnetes oder gesperrtes Resultat erscheint vor den automatisch bestimmten Parametern. Ungültige Pflichtangaben werden zusätzlich zu den Feldmeldungen im Resultatbereich handlungsorientiert zusammengefasst. Der Regel- und Kalenderstand bleibt als zurückhaltende Informationszeile am Seitenende sichtbar.

Die Oberfläche führt keine eigene Fristberechnung durch. Sie bildet allgemeine Eingaben auf `calculateDeadline` und besondere Eingaben auf `calculateSpecialDeadline` ab. Unbestätigte Zustellfiktionen, ungeklärte spezialgesetzliche Regeln, widersprüchliche Feiertagsanknüpfungen und nicht unterstützte Spezialregime führen zu einer Sperre ohne Fristende.

Spezialresultate weisen Fristablauf und Anforderungen an die Fristwahrung getrennt aus. Dazu gehören insbesondere Eingang oder Aufgabe, Annahmeschluss, Zeitzone, Originalerfordernis, zulässige Kanäle und geeignete Nachweise. Automatische Komponentenprofile und rechtliche Übersteuerungen bleiben sichtbar.

Der Feiertagskalender wird im Bern-MVP standardmässig auf den Kanton Bern gesetzt. Bei `VRPG-BE` ist diese Wahl fachlich fest und nicht veränderbar. Bei Bundesprofilen kann sie sichtbar übersteuert werden. Eine tatsächliche Abweichung verlangt eine Begründung. Die Begründung wird im AP9-Kandidaten nicht dauerhaft gespeichert.

## Lokale Defaults und Datenschutz

Unter dem versionierten Schlüssel `fristenrechner.defaults.v1` werden nur folgende Werte im Browser gespeichert:

- Produktsprache
- zuständige Behörde beziehungsweise ihr Gemeinwesen
- Rechtsprofil
- Fristdauer
- profilspezifische Auswahlwerte
- ausgewählter Kalender
- ausgewählter Fristtyp
- ausgewählte Fristkomponente

Das Empfangsdatum, besondere Ankerdaten, Uhrzeiten, Bestätigungen, Übersteuerungsbegründungen und eine zusätzliche Feiertagsanknüpfung werden nicht als Default gespeichert. Der Inhalt des bestehenden Schlüssels trägt intern Version 2. Version-1-Defaults werden sicher migriert. Nicht mehr zulässige `unknown`-Werte sowie unvereinbare oder nicht sichtbare Spezialauswahlen werden verworfen. Der Speichervertrag wird in [`defaults.ts`](defaults.ts) validiert.

## Deutsch und Französisch

[`i18n.ts`](i18n.ts) enthält die Produkttexte für Deutsch und Französisch. Datengetriebene `labelKey` und `warningKey` werden nicht im Profil verdoppelt. Automatisierte Tests prüfen, dass alle Selektoren, Fachwarnungen, Sperrgründe und Rechenspurgründe des MVP in beiden Sprachen aufgelöst werden.

## Lokale Vorschau

Die Vorschau dient ausschliesslich Entwicklung und Qualitätssicherung:

```bash
npm run preview:ui
```

Danach ist die Oberfläche unter `http://127.0.0.1:4173/` erreichbar. Sechs reproduzierbare QA-Zustände können über den Parameter `qa` geladen werden:

`preview/index.html` ist die Quelldatei des lokalen Builds und keine eigenständige Anwendung. Beim direkten Öffnen zeigt sie deshalb einen Start- und Diagnosehinweis. `npm run preview:ui` erzeugt `index.html`, JavaScript und CSS gemeinsam unter `.work/ui-preview/` und liefert diesen vollständigen Stand über den lokalen Server aus.

- `?qa=stpo-weekend`
- `?qa=delivery-block`
- `?qa=special-law-block`
- `?qa=anchor-block`
- `?qa=vrpg-special-original`
- `?qa=vrpg-special-gate`

Die Presets liegen ausschliesslich in [`preview/qaPresets.ts`](preview/qaPresets.ts). Sie verändern weder den Rechenkern noch den Datenrelease.

## Qualitätsgrenzen

Die AP9-Prüfung umfasst semantische Beschriftungen, Tastaturreihenfolge, sichtbaren Fokus, Statusmeldungen mit `aria-live`, Deutsch und Französisch, eine mobile Breite von 390 Pixeln ohne horizontales Überlaufen sowie Farbkontraste der eigenen Gestaltungsfarben. AP11C hat diese Prüfung für Fristtyp, bedingte Anker, Spezialresultat, Fristwahrung, Sofortanfechtungshinweis und die französische Spezialansicht wiederholt. Dies setzt das Qualitätsziel WCAG 2.1 AA nach eCH-0059 für den geprüften Umfang um.

Es handelt sich noch nicht um eine formelle Accessibility-Konformitätsbewertung. Eine erneute Prüfung im echten SharePoint- und Teams-Host sowie ein vollständiger produktiver Audit folgen nach der AP11C-Abnahme.

## Freigabegrenze

Die SPFx-Lösung synchronisiert diese Komponente mechanisch. Der lokale MVP-0.2-Build und die Browserprüfung sind im [AP11C-Nachweis](../../docs/architektur/mvp-02-spezialregime-ap11c.md) dokumentiert. Eine Tenantinstallation setzt einen freigegebenen AP11C-Datenrelease voraus.
