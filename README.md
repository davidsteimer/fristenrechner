# Fristenrechner Schweiz

Der Fristenrechner Schweiz ist eine vollständig webbasierte Anwendung zur nachvollziehbaren Berechnung verfahrensrechtlicher Fristen. Die Lösung ist für Microsoft 365 konzipiert und soll auf modernen SharePoint-Seiten sowie als Registerkarte in Microsoft Teams funktionieren.

> **Projektstatus:** Der AP9-Kandidat der [funktionalen MVP-Rechneroberfläche](src/ui/README.md) ist implementiert und technisch geprüft. Er verbindet React 17 und Fluent UI v8 hostneutral mit dem abgenommenen AP8-Rechenkern. Alle 64 TypeScript-Tests bestehen. Darin sind sämtliche 15 freigegebenen Golden Cases und die drei Sperrfälle nochmals über das UI-Eingabemodell abgedeckt. AP9 wartet auf die Abnahme durch David Steimer. Die SPFx-Produktintegration und Tenantinstallation folgen in einem weiteren Arbeitspaket. Der Teams-Mirror und Gastzugriffe bleiben bis zu ihren ausdrücklich vorgesehenen Folgeprüfungen unkonfiguriert beziehungsweise gesperrt. Es besteht noch keine produktiv freigegebene Anwendung.

## Zweck

Die Anwendung soll aus dem Empfangsdatum einer fristauslösenden Zustellung, der Fristdauer, dem anwendbaren Verfahrensrecht und dem massgebenden Gemeinwesen ein begründetes Fristende bestimmen. Sie zeigt die automatisch gewählten Parameter, verwendeten Datenstände und Rechenschritte sichtbar an. Automatische Auswahlen sollen kontrolliert übersteuert werden können.

Die berechneten Angaben sind ein Arbeitsmittel. Sie ersetzen weder die Prüfung der konkreten Zustellung noch eine juristische Beurteilung des Einzelfalls.

## MVP-Umfang

Der erste Release konzentriert sich auf den Kanton Bern und umfasst folgende Rechtsprofile:

- Schweizerische Strafprozessordnung, StPO
- Schweizerische Zivilprozessordnung, ZPO
- Bundesgerichtsgesetz, BGG
- Verwaltungsverfahrensgesetz des Bundes, VwVG
- Gesetz über die Verwaltungsrechtspflege des Kantons Bern, VRPG

Die Produktsprache ist Deutsch und Französisch. Persönliche Voreinstellungen werden im ersten Release nur lokal im Browser gespeichert. Es werden keine Fallakten, Namen oder Aktenzeichen benötigt.

## Technisches Zielbild

Vorgesehen ist eine clientseitige SharePoint-Framework-Lösung mit React und Fluent UI. Ein deterministischer TypeScript-Rechenkern bleibt von Oberfläche, Microsoft-365-Integration und Datenquelle getrennt. Die Berechnung arbeitet ausschliesslich mit Kalenderdaten ohne Uhrzeiten und ohne Zeitzonenabhängigkeit.

Der Pilot bezieht versionierte Rechts- und Kalenderdaten aus einem öffentlichen GitHub-Release. Eine Provider-Schnittstelle bereitet den späteren Wechsel auf einen tenantinternen SharePoint-Mirror vor. Der Rechenkern kennt die konkrete Datenquelle nicht.

Der in AP8 implementierte [Rechenkern v0.1](src/core/README.md) verwendet reine ISO-Kalenderdatumsarithmetik, verarbeitet die typisierten AP5-Regeleffekte und blockiert ungeklärte Eingaben ohne scheinbar plausibles Fristende. Die automatisierten TypeScript-Tests laufen zusätzlich zum unabhängigen Python-Testorakel aus AP6.

Die in AP9 implementierte [MVP-Rechneroberfläche](src/ui/README.md) zeigt Gemeinwesen, gefilterte Rechtsprofile, profilspezifische Merkmale, automatische Parameter, kontrollierte Übersteuerungen, Resultate und die Rechenspur auf Deutsch und Französisch. Der [AP9-Prüfnachweis](docs/architektur/mvp-rechneroberflaeche-ap9.md) dokumentiert den automatisierten und browserbasierten Kandidatenstand.

Das [AP5-Datenrelease-Format](docs/architektur/datenrelease-format.md) verwendet JSON Schema Draft 2020-12, ISO-Kalenderdaten, ein unveränderliches Manifest und SHA-256-Prüfsummen. GitHub, SharePoint-Mirror und manueller Import liefern dasselbe Format als byteidentische Dateien.

## Qualitätsgrundsätze

- Jede Fachregel erhält eine amtliche Quelle, einen Gültigkeitszeitraum und mindestens einen Testfall.
- Fristbeginn, rechnerisches Ende, Stillstände, Verschiebungen und endgültiges Ende bleiben als Rechenspur nachvollziehbar.
- Ungeprüfte oder widersprüchliche Daten werden nicht stillschweigend verwendet.
- Deutsch und Französisch werden für sämtliche Produkttexte gleichwertig gepflegt.
- Tastaturbedienung, verständliche Fehlermeldungen und WCAG 2.1 AA nach eCH-0059 sind Qualitätsziele.
- Releases nennen Codeversion, Datenrelease, Quellenstand und Prüfstatus.

