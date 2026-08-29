# AP9: Funktionale MVP-Rechneroberfläche v0.1

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP9, GitHub-Issue #20 |
| Stand | 29. August 2026 |
| Status | als Grundlage für AP10 abgenommen |
| Verantwortliche Person | David Steimer |
| KI-Arbeitsinstrument | Codex ohne formelle Freigabe- oder Haftungsverantwortung |
| Datenbasis | `2026-08-29-ap5-approved.1` |
| Rechenkern | AP8 v0.1 |
| Produktstack | React 17.0.1, Fluent UI React v8.106.4, TypeScript 5.8.3 |

## 1. Ergebnis

AP9 liefert einen durchgängigen hostneutralen UI-Schnitt vom Empfangsdatum bis zum berechneten oder ausdrücklich gesperrten Resultat. Die Komponente verwendet ausschliesslich den AP8-Rechenkern und den vollständig validierten AP5-Datenstand. Sie enthält keine eigene Kalenderdatumsarithmetik.

Die Oberfläche setzt die in Issue #17 beschriebene Skalierungslogik bereits im MVP um. Die zuständige Behörde steht vor dem Erlass und filtert die Profilmenge datengetrieben. Ein nicht mehr zulässiges Profil wird bei einem Wechsel verworfen und durch einen zulässigen MVP-Default ersetzt.

Die AP9-Korrekturschleife vom 29. August 2026 richtet die Oberfläche auf den typischen Kanzlei-Workflow aus. Benutzerinnen und Benutzer erfassen primär das Zustelldatum, prüfen die meist konstanten Standards und lösen die Berechnung aus. Die vier Hauptaktionen stehen deshalb direkt unter den Eingaben in einem zweispaltigen Raster mit den Spaltenbreiten der Eingabefelder. Resultate und handlungsorientierte Fehlermeldungen erscheinen vor den automatischen Parametern. Der Regel- und Kalenderstand wurde in eine kompakte Informationszeile am Seitenende verschoben. Der bisherige Erklärungstext zum Gemeinwesen entfällt. Die Auswahl heisst neu `Zuständige Behörde` mit den Werten `Bundesbehörde` und `Behörde des Kantons Bern`.

## 2. Lieferumfang

- React-Komponente und exportierte UI-Schnittstelle unter `src/ui/`
- deutsche und französische Produkttexte
- lokale, versionierte und validierte Browser-Defaults
- kanzleiorientierter Hauptablauf mit Aktionen unmittelbar nach den Eingaben
- automatische Kalender- und Stillstandsanzeige
- begründungspflichtige Kalenderübersteuerung
- kontrollierte Mehrfachanknüpfung von Feiertagen
- Ergebnisdarstellung mit Fristbeginn, rechnerischem Ende und endgültigem Fristende
- Sperr- und Warnhinweise ohne scheinbar plausibles Ergebnis
- vollständige Rechenspur mit Daten, Regeln, Gründen, Stillstandsperioden und übersprungenen Tagen
- lokale, reproduzierbare Browser-Vorschau
- automatisierte UI-Modell-, Sprach- und Defaulttests

## 3. Sicherheitsgrenzen

AP9 trifft keine neue juristische Klassifikation. Sämtliche Profile, Selektoren, Warnungen und Regeleffekte stammen aus dem abgenommenen Datenrelease. Folgende Konstellationen bleiben ausdrücklich gesperrt:

- Zustellfiktion ohne Bestätigung ihrer Anwendbarkeit
- ungeklärte oder bekannte abweichende Spezialgesetzgebung ausserhalb des Profils
- mehrere nicht bestätigte Feiertagsanknüpfungen
- fehlende oder ungültige Pflichtmerkmale
- Daten ausserhalb der freigegebenen zeitlichen Abdeckung

Die UI speichert kein Empfangsdatum. Sie schreibt keine Daten nach SharePoint, Teams oder Microsoft Graph. Eine Übersteuerungsbegründung bleibt nur im aktuellen React-Zustand.

## 4. Prüfnachweis

