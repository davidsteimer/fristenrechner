# Freigabe des begrenzten R10-C-Vollzugs

David Steimer, 29. Oktober 2026. Separate Freigabeaufzeichnung zur unveränderten Vorlage, Fassung 1.0 vom 29. Oktober 2026.

## Erklärung des Nutzers

Der Wortlaut wird einschliesslich des fehlenden Anfangsbuchstabens unverändert wiedergegeben:

> ch gebe R10C-U01, R10C-H01 und R10C-I01 gemäss der gebundenen Vorlage, Fassung 1.0 vom 29.10.2026, einschliesslich der gemeinsamen Codewirkung und des beschriebenen Rückfallwegs frei. Starte mit der frischen Ausgangssicherung. Den Mirrorupload übernehme ich anschliessend manuell. Alle Ausschlüsse der Vorlage bleiben bestehen.

Die Erklärung schliesst die drei menschlichen Freigaben R10C-U01, R10C-H01 und R10C-I01. Sie bestätigt noch keinen bestandenen Vollzugsschritt und ersetzt weder die frische Ausgangssicherung noch die späteren technischen oder menschlichen Abnahmen. Die in den unveränderten Vorbereitungsunterlagen enthaltenen damaligen Angaben «noch nicht freigegeben» bleiben als historischer Vorlagenstand erhalten. Der aktuelle Freigabestatus folgt aus dieser gesonderten Erklärung.

## Gebundener Umfang

Die Freigabe gilt für die [E-/Q-Installationsvorlage](eq-installationsvorlage-mvp10.md), den [Rückfallweg](rueckfall-mvp10.md) und die [Prüfmatrix](pruefmatrix-mvp10.md) in der [gesamten Vorlagenbindung](../../outputs/release-mvp10-2026-10-28/r10c/proposal.json). Diese hat SHA-256 **`86b5f9800e12c988629d1327972b411b488add366814f1c3ae82273e6ac7e403`**. Die private Bindung der vier bestehenden Instanzen hat SHA-256 **`dd50cdd78f9508770be9a5dbe78044256f3e19a1aae1d807635187d1c7103924`**. Private Zieladressen und Konfigurationsdaten werden hier nicht wiedergegeben.

| Bestandteil | Gebundener Stand |
| --- | --- |
| Reguläres Paket | `0.10.0.0`, SHA-256 `7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd` |
| Neuer Datenrelease | `2026-10-28-mvp-010-approved.1`, 45 Dateien je Mirror, Manifest SHA-256 `7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016` |
| Bedingtes Recovery | `0.10.0.1`, SHA-256 `0def9a2c4a126f6d7b30d22ebe600c1b471ccd10d6c81b7dfab9745a350d797b`, Funktionsumfang MVP 0.9 |
| Eigene Rückfallquellen | `2026-10-18-mvp-09-approved.1`, 42 Dateien je Mirror, Format 9, Manifest SHA-256 `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265` |

## Reihenfolge und Bedingungen

1. Jetzt beginnt ausschliesslich C01, die frische lesende Bestandsprüfung und private Ausgangssicherung. Abweichende Identitäten, Versionen, Bytes, Konfigurationen, fremde Entwürfe oder zusätzlicher Rechtebedarf sind zu klären, bevor der betroffene Vollzug weitergeht.
2. Nach bestandenem C01 übernimmt David den manuellen Upload in die vier gebundenen neuen Releaseordner. Codex lädt keine Mirrors hoch. Anschliessend verlangt C03 den vollständigen frischen Vergleich von 180 neuen und 168 eigenen Rückfalldateien.
3. Der Austausch der bestehenden Katalogdatei und die beiden E-Appupdates dürfen erst nach bestandenem C01 bis C03 sowie unmittelbar bestätigtem Istbestand erfolgen. Die gemeinsame Codewirkung auf bereits verbundene Verbraucher einschliesslich Q und AP5 ist umfasst. Zuerst E prüfen, einschliesslich Q mit seinen zunächst alten Daten und AP5. Die beiden Q-Instanzen dürfen erst nach bestandenem E-Gate umgestellt werden.
4. Der begrenzte Datenrückfall und nötigenfalls das gebundene Recovery dürfen ausschliesslich nach dem dokumentierten Ablauf erfolgen. Vor dem Recovery-Codewechsel zeigen alle vier aktuellen Instanzen auf ihre eigenen gesicherten Format-9-Mirrors. AP5 und geschützte gemeinsame Standards bleiben erhalten. Eine spätere reguläre Wiederaufnahme nach installiertem Recovery benötigt ein neu gebautes und separat gebundenes Paket ab `0.10.0.2`.
5. Die technische Matrix verwendet synthetische Fälle, gezielte eigene Präferenzen, exakt begrenzte lokale Manifest-Sperrregeln und tatsächlich gespeicherte Kalenderdateien. Geräteprüfung, bestehender Gastzugriff, manuelle Q-Abnahme und Outlook-Entscheid bleiben gesondert bei David.

Alle Ausschlüsse der gebundenen Vorlage bleiben bestehen. Dazu gehören zusätzliche Builds und Commits, GitHub-Push, P, Outlook-Importe, allgemeine Browserdatenresets, Cachelöschungen und temporäre Mirror-Rückwechsel zur Testwiederholung ohne eigene konkrete Freigabe. Zusätzliche Sites, Apps oder Registerkarten, Deinstallationen, AP21/E05, zusätzliche Gäste, M365-Berechtigungen und Richtlinien bleiben ausgeschlossen. Root-Webauftritt, Sitemap, DNS, E-Mail und Hosting bleiben unverändert. Der dokumentierte Header-/Cachebefund wird nicht erneut geprüft. R10B-CLI-H01 bleibt vor der späteren Quellpublikation gesondert zu behandeln.

Der [maschinenlesbare Freigabebeleg](../../outputs/release-mvp10-2026-10-28/r10c/execution-approval-2026-10-29.json) bindet die lokal nachgeprüften Vorlagen und Artefakte. Er dokumentiert die erhaltene Autorisierung. Tatsächliche Onlinebefunde, ausgeführte Schritte und Abnahmen werden in gesonderten Vollzugsnachweisen geführt.
