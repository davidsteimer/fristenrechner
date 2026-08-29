# Datenschemata

Die Schemata definieren das providerneutrale AP5-Austauschformat sowie den sprachneutralen AP6-Testvertrag.

| Datei | Zweck |
| --- | --- |
| `common.schema.json` | Gemeinsame Typen für Quellen, Gültigkeit, Abdeckung, Prüfstatus, Bedingungen und Erweiterungen |
| `legal-profile.schema.json` | Rechtsprofile, explizite Selektoren und typisierte Regeleffekte |
| `calendar.schema.json` | Feiertage, Kalendervererbung und inklusive Stillstandsperioden |
| `release-manifest.schema.json` | Release-ID, Providervertrag, Kompatibilität, Artefakte und SHA-256-Prüfsummen |
| `golden-case-suite.schema.json` | Synthetische Referenzfälle, Eingaben, Quellen, Rechenspur und erwartete Ergebnisse |

## Grundregeln

- Schema-Dialekt ist [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12).
- Die Formatversion des AP5-Referenzbestands ist `1.0.0`.
- Kernobjekte weisen unbekannte Felder und Regeltypen ab.
- Qualifizierte, vom Rechenkern ignorierbare Zusatzinformationen sind nur unter `extensions` zulässig.
- Datumswerte sind ISO-Vollformate `JJJJ-MM-TT` ohne Uhrzeit und Zeitzone.
- Strukturelle Rückwärtskompatibilität, Datenrelease und Schemaänderung werden getrennt versioniert.

Ein veröffentlichtes Schema wird nicht stillschweigend semantisch umgedeutet. Inkompatible Änderungen benötigen eine neue Hauptversion und einen dokumentierten Migrationsentscheid. Einzelheiten stehen im [Datenrelease-Format](../docs/architektur/datenrelease-format.md) und im beschlossenen [DEC-2026-012](../docs/entscheidungen/DEC-2026-012-providerneutrales-datenrelease-format.md).

Das AP6-Schema gehört zum Testvertrag und verändert die Formatversion des AP5-Datenrelease nicht. Berechenbare Kandidatenfälle und fachlich offene Sperrfälle werden in getrennten Suites geführt.

## Validierung

Die Schemata werden selbst gegen den Metaschema-Dialekt geprüft. Anschliessend werden Manifest und alle gelisteten Artefakte strukturell und semantisch validiert:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python tests/data/validate_release.py \
  data/releases/2026-08-29-ap5-approved.1 \
  --self-test
```
