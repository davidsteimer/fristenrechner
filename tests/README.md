# Tests

Dieser Bereich nimmt die automatisierten Qualitätsnachweise auf. Vorgesehen sind:

- Unit Tests des Rechenkerns
- quellenbasierte Golden Cases
- Schema- und Datenvalidierung
- Grenzfälle für Schaltjahre, Jahreswechsel und Fristenstillstände
- UI- und Accessibility-Tests auf Deutsch und Französisch
- Build- und Integrationsprüfungen für SharePoint und Teams

Ein Golden Case dokumentiert Eingaben, erwartete Rechenschritte, erwartetes Ergebnis, Rechtsquelle, Gültigkeit und Prüfstatus. Der [AP6-Korpus](golden/README.md) enthält 15 fachlich abgenommene Referenzfälle, drei getrennte Sperrfälle und einen erwarteten Negativdatensatz.

Die [Rechtsmatrix für den MVP](../docs/fachrecht/rechtsmatrix-mvp.md#11-startbestand-für-ap6-golden-cases) enthält den quellenbasierten Startbestand der Fallgruppen. Die maschinenlesbaren Erwartungen unter `golden/approved/` wurden am 29. August 2026 durch David Steimer fachlich abgenommen.

## AP8-Rechenkern

Die TypeScript-Tests unter [`tests/core/`](core/) prüfen:

- alle 15 freigegebenen Golden Cases gegen den hostneutralen Produktkern
- die drei freigegebenen Sperrfälle samt Rechenspur
- Schaltjahre, Monats- und Jahreswechsel sowie Wochenenden
- unbekannte Profile, Kalender und Selektoren
- Daten- und Kalenderabdeckung
- spezialgesetzliche Sperren und unbestätigte Voraussetzungen
- bestätigte Zustellfiktion und Zustellung während eines ZPO-Fristenstillstands
- bytegleiche Wiederholbarkeit derselben Berechnung

Ausführung mit Node.js 22:

```bash
npm ci
npm run check
```

## AP9-Rechneroberfläche

Die TypeScript-Tests unter [`tests/ui/`](ui/) prüfen:

- datengetriebene Gemeinwesen- und Profilfilterung für Bund und Bern
- sicheres Verwerfen eines ausgefilterten kantonalen Defaults
- sichtbare Ableitung von Eingabedatumssemantik und Fristenstillstand
- Auslösbarkeit aller 15 freigegebenen und aller 3 gesperrten AP6-Fälle über das UI-Eingabemodell
- lokale Defaults ohne Empfangsdatum
- vollständige Auflösung der Selektoren, Warnungen und Sperrgründe auf Deutsch und Französisch
- kanzleiorientierte Reihenfolge von Hauptaktionen, Resultat, Automatik und Datenstand

Der bis AP9 bestehende Teilbestand umfasst 65 TypeScript-Tests. Darin enthalten sind Regressionstests für die sichtbare HTML-Fallbackmeldung, die vollständige lokale Buildausgabe und die vereinbarte Workflow-Reihenfolge. Mit AP11B umfasst der Gesamtlauf 86 TypeScript-Tests. AP11C erweitert ihn einschliesslich der abgenommenen Defaultlogik auf 103 Tests. Die browserbasierte Prüfung von Resultat, Sperren, Filterwechsel, Übersteuerung, Tastaturreihenfolge und Mobile-Layout ist im [AP9-Prüfnachweis](../docs/architektur/mvp-rechneroberflaeche-ap9.md) und im [AP11C-Nachweis](../docs/architektur/mvp-02-spezialregime-ap11c.md) dokumentiert.

## AP6-Golden-Case-Validierung

Der Validator [`tests/golden/validate_golden_cases.py`](golden/validate_golden_cases.py) prüft Schemata, Quellen- und Regelverweise, Datenrelease-Abdeckung, Mindestfallgruppen und Rechenspuren. Er berechnet alle 15 freigegebenen Fristergebnisse aus dem freigegebenen AP5-Release unabhängig neu. Drei offene Fachfälle müssen die Berechnung blockieren. Ein absichtlich unvollständiger Datensatz sowie vier semantisch manipulierte Varianten müssen abgewiesen werden.

Ausführung nach Installation von `requirements-data.txt`:

```bash
.venv/bin/python tests/golden/validate_golden_cases.py
```

## AP5-Datenvalidierung

Der Validator [`tests/data/validate_release.py`](data/validate_release.py) prüft:

- Schemata, Manifest und Artefakte
- Dateigrössen und SHA-256-Prüfsummen
- vollständige und sichere Manifestpfade
- eindeutige IDs und aufgelöste Quellen
- Selektoren, Bedingungen und Regeleffekte
- Kalenderabdeckung und Vererbung
- Stillstandsreferenzen, Periodengrenzen und Überlappungen
- feste und bewegliche Feiertage des Referenzbestands

Ausführung:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python tests/data/validate_release.py \
  data/releases/2026-08-29-ap5-approved.1 \
  --self-test
```

`--self-test` erzeugt ausschliesslich temporäre Kopien. Beim AP5-Release müssen sechs gezielte Beschädigungen abgewiesen werden. Beim Format-2-Release kommen das entfernte `R5_FIXED`, ein sichtbar geschalteter Behörden-Termin und ein widersprüchliches Einreichungsprofil hinzu.

## AP11B-Spezialregime

Die TypeScript-Tests unter [`tests/core/`](core/) prüfen den abgenommenen Format-2-Referenzrelease:

- die acht fachlich abgenommenen AP11A-Erwartungen bytegenau gegen den Produktkern
- alle vier Rechenarten R1 bis R4
- Tages- und Monatsarithmetik
- den BGG-Sommerstillstand und die Ausnahme für politische Rechte
- Endverschiebungen, Gate-Auswertung und versionierte Übersteuerungen
- Aufgabe, Eingang, Originaleingang bis 12.00 Uhr und eingeschriebene Aufgabe mit Kanälen und Nachweisen
- unbekannte, fehlende und widersprüchliche Eingaben
- die Sperre für offene und behördlich gesetzte Termine
- die feste Ankerbedingung für Art. 8a Abs. 1 VPR

Der releaseweite Validator prüft Format 2.0.0 und seine neun Negativmutationen:

```bash
.venv/bin/python tests/data/validate_release.py \
  data/releases/2026-08-30-ap11b-approved.1 \
  --self-test
```

Die unabhängige Gegenrechnung verwendet weder TypeScript-Code noch Resultate des Produktkerns:

```bash
.venv/bin/python tests/special-regimes/validate_special_regime_release.py
```

Sie validiert Katalog und Golden-Case-Suite gegen JSON Schema, berechnet 8 von 8 Fristen neu und weist `R5_FIXED` sowie einen im Rechen-GUI sichtbar gemachten Behörden-Termin zurück. Der ältere AP11A-Validator bleibt als reproduzierbarer Nachweis des fachlich abgenommenen Ausgangsbestands erhalten.

## AP11C-Oberfläche und SPFx

Die AP11C-UI-Tests prüfen zusätzlich:

- Sichtbarkeit und Selektierbarkeit von unterstützten, offenen, gesperrten und späteren Fristtypen
- Auslösbarkeit aller acht freigegebenen Spezialregime-Golden-Cases über das UI-Modell
- vollständige deutsche und französische Auflösung der Spezialfelder, Fristwahrung, Warnungen, Sperrgründe und Rechenspur
- Migration der lokalen Defaults auf die interne Version 2
- Entfernung von `unknown` aus den sichtbaren ZPO- und VRPG-BE-Pflichtauswahlen
- fortbestehende defensive Sperre manipulierter `unknown`-Werte im Rechenkern

Der eigene AP11C-Datenvertrag wird mit folgendem Befehl geprüft:

```bash
npm run test:data:ap11c
```

Die 14 SPFx-Tests unter `spfx/test/` prüfen Format 2, Spezialregimeberechnung, Providerparität, Prüfsummen, Kandidatensperre, lokalen Fallback, IndexedDB, SharePoint-Mirrorgrenzen, gemeinsame SharePoint- und Teams-Hosts sowie das Fehlen zusätzlicher API-Berechtigungen.
