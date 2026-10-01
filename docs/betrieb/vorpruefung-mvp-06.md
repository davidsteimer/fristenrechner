# MVP 0.6 · Lokale technische Vorbereitung

Stand: 1. Oktober 2026. **Eingangssicherung und zusammengeführte Quellenprüfung technisch abgeschlossen. Kein definitiver Releasebuild und keine operative Aktivierung.**

## Gebundene Grundlage

Die [AP20C3-Abnahme](../fachrecht/abnahme-ap20c3.md) und der [Releaseauftrag](deployment-mvp-06.md) sind dokumentiert. Der Kandidat `2026-10-01-ap20c3-candidate.1` umfasst 44 nationale Regeln und 50 Berner Anbindungen. Manifest und Mindestconsumer stehen auf `6.0.0`, die Sozialkomponente auf `2.0.0`.

Der [Vorbereitungssnapshot](../../outputs/release-mvp06-2026-10-01/preparation-inputs.json) bindet 180 Eingangsdateien. Seine SHA-256-Prüfsumme lautet `e38f06f47f258f3a7d54359d5ca5c0c12bc37fe846f197c4194d784c0a7c585a`. 85 später veränderbare Vorbilder einschliesslich Runtime-, Schema-, Versions-, Pin-, Governance- und Prüflogdateien sind mit geprüften Bytes separat erhalten. Unveränderliche Kandidaten-, Entscheid- und Abnahmedateien werden weiterhin am Originalpfad geprüft.

Der Snapshot bezeichnet ausschliesslich den lokalen Ausgangsstand. Er behauptet keine frische Livekontrolle des Tenant- oder Hostingbestands. Die geplanten Zielversionen `0.6.0` und `0.6.0.0` sind noch nicht in Produktdateien übernommen.

## Tatsächlich ausgeführte Kontrollen

| Kontrolle | Ergebnis |
| --- | --- |
| AP20C3-Prüfprotokoll erneut validiert | Unverändert, 82 Nachweisdateien und acht historische C2-Vorbilder sowie gebundene Artefakte/Prüflogs |
| Kandidat und zehn Artefakte | Manifest-, Grössen- und SHA-256-Bindungen stimmen |
| Bestandsobjekte | 24 Regeln und 28 Anbindungen aus MVP 0.5 unverändert |
| Neue AP20-Objekte | 20 Regeln und 22 Anbindungen noch `candidate` |
| Alle 50 Freigabeverknüpfungen | Kandidatgebunden und `approval: null`, keine operative Freigabe |
| Quellenverknüpfungen | Exakt vier Belege aufgelöst: 28 über MVP 0.5, sechs über C1, je acht über C2 und C3 |
| Fachliche Referenzen | AP17B, AP19B und AP20B gebunden |
| Übrige Datenartefakte | Neun unverändert, einschliesslich Feiertagskatalog |
| Vorbereitungsprüfungen | 25/25 bestanden, einschliesslich Manipulation, fehlender Belege, Pfadgrenzen und Symlinks |
| Quellenkonsolidierung | 42/42 bestanden, insbesondere vollständige Quellenzuordnung, Normtextbrücken, Änderungsindex und fehlende Freigaben |
| Vollständiger aktueller Governance-Lauf | 200/200 bestanden, einschliesslich der 25 Vorbereitungs- und 42 Quellenkonsolidierungsprüfungen |
| Erneuter Kern-/UI-Lauf in dieser Vorbereitung | 1694/1694 bestanden, keine ausgelassenen oder gescheiterten Tests |
| Typprüfung | Erneut ohne Befund bestanden |
| Reproduzierbarkeit | Wiederholung erzeugt dieselbe Snapshot-Prüfsumme, abweichende vorhandene Ziele werden nicht überschrieben |
| Spätere Übernahme simuliert | Isolierter Test verändert beziehungsweise entfernt alle 85 lebenden Vorbilder. Historische Nachprüfung funktioniert aus den gebundenen Archivkopien. Kein Rückgriff auf veränderte lebende Dateien |

