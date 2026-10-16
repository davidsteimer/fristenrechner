# R08-C Freigabe für den begrenzten E-/Q-Vollzug

Entscheid vom 16. Oktober 2026 durch David Steimer. R08C-U01, R08C-H01 und R08C-I01 sind gemäss der [gebundenen Installationsvorlage](eq-installationsvorlage-mvp08.md) freigegeben. Die [frische Ausgangssicherung C01 ist inzwischen bestanden](ausgangssicherung-mvp08.md). Den anschliessenden Mirrorupload übernimmt David manuell. Noch keine Installation.

## Entscheidungsgegenstand

Die unveränderte [Gesamtbindung](../../outputs/release-mvp08-2026-10-15/r08c/proposal.json) hat SHA-256 `179bfb3b6319a25f816241f69b78eff801cc98de1717523c890a2fc486ab35bf`. Sie bindet Installationsvorlage, Rückfallweg, Prüfmatrix, Paket `0.8.0.0`, Recovery `0.8.0.1`, Mirrorinventare und die private Zielbindung `b402ad864da468baef7e533db4225df3f553adaf7ddca416f253accb04b7e256`.

> Ich gebe R08C-U01, R08C-H01 und R08C-I01 gemäss der gebundenen Vorlage frei. Starte mit der frischen Ausgangssicherung. Den Mirrorupload übernehme ich anschliessend manuell.

Der [maschinenlesbare Freigabenachweis](../../outputs/release-mvp08-2026-10-15/r08c/execution-approval-2026-10-16.json) hält den Wortlaut und die Bedingungen getrennt von der historischen Vorlage fest. Deren damaliger Status wird nicht rückwirkend geändert.

## Reihenfolge und Grenzen

1. C01 frisch und lesend durchführen, Ausgangsstand und vollständige Konfigurationen privat sichern. Bei Abweichungen anhalten.
2. Nach bestandener Ausgangssicherung lädt David die vier Mirrors manuell hoch. Codex erhält keinen Mirroruploadauftrag.
3. C03 prüft alle 168 neuen und 164 bestehenden Rückfalldateien online gegen die gebundenen Sollbytes.
4. Erst nach bestandenen Vorbedingungen folgen Katalogwechsel, die beiden E-Instanzen und das E-Gate. Danach die beiden Q-Instanzen und ihre technische Matrix.

Der bedingte Rückfall ist nur gemäss [gebundenem Ablauf](rueckfall-mvp08.md) erlaubt. Vor dem vollständigen Code-Rückfall müssen alle vier aktuellen Konfigurationen auf ihren eigenen Format-7-Mirror zeigen. Die gemeinsame Katalogwirkung auf Q, AP5 und allfällige weitere bestehende Verbraucher bleibt Bestandteil der Freigabe, ohne Auftrag zur Tenantinventur oder zusätzlichen Installationen.

Berechtigungen, Richtlinien, zusätzliche Gäste, AP5-Pin und Daten, AP21-Testapps, E05, GitHub und P bleiben unverändert. Weitere Builds oder Commits und Outlook-Importe sind ausgeschlossen. Reale Geräte-/Gastprüfung, manuelle Q-Abnahme und Betriebsfreigabe werden nicht vorweggenommen. Die Outlook-Wiederverwendung bleibt ein gesonderter offener Entscheid.
