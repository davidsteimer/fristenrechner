# AP23D3 Abnahme und Beginn der Releasevorbereitung

Datum: 15. Oktober 2026. Entscheider: David Steimer.

**David Steimer hat AP23D3 fachlich-technisch abgenommen und die Releasevorbereitung beauftragt.** Abgenommen ist die gemeinsame Format-8-Integration mit fünf bisherigen Verfahrensprofilen und zwölf TI-/GR-Pfaden, Provider-/Cachebindung sowie den lokal geprüften Web-/SPFx-Builds. Die bereits abgenommene D2-Oberfläche einschliesslich UX-Nachtrag und die fachlichen Rechenregeln bleiben unverändert.

> AP23D3 ist fachlich-technisch abgenommen. Bitte starte die Releasevorbereitung.

## Gesicherter Stand

Der [ursprüngliche Integrationsbericht](../architektur/verwaltungsintegration-ap23d3.md) und der [D3-Gesamtnachweis](../../outputs/ap23d3-2026-10-15/QA-AP23D3.json) bleiben byteidentisch. Ihre damaligen Angaben «zur Abnahme» und `accepted: false` werden nicht rückwirkend geändert. Der heutige Entscheid steht in dieser Notiz und dem separaten Abnahmeregister.

| Nachweis | SHA-256 |
| --- | --- |
| D3-Gesamtnachweis | `0794e536ce757964eb1e00fb5d65a5fd4fdf39a2ddcb730e6061e93b3d06f38a` |
| [Abnahmeregister](../../outputs/ap23d3-abnahme-2026-10-15/receipt.json) | `e3641a460497a0047d7968de106575887757f4d8c619d396359ebd62bfb12966` |
| Unverändertes Kandidatenmanifest | `ccb67c22e55737af064f8c9ef7b122db8c5dfe1f4a1f142eb77cd05fd5ac646d` |

488 Dateien wurden vor der Fortschreibung der lebenden Einstiegsdokumentation anhand ihrer gebundenen Hashes und Byteanzahlen gesichert und anschliessend aus dem Archiv nochmals geprüft. Enthalten sind die gebundenen Quellen, Tests, tatsächlichen Webartefakte, das lokale SPFx-Testpaket, Browsernachweise und Originalprotokolle einschliesslich des abgebrochenen ersten Pakettestlaufs und seiner erfolgreichen unveränderten Wiederholung. Der vollständige Kandidat umfasst 41 Artefakte plus Manifest.

Der gesicherte D3-Prüfstand weist 2529 Produkttests, 20 Host-Lifecycle-Tests, 20 Webbuild-Tests, 1584 identische historische AP5-Resultat-/Rechenspurvergleiche, 204 SPFx-Quelltests, 89 Pakettests und neun lokale Browserproben aus. Das sind die getrennten historischen Prüfumfänge, keine neu ausgeführten Release- oder realen Hosttests. Die 24 dokumentierten Lintwarnungen bleiben ausgewiesen.

Das Archiv enthält nur die ausdrücklich gebundenen Belege und die vollständigen Kandidatenbytes. Der vollständige ältere D2-Abnahmebestand bleibt separat erhalten. Private Arbeitslogs und lokale Pfade machen diese Sicherung nicht automatisch öffentlich publikationsgeeignet.

## Auftrag und Grenzen

Die [lokale Releasevorbereitung unter der Planungsbezeichnung MVP 0.8](../betrieb/deployment-mvp-08.md) ist gestartet. Sie umfasst Eingangssicherung, technische Vorprüfung, Quelleninventar sowie anschliessenden Inhalts-/Fassungsabgleich mit begründeter Wiederverwendung und einem zusammengeführten Bericht zur Abnahme.

Quellenreleasefreigabe, kontrollierte Datenübernahme, definitive Produktversion und Artefakte, gebilligter Rückfall, E-/Q-Installation, reale Geräte-/Gastprüfung sowie GitHub/P bleiben getrennte Folgeschritte. Das lokale D3-Testpaket mit bestehender Version `0.7.0.2` ist nicht zur Installation freigegeben.

Produktiv bleibt MVP 0.7. Historischer AP5-Pin, Mirrors, AP21-Testapps, M365-Berechtigungen, Richtlinien, GitHub und steimer.ch-P werden durch diese Abnahme nicht verändert. David entscheidet und nimmt in Personalunion ab. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
