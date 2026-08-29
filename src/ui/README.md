# MVP-Rechneroberfläche

## Status

Dieses Modul ist der AP9-Kandidat der funktionalen MVP-Rechneroberfläche. Es verbindet den freigegebenen AP8-Rechenkern mit React 17.0.1 und Fluent UI React v8.106.4. Die Komponente bleibt von SharePoint, Teams, SPFx und einem konkreten Datenprovider unabhängig.

Der Kandidat wurde von David Steimer als Grundlage für die gestartete SPFx-Produktintegration AP10 übernommen. Er ist für sich allein kein produktiv installierter Release.

## Öffentliche Schnittstelle

Die Komponente wird aus [`index.ts`](index.ts) exportiert:

```tsx
import { FristenrechnerApp } from './ui';

<FristenrechnerApp data={validatedCalculationData} />
```

`data` ist ein vollständig validiertes `CalculationData`-Objekt aus dem AP8-Datenadapter. Datenbeschaffung, Releasevalidierung und atomare Aktivierung bleiben Aufgabe des Hosts. Dadurch verarbeitet die UI nur freigegebene Profile und Kalender.

Die optionale `storage`-Eigenschaft erlaubt einem Host, einen kompatiblen lokalen Speicher bereitzustellen. Ohne diese Eigenschaft verwendet der Browser `localStorage`, sofern dieser verfügbar ist. `initialState` dient lokalen Vorschau- und Integrationstests und ist kein Ersatz für validierte Defaults.

## Bedien- und Sicherheitsmodell

Die Bedienfolge lautet:

1. Empfangsdatum oder das zur Zustellart passende Ereignisdatum
2. Frist in Tagen
3. zuständige Behörde
4. gefilterter Erlass beziehungsweise gefiltertes Verfahrensrecht
5. datengetriebene Zusatzmerkmale des Rechtsprofils
6. Berechnung oder begründete Sperre
7. sichtbare automatische Parameter und allfällige kontrollierte Übersteuerung
8. kompakter Regel- und Kalenderstand am Seitenende

Das Feld `Zuständige Behörde` unterscheidet zwischen `Bundesbehörde` und `Behörde des Kantons Bern`. Für die Bundesbehörde erscheinen nur Bundesprofile. Für die Behörde des Kantons Bern erscheinen Bundesprofile und das Profil `VRPG-BE`. Diese Filterung wird aus `jurisdiction.level` und `jurisdiction.code` des validierten Datenrelease abgeleitet. Der Feldwert beschreibt weiterhin das Gemeinwesen der Behörde und keinen geografischen Behördensitz.

Die vier Hauptaktionen stehen unmittelbar nach den Eingabefeldern in einem zweispaltigen Raster. Sie sind gleich breit wie die Eingabefelder und belegen zwei Zeilen. Auf schmalen Ansichten wechseln sie in eine Spalte. Ein berechnetes oder gesperrtes Resultat erscheint vor den automatisch bestimmten Parametern. Ungültige Pflichtangaben werden zusätzlich zu den Feldmeldungen im Resultatbereich handlungsorientiert zusammengefasst. Der Regel- und Kalenderstand bleibt als zurückhaltende Informationszeile am Seitenende sichtbar.

Die Oberfläche führt keine eigene Fristberechnung durch. Sie bildet Eingaben auf den Vertrag des AP8-Kerns ab und zeigt dessen Resultat unverändert an. Unbestätigte Zustellfiktionen, ungeklärte spezialgesetzliche Regeln und widersprüchliche Feiertagsanknüpfungen führen zu einer Sperre ohne Fristende.

Der Feiertagskalender wird im Bern-MVP standardmässig auf den Kanton Bern gesetzt. Bei `VRPG-BE` ist diese Wahl fachlich fest und nicht veränderbar. Bei Bundesprofilen kann sie sichtbar übersteuert werden. Eine tatsächliche Abweichung verlangt eine Begründung. Die Begründung wird im AP9-Kandidaten nicht dauerhaft gespeichert.

## Lokale Defaults und Datenschutz

Unter dem versionierten Schlüssel `fristenrechner.defaults.v1` werden nur folgende Werte im Browser gespeichert:

- Produktsprache
- zuständige Behörde beziehungsweise ihr Gemeinwesen
- Rechtsprofil
- Fristdauer
- profilspezifische Auswahlwerte
- ausgewählter Kalender

Das Empfangsdatum, Bestätigungen, Übersteuerungsbegründungen und eine zusätzliche Feiertagsanknüpfung werden nicht als Default gespeichert. Der Speichervertrag wird in [`defaults.ts`](defaults.ts) validiert. Nicht lesbare, veraltete oder mit dem Gemeinwesen unvereinbare Werte werden auf sichere MVP-Standards zurückgeführt.

## Deutsch und Französisch

[`i18n.ts`](i18n.ts) enthält die Produkttexte für Deutsch und Französisch. Datengetriebene `labelKey` und `warningKey` werden nicht im Profil verdoppelt. Automatisierte Tests prüfen, dass alle Selektoren, Fachwarnungen, Sperrgründe und Rechenspurgründe des MVP in beiden Sprachen aufgelöst werden.

## Lokale Vorschau

Die Vorschau dient ausschliesslich Entwicklung und Qualitätssicherung:

```bash
npm run preview:ui
```

Danach ist die Oberfläche unter `http://127.0.0.1:4173/` erreichbar. Vier reproduzierbare QA-Zustände können über den Parameter `qa` geladen werden:

`preview/index.html` ist die Quelldatei des lokalen Builds und keine eigenständige Anwendung. Beim direkten Öffnen zeigt sie deshalb einen Start- und Diagnosehinweis. `npm run preview:ui` erzeugt `index.html`, JavaScript und CSS gemeinsam unter `.work/ui-preview/` und liefert diesen vollständigen Stand über den lokalen Server aus.

- `?qa=stpo-weekend`
- `?qa=delivery-block`
- `?qa=special-law-block`
- `?qa=anchor-block`

Die Presets liegen ausschliesslich in [`preview/qaPresets.ts`](preview/qaPresets.ts). Sie verändern weder den Rechenkern noch den Datenrelease.

## Qualitätsgrenzen

Die AP9-Prüfung umfasst semantische Beschriftungen, Tastaturreihenfolge, sichtbaren Fokus, Statusmeldungen mit `aria-live`, Deutsch und Französisch, eine mobile Breite von 390 Pixeln ohne horizontales Überlaufen sowie Farbkontraste der eigenen Gestaltungsfarben. Dies setzt das Qualitätsziel WCAG 2.1 AA nach eCH-0059 für den geprüften Umfang um.

Es handelt sich noch nicht um eine formelle Accessibility-Konformitätsbewertung. Eine erneute Prüfung im echten SharePoint- und Teams-Host sowie ein vollständiger produktiver Audit folgen nach der SPFx-Integration. Die Abweichung ist bewusst, weil AP9 eine hostneutrale Komponente und noch keinen installierten Produktrelease liefert.

## Folgepaket

Die SPFx-Produktintegration übernimmt diese Komponente, den bereits geprüften Release-Service aus dem Spike und die beschlossene Zielarchitektur aus DEC-2026-013. Sie ist nicht Bestandteil von AP9.
