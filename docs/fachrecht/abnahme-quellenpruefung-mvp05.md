# MVP 0.5 – Abnahme der zusammengeführten Quellenprüfung

Status: durch David Steimer am 28. September 2026 abgenommen. Die kontrollierte lokale Datenübernahme und der Bau definitiver Releaseartefakte sind freigegeben.

## Wortlaut des Entscheids

> Ich nehme die zusammengeführte Quellenprüfung für MVP 0.5 einschliesslich der dokumentierten Wiederverwendung und der fortbestehenden Vorbehalte ab. Ich gebe die kontrollierte lokale Datenübernahme und den Bau der definitiven Releaseartefakte frei.

Der Entscheid wurde im Projektgespräch erklärt. David Steimer nimmt die fachliche Verantwortung und die Freigabefunktion in Personalunion wahr. Codex dokumentiert und prüft technisch, ohne eigene formelle Freigabe- oder Haftungsverantwortung. Ein unabhängiges Vieraugenprinzip wird nicht behauptet.

## Abgenommener Gegenstand

- Die [zusammengeführte Quellenprüfung](quellenabgleich-mvp05.md) mit 53 Quellen-IDs des Rechenbestands und 82 zusätzlichen Quellen-IDs des byteidentisch übernommenen Feiertagskatalogs. Insgesamt sind 135 unterschiedliche Quellen-IDs erfasst.
- Die 53 Manifestquellen sind durch den Abgleich vom 28. September 2026 abgedeckt. Die 82 zusätzlichen Katalogquellen werden ausdrücklich aus der abgenommenen Prüfung vom 22. September 2026 weiterverwendet und nicht als erneut abgerufen ausgegeben.
- Die bekannte Behandlung des AI-Quellenkonflikts, die AVIV-Nachweismethode Option B, OF-001 und die übrigen dokumentierten Grenzen bleiben unverändert.
- Der [maschinelle Vollständigkeitsnachweis](../../outputs/release-mvp05-2026-09-28/source-review-completeness.json) bleibt als vorgelegter technischer Prüfstand unverändert. Sein SHA-256 lautet `67fdf2e5cb3ac19769655ed08f2ff80e9863b76a2526469917832bcba68e27ce`.
- Der [separate Abnahmebeleg](../../outputs/release-mvp05-2026-09-28/source-approval.json) bindet diesen Nachweis, seine acht Belege, die drei AP19C-Abnahmen und DEC-2026-025. Die vorhandenen Kandidaten und historischen Abnahmen werden nicht nachträglich umgeschrieben.

## Umfang der lokalen Übernahme

Die Freigabe erlaubt die kontrollierte Ableitung von `2026-09-28-mvp-05-approved.1` aus dem abgenommenen AP19C3-Kandidaten, das Nachführen des Quellenregisters samt neuem Prüfereignis und Index sowie den lokalen Bau der definitiven App-, SPFx- und Mirrorartefakte für MVP 0.5. Der freigegebene Funktionsumfang bleibt auf die 24 national modellierten Regeln und 28 konkreten Berner Anbindungen begrenzt. Keine weiteren Kantone werden operativ freigeschaltet.

Die periodische Gesamtprüfung wird dadurch nicht als neu durchgeführt ausgegeben. Der nächste ordentliche Prüftermin bleibt der 15. November 2027. Bei Verzögerung oder neuen Änderungshinweisen ist die Aktualität erneut zu beurteilen.

## Nicht freigegeben

Dieser Entscheid erlaubt keine Installation in E oder Q, keinen GitHub-Push, keinen Deploy-Key, keine Änderung an Hosting, Mirrors oder M365-Berechtigungen und keine öffentliche P-Auslieferung oder Betriebsfreigabe. Diese Schritte bleiben separat zu entscheiden. Der bekannte GET-Header-Befund auf der bestehenden Hosting-Infrastruktur bleibt ein Haltepunkt vor einer öffentlichen P-Auslieferung.
