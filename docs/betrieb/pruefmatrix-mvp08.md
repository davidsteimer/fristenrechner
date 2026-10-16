# MVP 0.8 Prüfmatrix für E und Q

Stand: 15. Oktober 2026. **Sollmatrix, noch kein Hosttest ausgeführt.** Gilt nur für Paket `0.8.0.0` und Daten `2026-10-15-mvp-08-approved.1` gemäss [Installationsvorlage](eq-installationsvorlage-mvp08.md). Die [lokalen R08-B-Nachweise](releaseartefakte-mvp-08.md) bleiben lokale Prüfungen. Sämtliche hier einzugebenden Fälle sind synthetisch.

## 1 Umfang und Reihenfolge

**E-SP und E-T:** technische Matrix T01–T06 und T08 je Host, dazu T07 als gemeinsame Vor-Q-Prüfung auf beiden Q-Hosts. Fachliches Gate mindestens A01, A09, B01–B03, B05 sowie C01, C03 und C04. Danach beide historischen AP5-Ansichten gemäss T09. Vor jeder Q-Konfigurationsänderung den unveränderten Q-Format-7-Betrieb unter dem bereits gemeinsam ausgelieferten Code prüfen. Ein Fehler hält die Q-Umstellung an.

**Q-SP und Q-T:** nach bestandenem T07 technische Matrix T01–T06 und T08 sowie alle A-, B- und C-Fälle. Die vier zusätzlichen Stadienvarianten aus Abschnitt 2 vollständig auf Q-SP rechnen, auf Q-T zusätzlich deren Auswahl und Übergänge prüfen. Kein vollständiger mathematischer Neutest sämtlicher Kombinationen im Browser wird behauptet. Lokale Kernprüfungen decken die übrigen Kombinationen ab.

DE/FR je Host: A01, B01, B02 und C03 in beiden Sprachen, dazu die tatsächlichen Kalenderdateien nach T08. Reale Geräte, Gast und manuelle Q-Abnahme sind getrennte menschliche Nachweise. Eine alte Abnahme zählt nicht als neue Prüfung.

## 2 Zwölf neue Verfahrenspfade

Gemeinsam: tatsächlicher Empfang **02.10.2026**, Sitz TI beziehungsweise GR, Erlass **LPAmm (TI)** beziehungsweise **VRG (GR)**. Fallkonstellation ausdrücklich «Allgemeines kantonales Verfahren, tatsächlicher Empfang, keine Abweichung». Bei GR-Gericht ausdrücklich «Keine ausdrückliche Dringlichkeitsverfügung». Gesetzliche Dauer nicht überschreiben, angeordnete Dauer zehn Tage eingeben. Jeder Fall muss berechenbar sein, Export erlauben und den richtigen Pfad sowie neuen Datenrelease ausweisen.

| Fall und Pfad | Stadium | Verfahrenshandlung | Tage | Sollablauf |
| --- | --- | --- | ---: | --- |
| A01 `ti-80-30` | Verwaltungsbeschwerde | Ordentliche Verwaltungsbeschwerde | 30 | 02.11.2026 |
| A02 `ti-84-30` | Gerichtsverfahren | Ordentliche Beschwerde an das Gericht | 30 | 02.11.2026 |
| A03 `ti-reply` | Gerichtsverfahren | Angeordnete Stellungnahme / Vernehmlassung | 10 | 12.10.2026 |
| A04 `ti-provisional-15` | Verwaltungsbeschwerde | Beschwerde gegen vorsorgliche Massnahme | 15 | 19.10.2026 |
| A05 `ti-advance` | Gerichtsverfahren | Vorschuss für Verfahrenskosten | 10 | 12.10.2026 |
| A06 `gr-32-30` | Verwaltungsbeschwerde | Ordentliche Verwaltungsbeschwerde | 30 | 02.11.2026 |
| A07 `gr-32-10` | Verwaltungsbeschwerde | Beschwerde gegen verfahrensleitende Anordnung | 10 | 12.10.2026 |
| A08 `gr-admin-ordered` | Verwaltungsverfahren | Behördlich angesetzte Tagesfrist | 10 | 12.10.2026 |
| A09 `gr-52-30` | Gerichtsverfahren | Ordentliche Beschwerde an das Gericht | 30 | 02.11.2026 |
| A10 `gr-52-10` | Gerichtsverfahren | Gerichtsbeschwerde gegen verfahrensleitende Anordnung | 10 | 12.10.2026 |
| A11 `gr-42-10` | Gerichtsverfahren | Prozessbeschwerde | 10 | 12.10.2026 |
| A12 `gr-court-ordered` | Gerichtsverfahren | Gerichtlich angesetzte Tagesfrist | 10 | 12.10.2026 |

