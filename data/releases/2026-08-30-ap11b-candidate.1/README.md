# AP11B-Datenrelease 2026-08-30-ap11b-candidate.1

| Merkmal | Wert |
| --- | --- |
| Status | Kandidat, noch nicht freigegeben |
| Format | 2.0.0 |
| Arbeitspaket | AP11B, GitHub-Issue #29 |
| Entscheid | DEC-2026-014 |
| Vorläufer | 2026-08-29-ap5-approved.1 und fachlich abgenommener AP11A-Katalog |

Dieser Kandidat erweitert das unveränderte AP5-Regel- und Kalendermodell um den versionierten Spezialregimekatalog `vrpg-be-special-regimes-2026-08-30`. Das Manifest führt erstmals die Rolle `specialRegimeCatalog` und weist deshalb die neue Hauptversion 2.0.0 aus. Ein Consumer für Format 1 muss diesen Datenstand ablehnen.

Der Kandidat bleibt als unveränderlicher technischer Nachweis erhalten. David Steimer hat AP11B am 30. August 2026 abgenommen. Der daraus abgeleitete [freigegebene Referenzrelease](../2026-08-30-ap11b-approved.1/README.md) enthält byteidentische Nutzartefakte und ein eigenes Freigabemanifest.

## Inhalt

- 5 bestehende Rechtsprofile mit 47 allgemeinen Regeln
- 2 bestehende Kalender mit 36 Feiertagen und 10 Stillstandsperioden
- 1 Spezialregimekatalog mit 29 Fristdefinitionen und 36 Regimen
- 26 berechnete Definitionen der Typen R1 bis R4
- 3 von einer Behörde gesetzte Hintergrunddefinitionen mit Herkunft `AUTHORITATIVE`
- 6 Einreichungsprofile mit Wahrungsmodus, Kanälen, Nachweisen, Originalerfordernis, Uhrzeit und Zeitzone
- 21 releaseweit konsistente Quellen
- 8 Nutzartefakte mit SHA-256-Prüfsummen

Der Release-Zeithorizont reicht vom 1. Januar 2026 bis 31. Dezember 2028 und deckt damit auch die fachlich abgenommenen Wahlfälle aus dem Frühjahr 2026 ab. Jedes allgemeine Rechtsprofil behält zusätzlich seine engere `dataValidFrom`-Grenze. Der allgemeine Rechenkern blockiert deshalb frühere Eingaben weiterhin profilbezogen. Der Spezialkern verlangt sowohl Release- als auch Kalenderabdeckung.

Die drei provisorischen `R5_FIXED`-Regeln des AP11A-Kandidaten sind nicht Bestandteil dieses Releases. Art. 16 PRG und Art. 8a VPR wurden in einen berechenbaren gesetzlichen Teil und einen nicht berechenbaren behördlichen Teil zerlegt. Art. 21 BPR bleibt vollständig behördlich bestimmt. Solche Hintergrundtermine sind im Rechen-GUI verborgen.

## Reproduzierbarkeit

Der Kandidat wird deterministisch aus dem AP5-Release und dem fachlich abgenommenen AP11A-Bestand erzeugt:

```bash
node scripts/build-ap11b-candidate.mjs
```

Die Erzeugung harmonisiert identische Quellenmetadaten, berechnet Dateigrössen und SHA-256-Prüfsummen neu und erstellt zugleich den übernommenen Golden-Case-Bestand.

## Validierung

Nach Installation von `requirements-data.txt`:

```bash
.venv/bin/python tests/data/validate_release.py \
  data/releases/2026-08-30-ap11b-candidate.1 \
  --self-test

.venv/bin/python tests/special-regimes/validate_special_regime_release.py
```

Der erste Lauf prüft Schemata, Manifest, Prüfsummen, Quellen, Querverweise und neun absichtlich beschädigte Kopien. Der zweite Lauf rechnet alle acht fachlich abgenommenen Spezialfälle unabhängig vom TypeScript-Kern nach und weist verbotene Mutationen zurück.

Die produktive Aktivierung, die UI-Erweiterung und ein neues SPFx-Paket sind nicht Bestandteil von AP11B. Sie benötigen eine gesonderte technische und fachliche Abnahme.
