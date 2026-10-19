# MVP 0.9 Prüfmatrix für E und Q

Stand: 18. Oktober 2026. **Sollmatrix. Sämtliche nachstehenden Hosttests und menschlichen Prüfungen sind ausstehend.** Diese Datei dokumentiert weder eine Ausführung noch eine Installationsfreigabe. Massgebend ist die gesonderte [E-/Q-Installationsvorlage](eq-installationsvorlage-mvp09.md) mit frischer Zielbindung und Ausgangssicherung. Die [bestandenen lokalen R09-B-Prüfungen](lokaler-releaseabschluss-mvp09.md) ersetzen keine aktuellen Hostnachweise.

Gebundener Sollstand: Anwendung `0.9.0`, Paket `0.9.0.0`, SHA-256 `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331`, Datenrelease `2026-10-18-mvp-09-approved.1`, Manifest SHA-256 `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265`. Format und Mindestconsumer `9.0.0`, Verwaltungsverfahrenskatalog `2.0.0`, 41 Komponenten plus Manifest. Sämtliche Fälle sind synthetisch.

## 1. Ziele, Reihenfolge und Freigabegates

| Kürzel | Bestehendes Ziel, vor Vollzug technisch frisch zu bestätigen | Status |
| --- | --- | --- |
| E-SP | Aktueller Rechner auf «Fristenrechner Test» | Ausstehend |
| E-T | Aktuelle Rechnerregisterkarte im Team «Entwicklungsumgebung», Kanal «Fristenrechner» | Ausstehend |
| Q-SP | Aktueller Rechner auf «Fristenrechner Gastdemo» | Ausstehend |
| Q-T | Bestehende Rechnerregisterkarte im Team «Fristenrechner Gastdemo Teams», Kanal «Fristenrechner» | Ausstehend |

Namen allein genügen nicht als Zielidentifikation. URL, Site-/App-/Webpart-/Tabidentität, Provider und bisherige Datenkonfiguration werden gemäss privater Zielbindung zugeordnet. Keine zusätzliche Installation, neue Testseite, Tabkopie oder Berechtigungsänderung.

**E-Gate:** Auf E-SP und E-T jeweils T01–T06 und T08, A01, A09, A13, A17, A22 und A24, B01–B03, B06, B08–B10 sowie C01, C03 und C04 ausführen. Mehrteilige Fälle vollständig durchführen. T07 prüft vor jeder Q-App-/Mirrorumstellung beide noch nicht umgestellten Q-Verbraucher. T09 prüft beide historischen AP5-Ansichten. Erst nach bestandenem E-Gate einschliesslich T07/T09 darf Q gemäss gesonderter Freigabe umgestellt werden. Ein fehlgeschlagener oder ungeklärter Gatefall hält diese Umstellung an.

**Vollständige technische Q-Matrix:** Auf Q-SP und Q-T jeweils alle A01–A25, B01–B12, C01–C06 und T01–T06/T08 ausführen. T07 und T09 bleiben durch ihre bereits vor der Q-Umstellung erhobenen Belege gebunden. Die sieben Zusatzstadien aus Abschnitt 2 werden auf Q-SP vollständig gerechnet und auf Q-T zusätzlich hinsichtlich Auswahl, Invalidierung und erneuter Qualifikation geprüft. Damit werden sämtliche 25 Pfade auf beiden aktuellen Q-Hosts ausgeführt, nicht aber sämtliche mathematischen Kombinationen aus der lokalen Regression im Browser wiederholt.

**DE/FR:** Je aktuellem Host A13, A17, A22, B01, B02, B08 und C03 zusätzlich in beiden Sprachen prüfen. Auf Q zusätzlich die übrigen neuen Pfadbezeichnungen und Fallqualifikationen in beiden Sprachen anzeigen. T08 bindet acht tatsächlich gespeicherte Kalenderdateien. T06 umfasst Darstellung und echten Browserzoom in DE und FR.

**Menschliche Abnahme:** M01 bis M03 bleiben getrennte neue Nachweise durch David. Technisches Q-Gate, Geräteprüfung, Gastanmeldung und fachliche Q-Abnahme sind nicht gegenseitig austauschbar. Der Outlook-Entscheid M04 bleibt separat. Aktueller Status aller Gates: **ausstehend**.

## 2. Alle 25 Verfahrenspfade

Gemeinsam gilt der rechtlich massgebende tatsächliche Empfang **02.10.2026**. Sitz der zuständigen kantonalen Zielstelle und Erlass entsprechen der Tabelle. Gesetzliche Tageszahl nicht überschreiben. Bei angeordneten Fristen zehn Tage ausdrücklich eingeben. Jeder positive Fall muss ein definitives Resultat mit Exportmöglichkeit und dem richtigen Datenrelease liefern. Pfad und Rechtsherkunft sind in den vorhandenen technischen Nachweisen beziehungsweise im gespeicherten Export zu kontrollieren, nicht in einem erfundenen zusätzlichen GUI-Feld.

Fallkonstellation ausdrücklich neu wählen:

