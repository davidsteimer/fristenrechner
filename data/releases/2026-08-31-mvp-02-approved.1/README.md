# Freigegebener Datenrelease MVP 0.2

| Merkmal | Wert |
| --- | --- |
| Release-ID | `2026-08-31-mvp-02-approved.1` |
| Status | fachlich und technisch abgenommen |
| Format | 2.0.0 |
| Arbeitspaket | AP11C, GitHub-Issue #30 |
| eingeschlossener UX-Umfang | GitHub-Issue #25 |
| Abnahme | David Steimer, 31. August 2026 |
| Vorläufer | `2026-08-30-ap11c-candidate.1` |

Dieser Release ist der freigegebene Fachdatenstand für MVP 0.2. Er übernimmt die Regeln, Kalender, Spezialregime und Quellen des AP11C-Kandidaten. Die sechs fachlich unveränderten Artefakte bleiben byteidentisch. Bei den Profilen ZPO und VRPG-BE wird ausschliesslich die Prüfmetadatenstruktur von `candidate` auf `verified` mit David Steimer als freigebender Person nachgeführt.

Die Option `unknown` bleibt aus `procedureVariant` der ZPO und aus `specialLawStatus` des VRPG-BE entfernt. Die allgemeinen Fristregeln, die 29 Spezialfristdefinitionen, die 36 Spezialregime, die acht Golden Cases und sämtliche materiellen Berechnungserwartungen bleiben unverändert.

## Reproduzierbarkeit

Vom Repository-Hauptverzeichnis:

```bash
npm run build:data:ap11c
npm run test:data:ap11c
```

Der erste Befehl baut den AP11C-Kandidaten deterministisch und leitet daraus den freigegebenen Release ab. Der zweite Befehl prüft beide Stände, sämtliche Schemata und Prüfsummen, neun Negativmutationen sowie den AP11C-spezifischen Auswahlvertrag.

## Freigabegrenze

Die Fachdaten und die AP11C-Produktintegration sind freigegeben. Die Betriebsfreigabe in SharePoint und Microsoft Teams setzt zusätzlich die vollständig bestandene Tenant-Testmatrix T01 bis T14 voraus. Gastzugriffe bleiben ausgeschlossen.