Zusätzliche zulässige Stadien desselben Pfads, keine neuen Fachpfade: A03 und A05 auch Verwaltungsbeschwerde, A04 auch Gericht, A08 auch Verwaltungsbeschwerde. Gleiche Datums-/Tagesvorgaben und gleiche Ergebnisse. Nach Stadiumwechsel Fallkonstellation ausdrücklich neu setzen.

Sollwerte: [tatsächliche MVP08-Pakettests](../../spfx/test-build/mvp08-harness.cjs) und [abgenommene Kernfälle](../../tests/core/ap23d1-deadline.test.ts). Keine neue juristische Auslegung oder Fallfreigabe.

## 3 Neue Grenzen und Unterschiede

| Fall | Explizite Eingaben | Soll |
| --- | --- | --- |
| B01 TI-O2 | A01, Empfang 17.02.2027 | Gesperrt, kein definitives Resultat und kein Export. Verständliche Diagnose zum betroffenen 19.03.2027 |
| B02 GR Sommer und Dringlichkeit | A09, Empfang 10.07.2027. Danach ausdrückliche gerichtliche Dringlichkeit setzen. Vergleich A06 mit gleichem Empfang | Gericht ohne Dringlichkeit 10.09.2027. Nach Dringlichkeitswechsel altes Ergebnis sofort weg, neu gerechnet 09.08.2027. Verwaltungsbeschwerde ebenfalls 09.08.2027 |
| B03 Angeordnete GR-Gerichtsfrist | A12, Empfang 20.07.2027, zehn Tage, zuerst ohne, dann mit ausdrücklicher Dringlichkeit | Ohne 25.08.2027, mit 30.07.2027 |
| B04 Behördenort TI/GR | A08, Empfang 18.03.2027, ein Tag. Vergleich A05 mit demselben Datum/einem Tag | GR 19.03.2027, TI 22.03.2027. Kein zusätzlich frei zu bestimmender Feiertagskanton |
| B05 Fehlende Fakten und Wechsel | Nach positivem A01 Fallkonstellation auf «Nicht geklärt», danach auf Spezialrecht/abweichende Fallkonstellation setzen. Positiven A09-Fall auf Verwaltungsverfahren umstellen | Resultat und Export entfernt, erneute Fachqualifikation nötig. Bei nur einer Handlung feste Anzeige statt Scheinauswahl. Keine stillschweigende allgemeine Freigabe |
| B06 Untergrenze | A08 mit einem Tag, Empfang 28.08.2026, danach 29.08.2026 | Zuerst gesperrt, Kontrollfall 31.08.2026 |
| B07 Obergrenze | A08 mit einem Tag, Empfang 30.12.2027, danach 31.12.2027 und 01.01.2028. Zusätzlich A01 mit Empfang 17.12.2027 | Erster Fall 31.12.2027. Die drei anderen gesperrt ohne Export, auch wenn der Empfang noch in 2027 liegt |

Bei angeordneten Fristen zusätzlich leere Dauer prüfen: kein definitives Ergebnis. Bei gesetzlicher Frist ist die gebundene Dauer nicht frei überschreibbar. Nicht im GUI erreichbare Vertragsmanipulationen bleiben lokale Negativtests, keine Browser-Scheinfälle.

B01/B02 und Invalidierung stützen sich auch auf die [Komponententests](../../tests/ui/ap23d3-app.test.tsx), B03/B04/B06/B07 auf die oben verlinkten Kernfälle. Ihr Ergebnis wird hier nicht bereits als Hostpass eingetragen.

## 4 Bestandsfunktionen und Rechenspur