## Repository-Struktur

| Pfad | Zweck |
| --- | --- |
| `src/` | Rechenkern, Oberfläche, Lokalisierung und Provider |
| `data/` | Versionierte Rechtsprofile, Feiertage und Fristenstillstände |
| `schemas/` | Maschinenlesbare Schemata für Regeln, Kalender und Releases |
| `tests/` | Unit Tests, Golden Cases, Datenvalidierung und UI-Tests |
| `spike/spfx/` | Zeitlich begrenzter SPFx-Minimalprototyp mit Build-, Paket- und Providernachweisen |
| `docs/` | Architektur, Betrieb, Fachpflege und Entscheide |
| `outputs/` | Freigegebene Projektgrundlagen in Word und PDF |
| `LICENSES/` | Lizenztexte und Abgrenzung der lizenzierten Werktypen |

Die technische Projektstruktur wurde mit dem im [AP7-Ausführungsplan](docs/architektur/spfx-machbarkeitsspike-ap7.md) abgegrenzten SPFx-Spike erfolgreich geprüft. Der [Ergebnisbericht](docs/architektur/spfx-spike-ergebnisbericht.md) und das [Testprotokoll](docs/architektur/spfx-spike-testprotokoll.md) dokumentieren die vollständige Evidenz. Der dauerhafte Quellcodebaum wird gestützt auf den beschlossenen Architekturentscheid DEC-2026-013 übernommen.

## Projektführung

Das Vorhaben wird schlank nach HERMES 2022 agil geführt. Es gilt ein WIP-Limit von einem wesentlichen Arbeitspaket. Ein Arbeitspaket umfasst höchstens fünf Nettoarbeitstage. Die [GitHub Issues](https://github.com/davidsteimer/fristenrechner/issues) und das öffentliche [GitHub Project «Fristenrechner Schweiz · MVP»](https://github.com/users/davidsteimer/projects/1) bilden die einzige operative Aufgabenliste.

David Steimer nimmt in der aktuellen Einpersonenphase alle menschlichen Projekt-, Fach-, Prüf- und Betriebsrollen wahr. Die Rollen bleiben als Zielmodell getrennt dokumentiert. Codex unterstützt als KI-Arbeitsinstrument, übernimmt aber keine formelle Freigabe-, Organ- oder Haftungsverantwortung.

Materielle Entscheide werden mit stabilen DEC-Nummern im [Entscheidungsregister](docs/entscheidungen/README.md) dokumentiert. Chatnachrichten allein gelten nicht als dauerhafter Entscheidungsnachweis.

Die fachliche Grundlage des MVP liegt in der [Rechtsmatrix](docs/fachrecht/rechtsmatrix-mvp.md). Das zugehörige [Quellenregister](docs/fachrecht/quellenregister.md) und die [offenen Fachfragen](docs/fachrecht/offene-fachfragen.md) verhindern, dass ungeklärte Annahmen als sichere Automatik in die Anwendung gelangen.

Der [AP6-Golden-Case-Korpus](tests/golden/README.md) bildet die fachlich freigegebenen Referenzerwartungen für den [implementierten Rechenkern](src/core/README.md). Berechenbare Referenzfälle und bewusst blockierte offene Konstellationen bleiben getrennt.

## Projektgrundlagen

- [Konzept Fristenrechner Schweiz, Version 1.0](outputs/2026-08-28_Konzept_Fristenrechner_Schweiz_V1.0.pdf)
- [Projekt- und Realisierungsplan, Version 1.0](outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.pdf)

Die editierbaren Word-Fassungen liegen im selben Verzeichnis.

## Mitwirken und Sicherheit

Beiträge sind willkommen. Vor einer grösseren Änderung bitte zuerst ein Issue eröffnen. Fachliche Änderungen benötigen amtliche Quellen und überprüfbare Testfälle. Einzelheiten stehen in [CONTRIBUTING.md](CONTRIBUTING.md).

Sicherheitslücken und sensible Befunde dürfen nicht in einem öffentlichen Issue offengelegt werden. Das Meldeverfahren steht in [SECURITY.md](SECURITY.md).

## Lizenzen

Der Programmcode steht unter der [GNU Affero General Public License, Version 3](LICENSE), ausschliesslich Version 3. Dokumentation sowie kuratierte Regel- und Kalenderdaten stehen unter [CC BY-SA 4.0](LICENSES/CC-BY-SA-4.0.txt), soweit die Rechte und Bedingungen der jeweiligen Primärquellen dies zulassen.

Amtliche Erlasstexte, Drittmaterialien, Quellenzitate, Marken und Logos werden durch diese Lizenzzuordnung nicht neu lizenziert. Abweichende Hinweise in einer Datei oder bei einem Datensatz gehen vor. Die genaue Abgrenzung ist in [LICENSES/README.md](LICENSES/README.md) festgehalten.

Copyright © 2026 David Steimer