- TI/GR: «Allgemeines kantonales Verfahren, tatsächlicher Empfang, keine Abweichung». Bei GR-Gericht zusätzlich «Keine ausdrückliche Dringlichkeitsverfügung».
- Neue ordentliche LU-/ZG-/AR-Beschwerden: «Endentscheid, vollständiger Empfang, unbestrittene Belehrung, unveränderte ordentliche Tagesfrist».
- Neue angeordnete LU-/ZG-/AR-Fristen: «Prozessuale Eingabe, vollständiger Empfang, unbestrittene Anordnung, unveränderte Tagesfrist». Keine Zahlung und kein Kosten- oder Beweisvorschuss.
- AR-Fünftagesrekurs: «Nichtgeldvollstreckung nach Art. 63 VRPG, vollständiger Empfang, unbestrittene unveränderte Fünftagesfrist».

Die neuen Gruppen setzen den begrenzten allgemeinen kantonalen Verfahrensweg voraus. Es werden keine Fallfakten aus gespeicherten Standards abgeleitet. Die neuen Ausschlüsse werden nicht nachträglich auf die unveränderten TI-/GR-Pfade übertragen, insbesondere bleibt der bestehende TI-Kostenvorschuss ein eigener Pfad.

| Fall / Pfad | Kanton / Erlass | Stadium und Verfahrenshandlung | Tage | Sollablauf | Status |
| --- | --- | --- | ---: | --- | --- |
| A01 `ti-80-30` | TI / LPAmm TI | Verwaltungsbeschwerde, ordentliche Verwaltungsbeschwerde | 30 | 02.11.2026 | Ausstehend |
| A02 `ti-84-30` | TI / LPAmm TI | Gerichtsverfahren, ordentliche Beschwerde an das Gericht | 30 | 02.11.2026 | Ausstehend |
| A03 `ti-reply` | TI / LPAmm TI | Gerichtsverfahren, angeordnete Stellungnahme / Vernehmlassung | 10 | 12.10.2026 | Ausstehend |
| A04 `ti-provisional-15` | TI / LPAmm TI | Verwaltungsbeschwerde, Beschwerde gegen vorsorgliche Massnahme | 15 | 19.10.2026 | Ausstehend |
| A05 `ti-advance` | TI / LPAmm TI | Gerichtsverfahren, Vorschuss für Verfahrenskosten | 10 | 12.10.2026 | Ausstehend |
| A06 `gr-32-30` | GR / VRG GR | Verwaltungsbeschwerde, ordentliche Verwaltungsbeschwerde | 30 | 02.11.2026 | Ausstehend |
| A07 `gr-32-10` | GR / VRG GR | Verwaltungsbeschwerde, Beschwerde gegen verfahrensleitende Anordnung | 10 | 12.10.2026 | Ausstehend |
| A08 `gr-admin-ordered` | GR / VRG GR | Verwaltungsverfahren, behördlich angesetzte Tagesfrist | 10 | 12.10.2026 | Ausstehend |
| A09 `gr-52-30` | GR / VRG GR | Gerichtsverfahren, ordentliche Beschwerde an das Gericht | 30 | 02.11.2026 | Ausstehend |
| A10 `gr-52-10` | GR / VRG GR | Gerichtsverfahren, Gerichtsbeschwerde gegen verfahrensleitende Anordnung | 10 | 12.10.2026 | Ausstehend |
| A11 `gr-42-10` | GR / VRG GR | Gerichtsverfahren, Prozessbeschwerde | 10 | 12.10.2026 | Ausstehend |
| A12 `gr-court-ordered` | GR / VRG GR | Gerichtsverfahren, gerichtlich angesetzte Tagesfrist | 10 | 12.10.2026 | Ausstehend |
| A13 `lu-admin-30` | LU / VRG LU | Verwaltungsbeschwerde, ordentliche Verwaltungsbeschwerde | 30 | 02.11.2026 | Ausstehend |
| A14 `lu-court-30` | LU / VRG LU | Gerichtsverfahren, ordentliche Beschwerde an das Gericht | 30 | 02.11.2026 | Ausstehend |
| A15 `lu-admin-ordered` | LU / VRG LU | Verwaltungsverfahren, behördlich angeordnete prozessuale Eingabe (keine Zahlung) | 10 | 12.10.2026 | Ausstehend |
| A16 `lu-court-ordered` | LU / VRG LU | Gerichtsverfahren, gerichtlich angeordnete prozessuale Eingabe (keine Zahlung) | 10 | 12.10.2026 | Ausstehend |
| A17 `zg-admin-20` | ZG / VRG ZG | Verwaltungsbeschwerde, ordentliche Verwaltungsbeschwerde | 20 | 22.10.2026 | Ausstehend |
| A18 `zg-court-30` | ZG / VRG ZG | Gerichtsverfahren, ordentliche Beschwerde an das Gericht | 30 | 02.11.2026 | Ausstehend |
| A19 `zg-admin-ordered` | ZG / VRG ZG | Verwaltungsverfahren, behördlich angeordnete prozessuale Eingabe (keine Zahlung) | 10 | 12.10.2026 | Ausstehend |
| A20 `zg-court-ordered` | ZG / VRG ZG | Gerichtsverfahren, gerichtlich angeordnete prozessuale Eingabe (keine Zahlung) | 10 | 12.10.2026 | Ausstehend |
| A21 `ar-admin-20` | AR / VRPG AR | Verwaltungsbeschwerde, ordentliche Verwaltungsbeschwerde | 20 | 22.10.2026 | Ausstehend |
| A22 `ar-execution-5` | AR / VRPG AR | Verwaltungsbeschwerde, Rekurs gegen eine Vollstreckungsverfügung (Art. 63 VRPG) | 5 | 07.10.2026 | Ausstehend |
| A23 `ar-admin-ordered` | AR / VRPG AR | Verwaltungsverfahren, behördlich angeordnete prozessuale Eingabe (keine Zahlung) | 10 | 12.10.2026 | Ausstehend |
| A24 `ar-court-30` | AR / VRPG AR | Gerichtsverfahren, ordentliche Beschwerde an das Gericht | 30 | 02.11.2026 | Ausstehend |
| A25 `ar-court-ordered` | AR / VRPG AR | Gerichtsverfahren, gerichtlich angeordnete prozessuale Eingabe (keine Zahlung) | 10 | 12.10.2026 | Ausstehend |

