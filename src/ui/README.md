# MVP-Rechneroberfläche

## Status

Dieses Modul enthält die gemeinsame funktionale Rechneroberfläche. Es verbindet den allgemeinen AP8-Rechenkern und den in AP11B freigegebenen Spezialregimekern mit React 17.0.1 und Fluent UI React v8.106.4. Die Komponente bleibt von SharePoint, Teams, SPFx und einem konkreten Datenprovider unabhängig.

Historischer Freigabestand: Der AP9-Stand wurde von David Steimer als Grundlage für AP10 abgenommen. Die AP11C-Erweiterung wurde als MVP 0.2 fachlich abgenommen und im steimer.ch-Tenant geprüft. Die Erweiterungen aus AP12C und Issue #18 sind Bestandteil des freigegebenen Release 2. Das Paket 0.3.0.0 und die SharePoint-, Teams- und Outlook-Prüfmatrix sind abgeschlossen. Die anschliessende öffentliche P-Ausprägung ist mit DEC-2026-018 freigegeben.

Lokaler Entwicklungsstand vom 12. September 2026: AP17A setzt die mit [DEC-2026-019](../../docs/entscheidungen/DEC-2026-019-gestufte-vrpg-bedienung.md) beschlossene gestufte VRPG-Bedienung um. AP17A und der begrenzte AP17B-Fachstand sind abgenommen. [AP17C](../../docs/architektur/vrpg-integration-ap17c.md) integriert 16 qualifizierte Fachpfade in einen ausdrücklich bezeichneten lokalen Kandidaten und ist durch David Steimer am 12. September 2026 fachlich abgenommen. Der [AP17-Plan](../../docs/ux/vrpg-bedienkonzept-ap17.md) trennt Integration, fachliche Kandidatenabnahme und Produktfreigabe. Die nachfolgenden Bedienbeschreibungen beziehen sich auf den lokalen Quellstand, nicht auf eine bereits aktualisierte Produktivinstallation.

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
5. datengetriebene Zusatzmerkmale oder gestufte VRPG-Auswahl
6. Berechnung oder begründete Sperre
7. sichtbare automatische Parameter und allfällige kontrollierte Übersteuerung
8. kompakter Regel- und Kalenderstand am Seitenende

Beim gemeinsamen Einstieg `VRPG Bern und Spezialrecht` beginnt die Bereichsauswahl mit `Bitte wählen`. Es folgen allgemeines Verwaltungsrecht, Sozialversicherungsrecht, politische Rechte und Beschaffungsrecht. Abhängig vom Bereich erscheinen Spezialerlass beziehungsweise betroffene Ebene und Verfahrenshandlung. Ein zusätzliches Verfahrensstadium erscheint nur, wenn es relevant ist und nicht bereits durch die Handlung feststeht. Die Zuordnung liegt in [`vrpgSelection.ts`](vrpgSelection.ts).

Unter `Politische Rechte → Eidgenössische Angelegenheit` wird die einzige unterstützte Handlung automatisch eingesetzt und fest angezeigt. `vrpgFixedAction` verwendet dazu ausschliesslich die ausdrücklich zugeordneten und aktuell unterstützten Katalogeinträge. Kantonal und kommunal bleiben echte Auswahlen. Leere gespeicherte Bundesauswahlen werden eindeutig ergänzt, beschädigte oder fremde nichtleere Handlungswerte nicht still umgedeutet. Die Bereinigung nach Ebenenwechsel und die bestehenden Katalogsperren bleiben erhalten.

Die bisher freigegebenen auswählbaren Regime und ihre konkreten Fristkomponenten bleiben über die neue Gruppierung erreichbar. Eine neue oder ähnlich bezeichnete Katalogregel wird nicht automatisch zur Auswahl hinzugefügt. Sozialversicherungsrecht mit IVG, AHVG und UVG sowie Beschaffungsrecht mit IVöB waren in AP17A zunächst gesperrte Auswahlgerüste. Mit dem ausdrücklich geladenen AP17C-Kandidaten werden ausschliesslich die 16 in AP17B abgenommenen Zuordnungen angeboten. Der freigegebene MVP-0.3-Datenstand enthält sie weiterhin nicht.

