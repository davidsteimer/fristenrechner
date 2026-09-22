# AP18C: Abnahme und Start der Releasevorbereitung

Datum: 22. September 2026. Entscheider: David Steimer.

David Steimer hat nach dem lokalen Integrations- und Prüfnachweis erklärt:

> AP18C ist abgenommen.
> Starten wir den Release.

Damit ist die AP18C-Implementierung gemäss beschlossenem [DEC-2026-023](../entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) abgenommen. Dies umfasst den schweizweiten Feiertagskatalog `1.0.0`, Manifest-/Consumerformat `4.0.0`, die streng begrenzte operative CH-/BE-Projektion sowie die lokal geprüfte Integration in Webanwendung und SPFx. Der [Prüfnachweis](../../outputs/ap18c-product-2026-09-22/QA-AP18C.md) bleibt als Nachweis des vorgelegten Implementierungsstands erhalten.

## Gebundener Stand

| Gegenstand | Identität |
| --- | --- |
| Datenkandidat | `2026-09-22-ap18c-candidate.1` |
| Kandidatenmanifest SHA-256 | `be1bf547e085032f505e71d0d12b891436b2e9a9ec0b67cc33b711f32d5906b7` |
| Feiertagskatalog SHA-256 | `b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7` |
| Arbeitsmappe V0.12 SHA-256 | `d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65` |

Die Kandidatenartefakte werden nicht nachträglich auf `approved` umgeschrieben. Die anschliessende Promotion erzeugt einen eigenen unveränderlichen Datenrelease. AP17C ist bereits fachlich abgenommen und sein Spezialregimevertrag mit DEC-2026-020 bestätigt. Beide Arbeitspakete werden im nächsten Release zusammengeführt.

## Beauftragter nächster Schritt

Die lokale Releasevorbereitung erfolgt als **MVP 0.4** mit App-Version `0.4.0` und SPFx-Lösungsversion `0.4.0.0`. Dies ist die fortlaufende Produktversion, nicht eine weitere Änderung des Datenvertrags. Die Vorbereitung umfasst Quellenabgleich, gesonderten Datenrelease, Builds, Tests, Releaseidentität und Bereitstellungsunterlagen.

Der [Releaseplan](../betrieb/deployment-mvp-04.md) dokumentiert den jeweiligen Fortschritt und die noch erforderlichen Freigaben. Die Abnahme erklärt weder die historischen V0.9-/V0.10-Dateihashes für wiederhergestellt noch alle Katalogquellen oder provisorischen Übersetzungen pauschal für neu geprüft.

## Weitergeltende Grenzen

- Keine zusätzlichen kantonalen Fristenprofile oder AP17-Zuordnungen.
- Keine Kalender-App und keine Kartenanwendung.
- Bestehende fachliche Vorbehalte für SO, GR, NE und eigenständiges kommunales Recht bleiben erhalten.
- Die neue Prüfung unmittelbar vor dem Release wird separat dokumentiert. Frühere Prüfdaten werden nicht umdatiert.
- Kein automatischer GitHub-Schreibzugriff und keine neue Schlüsselberechtigung.
- Konkrete Veröffentlichung, Tenant-/Mirror-Aktualisierung, P-Deployment und Betriebsfreigabe erfolgen nach den dokumentierten gesonderten Freigabeschritten.

David Steimer entscheidet in Personalunion. Codex ist das dokumentierte KI-Arbeitsinstrument, ohne formelle Freigabe- oder Haftungsverantwortung. Ein menschliches Vieraugenprinzip wird nicht behauptet.