**Sieben zusätzliche zulässige Stadien, keine zusätzlichen Fachpfade:** A03 und A05 auch Verwaltungsbeschwerde, A04 auch Gericht, A08/A15/A19/A23 auch Verwaltungsbeschwerde. Gleiche Eingaben und Sollabläufe wie oben. Nach jedem Stadiumwechsel die Fallkonstellation neu setzen. Status sämtlicher Zusatzvarianten: **ausstehend**.

Die 25 Datumswerte stammen aus den [tatsächlichen MVP09-Pakettests](../../spfx/test-build/mvp09-harness.cjs). Pfad-/Stadien- und Qualifikationsbindungen stammen aus dem [freigegebenen Laufzeitkatalog](../../data/releases/2026-10-18-mvp-09-approved.1/administrative-procedures/ch-cantonal-administrative-procedures.json). Das ist keine neue fachliche Freigabe.

## 3. Grenzen, Stillstände und Qualifikation

Die A-Fälle liefern die vollständige Ausgangsqualifikation. Nur die hier genannten Eingaben ändern. «Gesperrt» bedeutet immer: kein definitives Enddatum und kein Kalenderexport. Ein früheres gültiges Resultat darf nicht weiterverwendet werden.

| Fall | Explizite Variante | Soll | Status |
| --- | --- | --- | --- |
| B01 AR-O1 | A24 mit Empfang 18.02.2027. Kontrollfall derselbe Pfad mit 17.02.2027 | Grenzfall gesperrt mit eigener AR-Diagnose, nicht TI-Text. Technischer Prüfbezug: letzter gezählter Tag 20.03.2027, gesperrter Tag 21.03.2027. Kontrollfall 19.03.2027 mit Export | Ausstehend |
| B02 TI-O2 | A01 mit Empfang 17.02.2027 | Gesperrt mit TI-Diagnose zum betroffenen 19.03.2027. Keine Übertragung dieser Sperre auf den LU-Kontrollfall B03 | Ausstehend |
| B03 LU-Feiertagsbindung | A13 mit 17.02.2027. Danach A14 mit 08.11.2026 | LU 19.03.2027 ohne Josefstagverschiebung. Zweiter Fall 09.12.2026 wegen Mariä Empfängnis. Automatische Bindung an LU, kein freies Feiertagskantonfeld | Ausstehend |
| B04 LU/ZG ohne Gerichtsferien | A14 und A18 mit 17.12.2026. A16 und A20 mit 12.03.2027 und 14 Tagen. A17 mit 12.07.2027 | Beide Gerichtsrechtsmittel 18.01.2027 ohne Weihnachtsstillstand. Beide angeordneten Fristen 30.03.2027 wegen Karfreitag-/Wochenend-/Ostermontagskette, nicht wegen Friststillstand. ZG-Verwaltungsbeschwerde 02.08.2027 ohne Sommerstillstand | Ausstehend |
| B05 AR Weihnachten | A24 mit 17.12.2026. A25 und A23 je mit 20.12.2026 und zehn Tagen. A22 mit 22.12.2026 | Gerichtsbeschwerde 01.02.2027. Angeordnete Gerichtsfrist 12.01.2027, angeordnete Verwaltungsfrist 30.12.2026. Fünftagesrekurs 28.12.2026 ohne Gerichtsferien. Gerichtlicher Stillstand endet einschliesslich 02.01.2027 | Ausstehend |
| B06 AR Sommer und Ostern | A24 und A21 mit 12.07.2027. Danach A24 mit 18.03.2027 | Gericht 13.09.2027 mit 32 Stillstandstagen, Verwaltung 02.08.2027 ohne Stillstand. Osterfall 03.05.2027. Rechenspur nennt die jeweilige AR-Grundlage, keine irreführende ZPO-/BGG-/VwVG-Zuordnung | Ausstehend |
| B07 GR Gericht und Dringlichkeit | A09 mit 10.07.2027, zuerst ohne und dann mit ausdrücklicher gerichtlicher Dringlichkeit. Vergleich A06 mit gleichem Datum. A12 mit 20.07.2027, zehn Tagen, ohne/mit Dringlichkeit | A09 10.09.2027 ohne, 09.08.2027 mit Dringlichkeit. A06 09.08.2027. A12 25.08.2027 ohne, 30.07.2027 mit Dringlichkeit. Wechsel entfernt altes Resultat/Export sofort. Keine freie Dringlichkeits-Abschaltung bei LU/ZG/AR | Ausstehend |
| B08 Fehlende und abweichende Fakten | Nacheinander A13, A19 und A22 ohne gesetzte Fallkonstellation versuchen. Danach jeweils positiv rechnen und «Nicht geklärt» sowie «Spezialrecht oder abweichende Fallkonstellation» wählen | Ohne positive aktuelle Qualifikation kein definitives Ergebnis. Nach Wechsel Resultat und Export sofort entfernt. Keine implizite Endentscheid-, Eingabe- oder Nichtgeldvollstreckungsbestätigung aus Standards. Für die übrigen zehn neuen Pfade auf Q denselben Dreischritt kurz wiederholen | Ausstehend |
| B09 Pfad-/Stadien-/Erlasswechsel | Positiven A22 auf A21 umstellen, danach auf Gericht/A24. Bei A24 zu ZPO und zurück zu VRPG AR wechseln. A19 auf Verwaltungsverfahren anzeigen | Nach jedem Wechsel neue Fallqualifikation erforderlich. Fünftagesrekurs steht nicht als Gerichtspfad zur Auswahl. Unzulässige alte Kombination nicht automatisch weiterrechnen. Wenn genau eine echte Handlung besteht, feste Anzeige statt Scheinauswahl. A19 zeigt ausdrücklich prozessuale Eingabe, keine Zahlung | Ausstehend |
| B10 Neue Zeitfenster | A13 mit 26.09.2026, A17 und A21 mit 28.08.2026. A20 mit 17.12.2027 und 14 Tagen, danach 31.12.2027 und einem Tag. A24 mit 24.11.2027 | Erste drei Fälle gesperrt. ZG-Kontrolle ergibt 31.12.2027. Zweiter ZG-Fall und AR-Fall gesperrt, weil erforderliche Tage ausserhalb 2027 liegen. LU beginnt 27.09.2026, ZG/AR 29.08.2026. Keine pauschale Freigabe aller bis 2027 empfangenen Sendungen | Ausstehend |
| B11 TI-/GR-Grenzen und Orte | A08 mit 18.03.2027 und einem Tag, Vergleich A05 mit gleichem Datum/einem Tag. A08 mit einem Tag und 28./29.08.2026 sowie 30./31.12.2027. A01 mit 17.12.2027 | GR 19.03.2027, TI 22.03.2027. GR-Untergrenze: 28.08. gesperrt, 29.08. ergibt 31.08.2026. Jahresende: 30.12. ergibt 31.12.2027, 31.12. gesperrt. TI-Dezemberfall ebenfalls gesperrt | Ausstehend |
| B12 Tageszahl und abgegrenzte Konstellationen | Bei A15/A19/A23 Tageszahl leer, null und 366, danach zehn setzen. Bei A13/A17/A22 gesetzliche Dauer beobachten. Nichtgeldvollstreckung, Endentscheid und prozessuale Eingabe in den Erläuterungen unterscheiden | Ungültige angeordnete Dauer verhindert Berechnung, gültige Kontrollfälle gemäss A-Tabelle. Gesetzliche Dauer fest gebunden. Keine Monats-/Fixtermin-, Zahlungs-, Mahnungs-/SchKG- oder Spezialrechtsfälle als normale Tagesfrist deklarieren. Solche nicht über eigene Felder modellierten Fakten werden nicht durch manipulierte Browserdaten als vermeintliche GUI-Tests erzeugt | Ausstehend |

