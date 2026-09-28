# MVP 0.5 · lokal freigegebener Datenrelease

Status: **Datenübernahme und Bau der definitiven Releaseartefakte freigegeben. Keine Installation, Publikation oder Betriebsfreigabe.**

David Steimer hat am 28. September 2026 die zusammengeführte Quellenprüfung einschliesslich Wiederverwendung und Vorbehalten abgenommen und die lokale Übernahme des abgenommenen AP19-Stands freigegeben. Die [Abnahmenotiz](../../../docs/fachrecht/abnahme-quellenpruefung-mvp05.md) bindet den Entscheid.

## Herkunft und Grenze

- Release-ID: `2026-09-28-mvp-05-approved.1`. Manifest und Mindestconsumer `5.0.0`, Sozialverfahrenskatalog `1.0.0`, App-Zielversion `0.5.0`.
- Ausgangskandidat `2026-09-28-ap19c3-candidate.1`, Manifest-SHA-256 `8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da`.
- 24 nationale Bundesregeln und 28 ausschliesslich bernische Anbindungen, Fall- und Rechenabdeckung 2026 bis 2027. Keine weiteren Kantone oder Feiertagsräume freigeschaltet.
- Neun Komponenten bleiben byteidentisch zum AP19C3-Kandidaten. Im Sozialkatalog ändern ausschliesslich Beschriftung, Abnahmemetadaten, Regel-/Anbindungsstatus und die 28 präzisen Freigabebindungen. Materielle Regeln, Zuständigkeitsfakten, Ausschlüsse, Normgeltung und Quellenprüfdaten bleiben unverändert.
- Historische Quellenstände werden nicht pauschal nachdatiert. Die 82 zusätzlichen, nicht operativ verwendeten Feiertagskatalogquellen verwenden die abgenommene Prüfung vom 22. September 2026. AI-Konflikt, AVIV-Option B und die gesonderte Wochenendzustellungsabklärung bleiben dokumentiert.

## Reproduktion

`node --import tsx scripts/promote-ap19-release.mjs` prüft die exakten Eingaben, beide historischen Referenzsuiten, den realen Rechenkern und den unabhängigen Python-Prüfer vor dem Schreiben. Abweichende bestehende Dateien werden nicht überschrieben. Die Freigaben binden SHA-256 der nach RFC 8785 kanonisierten Regel- und Anbindungsobjekte sowie die exakten Quellenfreigabe-, Referenz- und Kalenderstände.

Der [Promotionsnachweis](../../../outputs/release-mvp05-2026-09-28/data-promotion.json) beschreibt Hashes, Delta und Prüfstatus. `steimer.candidate` bleibt unveränderter Herkunftsnachweis des früheren Kandidaten. Massgebend für diesen neuen Stand sind `releaseStatus`, die 28 freigegebenen Einträge und `steimer.approval`. Kein Schreiben in diesem Ordner löst ein Deployment aus.
