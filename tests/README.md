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

Der Gesamtlauf umfasst 64 TypeScript-Tests. Darin enthalten sind zwei Regressionstests für die sichtbare HTML-Fallbackmeldung und die vollständige lokale Buildausgabe. Die browserbasierte Prüfung von Resultat, Sperren, Filterwechsel, Übersteuerung, Tastaturreihenfolge und Mobile-Layout ist im [AP9-Prüfnachweis](../docs/architektur/mvp-rechneroberflaeche-ap9.md) dokumentiert.

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

`--self-test` erzeugt ausschliesslich temporäre Kopien. Sechs gezielte Beschädigungen müssen abgewiesen werden. Dazu gehören falsche Prüfsummen, doppelte Regeln, unaufgelöste Quellen, unbekannte Regelarten, verkehrte Periodengrenzen und eine fehlende Kalendervererbung.