Quellen der zusätzlichen Sollwerte: [abgenommene E1-Fachreferenzen](../../tests/golden/candidates/ap23e1-administrative.json), [E1-Abnahme](../fachrecht/abnahme-ap23e1.md), [native E3-Kernregression](../../tests/core/ap23e3-core.test.ts), [E3-Interaktion](../../tests/ui/ap23e3-app.test.tsx) und [unveränderte TI-/GR-Kernfälle](../../tests/core/ap23d1-deadline.test.ts). Historische Kandidatentests sperren ihren Export absichtlich. Diese Kandidatensperre ist **nicht** das Soll des nun freigegebenen Datenreleases. Für positive A-Fälle gilt die in den tatsächlichen MVP09-Pakettests nachgewiesene Exportfreigabe.

## 4. Bestandsverfahren und verständliche Rechenspur

| Fall | Explizite Eingaben | Soll | Status |
| --- | --- | --- | --- |
| C01 BE-StPO | Sitz BE, StPO, Partei ohne Vertretung in BE, Empfang 16.09.2026, zehn Tage | 28.09.2026 und Export | Ausstehend |
| C02 ZPO und Behördenort | Sitz TI, ZPO ordentlich, 07.12.2026, ein Tag. Danach Sitz BE, ZPO ordentlich, 17.12.2026, fünf Tage | TI 09.12.2026. BE 07.01.2027 mit verständlicher Stillstandsperiode und Art. 145 ZPO. Kein zusätzlich frei zu bestimmender Feiertagskanton für den Gerichtsanknüpfungsfall | Ausstehend |
| C03 AHVG/ATSG | Sitz BE, VRPG → Sozialversicherungsrecht → AHVG → Einsprache, zuständige kantonale Ausgleichskasse BE, Partei ohne Vertretung in BE, Empfang 17.12.2026, gesetzliche 30 Tage | 01.02.2027, verständliche ATSG-Spur einschliesslich Art. 38 Abs. 4. Alle elf bestehenden Sozialerlasse bleiben auswählbar, ohne neue ausserbernische Freigabe | Ausstehend |
| C04 Januargrenze | StPO, Sitz BE, Partei ohne Vertretung in SG, 01.01.2029, ein Tag. Kontrollfall 01.01.2027 | 2029 Vergleich 02./03.01.2029, gesperrt ohne definitives Resultat/Export. 2027 gleiches rechtliches Ergebnis 04.01.2027 mit Export | Ausstehend |
| C05 Regionale Bundesrechtsgrenzen | StPO, Sitz BE, Partei ohne Vertretung in NE, 26.05.2027, ein Tag, Le Landeron offen/Nein/Ja. Danach Partei in GR, 16.09.2026, zehn Tage | NE offen gesperrt, Nein 27.05., Ja 28.05.2027 mit Vorbehalt. GR 28.09.2026 mit Bundesrechtsgrenze. Diese Grenze nicht auf den eigenen GR-Verwaltungspfad übertragen | Ausstehend |
| C06 BE-VRPG und EOG | Allgemeines BE-VRPG, 04.09.2026, zehn Tage. Vollständig qualifizierter EOG-Einsprachefall mit zuständiger Kasse, Wohnsitz bei Zustellung BE, Partei ohne Vertretung in BE, 16.09.2026. Danach spezifischen Wohnsitz leer, dann ZH, schliesslich vollständiger BE-Fall mit 18.11.2027 | Allgemeines VRPG 14.09.2026. Positiver EOG-Fall mit gesetzlichen 30 Tagen 16.10.2026. Alle drei EOG-Grenzfälle gesperrt ohne Export. Keine Erweiterung der Sozialfreigaben durch Format 9 | Ausstehend |

