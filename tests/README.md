# Tests

Dieser Bereich nimmt die automatisierten Qualitätsnachweise auf. Vorgesehen sind:

- Unit Tests des Rechenkerns
- quellenbasierte Golden Cases
- Schema- und Datenvalidierung
- Grenzfälle für Schaltjahre, Jahreswechsel und Fristenstillstände
- UI- und Accessibility-Tests auf Deutsch und Französisch
- Build- und Integrationsprüfungen für SharePoint und Teams

Ein Golden Case dokumentiert Eingaben, erwartete Rechenschritte, erwartetes Ergebnis, Rechtsquelle, Gültigkeit und Prüfstatus.

Die [Rechtsmatrix für den MVP](../docs/fachrecht/rechtsmatrix-mvp.md#11-startbestand-für-ap6-golden-cases) enthält den quellenbasierten Startbestand der in AP6 auszuarbeitenden Fallgruppen. Die dort genannten Daten sind noch nicht als erwartete Testergebnisse freigegeben.

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
