# Freigegebenes Referenzrelease AP5

`2026-08-29-ap5-approved.1` ist das durch David Steimer am 29. August 2026 abgenommene Referenzrelease für AP5. Es bildet den freigegebenen Fachdatenstand für AP6 und die weitere Umsetzung. Die Anwendung selbst ist damit noch nicht produktiv freigegeben.

Das Release wurde aus `2026-08-29-ap5-candidate.1` abgeleitet. Die fachlichen Regeln, Feiertage und Stillstandsperioden blieben unverändert. Der Prüfstatus der sieben Nutzartefakte wurde auf `verified` gesetzt und David Steimer als prüfende Person eingetragen. Die Freigabe ist im neuen Manifest über eine eigene Release-ID, den Status `approved`, maschinenlesbare Freigabemetadaten und neue Prüfsummen dokumentiert. Der veröffentlichte Candidate wurde nicht verändert.

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
  data/releases/2026-08-29-ap5-approved.1 \
  --self-test
```

Die Freigabe umfasst den AP5-Referenzdatenstand und den Architekturentscheid DEC-2026-012. Sie ersetzt weder die Golden Cases aus AP6 noch die spätere Freigabe der funktionsfähigen Anwendung.