Die vollständigen unveränderten Sozialfakten konkretisieren [MVP07 F08/F09](pruefmatrix-mvp07.md). C02/C03 stützen sich zusätzlich auf die [UX-Verträge](../../tests/ui/ap23d2-ux-app.test.tsx) und die [E3-Bestandsprüfung](../../tests/ui/ap23e3-app.test.tsx). Lesbare Rechtsgrundlagen und verlinkte Normen gehören in die Rechenspur. Rohkennungen wie `SRC-…` oder `CH-CAL-…` dürfen dort nicht anstelle verständlicher Bezeichnungen erscheinen, bleiben aber in technischen Nachweisen zulässig. Die Release-ID wird an ihrem tatsächlich implementierten Anzeigeort geprüft.

## 5. Technische Hostmatrix

| ID | Ausführung und Erfolgskriterium | Status |
| --- | --- | --- |
| T01 Identität und unveränderte Konfiguration | Pro aktuellem Ziel Katalog-/Appversion `0.9.0.0`, tatsächliches Hauptbundle, Provider, vollständigen Mirrorpfad und Manifestbindung prüfen. Vorher-/Nachhervergleich aller übrigen Konfigurationseigenschaften. Kein stiller GitHub-/BE-/AP5-Ersatz, keine neue API-Berechtigung oder zusätzliche Installation | Ausstehend |
| T02 Rohbytes und Erstabruf | Alle 42 Dateien jedes der vier Mirrors vollständig gegen die Sollbytes prüfen. Danach Erstabruf im tatsächlichen Host- und Speicherkontext anhand URL, HTTP-Status und Antwortbytes beobachten. Releaseanzeige allein oder warmer Cache belegt keinen frischen Abruf. Keine originweite Löschung | Ausstehend |
| T03 Quellenwechsel und Fehlabruf | Vorbereitung gemäss Abschnitt 5.1 ausdrücklich **vor dem jeweiligen tatsächlichen Mirrorpfadwechsel**, nicht erst nach der Umstellung. Neuer Format-9-Mirror darf bei seinem fehlgeschlagenen Erstabruf weder das alte Format-8-Resultat noch dessen Export oder einen fremd konfigurierten Cache verwenden. Tatsächlich gescheiterten gezielten Request nachweisen. Nach Entfernung der eigenen Sperre erfolgreicher Wiederanlauf mit vollständig richtigen 42 Antwortdateien und A22. Ein späterer Fehlabruf derselben bereits verifizierten Quelle darf nur den zu genau dieser Konfiguration gehörenden verifizierten Cache nutzen | Ausstehend |
| T04 Datum und sofortige Invalidierung | Frühe Datumseingabe vor abgeschlossener Verfahrensauswahl, Vollformat, Tag, Tag.Monat und `h`, jeweils Enter, Tab und Blur. Tatsächlichen lokalen Prüftag für relative Eingaben festhalten. Ungültiges Datum sperrt. Unbestätigter Datumstext, neuer Pfad, Stadium, Erlass, Qualifikation oder GR-Dringlichkeit entfernen Resultat/Export sofort. Empfangsdatum wird nicht aus Standards wiederhergestellt. Neuberechnung ausdrücklich auslösen | Ausstehend |
| T05 Standards 5 und Rohwertschutz | Gemäss Abschnitt 5.2. Vorhandener V5-Stand bleibt V5, keine neue Formatmigration. Neue LU-/ZG-/AR-Pfade speichern nur stabile Präferenzen. Fallfakten, Empfang, Exportreferenz und Dringlichkeit nicht speichern. Eigene ungültige/künftige Testwerte bleiben rohbytegleich geschützt. Resetmarker verhindert Wiederaufleben alter Standards. Beide Schlüssel getrennt beobachten, gemeinsame Speicher seriell behandeln | Ausstehend |
| T06 UX #50, DE/FR und echter Zoom | Gemäss Abschnitt 5.3 an jedem tatsächlichen Host. Breite Ansicht zweispaltig, schmale Ansicht einspaltig ohne relevantes horizontales Überlaufen. Empfangsdatum und Platzhalter passend zu übrigen Feldern, linksbündig. Echter Browserzoom 100 → 300 → 100 Prozent in DE/FR. Tastaturfokus, Buttons, Fehlermeldungen und Teamsnavigation prüfen. Keine CSS-Vergrösserung oder lokale Vorschau als Hostzoomnachweis | Ausstehend |
| T07 Gemischter Betrieb vor Q-Umstellung | Unmittelbar nach gemeinsamem Katalogwechsel auf beiden Q-Hosts vor deren App-/Mirrorumstellung den tatsächlichen neuen Code mit unverändertem bisherigen Format-8-Mirror prüfen. Alten Datenrelease `2026-10-15-mvp-08-approved.1`, C01 und A01 mit alten Daten bestätigen. Neue LU-/ZG-/AR-Verwaltungspfade dürfen aus Format 8 nicht aktiv werden. Alte aktuelle Q-Konfiguration nicht auf Format 9 vortäuschen. Dieser Zwischenbetrieb gehört zum E-Gate | Ausstehend |
| T08 Tatsächliche Kalenderdownloads | Je E-SP, E-T, Q-SP und Q-T A22 DE und FR tatsächlich speichern, insgesamt acht Dateien. Details in Abschnitt 5.4. Kein Öffnen oder Importieren in Outlook. Ein lokal simulierter Download ersetzt keine Hostdatei | Ausstehend |
| T09 Historischer AP5-Erhalt | Historische SharePoint-Seite und Teams-Alias prüfen. Alter ausdrücklicher Pin und Release `2026-08-29-ap5-approved.1`, neues tatsächlich geladenes Bundle. Acht historische Dateien gegen Sollbytes prüfen, frischen Abruf von Cachewiederverwendung unterscheiden. C01 ergibt 28.09.2026. Keine Änderung des historischen Pins, keine Publikation der historischen Seite, keine Standardspeicherung und keine Übertragung neuer Verwaltungspfade | Ausstehend |

