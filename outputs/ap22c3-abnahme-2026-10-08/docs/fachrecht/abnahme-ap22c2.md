# AP22C2 Abnahme von Kalenderauflösung und Oberfläche

Datum: 8. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP22C2 ist abgenommen, du kannst mit AP22C3 starten.

**AP22C2 ist abgenommen. AP22C3 ist zur lokalen Umsetzung freigegeben.** Gegenstand ist die [C2-Implementierung](../architektur/kalenderintegration-ap22c2.md) mit Rollen- und Gebietsauflösung, vollständigen Januarvergleichen, gemeinsamer DE-/FR-Oberfläche, Rechenspur und Standards Version 4.

Der abgenommene Prüflauf umfasst 52 neue TypeScript-Tests, 2'173 Produkttests, 35 unabhängige C1-Python-Tests sowie die AP22B-Vertragsregression. Diese Zahlen bezeichnen den damaligen Nachweis, nicht einen nachträglich neu erzeugten Lauf.

## Bindung des abgenommenen Stands

Vor Beginn der C3-Codeänderungen wurden die durch beide C2-Prüfprotokolle gebundenen Dateien gegen SHA-256 und Byteanzahl geprüft. 27 Dateien einschliesslich der Protokolle sind in der getrennten [Abnahmekopie](../../outputs/ap22c2-abnahme-2026-10-08/receipt.json) gesichert.

| Nachweis | SHA-256 |
| --- | --- |
| QA-AP22C2.json | `18ad037b4cb4724941046d91d8ee2dc9f5606c3bf63ac275fb61f2ee9ff49e52` |
| browser-qa-integrity.json | `ef916f361e047e983df77eb5dd0090b9a3f490696fa286e69de5930fdbc557d4` |
| Abnahmeregister receipt.json | `355b0043a2b82e3da7c9ccfbe804529a7e506d87bb04e199ebaa35d1b549704d` |

Historische Prüfdateien und deren damalige Kennzeichnung bleiben unverändert. Für die Abnahme ist diese Notiz massgebend. Das C2-Datenbündel bleibt ein Referenzkandidat ohne operativen Release.

## Nächster Schritt und Grenzen

C3 umfasst die vollständige Format-7-Datenanbindung, konfigurationsgebundenen Provider-/Cachefallback, Web-/SPFx-Hostintegration und Regression einschliesslich der historischen AP5-Pins. Die Umsetzung erfolgt lokal. Eine Quellenreleasefreigabe, Datenpromotion, E-/Q-/P-Installation oder Veröffentlichung ist nicht erteilt.

Es werden keine weiteren Sozialanbindungen, kantonalen Verwaltungsverfahren oder kommunalen Erlasse freigegeben. AP21 wird nicht parallel begonnen. Die produktive MVP-0.6-Version bleibt unverändert.

David Steimer nimmt Fachverantwortung und Abnahme in Personalunion wahr. Codex dokumentiert und implementiert als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
