# AP23E2 Technische Abnahme und Start von AP23E3

Datum: 18. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23E2 ist technisch abgenommen. Bitte starte AP23E3.

**AP23E2 ist technisch abgenommen. AP23E3 ist ausdrücklich gestartet.** Der [bestätigte Entscheid DEC-2026-033](../entscheidungen/DEC-2026-033-beschluss.md) legt Katalog 2.0.0 und Manifest/Mindestconsumer 9.0.0 fest. Die Abnahme umfasst den geprüften Datenvertrag und isolierten Strukturkandidaten, nicht bereits einen freigegebenen Datenrelease.

## Gebundener Abnahmestand

| Nachweis | SHA-256 |
| --- | --- |
| [Technischer Abnahmebericht](../architektur/technische-abnahmepruefung-ap23e2.md) | `f8542f3b69b6b390eba2148325440d591ad6f49b0ae82d0493dbed106e0ab920` |
| [Maschinenlesbare Wiederholungsprüfung](../../outputs/ap23e2-abnahmepruefung-2026-10-18/QA-AP23E2-ABNAHMEPRUEFUNG.json) | `9872982c93adb19b839827d0bb93ef1220457f2dfdd18263c99da02bf488e566` |
| [Beschluss DEC-2026-033](../entscheidungen/DEC-2026-033-beschluss.md) | `8a669f031ad213c04f67c4160dab86cc59e9d574444ec61d7766b9cf9e704cf8` |
| [Abnahmesicherung mit 201 Dateien](../../outputs/ap23e2-abnahme-2026-10-18/receipt.json) | `6f689865002918aeecbd5f57c4d79fb07b595eea937aeb88a72081938b7798e3` |

Die erneute technische Prüfung ist unmittelbar vor der ersten Produktänderung bestanden. Die Sicherung enthält die gebundenen E2-Nachweise, Kandidatendateien, den damaligen Produktquellstand und MVP-0.8-Daten. Sie ist eine Nachweiskopie, keine eigenständig eingerichtete Testumgebung. Historische Vorlagen und Berichte behalten ihren damaligen Status unverändert. Die alten Gesamtprüfer dürfen nach der beauftragten Produktänderung nicht mit neuen Sollhashes rückwirkend umgeschrieben werden.

## Auftrag AP23E3

AP23E3 umfasst die vollständig neu gebundene lokale Datenprobe, strengen Format-9-Reader, ausdrückliche Fallqualifikation und gemeinsame Rechenanbindung sowie die DE-/FR-Oberfläche, Defaults-, Export-, Provider- und lokale Hostregression. Die zwölf TI-/GR-Pfade, die bestehenden Sozialfreigabegrenzen, historischen Formate und AP5 bleiben geschützt. Die 13 neuen Wege, Zeitfenster und AR-O1 bleiben innerhalb der E1-Fachabnahme.

Der zweispaltige Aufbau, frühe Datumseingabe und die lokal abgenommene UX-Korrektur bleiben erhalten. Aktuelle Fallvoraussetzungen werden weder aus fehlenden Angaben noch aus persönlichen Standards erfunden. Die vorhandene Fallkonstellation wird präzisiert, ohne zusätzliche Checkboxen einzuführen.

Quellenreleasefreigabe, Datenübernahme in einen freigegebenen Release, Commit, GitHub-Push, Upload und Installation sind nicht umfasst. E/Q/P, Mirrors, M365-Berechtigungen und Betriebspaket bleiben unverändert. Die lokale Umsetzung wird als eigenes Prüfergebnis zur fachlich-technischen Abnahme vorgelegt.