| ID | Prüfung | Ergebnis | Evidenz |
| --- | --- | --- | --- |
| U01 | TypeScript-Typprüfung | bestanden | `npm run typecheck` |
| U02 | bestehende AP8-Kernprüfungen | 33 von 33 bestanden | `tests/core/` |
| U03 | AP9-UI-Modell und alle AP6-Fälle | 21 von 21 bestanden | `tests/ui/model.test.ts` |
| U04 | lokale Defaults und Datenschutz | 4 von 4 bestanden | `tests/ui/defaults.test.ts` |
| U05 | Sprachabdeckung Deutsch und Französisch | 4 von 4 bestanden | `tests/ui/i18n.test.ts` |
| U06 | gesamter TypeScript-Testlauf | 65 von 65 bestanden | `npm run test` |
| U07 | vollständige lokale Buildausgabe und Workflow-Reihenfolge | bestanden | `npm run build:ui`, `tests/ui/preview.test.ts` |
| B01 | StPO-Wochenendfall | 28.09.2026, bestanden | lokale Browserprüfung in Edge |
| B02 | Bund filtert VRPG-BE aus | bestanden | vier Bundesprofile, kein kantonales Profil |
| B03 | Wechsel VRPG-BE zu Bund | bestanden | Auswahl sichtbar auf StPO zurückgesetzt |
| B04 | französische Oberfläche | bestanden | Titel, Formular und Automatik vollständig französisch |
| B05 | drei fachliche Sperrfälle | bestanden | je Sperrgrund sichtbar, kein Feld `Fristablauf` |
| B06 | Kalenderübersteuerung | bestanden | ohne Begründung gesperrt, nach Begründung berechenbar |
| B07 | Tastaturreihenfolge | bestanden | Sprache, Datum, Frist, zuständige Behörde, Erlass, Zusatzmerkmal, Hauptaktionen |
| B08 | Mobile bei 390 Pixeln | bestanden | Dokumentbreite entspricht Inhaltsbreite, kein horizontales Überlaufen |
| B09 | Browserkonsole | bestanden | keine anwendungsseitigen Fehler oder Warnungen im Schlusslauf |
| B10 | Kanzlei-Workflow | bestanden | je zwei gleich breite Hauptaktionen auf zwei Zeilen vor Resultat, Resultat vor Automatik, Datenstand am Seitenende |
| B11 | handlungsorientierte Validierung | bestanden | fehlendes Datum im Feld und im Resultatbereich erklärt |
| B12 | Standardaktionen | bestanden | Speichern und Zurücksetzen mit sichtbarer Bestätigung, weiterhin ohne Empfangsdatum |
| A01 | eigene Textfarben | bestanden | Navy 14,38:1, Teal 5,77:1, Muted 5,91:1, Copper 5,01:1 |

Der Browserlauf wurde nach jeder Buildänderung neu geladen. Ein anfängliches horizontales Überlaufen eines langen Dropdownwerts auf 390 Pixeln wurde lokalisiert, durch flexible Mindestbreiten korrigiert und anschliessend mit `documentWidth = clientWidth = 375` erneut geprüft.

Die Korrekturschleife wurde zusätzlich im normalen StPO-Wochenendfall, mit leerem Pflichtdatum, im Zustellfiktions-Sperrfall, mit den beiden Standardaktionen sowie in deutscher und französischer Sprache geprüft. Die Browserkonsole enthielt keine Meldung aus `127.0.0.1` oder dem Anwendungsbundle. Meldungen einer installierten Browsererweiterung mit `chrome-extension://` lagen ausserhalb der Anwendung und wurden als solche abgegrenzt.

## 5. Accessibility und eCH-0059

Die Komponente verwendet echte Überschriften, Formularbeschriftungen, Pflichtfeldkennzeichnung, semantische Listen und Definitionslisten sowie eine polite Live-Region für Resultate. Die Kernbedienfolge funktioniert mit Tastatur. Fokuszustände werden durch Fluent UI sichtbar dargestellt. Die eigenen Textfarben erreichen für normalen Text mindestens das Kontrastverhältnis 4,5:1.

Die Prüfung orientiert sich im AP9-Umfang an WCAG 2.1 AA und damit am im Projekt festgelegten Qualitätsziel nach eCH-0059. Sie ist noch keine formelle Konformitätserklärung. Hosteffekte in SharePoint und Teams, Hochkontrastdarstellung im Zieltenant und ein vollständiger End-to-End-Audit werden im Integrations- beziehungsweise Releasepaket erneut geprüft.

## 6. Abgrenzung und nächster Schritt

Nicht enthalten sind SPFx-Produktpaketierung, Providerintegration, Tenantinstallation, produktive Releasefreigabe, Gastzugriffe und Outlook-Export. Kontextbezogene Hilfetexte werden in [Issue #21](https://github.com/davidsteimer/fristenrechner/issues/21), eine zusätzliche visuelle Kennzeichnung von Auswahl und Übersteuerungen in [Issue #22](https://github.com/davidsteimer/fristenrechner/issues/22) für einen Folgerelease geprüft. David Steimer hat den AP9-Stand mit dem Auftrag zum Start von AP10 als Integrationsgrundlage übernommen. Die SPFx-Produktintegration wird in [AP10](spfx-produktintegration-ap10.md) getrennt nachgewiesen.