### 5.1 Eng begrenzter Fehlabruf ohne pauschales Aufräumen

1. Eine eigene isolierte Prüfsitzung verwenden. Bestehende normale Benutzerprofile und deren Präferenzen bleiben unangetastet. Ziel, Origin, Speicherkontext und Zustand vor dem ersten neuen Abruf zuordnen. Eine frische Prüfsitzung ist kein Browserdatenreset.
2. **Vor dem tatsächlichen Mirrorpfadwechsel** den bisherigen MVP08-Rechner dieser Instanz unter dem neuen gemeinsamen Code einmal regulär in der isolierten Prüfsitzung laden. Den dabei eigenen, eindeutig an diese Format-8-Quelle gebundenen Cache nachweisen. Zugleich festhalten, dass in genau diesem Kontext noch kein Cacheeintrag für die konkrete neue Format-9-Mirrorquelle besteht. Die Benennung des Providers allein ist keine Konfigurationsidentität.
3. Exakt den neuen Manifestrequest dieser Zielinstanz lokal blockieren. **Die vollständige Regel vor dem Speichern des neuen Mirrorpfads und vor dem Neuladen lesen und bestätigen.** Sie muss den konkreten Origin, Site-/Mirrorpfad und `manifest.json` treffen, einschliesslich allfälliger Queryparameter. Niemals eine globale Regel wie `*://*` aktivieren oder stehen lassen. Bei unklarer Regel vor dem Konfigurationswechsel beziehungsweise Reload anhalten.
4. Erst jetzt den ohnehin freigegebenen geplanten Mirrorwechsel dieser Instanz durchführen und den blockierten Erstabruf beobachten. Requestfehler mit URL und Netzwerknachweis festhalten. Resultat-/Exportfreiheit und sichtbare Fehlerbehandlung prüfen. Ein leerer oder unzuverlässiger Sperrzähler genügt nicht als Nachweis. T03 nicht erst nach abgeschlossener Umstellung vorbereiten, denn dann wäre die erforderliche neue Quelle möglicherweise bereits zwischengespeichert.
5. Ausschliesslich die eigene enge Sperre entfernen, Entfernung verifizieren und neu laden. Richtigen Quellenabruf, Dateibytes und Berechnung bestätigen. Einen weiteren gezielten Fehlabruf derselben nun verifizierten Quelle getrennt vom Erstabruf protokollieren.
6. Ist bereits ein eigener MVP09-Cacheeintrag vorhanden, bevorzugt einen unverbrauchten isolierten Kontext verwenden. **Die gezielte Entfernung eines frisch und eindeutig identifizierten, ausschliesslich in diesem Prüflauf erzeugten Cacheeintrags benötigt eine separate Freigabe.** Keine automatische Cachebereinigung, keine Entfernung alter oder fremder Einträge. Ein temporärer Mirror-Rückwechsel zur Testwiederholung ist ebenfalls nicht durch diese Matrix freigegeben und benötigt eine gesonderte Zustimmung.

