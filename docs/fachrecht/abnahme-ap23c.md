# AP23C Abnahme des Kantonalverfahrensvertrags

Datum: 14. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23C ist abgenommen und DEC-2026-032 bestätigt. Beginne mit AP23D1.

**AP23C ist fachlich-technisch abgenommen und DEC-2026-032 beschlossen. AP23D1 ist ausdrücklich gestartet.** Der [Beschlussnachweis](../entscheidungen/DEC-2026-032-beschluss.md) hält die bestätigten Eckpunkte fest. Eine erneute Bestätigung derselben Vorlage ist nicht erforderlich.

## Abgenommener Gegenstand

Abgenommen sind der [Daten- und Migrationsvertrag](../architektur/verwaltungsverfahrensvertrag-ap23c.md), die beiden Kandidatenschemas, die TI-/GR-Vertragsprobe und der [isolierte Prüfnachweis](../architektur/verwaltungsverfahrensvertrag-ap23c-pruefung.md). Bestätigt sind Kantonalverfahrenskatalog 1.0.0, Manifest und Mindestconsumer 8.0.0, das begrenzte neue Zeitfenster 29.08.2026–31.12.2027 und Defaults 5 unter eigenem Schlüssel. Die fünf Bestandsprofile und übrigen Komponentenformate bleiben erhalten.

DEC-2026-031 zur Feiertagsanknüpfung, der Vorrang besonderer Bundesnormen und ausdrücklicher kantonaler Abweichungen, die zwölf TI-/GR-Pfadgruppen und TI-O2 als Sperrfall bleiben verbindlich. NW und weitere Kantone werden dadurch nicht operativ freigegeben.

## Bindung der Vorlage

Vor Beginn der Umsetzung wurden alle elf im [QA-AP23C.json](../../outputs/ap23c-vertrag-2026-10-14/QA-AP23C.json) aufgeführten Artefakte erneut auf SHA-256 und Byteanzahl geprüft. Alle stimmen überein.

| Nachweis | SHA-256 |
| --- | --- |
| QA-AP23C.json | `3db2767c9c58a0adbf86828a1e0211ccd18d321b1d44b3e87d515cb4755b1328` |
| Vertragsvorlage | `56124df3e28b5c5a7007abefd3d9d8861f135c85d91d880c048f49e30fceb563` |
| DEC-2026-032-Vorlage | `745eabba072dbe5a9063fa48150fe22daf5fc25601d76937cb72df47171afe6e` |
| Katalogschema | `a9bb3aa220c6f6612f092d97c9dc199563aaa2e6b87b6687939c3cfdc4ecabea` |
| Manifestschema | `535d8f9754758900f9952a2b7a676824190efb58ecee6a437510853fc3316fb2` |

Die ursprünglichen Statusangaben «vorgeschlagen» und «noch nicht beschlossen» bleiben in den gebundenen Vorlagen als damaliger Stand erhalten. Massgebend sind nun diese Abnahme und der Beschlussnachweis. Die Strukturprobe wird nicht rückwirkend zu einem freigegebenen Datenrelease umgeschrieben.

Die historischen Prüfer binden teilweise auch den damaligen Produktquellcode. AP23D1 darf diesen Code im ausdrücklich beauftragten Umfang ändern. Ein späterer historischer Hashvergleich ist deshalb von der neuen Produktregression zu unterscheiden. Die alten Nachweise und Sollhashes werden nicht angepasst, um eine solche Änderung zu verdecken.

## Gestarteter Umfang und Grenzen

AP23D1 umfasst neue Reader und Validierung, einen qualifizierten Kantonalresolver, den internen Rechenplan und gemeinsame Tagesarithmetik sowie historische Regression und neue Sperrtests. Defaults-Migration, sichtbare UI-Anbindung und Exportoberfläche gehören zu AP23D2. Provider-/Hostintegration und lokale Auslieferungskandidaten gehören zu AP23D3.

Keine Quellenreleasefreigabe, Datenpromotion, App-Bereitstellung oder Veröffentlichung ist enthalten. Freigegebene Daten, AP5-Pins, E/Q/P, Mirrors, Berechtigungen und Richtlinien bleiben unverändert. David Steimer entscheidet und nimmt ab. Codex arbeitet ohne formelle Freigabe- oder Haftungsverantwortung.
