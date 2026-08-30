# Datenschemata

Die Schemata definieren das providerneutrale AP5-Austauschformat, den sprachneutralen AP6-Testvertrag und die noch nicht freigegebene AP11A-Erweiterung für Spezialregime.

| Datei | Zweck |
| --- | --- |
| `common.schema.json` | Gemeinsame Typen für Quellen, Gültigkeit, Abdeckung, Prüfstatus, Bedingungen und Erweiterungen |
| `legal-profile.schema.json` | Rechtsprofile, explizite Selektoren und typisierte Regeleffekte |
| `calendar.schema.json` | Feiertage, Kalendervererbung und inklusive Stillstandsperioden |
| `release-manifest.schema.json` | Release-ID, Providervertrag, Kompatibilität, Artefakte und SHA-256-Prüfsummen |
| `golden-case-suite.schema.json` | Synthetische Referenzfälle, Eingaben, Quellen, Rechenspur und erwartete Ergebnisse |
| `deadline-rule.schema.json` | AP11A-Kandidat mit fünf typisierten Rechenarten und benannten Ankern |
| `filing-profile.schema.json` | AP11A-Kandidat für Aufgabe, Eingang, Original, Uhrzeit, Kanäle und Nachweise |
| `special-regime-catalog.schema.json` | AP11A-Katalog aus Regeln, Profilen, Gates, Übersteuerungen und Regimen |
| `special-golden-case-suite.schema.json` | Kandidat des Testvertrags 2.0 für mehrere Daten, Uhrzeiten und Spezialerwartungen |

## Grundregeln

- Schema-Dialekt ist [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12).
- Die Formatversion des AP5-Referenzbestands ist `1.0.0`.
- Kernobjekte weisen unbekannte Felder und Regeltypen ab.
- Qualifizierte, vom Rechenkern ignorierbare Zusatzinformationen sind nur unter `extensions` zulässig.
- Datumswerte sind ISO-Vollformate `JJJJ-MM-TT` ohne Uhrzeit und Zeitzone.
- AP11A führt Uhrzeiten nur als getrennte lokale Werte mit expliziter IANA-Zeitzone, nie als vermischten Datumsstring.
- Strukturelle Rückwärtskompatibilität, Datenrelease und Schemaänderung werden getrennt versioniert.

Ein veröffentlichtes Schema wird nicht stillschweigend semantisch umgedeutet. Inkompatible Änderungen benötigen eine neue Hauptversion und einen dokumentierten Migrationsentscheid. Einzelheiten stehen im [Datenrelease-Format](../docs/architektur/datenrelease-format.md) und im beschlossenen [DEC-2026-012](../docs/entscheidungen/DEC-2026-012-providerneutrales-datenrelease-format.md).

Das AP6-Schema gehört zum Testvertrag und verändert die Formatversion des AP5-Datenrelease nicht. Berechenbare Referenzfälle und fachlich offene Sperrfälle werden in getrennten Suites geführt. Der Status `approved` kennzeichnet die fachliche Abnahme durch David Steimer.

Die vier AP11A-Schemata sind Kandidaten. Sie erweitern weder das freigegebene AP5-Release noch die 15 abgenommenen AP6-Fälle. Die vorgeschlagene produktive Formatevolution ist in [DEC-2026-014](../docs/entscheidungen/DEC-2026-014-komponentenweise-fachdatenformatevolution.md) dokumentiert.

## Validierung

Die Schemata werden selbst gegen den Metaschema-Dialekt geprüft. Anschliessend werden Manifest und alle gelisteten Artefakte strukturell und semantisch validiert:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python tests/data/validate_release.py \
  data/releases/2026-08-29-ap5-approved.1 \
  --self-test
.venv/bin/python tests/special-regimes/validate_special_regime_candidates.py
```
