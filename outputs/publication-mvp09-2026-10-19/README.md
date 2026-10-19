# MVP 0.9 Öffentliche Publikationsnachweise

Stand: 19. Oktober 2026. Lokales Publikationspaket, noch keine Veröffentlichungsfreigabe.

- [Positivliste mit exakten Pfaden, Längen und SHA-256](publication-package.json)
- [Bereinigte historische Nachweiskopien und Herkunft](evidence/manifest.json)
- [Frische Tests des ausgewählten Exports](public-checks.json)
- [Begrenzte Datenschutz-/Publikationssichtung](privacy-review.json)
- [Unveränderte geschützte Originale und Artefakte](preservation-check.json)
- [Abschliessende lokale Prüfung](closure-check.json)
- [Freigabevorlage und Erläuterungen](../../docs/betrieb/publikationspaket-mvp09.md)

Die 50 Kopien bilden historische Einzelprüfungen ab. Private Originale werden nicht für die öffentliche Prüfung benötigt. Pfadbereinigte Vollkopien behalten Diagnosen und Fehlversuche. Bei Zusammenfassungen sind ausgewählte und ausgelassene Felder ausdrücklich benannt. Historische Status-/Freigabefelder bleiben unverändert und werden durch diese Aufbereitung nicht zu heutigen Entscheiden.

Die heutige [Q-Abnahme](../../docs/betrieb/abnahme-q-mvp09.md) dokumentiert Geräte, Gastzugriff und begrenzte Outlook-Wiederverwendung separat. Vollständige Rohquellen, Buildarchive, private Zielbindungen, HARs, Screenshots und Hostingbackups gehören nicht zum Paket.

`node scripts/prepare-mvp09-public-evidence.mjs --verify` und `node scripts/verify-mvp09-publication.mjs` lesen nur die bezeichneten öffentlichen Dateien. Die Positivliste erfasst die ausgewählten neuen/geänderten Dateien einschliesslich des bestehenden Datencommits. Bereits veröffentlichte unveränderte Repositorydateien bleiben die Basis. Die Positivliste enthält sich selbst nicht. Ihre SHA-256 wird separat zur Freigabe vorgelegt.