### 5.2 Standardsnachweis in eigenen Testkontexten

Vor Schreibtests Existenz und Rohbytes von `fristenrechner.defaults.v1` und `fristenrechner.defaults.v5` sichern. Keine vorhandenen fremden Werte für Tests ersetzen. Ein konkreter Schreibtest erfolgt nur im dafür freigegebenen eigenen Kontext. Wo eine technische Isolation fehlt, ist der Fall offen zu lassen oder eine eng begrenzte zusätzliche Zustimmung einzuholen.

| Teilfall | Nachweis | Status |
| --- | --- | --- |
| T05a Bestandswerte | Eigene gültige V5-BE-/TI-Präferenz laden. Keine erfundene Qualifikation und keine Umdeutung in einen neuen kantonalen Pfad. Alter Schlüssel bleibt bytegleich | Ausstehend |
| T05b Neue Präferenzen | A13, A17 und A22 nacheinander als Standard speichern und neu laden. Gesetzliche 30/20/5 Tage und stabiler Pfad bleiben. Empfangsdatum, Datumskurzform, aktuelle Fallkonstellation, regionale Fakten, Dringlichkeit und Exportreferenz fehlen. Ohne erneute Qualifikation kein Resultat | Ausstehend |
| T05c Geschützte Rohwerte | Nur eigene synthetische beschädigte V5-, zukünftige Versions- und unbekannte Auswahlwerte prüfen. Laden sowie versuchtes Speichern/Zurücksetzen dürfen geschützte Rohbytes nicht still löschen oder überschreiben. Verständliche Schutzmeldung, kein stiller Standardersatz. Vorbereitung und Rücknahme der eigenen Werte im Vollzugsnachweis einzeln binden | Ausstehend |
| T05d Resetmarker | Eigene gültige V5-Präferenz regulär zurücksetzen, neu laden. V5-Resetmarker bleibt, alte V1–V4-Präferenzen werden nicht erneut importiert. Alter Schlüssel bleibt bytegleich | Ausstehend |
| T05e Unveränderte Altmigration | In einer eigenen frischen synthetischen Konstellation ohne V5-Schlüssel gültige V4-Präferenzen nach V5 übernehmen. Kein Empfangsdatum und keine Fallqualifikation migrieren. Dies ist ein Bestandskompatibilitätstest, kein für sämtliche MVP08-Benutzer notwendiger Migrationsschritt | Ausstehend |

Die abgeschlossene lokale [Paket-Rundlaufprüfung](../../outputs/release-mvp09-2026-10-18/recovery-roundtrip/verification.json) bleibt separat. Sie erlaubt keinen vorsorglichen Recoveryeinsatz im Tenant. Ein tatsächlicher Rückfall folgt ausschliesslich der konkret freigegebenen Rückfallvorlage.

### 5.3 Feldhöhe, Schrift und Zoom

Desktop-Soll für das Empfangsdatum: **32 CSS-Pixel Höhe, 14 CSS-Pixel Schrift, linksbündig**. In der tatsächlichen Anordnung mit benachbarten Eingaben vergleichen. Der Platzhalter darf nicht wieder grösser erscheinen. Referenzkontrollen des lokalen Baus sind 30–32 CSS-Pixel hoch. Rundung und CSS-Messung von physischen Bildpixeln trennen. Die Werte bleiben bei echtem Browserzoom CSS-Werte, nicht unvergrösserte physische Abmessungen.

Bei grobem Zeiger/Touch bleibt die bewusst grössere Bedienfläche mit **44 CSS-Pixeln und 16 CSS-Pixel-Schrift** erhalten. Dies ist keine erneute Desktop-Feldhöhendifferenz. Reale mobile Darstellung und Tastaturbedienung werden unter M01 abgenommen, nicht aus der Touchsimulation abgeleitet.

Je Host DE/FR breit und schmal prüfen. Danach Browserzoom auf 300 Prozent setzen, dessen tatsächlichen Wert dokumentieren und mindestens Kopfbereich, Eingabe und berechnetes Resultat kontrollieren. Formular muss bei entsprechend verengtem Inhaltsviewport sinnvoll umbrechen. Keine verdeckten Pflichtangaben, abgeschnittenen Eingaben, unerreichbaren Schaltflächen oder horizontalen Seitenüberläufe. Teamsrahmen und automatisch ausblendende Navigation gesondert beobachten. Den Zoom in der eigenen Prüfsitzung anschliessend auf den gesicherten Ausgangswert zurückstellen. Die lokale [native 300-Prozent-Prüfung](../../outputs/release-mvp09-2026-10-18/browser-zoom-native-20261018-03/verification.json) ist Vergleichsgrundlage, kein Hostpass.

