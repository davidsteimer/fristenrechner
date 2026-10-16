# AP23D1 Abnahme von Reader und Rechenkern

Datum: 15. Oktober 2026. Entscheider: David Steimer.

**David Steimer hat AP23D1 abgenommen und den Beginn von AP23D2 beauftragt.** Die Abnahme betrifft die vorgelegte [Kernintegration für kantonale Verwaltungsverfahren](../architektur/verwaltungsintegration-ap23d1.md) auf Grundlage des bereits bestätigten [DEC-2026-032](../entscheidungen/DEC-2026-032-beschluss.md). Sie ist keine Freigabe eines neuen Rechtsdatenreleases oder einer Bereitstellung.

## Abgenommener Gegenstand

AP23D1 umfasst den Reader für vollständige Format-8-Datenbündel, die Katalog- und Bindungsprüfung, den qualifizierten TI-/GR-Resolver und die gemeinsame Tagesarithmetik. Abgenommen sind auch die Sperren für fehlende Fallqualifikation, unzulässige Dauer, zeitliche Grenzen, nicht modellierte regionale Bindungen und TI-O2. Neue Kantonalwege werden nicht als bestehende Bundes- oder Berner Rechtsprofile ausgegeben.

Der vorgelegte Gesamtnachweis enthält 103 bestandene neue Tests, 2’373 bestandene Tests der gesamten Produktregression und 1’584 vollständige Übereinstimmungen historischer Resultate und Rechenspuren. Die TypeScript-Prüfung und die Integritätskontrollen sind bestanden. Diese Zahlen bezeichnen den abgenommenen D1-Stand, nicht eine spätere D2-Gesamtprüfung.

## Gebundener und gesicherter Nachweis

| Nachweis | Bindung |
| --- | --- |
| [Original QA-AP23D1.json](../../outputs/ap23d1-2026-10-14/QA-AP23D1.json) | SHA-256 `f7a24dd9c88833dfab293e465ce4274b5417826062211294c194ee73f04aac6e` |
| [Unveränderte Abnahmekopie des QA-Berichts](../../outputs/ap23d1-abnahme-2026-10-15/outputs/ap23d1-2026-10-14/QA-AP23D1.json) | Derselbe SHA-256-Wert |
| Archiv `outputs/ap23d1-abnahme-2026-10-15` | 24 gebundene Artefakte, der QA-Bericht und vier Testprotokolle, unter ihren bisherigen relativen Pfaden |

Die 24 Archivartefakte wurden am 15. Oktober 2026 erneut gegen die im QA-Bericht enthaltenen SHA-256-Werte geprüft. Der archivierte QA-Bericht ist byteidentisch zum Original. Die vier Protokolle stimmen mit den gebundenen Ausgabeprüfsummen überein.

Vorlage, QA-Bericht und Archiv behalten ihren damaligen Status «zur Abnahme» beziehungsweise `accepted: false`. Die heutige Abnahme steht bewusst separat. AP23D2 darf die lebenden Quellen im beauftragten Umfang fortentwickeln, ohne den gesicherten D1-Stand oder dessen Sollprüfsummen nachträglich anzupassen.

## Gestarteter Umfang und Grenzen

AP23D2 umfasst einen kontrollierten TI-/GR-Referenzkandidaten, die DE-/FR-Oberfläche, persönliche Vorgaben der Version 5, die Rechenspur und die Herkunftsbindung des Kalenderexports. Der [D2-Umsetzungsstand](../architektur/verwaltungsintegration-ap23d2.md) wird getrennt vorgelegt.

Provider-/Cacheintegration, der gemeinsame Format-8-Host für Bestandsprofile, SPFx-Synchronisation und auslieferbare Web-/SPFx-Pakete gehören zu AP23D3. Quellenreleasefreigabe, Datenpromotion, E-/Q-Installation, Geräte-/Gastprüfung und öffentliche Bereitstellung benötigen ihre jeweiligen späteren Freigaben. Bestehende Datenreleases, AP5-Pins, E/Q/P, Mirrors, M365-Berechtigungen und Richtlinien bleiben unverändert.

David Steimer entscheidet und nimmt ab. Codex ist Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