Der AP20C3-Gesamtnachweis mit 1694 Kern-/UI-, 133 damaligen Governance-, zwölf Web-, 140 SPFx-Laderprüfungen und 65 Prüfungen am gebauten Produkt bleibt als gebundener Integrationsnachweis erhalten. Kern/UI und Typprüfung wurden während dieser Releasevorbereitung zusätzlich erneut ausgeführt. Die Zahlen sind weder additiv noch ein neu ausgeführter definitiver MVP-0.6-Pakettest. Die Vorbereitungsprüfung erteilt insbesondere keine E-/Q-/P-Freigabe.

## Reproduzieren

Mit der im Projekt vorgesehenen Node-22-Toolchain:

```sh
node scripts/prepare-mvp06-inputs.mjs
node --test tests/governance/mvp06-preparation.test.mjs
node scripts/consolidate-mvp06-sources.mjs
node --test tests/governance/mvp06-source-coverage.test.mjs
```

Die neuen Befehle sind eigenständig. Die hashgebundene bestehende `package.json` und die eingefrorenen MVP-0.5-Skripte wurden dafür nicht verändert. Die Archive werden vor einem späteren öffentlichen Push gesondert gesichtet. Insbesondere lokale Prüflogpfade und technische Rohdaten sind nicht durch diesen technischen Nachweis pauschal zur Publikation freigegeben.

## Zusammengeführter Quellenstand

Die [Quellenprüfung](../fachrecht/quellenabgleich-mvp06.md) umfasst 77 Manifestreferenzen und 82 getrennt ausgewiesene historische Katalogwiederverwendungen. Der [technische Gesamtnachweis](../../outputs/release-mvp06-2026-10-01/source-review-completeness.json) ist unter SHA-256 `a389456a87f57e595818c76852360162daab58cc772fda82ae8de8100225c7bb` gespeichert und bytegenau reproduziert. Seine 166 Nachweisdateien enthalten 164 eindeutige ausdrücklich gebundene Hashreferenzen.

Die abweichenden XML-Repräsentationen von ATSG 2024 und ELG 2026 sind über 21 gleiche Normtexte und Absatzinhalte verbunden, nicht als ganze Dateien identisch erklärt. Die verbesserte Änderungsabfrage samt gesonderter Bewertung erhält eine tatsächlich zusätzliche frühere ELG-Art.-11-Zeile, ohne daraus eine neue Frist- oder Zuständigkeitsregel abzuleiten. AI-Konflikt, AVIV-Option B und OF-001 bleiben ausdrücklich erhalten. Die zusätzliche KI-Gegenprüfung ersetzt keine menschliche Abnahme.

Der strenge Quellenlauf benötigt derzeit auch lokale Rohbelege unter `.work`. Die öffentliche Reproduzierbarkeit wird vor dem Push gemäss P06-01 im [Deploymentplan](deployment-mvp-06.md) hergestellt. Es werden nicht ungeprüft alle Rohbelege publiziert.

## Nächster Schritt und unveränderte Grenzen

Der Quellenabgleich gemäss [Quellenprüfplan](../fachrecht/quellenpruefplan-mvp06.md) liegt jetzt zur Abnahme vor. Die menschliche Gesamtquellenabnahme und der konkrete Auftrag für Datenübernahme/definitive Builds stehen noch aus. Die Aufnahme von 24 neuen Quellenreferenzen ins aktive Register, neue Governance-Ereignisse, endgültige Freigabeverknüpfungen und Produktversionswechsel sind noch nicht vorgenommen.

MVP-0.5-Daten, produktive Importe und Pins, Versionsdateien sowie das aktive Quellenregister und der Index sind unverändert. Kein Commit, Quellcode-Push, definitives Paket, Mirrorupload, M365-/Gast-/Outlook-Eingriff oder Hostingwechsel. Die GitHub-Nachführung von #43, #35 und #44 ist ausschliesslich Projektsteuerung und veröffentlicht keine lokalen Dateien.