### 5.4 Acht gespeicherte Host-Kalenderdateien

Je aktuellem Host A22 mit Empfang 02.10.2026 und fünf gesetzlichen Tagen in DE und FR auslösen. Referenzen `QA-MVP09-{E-SP|E-T|Q-SP|Q-T}-{DE|FR}-AR5`, keine echten Aktenzeichen. Downloads im jeweiligen Host tatsächlich speichern und anschliessend die gespeicherten Bytes prüfen.

Soll: ganztägiger Beginn **07.10.2026**, exklusives Ende **08.10.2026**, frei (`TRANSP:TRANSPARENT`), Kategorie `Fristablauf`, Erinnerung `TRIGGER:-PT112H`. Passender DE-/FR-Betreff und synthetische Referenz, Release `2026-10-18-mvp-09-approved.1`, Pfad `ar-execution-5` und zugehörige administrative Rechts-/Datenherkunft. UTF-8, CRLF, zulässige Zeilenfaltung, UID, SHA-256 und Dateizuordnung dokumentieren. Keine Teilnehmenden, Anhänge oder Serienregeln. Browser-Speicherdialoge nicht mit Sicherheitsänderungen umgehen.

Kalenderexport nach B01/B02/B08 sowie nach unbestätigter Eingabe oder Kontextwechsel muss fehlen. Eine zuvor gespeicherte Datei darf nicht als aktueller Export ausgegeben werden. Acht eindeutige Host-/Sprachzuordnungen sind nachzuweisen, nicht acht beliebige Dateien. Alle acht Nachweise sind **ausstehend**. **Kein Outlook-Import.**

## 6. Menschliche Prüfungen und Abschluss

| ID | Neuer Nachweis durch David | Status |
| --- | --- | --- |
| M01 Reale Geräte | Empfangsdatum und Platzhalter, Desktop-/Touchgrössen, Datumshilfen, Fokus/Tab, neue LU-/ZG-/AR-Auswahl, Resultat und Rechenspur in tatsächlicher SharePoint-/Teams-Nutzung prüfen. Gerät, Betriebssystem, Browser/App und Tastatur nennen. Den akzeptierten iPad-/Magic-Keyboard-Befund qualifiziert beibehalten. VoiceOver nur bei tatsächlicher Prüfung als bestanden ausweisen, sonst offen kennzeichnen | Ausstehend |
| M02 Bestehender Gast | Bestehenden B2B-Gast in einer zulässigen Umgebung tatsächlich an Q-SP und Q-T anmelden. MVP09-Datenstand, A22, B01 und gespeicherten Kalenderexport bestätigen. Keine zusätzliche Einladung oder Rechteänderung. Conditional Access nicht umgehen. Eigentümerprüfung und alte Gastabnahme sind kein neuer Gastnachweis | Ausstehend |
| M03 Fachliche Q-Abnahme | Paket-/Datenbindung, technische Matrix, reale Geräte-/Gastbelege und verbleibende konkret benannte Restpunkte ausdrücklich abnehmen. Keine Ableitung allein aus «Berechnung funktioniert» oder aus lokalen Tests | Ausstehend |
| M04 Outlook | Den [begründeten MVP09-Wiederverwendungsvorschlag](outlook-wiederverwendung-mvp09.md) ausdrücklich bestätigen oder einen eng begrenzten neuen Importauftrag erteilen. Ohne diesen Auftrag bleibt es bei Datei-/Serialisierungsprüfungen | Ausstehend |

Jeder Ausführungseintrag nennt Host und Fallvariante, Zeitpunkt, Paket-/Bundle-/Datenstand, Kontoart, Browser/Gerät, vollständige Eingaben, erwartetes und tatsächlich beobachtetes Ergebnis sowie Belegpfade. Passwörter, Tokens, nicht benötigte Browser-/Tenantdaten und echte Fallreferenzen gehören nicht in öffentliche Nachweise. Der technisch gemeinsame Paketcode und die getrennten Mirrorumstellungen bleiben erkennbar.

Aktueller Status ist durchgehend **ausstehend**. Nach Ausführung sind «bestanden», «nicht bestanden» oder «nicht ausgeführt mit Grund» zulässig. Ein Ersatznachweis wird mit Methode und Grenzen dokumentiert, nie still als identischer Hosttest umetikettiert. Bei Abweichung oder unzureichender Beobachtbarkeit anhalten und den konkreten offenen Punkt vorlegen. Eigene Netzwerkregeln, Zoomwerte und freigegebene Testpräferenzen gezielt zurücknehmen. Kein allgemeiner Browserdatenreset.

Diese Matrix erweitert weder Fachfreigaben noch den Installationsauftrag. GitHub, steimer.ch-P, Root-Webauftritt, Sitemap, M365-Berechtigungen, AP21-Testapps und E05 bleiben unverändert. Ein bestandener technischer Q-Lauf ist keine Publikations- oder Betriebsfreigabe.
