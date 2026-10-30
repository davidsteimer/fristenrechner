# Freigabe des lokalen R10 B Vollzugs

David Steimer, 28. Oktober 2026.

> Ich gebe R10-B gemäss Fassung 1.1 und der gebundenen Positivliste R2 frei, einschliesslich des begrenzten lokalen Datencommits und Recovery-Baus. Bitte starte die Umsetzung. Installation, Uploads und GitHub-Push bleiben ausgeschlossen.

Die Freigabe gilt für die [Vorlage Fassung 1.1](uebernahme-und-buildvorlage-r10-b.md) und die [Positivliste R2](../../outputs/r10-b-vorbereitung-2026-10-28/r10b-proposal-r2.json) mit SHA-256 `63784d635301c99416cbb49b23cac1260539d891b05e7094ba2d9bb654b13ec5`. Der unveränderte Vorlagenprüfnachweis hat SHA-256 `188df6410944feb660ec81aa2a763a3dbbd54abd7ea7919afa53b87339b2c3b8`.

Umfasst sind die benannte lokale Quellen- und Datenübernahme, genau ein Datencommit mit ausschliesslich den 45 neuen Laufzeitdateien, die engen Versions-, Pin-, Einstiegs-, Validator- und Testanpassungen sowie regulärer Bau und isolierter MVP09-Recoverybau. Anwendung `0.10.0`, Paket `0.10.0.0` und Recovery `0.10.0.1` sind damit für diesen lokalen Vollzug bestätigt. Die fachlichen Regeln, Zeitfenster, Grenzen und historischen Belege bleiben unverändert.

Die tatsächliche Quellenabnahme folgt weiterhin aus der [gesonderten R10-A2-Abnahme](../fachrecht/abnahme-r10-a2.md). Diese Ausführungsfreigabe ersetzt weder lokale Testergebnisse noch manuelle Q-Abnahme oder Betriebsfreigaben.

Installation, Uploads, weitere Commits, GitHub-Push, tatsächliche Recoveryinstallation, M365-/Hostingänderungen, Outlook-Importe und Betriebsfreigaben bleiben ausgeschlossen. AP5 und AP21 bleiben unberührt. Keine erneute Header-/Cacheprüfung.

Der maschinenlesbare Vollzugsbeleg und die gesicherten Ausgangsbytes werden unter `outputs/release-mvp10-2026-10-28/` geführt. Bei einem Haltgrund der Vorlage wird vor der betroffenen Fortsetzung angehalten.