| Fall | Explizite Eingaben | Soll |
| --- | --- | --- |
| C01 BE-Ausgangsfall | StPO, Sitz BE, Partei ohne Vertretung in BE, 16.09.2026, zehn Tage | 28.09.2026 und Export |
| C02 Gerichtssitz und ZPO-Spur | Sitz TI, ZPO ordentlich, 07.12.2026, ein Tag. Danach Sitz BE, ZPO ordentlich, 17.12.2026, fünf Tage | TI 09.12.2026 ohne doppelten freien Feiertagskanton. BE 07.01.2027, verständliche Stillstandsperiode und Art. 145, technische IDs nur in den technischen Details |
| C03 Sozialrecht und ATSG-Spur | Sitz BE, VRPG → Sozialversicherung → AHVG → Einsprache, zuständige kantonale Ausgleichskasse BE, Partei ohne Vertretung in BE, Empfang 17.12.2026, gesetzliche Dauer 30 Tage | 01.02.2027, verständliche ATSG-Spur einschliesslich Art. 38 Abs. 4. Elf bestehende Sozialerlasse weiterhin auswählbar |
| C04 Januargrenze | StPO, Sitz BE, Partei ohne Vertretung in SG, 01.01.2029, ein Tag. Kontrollfall 01.01.2027 | 2029 Vergleich 02./03.01.2029, gesperrt ohne definitives Resultat/Export. 2027 gleiches rechtliches Ergebnis 04.01.2027, Export erlaubt |
| C05 Regionale Grenzen | StPO, Sitz BE, Partei ohne Vertretung in NE, 26.05.2027, ein Tag, Le Landeron offen/Nein/Ja. Danach bei unverändertem Sitz BE Partei in GR, 16.09.2026, zehn Tage | NE offen gesperrt, Nein 27.05., Ja 28.05.2027, Vorbehalt sichtbar. GR 28.09.2026 mit Bundesrechtsgrenze. Diese Grenze nicht in den eigenen GR-Verwaltungspfad hineintragen |
| C06 BE-VRPG und Sozialgrenze | Allgemeines VRPG, 04.09.2026, zehn Tage. EOG-Einsprache gemäss vollständigem F08/F09 der MVP07-Matrix, spezifischer Wohnsitz leer, dann ZH, danach vollständiger BE-Fall 18.11.2027 | Allgemeines VRPG 14.09.2026. Alle drei EOG-Grenzfälle gesperrt ohne definitives Resultat/Export |

C02/C03 sind durch die abgenommenen [UX-Fälle](../../tests/ui/ap23d2-ux-app.test.tsx) und Komponententests gebunden. Die [historische MVP07-Matrix F08/F09](pruefmatrix-mvp07.md) konkretisiert die unveränderten EOG-Fakten. Die Release-ID wird im tatsächlichen Regel-/Kalenderstand geprüft. Ein nicht implementierter Anzeigeort in der Rechenspur wird nicht verlangt.

## 5 Technische Hostmatrix

| ID | Ausführung und Erfolgskriterium |
| --- | --- |
| T01 Identität | Katalog-/Appversion 0.8.0.0 und tatsächliches Hauptbundle, Provider, Mirrorpfad und Manifest prüfen. Keine neuen Rechte. Alle übrigen Konfigurationseigenschaften frisch vor/nach Umstellung vergleichen |
| T02 Rohbytes und Erstabruf | Vollständiger Soll-/Ist-Vergleich aller 42 Dateien je Ziel. Erstabruf im tatsächlichen Host/Speicherkontext beobachten, mit URL, HTTP-Status und Antwortbytes zuordnen. Warmer Cache oder reine Releaseanzeige genügt nicht. Kein originweiter Reset |
| T03 Quellenwechsel und Fehlabruf | Vor Wechsel fehlenden exakt neuen Cacheeintrag nachweisen, möglichst eigene frische Prüfsitzung. Nur neuen Manifestrequest lokal begrenzt blockieren. Neue Quelle darf weder Altresultat/Export noch fremden Cache weiterverwenden. Eigene Regel entfernen, Wiederanlauf und Antwortbytes aller 42 Dateien prüfen. Ein unzuverlässiger UI-Sperrzähler ersetzt keinen tatsächlich fehlgeschlagenen Request. Andere Browser-/Serverressourcen nicht sperren |
| T04 Datum und Invalidierung | Frühe Datumseingabe, Vollformat, Tag, Tag.Monat und `h` mit Enter, Tab und Blur. Lokalen Testtag protokollieren. Ungültiges Datum blockiert. Unbestätigter Datumstext, neuer Pfad, Stadium, Qualifikation oder Dringlichkeit entfernen Ergebnis/Export sofort. Neuberechnung ausdrücklich auslösen |
| T05 Standards | Vor erstem Format-8-Laden beide Standardschlüssel mit Existenz und Rohbytes sichern. Migration eigener v4-Testwerte nach v5 ohne Fallfakten. Speichern/Reload erhält nur stabile Auswahl, keine Empfangsdaten, Referenz, Qualifikation oder Dringlichkeit. Resetmarker verhindert Wiederaufleben alter Standards. Alten Schlüssel unverändert erhalten. Gemeinsame Kontexte seriell und fremde Werte unangetastet |
| T06 DE/FR und Darstellung | Wirklicher SharePoint-/Teams-Host breit zweispaltig, schmal ohne Überlauf oder abgeschnittene relevante Texte. Tatsächlichen 200-Prozent-Zoom und Tastaturfokus prüfen. Datum linksbündig mit Format-/Hilfetext. Automatische Feiertagsbindung und verständliche Rechenspur. Teamsnavigation beobachten, nicht aus lokaler Vorschau ableiten |
| T07 Noch nicht umgestellte Verbraucher | Nach Katalogwechsel Q vor dessen Konfigurationsumstellung unter neuem Code mit bisherigem Format-7-Mirror und C01 prüfen. Nach E-Gate Q umstellen. Keine alte Q-Konfiguration oder AP5 zur Rettung einer neuen Format-8-Konfiguration verwenden |
| T08 Kalenderdateien | Je aktuellem Host A01 DE und FR tatsächlich speichern, zusammen acht Dateien. Eindeutige synthetische Referenz `QA-MVP08-{Host}-{Sprache}`. Beginn 02.11.2026, exklusives Ende 03.11.2026, frei, Kategorie Fristablauf, Erinnerung −112 Stunden, passender Betreff und administrative Rechts-/Datenherkunft. SHA, UTF-8/CRLF, Faltung, UID und keine fremden Teilnehmenden/Anhänge prüfen. Kein Outlook-Import |
| T09 AP5 | Historische SharePoint-Seite und Teams-Alias: expliziter alter Pin, Release `2026-08-29-ap5-approved.1` und neues Bundle. Acht historische Datenfiles gegen Sollbytes prüfen, tatsächlichen Quellabruf/Wiederverwendung sauber unterscheiden. C01 ergibt 28.09.2026. Keine historische Publikation oder Standardspeicherung |

