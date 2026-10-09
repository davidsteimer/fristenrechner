# MVP 0.6 · lokal freigegebener Datenrelease

Status: **Datenübernahme und Bau der definitiven Releaseartefakte freigegeben. Keine Installation, Publikation oder Betriebsfreigabe.**

David Steimer hat am 1. Oktober 2026 die zusammengeführte Quellenprüfung einschliesslich Wiederverwendung und Vorbehalten abgenommen und die lokale Übernahme des abgenommenen AP20-Stands freigegeben. Die [Abnahmenotiz](../../../docs/fachrecht/abnahme-quellen-mvp06.md) bindet den Entscheid.

## Herkunft und Grenze

- Release-ID: `2026-10-01-mvp-06-approved.1`. Manifest und Mindestconsumer `6.0.0`, Sozialverfahrenskatalog `2.0.0`, App-Zielversion `0.6.0`.
- Ausgangskandidat `2026-10-01-ap20c3-candidate.1`, Manifest-SHA-256 `b4250a31d226b4f59e0857a857f49e1ea354722b9ff46b9324d70b330f135450`.
- 44 nationale Bundesregeln und 50 ausschliesslich bernische Anbindungen, Fall- und Rechenabdeckung 2026 bis 2027. Keine weiteren Kantone oder Feiertagsräume freigeschaltet.
- Neun Komponenten bleiben byteidentisch zum AP20C3-Kandidaten. Im Sozialkatalog ändern ausschliesslich Beschriftung, Abnahmemetadaten, Regel-/Anbindungsstatus und die 50 präzisen Freigabebindungen. Materielle Regeln, Zuständigkeitsfakten, Ausschlüsse, Normgeltung und Quellenprüfdaten bleiben unverändert.
- Historische Quellenstände werden nicht pauschal nachdatiert. Die 82 zusätzlichen, nicht operativ verwendeten Feiertagskatalogquellen verwenden die abgenommene Prüfung vom 22. September 2026. AI-Konflikt, AVIV-Option B und die gesonderte Wochenendzustellungsabklärung bleiben dokumentiert.

## Reproduktion

`node --import tsx scripts/promote-ap20-release.mjs` prüft die exakten Eingaben, alle drei abgenommenen Referenzsuiten, den realen Rechenkern und den unabhängigen Python-Prüfer vor dem Schreiben. Der volle Quellenprüflauf benötigt derzeit lokale private Rohbelege. Die öffentliche Reproduzierbarkeit ist als P06-01 vor einem späteren Push gesondert zu klären. Abweichende bestehende Dateien werden nicht überschrieben. Die Freigaben binden SHA-256 der nach RFC 8785 kanonisierten Regel- und Anbindungsobjekte sowie die exakten Quellenfreigabe-, Referenz- und Kalenderstände.

Der [Promotionsnachweis](../../../outputs/release-mvp06-2026-10-01/data-promotion.json) beschreibt Hashes, Delta und Prüfstatus. `steimer.candidate` bleibt unveränderter Herkunftsnachweis des früheren Kandidaten. Massgebend für diesen neuen Stand sind `releaseStatus`, die 50 freigegebenen Einträge und `steimer.approval`. Kein Schreiben in diesem Ordner löst ein Deployment aus.
