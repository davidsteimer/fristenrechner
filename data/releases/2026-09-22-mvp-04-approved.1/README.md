# MVP 0.4: lokal vorbereiteter Datenrelease

Status: **Daten und Implementierung abgenommen, Publikation und Betrieb noch nicht freigegeben.**

David Steimer hat AP18C am 22. September 2026 abgenommen und den Releaseprozess gestartet. Dieser neue, unveränderliche Datenstand `2026-09-22-mvp-04-approved.1` setzt diese Abnahme um. Er ist keine Bestätigung einer neuen juristischen Quellenprüfung. Der separate Release-Quellencheck, die Veröffentlichung und die Freigaben für Installation und Betrieb bleiben eigene Schritte.

## Vertrag und Herkunft

- App-Zielversion `0.4.0`, Manifest und Mindestconsumer `4.0.0`. Diese Versionen bezeichnen unterschiedliche Verträge.
- Ausgangskandidat [2026-09-22-ap18c-candidate.1](../2026-09-22-ap18c-candidate.1/README.md), Manifest-SHA-256 `be1bf547e085032f505e71d0d12b891436b2e9a9ec0b67cc33b711f32d5906b7`.
- Neun Artefakte. Acht bleiben byteidentisch. Nur die Felder `review` und `scope` des AP17-Spezialregimekatalogs bilden nun den abgenommenen Stand ab. Fachregeln und historische Quellenprüfungen bleiben unverändert.
- Alle 479 Feiertagsregeln bleiben byteidentisch erhalten. Operativ wirken weiterhin nur die zwölf bestehenden CH-/BE-Feiertagsregeln und die drei Gerichtsferienregeln. Keine neuen kantonalen Fristenprofile.
- Historische Arbeitsstatus, Fachabnahmen und provisorische Übersetzungen des Feiertagskatalogs bleiben erhalten. Eine technische Datenfreigabe ist keine pauschale juristische Freigabe dieser Einträge.

## Nachvollziehbare Metadaten

Die Manifest-Erweiterung `steimer.approval` dokumentiert die menschliche Daten- und Implementierungsabnahme. `steimer.release-preparation` weist die weiterhin ausstehenden Publikations-, Deployment- und Betriebsfreigaben aus. `steimer.candidate` bleibt als Herkunftsnachweis und für den unveränderten Zukunftsquellenvergleich bestehen. Dort ist die AP18C-Abnahme eingetragen, die Aktivierung bleibt ausdrücklich falsch. Die Quellenzusammenfassung wurde nicht nachdatiert.

## Reproduktion und Bereitstellungsgrenze

`node --import tsx scripts/promote-ap18c-release.mjs` prüft den hash-gebundenen Kandidaten, die Fachdatenidentität, den Rechenkern und den unabhängigen Python-Prüfer vor dem Schreiben. Abweichende bestehende Ausgaben werden nicht überschrieben. Ein zweiter Lauf muss identische Bytes bestätigen.

Der [Promotionsnachweis](../../../outputs/release-mvp04-2026-09-22/data-promotion.json) enthält alle relevanten Hashes und das begrenzte Artefaktdelta. Ein Format-4-fähiger Consumer muss vor dem Wechsel des vollständigen Feeds oder Mirrors bereitstehen. Dieser Ordner und sein Manifest lösen keine automatische Bereitstellung aus.