T03 dient nur dem gebundenen Quellenwechsel. Keine Manipulation freigegebener Mirrordateien. Ist eine notwendige Browserbeobachtung nicht möglich, bleibt der Test mit Grund offen, bis ein gleichwertiger Nachweis oder ein ausdrücklicher Restpunkteentscheid vorliegt. Eigene Netzwerkregeln, Zoomänderungen und Testpräferenzen anschliessend gezielt zurücknehmen. Die vollständige lokale Fallregression wird nicht unnötig im Browser nachgebaut, die reale Hostintegration aber auch nicht durch lokale Tests ersetzt.

## 6 Menschliche Prüfungen und Abschluss

| ID | Nachweis durch David |
| --- | --- |
| M01 Geräte | Reale mobile Teams- und SharePoint-Ansicht, Datumseingabe und neue TI-/GR-Auswahl, Ergebnis/Spur. Gerät, Betriebssystem, Browser/App und Tastatur nennen. VoiceOver separat prüfen oder offen kennzeichnen. Der akzeptierte iPad-Magic-Keyboard-Befund bleibt qualifiziert |
| M02 Gast | Bestehenden B2B-Gast in zulässiger Umgebung tatsächlich auf Q-SP und Q-T anmelden. Neuen Datenstand, A01, B01 und einen gespeicherten Export bestätigen. Conditional Access nicht umgehen, Eigentümerprüfung ist kein Gastnachweis |
| M03 Fachliche Q-Abnahme | Paket-/Datenbindung und konkret dokumentierte Restpunkte ausdrücklich abnehmen. Keine Ableitung aus M01/M02 oder technischen Teilprüfungen allein |

Jeder Eintrag nennt Ziel, Fall/Variante, Paket-/Bundle-/Datenstand, Zeitpunkt, Gerät/Browser und Kontoart, vollständige Eingaben, tatsächliches Ergebnis und Belegpfad. Zulässige Status sind bestanden, nicht bestanden und nicht ausgeführt mit Grund. Wiederverwendung erhält ihren ursprünglichen Nachweistyp und eine konkrete Begründung.

Die [Outlook-Wiederverwendung](outlook-wiederverwendung-mvp08.md) ist ein gesonderter offener Entscheid. Die Serialisierung ist wegen der optionalen Beschreibungsergänzung nicht vollständig bytegleich. Neue administrative Herkunftsangaben werden hier frisch geprüft. Alte Importe belegen weder deren aktuelle Darstellung in Outlook noch Erinnerungszustellung oder Kategorienfarbe. R08-C ist keine GitHub-/P- oder Betriebsfreigabe.