Leere Auswahlen können ausdrücklich als persönliche Standards gespeichert werden. Der Wechsel einer übergeordneten Auswahl entfernt unvereinbare Unterauswahlen, Datumsanker und das bisherige Ergebnis. Behördlich gesetzte Termine und reine Dokumentationseinträge bleiben aus dem Rechen-GUI entfernt. Fehlende Angaben, nicht enthaltene Fachregeln und die vier bewusst ungeklärten Sammelpfade führen zu einer verständlichen Sperre, nicht zu einem allgemeinen VRPG-Ersatzresultat.

AP17C ergänzt [`vrpgQualification.ts`](vrpgQualification.ts) mit festen Modellanzeigen für Verfahrensgegenstand und fristauslösendes Dokument. Bei nur einer unterstützten Eröffnungsart erscheint auch diese fest. `vrpgModelScope` leitet die Werte aus dem ausdrücklich ausgewählten Fachpfad ab. Keine dieser Anzeigen behauptet eine Bestätigung der tatsächlichen Fallkonstellation. Gemäss der von David Steimer am 12. September 2026 beauftragten Korrektur gibt es hier keine zusätzlichen Pflichtklicks, keine ausgegrauten Felder und keine Dropdown-Pfeile. Lange Texte umbrechen. Die festen Felder sind nicht in der Tabulatorfolge.

Fallbezogene Auswahlen für die beiden Eröffnungsarten im Beschaffungsrecht, die ATSG-Anknüpfung sowie das Datum der Vergabeverfahrenseinleitung beginnen weiterhin leer und werden nicht als Standards gespeichert. `VrpgContextState` enthält nur diese tatsächlichen Fallangaben. Es gibt keine zusätzliche Bestätigungscheckbox. Gesetzliche 20/30 Tage sind nicht frei veränderbar. Angeordnete Tagesfristen benötigen die explizite Dauer. Auch der direkte Kernaufruf prüft sämtliche Voraussetzungen erneut.

Der UI-Adapter kennzeichnet seinen Kontext mit `qualificationBasis: displayed-model-scope`. Bei fixer Eröffnung bleibt `notificationConfirmed: false`, was der Kern nur bei genau einem exakt passenden Kanal zulässt. Die echte Auswahl mehrerer Kanäle bleibt davon getrennt. Ohne neue Basis gilt weiterhin der unveränderte archivische Vertrag. Eine ungültige Basis, widersprüchliche Eingaben oder nicht passende Fachzuordnungen werden gesperrt. Der Datenkandidat wird durch diese Laufzeitänderung nicht neu erzeugt oder freigegeben.

Die bewusste Wahl der allgemeinen VRPG-Frist ersetzt die frühere zusätzliche Bestätigung, dass keine abweichende spezialgesetzliche Regel gilt. Bestätigungen für eine Zustellfiktion oder mehrere mögliche Feiertagsanknüpfungen bleiben davon unberührt.

Das Feld heisst durchgehend `Sitz der zuständigen Stelle` beziehungsweise `Siège de l’organisme compétent`, auch nach dem Laden gespeicherter Standards und beim Wechsel von Erlass oder Rechtsbereich. Die bisherige Sonderbeschriftung im Sozialversicherungspfad entfällt gemäss dem Bedienentscheid von David Steimer vom 12. September 2026. Die Auswahlwerte `Bundesbehörde` und `Behörde des Kantons Bern` bleiben unverändert. Diese sprachliche Vereinfachung erweitert den unterstützten Verfahrenskontext nicht. Für die Bundesbehörde erscheinen nur Bundesprofile. Für die Behörde des Kantons Bern erscheinen Bundesprofile und das Profil `VRPG-BE`. Diese Filterung wird aus `jurisdiction.level` und `jurisdiction.code` des validierten Datenrelease abgeleitet. Gerichtliche Dokumentauswahlen bezeichnen das bernische Versicherungsgericht weiterhin ausdrücklich.

Eingaben, die vier Hauptaktionen, Ergebnisse und automatische Parameter folgen demselben zweispaltigen Raster. Die Hauptaktionen stehen unmittelbar nach den Eingabefeldern, sind gleich breit wie diese und belegen zwei Zeilen. Ein einzelnes Zusatzfeld bleibt eine halbe Zeile breit. Auf schmalen Ansichten wechseln die Raster in eine Spalte. Ein berechnetes oder gesperrtes Resultat erscheint vor den automatisch bestimmten Parametern. Ungültige Pflichtangaben werden zusätzlich zu den Feldmeldungen im Resultatbereich handlungsorientiert zusammengefasst. Der Regel- und Kalenderstand bleibt als zurückhaltende Informationszeile am Seitenende sichtbar.

