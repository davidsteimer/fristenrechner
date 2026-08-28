# Datenschemata

Die AP5-Schemata definieren das providerneutrale Austauschformat für Rechtsprofile, Feiertage, Fristenstillstände und Datenreleases.

| Datei | Zweck |
| --- | --- |
| `common.schema.json` | Gemeinsame Typen für Quellen, Gültigkeit, Abdeckung, Prüfstatus, Bedingungen und Erweiterungen |
| `legal-profile.schema.json` | Rechtsprofile, explizite Selektoren und typisierte Regeleffekte |
| `calendar.schema.json` | Feiertage, Kalendervererbung und inklusive Stillstandsperioden |
| `release-manifest.schema.json` | Release-ID, Providervertrag, Kompatibilität, Artefakte und SHA-256-Prüfsummen |

## Grundregeln

- Schema-Dialekt ist [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12).
- Die Formatversion des AP5-Referenzbestands ist `1.0.0`.
- Kernobjekte weisen unbekannte Felder und Regeltypen ab.
- Qualifizierte, vom Rechenkern ignorierbare Zusatzinformationen sind nur unter `extensions` zulässig.
- Datumswerte sind ISO-Vollformate `JJJJ-MM-TT` ohne Uhrzeit und Zeitzone.
- Strukturelle Rückwärtskompatibilität, Datenrelease und Schemaänderung werden getrennt versioniert.

Ein veröffentlichtes Schema wird nicht stillschweigend semantisch umgedeutet. Inkompatible Änderungen benötigen eine neue Hauptversion und einen dokumentierten Migrationsentscheid. Einzelheiten stehen im [Datenrelease-Format](../docs/architektur/datenrelease-format.md) und im vorgeschlagenen [DEC-2026-012](../docs/entscheidungen/DEC-2026-012-providerneutrales-datenrelease-format.md).

## Validierung

Die Schemata werden selbst gegen den Metaschema-Dialekt geprüft. Anschliessend werden Manifest und alle gelisteten Artefakte strukturell und semantisch validiert:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python tests/data/validate_release.py \
  data/releases/2026-08-29-ap5-candidate.1 \
  --self-test
```
