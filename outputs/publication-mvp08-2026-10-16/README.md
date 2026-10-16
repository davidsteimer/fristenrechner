# Öffentlicher Publikationsbestand MVP 0.8

Stand: 16. Oktober 2026. Lokale Freigabevorlage, noch nicht veröffentlicht. [Entscheidungsvorlage und Grenzen](../../docs/betrieb/publikationspaket-mvp08.md).

## Verbindliche Auswahl

[publication-package.json](publication-package.json) ist die exakte Positivliste der neuen und geänderten Dateien samt Bytes und SHA-256. Sie umfasst auch die 42 Dateien des bestehenden lokalen Datencommits. Das Manifest selbst wird zusätzlich und mit separat vorgelegter Prüfsumme freigegeben. Unveränderte Dateien der bisherigen Git-Historie sind nicht nochmals als neue Publikationsänderung aufgeführt.

Die Liste enthält keine private Arbeitsablage, Websitebackups, Browser-Rohbelege oder vorbestehende lokale Änderung am Word-Projektplan. Eine Publikationsfreigabe erzeugt keine P- oder M365-Freigabe.

## Nachweise

| Nachweis | Bedeutung |
| --- | --- |
| [Öffentliche Belege](evidence/manifest.json) | 30 bereinigte Kopien und Zusammenfassungen mit Herkunfts- und Zielhashes, ausgewählten beziehungsweise ausgelassenen Feldern und Nachweisgrenzen |
| [Unabhängige Standardtests](public-checks.json) | Gepinnter Git-Ausgangsbestand plus ausgewählte Änderungen, ohne neue private Originalarchive oder Gitmetadaten. Vorhandene Abhängigkeiten wiederverwendet |
| [Publikationskontrolle](privacy-review.json) | Enger Textmustercheck, Archiv-, Arbeitsmappen- und Iconprüfung, bewusste Ausschlüsse und verbleibende Grenzen |
| [Unverändertheit](preservation-check.json) | Frischer Abgleich der geschützten Originale und tatsächlichen Auslieferungsartefakte |
| [Abschlusskontrolle](closure-check.json) | Technische Eingänge nach Dokumentationsabschluss unverändert, aktuelle Einstiegstexte verlinkt und Versionsangaben geprüft |

Die Dateien unter `checks/` enthalten vollständige Ausgaben des neuen isolierten Prüflaufs, mit ausschliesslich bereinigten lokalen Pfaden. Der betreffende ursprüngliche Loghash steht jeweils in `public-checks.json`. Der dort bezeichnete Listenhash ist der Auswahlstand zu Testbeginn, nicht die erst nach Aufnahme der Prüfprotokolle abgeschlossene Positivliste. Die technische Gleichheit wird anschliessend separat bestätigt.

## Historische Originale und öffentliche Kopien

Historische Abnahmen, Fehler und ursprüngliche Berichte bleiben unverändert. Ihre internen Hashbindungen werden nicht auf bereinigte Dateien umgebogen. Falls eine historische Unterlage auf einen hier nicht enthaltenen Originalbericht verweist, zeigt das Evidence-Manifest die öffentliche Entsprechung und die ausgelassenen Felder. Ein solcher Verweis ist keine Zusage, das private Vollarchiv veröffentlichen zu können.

Die sieben Zusammenfassungen sind keine vollständigen Kopien. Auch ein erfolgreicher öffentlicher Integritätscheck wiederholt weder den juristischen Quellenabgleich noch den vollständigen Recovery-Vollaudit. Die Quellenabnahme liegt zusätzlich byteidentisch als gebundener Releaseanker vor. Ihre enthaltenen privaten Herkunftsverweise sind für den öffentlichen Prüfer nicht erforderlich.

## Lesende Prüfung

Aus dem Repositoryhauptordner, nach Aufnahme des positiv ausgewählten Bestands:

```sh
node scripts/verify-mvp08-publication.mjs
node scripts/prepare-mvp08-public-evidence.mjs --verify
node scripts/verify-mvp08-public-integrity.mjs
```

Diese drei Befehle ändern keine Dateien und benötigen keine privaten Originalbelege. Der gesonderte lokale Aufruf `node scripts/prepare-mvp08-public-evidence.mjs --verify-originals` prüft zusätzlich die vorhandenen Originale. Er ist nicht als öffentliche Mindestprüfung ausgewiesen. Eine fehlende private Belegdatei wird dabei nicht stillschweigend übersprungen.
