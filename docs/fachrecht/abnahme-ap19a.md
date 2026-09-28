# AP19A · Abnahme von Fachumfang und Modellstruktur

Datum: 25. September 2026. Entscheider: David Steimer.

David Steimer hat nach der Rückfrage zur Paketnummerierung ausdrücklich bestätigt, dass sein «OK, passt» als Abnahme des vorgelegten AP19A-Umfangs und der Modellstruktur verstanden werden darf und AP19B beginnen soll. Damit ist AP19A in diesem begrenzten Umfang abgenommen.

## Abgenommener Gegenstand

- Priorisiertes Bundesrechtsinventar und erste Tranche ELG, AVIG und KVG mit den zwölf abgegrenzten Pfadvorschlägen.
- ELG: individuelle Bundes-EL des zweiten Kapitels, einschliesslich Krankheits- und Behinderungskosten. Keine automatische Übernahme eigenständiger kantonaler Mehrleistungen.
- AVIG: zunächst individuelle Arbeitslosenentschädigung. Weitere Entschädigungsarten bleiben gesonderte spätere Unterbereiche.
- KVG: zunächst individuelle OKP-Leistungen gegenüber dem Krankenversicherer. Gesetzliche Ausnahmen und vorläufige Produktgrenzen bleiben unterscheidbar.
- Nationale Bundesregeln, kantonale Anbindungen und konkrete Freigaben als getrennte Ebenen gemäss DEC-2026-024.
- Nicht produktive Strukturprobe mit 22 Referenzkonstellationen und 15 Governance-/Mutationstests. Die Ergebnisse belegen Struktur und Sperren, nicht zwölf implementierte Fachberechnungen.

## Gebundene Vorlage

Die nachstehenden AP19A-Dateien bleiben unverändert. Ihr ursprünglicher Entwurfsstatus ist Teil des damaligen Vorlagestands. Der aktuelle Abnahmestatus ergibt sich aus dieser Notiz, nicht aus einer rückwirkenden Änderung ihrer Prüf- oder Aktivierungsflags.

| Gegenstand | SHA-256 |
| --- | --- |
| [Bundesrechtsinventar](sozialversicherungsinventar-ap19a.md) | `ae7fc56929df892981348e25bb0c92f9b1965b82fc344f14b5243b9c55a9ce25` |
| [Quellenpaket ELG/AVIG](quellenpaket-ap19a-elg-avig.md) | `b51f73b796044740e9374bb0d2aa164fbb36a12ed49d56239b879845b7c29d68` |
| [Quellenpaket KVG](quellenpaket-ap19a-kvg.md) | `1e49960e860e6a40ebfe3a815d5d037b1a64fc83799ca58f3269ddcb84d74f62` |
| [Modellstruktur und Prüfnachweis](../architektur/sozialversicherungsmodell-ap19a.md) | `c4dfac54a2b790c30164b973e69ef9ce608e9d3db6b50206d444c1bd8df20381` |
| [Maschinenlesbare Strukturprobe](../../tests/golden/candidates/ap19a-national-model.json) | `88eddd275b9d50efc190f1e8035bd6aaaf4414fa2524bb9c95cc2031086cb8df` |
| [Prüfskript](../../scripts/check-ap19a-model.mjs) | `c24dd633b44ce7515c5b500645d847ede2e825fbe7f5a7e44b791373780a3b15` |
| [Governance-Tests](../../tests/governance/ap19a-model.test.mjs) | `2d6ed57b924e758bdda44d28147bf7c5abd615a1dfc4d38eed99d411f2142a7c` |

Der [Arbeitsplan](sozialversicherungsrecht-ap19.md) bleibt ein lebendes Steuerungsdokument. [DEC-2026-024](../entscheidungen/DEC-2026-024-nationales-sozialversicherungsmodell.md) ist bereits beschlossen und wird durch diese Abnahme nicht ersetzt.

## Beauftragter nächster Schritt

AP19B konkretisiert den Produktvertrag, die Komponenten- und Consumerversionen, die verlustfreie Migration und die fachlichen Datums-/Sperrreferenzen. Dazu gehört der noch offene Fassungs- und Zuständigkeitsabgleich. Der daraus entstehende Vertrag wird gesondert zur Entscheidung vorgelegt, bevor AP19C die Produktintegration umsetzt.

## Weitergeltende Grenzen

- Keine vorweggenommene Abnahme der erst in AP19B erstellten Datumsreferenzen oder der konkreten Formatversionen.
- Keine pauschale zeitliche Rechtsfreigabe für 2026–2027 allein aufgrund des AP19A-Modelltestfensters.
- Keine operative Freigabe der neuen Pfade, zusätzlicher Kantone oder ausserkantonaler Feiertagsanknüpfungen.
- Keine Erweiterung auf beliebige Gerichtsfristen, materielle Anspruchsfristen, Monatsfristen oder feste Endtermine.
- MVP 0.4 und sämtliche bestehenden Datenreleases bleiben unverändert. Kein Auftrag zu Build, Datenpromotion, Push, Mirrorwechsel oder E-/Q-/P-Deployment.

David Steimer entscheidet in Personalunion. Codex dokumentiert den Beschluss und führt die beauftragten Folgearbeiten als KI-Arbeitsinstrument aus, ohne formelle Freigabe- oder Haftungsverantwortung.