Die Oberfläche führt keine eigene Fristberechnung durch. Sie bildet allgemeine Eingaben auf `calculateDeadline` und besondere Eingaben auf `calculateSpecialDeadline` ab. Unbestätigte Zustellfiktionen, ungeklärte spezialgesetzliche Regeln, widersprüchliche Feiertagsanknüpfungen und nicht unterstützte Spezialregime führen zu einer Sperre ohne Fristende.

Bisherige Spezialresultate weisen Fristablauf und Anforderungen an die Fristwahrung getrennt aus. Dazu gehören insbesondere Eingang oder Aufgabe, Annahmeschluss, Zeitzone, Originalerfordernis, zulässige Kanäle und geeignete Nachweise. Die neuen qualifizierten Tagesfristen zeigen stattdessen den Tag nach der Eröffnung, den ersten gezählten Tag, übersprungene Stillstandstage und Endverschiebung. Anforderungen an Fristwahrung, Zulässigkeit und Wiederherstellung werden damit nicht geprüft oder bestätigt. Automatische Parameter und die technische Fallabdeckung bleiben sichtbar.

Ein vollständig berechnetes Resultat bietet einen rein clientseitigen Outlook-kompatiblen Kalendereintrag an. Sowohl im allgemeinen als auch im besonderen Resultatraster belegt er die Kachel rechts unten, ohne breite Zusatzkachel. Blockierte Resultate und Spezialresultate mit noch erforderlicher manueller Prüfung erhalten keinen Export. Die optionale Referenz bleibt im flüchtigen Komponentenstatus und wird bei einer neuen Berechnung, einer fachlichen Eingabeänderung oder beim Zurücksetzen gelöscht.

Die Schaltfläche zur Dateierzeugung bildet zugleich den sichtbaren Kopf der Kachel. Darunter stehen nur die optionale Referenz und der kurze Hinweis zur Nicht-Speicherung. Die erzeugte `.ics`-Datei enthält einen ganztägigen, freien Termin am berechneten Fristablauf, die Kategorie `Fristablauf` und eine Erinnerung 4 Tage 16 Stunden vor Terminbeginn. Die Outlook-Farbzuweisung und die mögliche Abweichung der lokalen Erinnerungsuhrzeit bei einer Zeitumstellung bleiben im [Issue-18-Nachweis](../../docs/architektur/outlook-kalendereintrag-issue-18.md) dokumentiert, werden im kompakten GUI aber nicht zusätzlich erklärt.

Der Feiertagskalender wird im Bern-MVP standardmässig auf den Kanton Bern gesetzt. Bei allgemeinem `VRPG-BE` ist diese Wahl fachlich fest und nicht veränderbar. Bei Bundesprofilen kann sie sichtbar übersteuert werden. Eine tatsächliche Abweichung verlangt eine Begründung. Die Begründung wird nicht dauerhaft gespeichert. AP17C verlangt im Sozialversicherungspfad ausdrücklich geklärte Anknüpfungen von Partei und allfälliger Vertretung im Kanton Bern. Fehlende oder andere Anknüpfungen bleiben gesperrt und können nicht übersteuert werden.

Datumsangaben verwenden die kleine native Komponente [`DateInput.tsx`](DateInput.tsx) mit `input type="date"`, ISO-Wert, verknüpfter Beschriftung und Fehlermeldung. Sie ersetzt für Datumsfelder das Fluent-Textfeld, nachdem in Chrome 152 ein Fokusproblem dieses Feldes reproduziert wurde. Die Änderung benötigt keine zusätzliche Abhängigkeit und ändert weder die Kalenderarithmetik noch die fachliche Datumssemantik.

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
- gestufte VRPG-Auswahl mit Bereich, Spezialerlass beziehungsweise Ebene, Handlung und gegebenenfalls Stadium

