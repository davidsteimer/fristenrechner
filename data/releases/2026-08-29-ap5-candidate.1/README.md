# Referenzrelease AP5

`2026-08-29-ap5-candidate.1` ist das technisch validierte Referenzrelease für AP5. Es ist noch kein produktiv freigegebenes Datenrelease.

## Inhalt

- fünf Rechtsprofile mit den 47 stabilen Regel-IDs aus AP4
- eidgenössischer und bernischer Feiertagskalender für 2026 bis 2028
- Stillstandsperioden für Ostern, Sommer und Jahreswechsel
- Quellen-, Gültigkeits- und Prüfmetadaten
- Manifest mit sieben Artefakten, Dateigrössen und SHA-256-Prüfsummen

## Validierung

Vom Repository-Hauptverzeichnis:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python tests/data/validate_release.py \
  data/releases/2026-08-29-ap5-candidate.1 \
  --self-test
```

Die Aktivierung als produktives Release benötigt eine separate fachliche und technische Freigabe. Der Status `candidate` ist absichtlich sichtbar.