Das Empfangsdatum, besondere Ankerdaten, Uhrzeiten, Bestätigungen, Übersteuerungsbegründungen und eine zusätzliche Feiertagsanknüpfung werden nicht als Default gespeichert. Der Inhalt des unveränderten Schlüssels trägt intern Version 3. Version-1- und Version-2-Defaults werden anhand eindeutiger, freigegebener Regime-/Komponentenzuordnungen migriert. Mehrdeutige oder nicht freigegebene Altzuordnungen führen zur erneuten Auswahl, nicht zu einem angenommenen Ersatzregime. Nicht mehr zulässige `unknown`-Werte sowie unvereinbare Spezialauswahlen werden verworfen. `Bitte wählen` bleibt ausdrücklich speicherbar. Der Speichervertrag wird in [`defaults.ts`](defaults.ts) validiert.

Auch die optionale Referenz des Kalendereintrags wird nie als Default oder anderweitig im Browser gespeichert. Sie fliesst nur in die lokal erzeugte Kalenderdatei ein.

## Deutsch und Französisch

[`i18n.ts`](i18n.ts) enthält die Produkttexte für Deutsch und Französisch. Datengetriebene `labelKey` und `warningKey` werden nicht im Profil verdoppelt. Automatisierte Tests prüfen, dass alle Selektoren, Fachwarnungen, Sperrgründe und Rechenspurgründe des MVP in beiden Sprachen aufgelöst werden.

## Lokale Vorschau

Die Vorschau dient ausschliesslich Entwicklung und Qualitätssicherung:

```bash
npm run preview:ui
```

Danach ist die Oberfläche unter `http://127.0.0.1:4173/` erreichbar. Reproduzierbare QA-Zustände können über den Parameter `qa` geladen werden:

`preview/index.html` ist die Quelldatei des lokalen Builds und keine eigenständige Anwendung. Beim direkten Öffnen zeigt sie deshalb einen Start- und Diagnosehinweis. `npm run preview:ui` erzeugt `index.html`, JavaScript und CSS gemeinsam unter `.work/ui-preview/` und liefert diesen vollständigen Stand über den lokalen Server aus.

- `?qa=stpo-weekend`
- `?qa=vrpg-progressive` zeigt die neue Auswahlführung ohne vorbefülltes Datum
- `?qa=delivery-block`
- `?qa=special-law-block`
- `?qa=anchor-block`
- `?qa=vrpg-special-original`
- `?qa=vrpg-special-gate`

Die Presets liegen ausschliesslich in [`preview/qaPresets.ts`](preview/qaPresets.ts). Sie verändern weder den Rechenkern noch den Datenrelease.

## Qualitätsgrenzen

Die AP9-Prüfung umfasst semantische Beschriftungen, Tastaturreihenfolge, sichtbaren Fokus, Statusmeldungen mit `aria-live`, Deutsch und Französisch, eine mobile Breite von 390 Pixeln ohne horizontales Überlaufen sowie Farbkontraste der eigenen Gestaltungsfarben. AP11C hat diese Prüfung für Fristtyp, bedingte Anker, Spezialresultat, Fristwahrung, Sofortanfechtungshinweis und die französische Spezialansicht wiederholt. Dies setzt das Qualitätsziel WCAG 2.1 AA nach eCH-0059 für den geprüften Umfang um.

Es handelt sich nicht um eine formelle Accessibility-Konformitätsbewertung. Die historischen Release-2-Hostprüfungen sind abgeschlossen. Sie ersetzen keine erneute Prüfung des AP17-Kandidaten. Sein lokaler Prüfstand wird im [AP17A-Nachweis](../../docs/architektur/vrpg-bedienung-ap17a.md) dokumentiert. Hostprüfungen und die kontrollierte Bereitstellung eines neuen Releases folgen erst nach den dafür erforderlichen Freigaben.

## Freigabegrenze

Die SPFx-Lösung synchronisiert diese Komponente mechanisch. Der MVP-0.2-Build und seine Tenantprüfung sind im [AP11C-Nachweis](../../docs/architektur/mvp-02-spezialregime-ap11c.md) dokumentiert. Release 2 verwendet den freigegebenen Datenrelease `2026-08-31-mvp-03-approved.1` und hat seine Tenantmatrix bestanden. AP17A verändert diesen freigegebenen Datenrelease nicht. Die lokale UI-Umsetzung ist weder eine neue Fachfreigabe noch eine Bereitstellungs- oder Betriebsfreigabe für SharePoint, Teams oder die öffentliche P-Ausprägung.
