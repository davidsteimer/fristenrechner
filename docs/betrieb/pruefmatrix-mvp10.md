# MVP 0.10 Prüfmatrix für E und Q

Fassung 1.0, 29. Oktober 2026. **Sollmatrix. Alle tatsächlichen Host-, Geräte-, Gast- und Abnahmeprüfungen sind ausstehend.** Diese Vorbereitung erteilt keine Installations-, Upload- oder Betriebsfreigabe. Massgebend sind die gesonderte [E-/Q-Installationsvorlage](eq-installationsvorlage-mvp10.md), ihre private Zielbindung und die vor dem Vollzug frisch erhobene Ausgangslage.

Gebundener Sollstand: Anwendung `0.10.0`, Paket `0.10.0.0`, SHA-256 `7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd`, Datenrelease `2026-10-28-mvp-010-approved.1`, Manifest SHA-256 `7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016`. Format und Mindestconsumer `17.0.0`, Verwaltungsverfahrenskatalog `10.0.0`, **44 Komponenten plus Manifest**. Der [lokale R10-B-Nachweis](lokaler-releaseabschluss-mvp10.md) und seine [Abschlussquittung](../../outputs/release-mvp10-2026-10-28/local-completion.json) belegen lokale Prüfungen, keine M365-Installation.

## 1. Ziele und Ausführungsreihenfolge

| Kürzel | Bestehendes Ziel, technisch frisch zu bestätigen | Status |
| --- | --- | --- |
| E-SP | Aktueller Rechner auf «Fristenrechner Test» | Ausstehend |
| E-T | Aktuelle Rechnerregisterkarte im Team «Entwicklungsumgebung», Kanal «Fristenrechner» | Ausstehend |
| Q-SP | Aktueller Rechner auf «Fristenrechner Gastdemo» | Ausstehend |
| Q-T | Bestehende Rechnerregisterkarte im Team «Fristenrechner Gastdemo Teams», Kanal «Fristenrechner» | Ausstehend |

URL, Site-, App-, Webpart- beziehungsweise Tabidentität, Provider und Datenkonfiguration müssen der privaten Zielbindung entsprechen. Ein Anzeigename allein identifiziert kein Ziel. Die nachstehende Hostmatrix erlaubt weder neue Sites oder Testseiten noch Tabkopien, weitere Installationen oder Berechtigungsänderungen.

**E-Gate vor Q:** Auf E-SP und E-T jeweils T01–T06, T08 und T10, A01, A05, A06, A08, A15, A17, A18, A19, A21, A23–A25, B01, B05, B07–B13, B15–B18, B20–B22 und C01, C03, C04 ausführen. Mehrteilige Zeilen vollständig prüfen. Zusätzlich T07 auf beiden noch nicht umgestellten Q-Hosts und T09 auf den beiden historischen AP5-Ansichten durchführen. Ein offener oder fehlgeschlagener Gatefall hält die Q-Umstellung an. Ein örtlich nicht bedienbarer oder unzureichend beobachteter Test gilt nicht als bestanden.

**Technisches Q-Gate:** Auf Q-SP und Q-T jeweils alle A01–A25, B01–B22, C01–C06 sowie T01–T06, T08 und T10 durchführen. T07 und T09 bleiben durch ihre vor der Q-Umstellung aufgenommenen Belege gebunden. Die Matrix wiederholt bewusst nicht sämtliche 245 Pfade und deren Kombinationen manuell. Sie prüft auf jedem Q-Host einen konkreten positiven Verwaltungsfall je ausserbernischem Kanton, den Berner Bestand und die unterschiedlichen neuen Regelmechanismen. Die vollständige lokale Pfadregression bleibt ein eigener Nachweis.

**DE/FR:** Die Fälle A23–A25, B09, B15–B18, B21/B22 und C03 auf jedem aktuellen Host in beiden Sprachen prüfen, soweit sie dort zum Gate gehören. Alle 25 Kantone und ihre Erlasse auf Q in beiden Sprachen anzeigen. T06 umfasst DE/FR bei tatsächlichem Browserzoom. T08 verlangt acht eindeutige gespeicherte Hostdateien. Produktsprachen bleiben DE/FR, IT/RM ist nicht Teil dieses Releases.

Geräteprüfung, reale Gastanmeldung, fachliche Q-Abnahme und Outlook-Entscheid bleiben die getrennten menschlichen Schritte M01–M04. Alle Gates sind **ausstehend**.

**Kennungsraum:** `A01` bis `M04` bezeichnen innerhalb dieser Datei Prüfzeilen, insbesondere sind `Prüffall C01–C06` die Bestandsfälle aus Abschnitt 5. Gleich benannte `Ablaufgates C01–C06` der Installationsvorlage sind andere Kennungen. Im Vollzugsnachweis ist deshalb jeweils «Prüffall» oder «Ablaufgate» samt Dokument zu nennen, nicht nur die nackte Kennung.

## 2. Bindung der synthetischen Fallvorgaben

Die folgenden Quellenkürzel bezeichnen bereits geprüfte lokale Testeingänge. Die jeweilige Fallkennung ist innerhalb der angegebenen Datei eindeutig. Sämtliche dort enthaltenen Fallfakten gehören zur Vorgabe, auch wenn die Tabelle nur die entscheidenden Unterschiede wiederholt. Im GUI werden die vorhandenen aktuellen Qualifikationen ausdrücklich gesetzt und feste Anzeigen kontrolliert. Technische Kennungen in dieser Matrix sind keine zusätzlich einzubauenden Produktfelder. Keine Fakten aus gespeicherten Standards ableiten und keine nicht angebotenen Eingaben über manipulierte Browserobjekte erfinden.

| Kürzel | Gebundene Referenz |
| --- | --- |
| V09 | [MVP09-Hostmatrix](pruefmatrix-mvp09.md), deren genaue A-/B-/C-Eingaben und verlinkte geprüfte Referenzen. Aktueller Datenstand in dieser Matrix ist immer MVP10, ausser T07/T09 |
| F | [AP23F2, `results[].id`, Eingaben `syntheticInput`](../../outputs/ap23f2-2026-10-22/QA-AP23F2.json) |
| G | [AP23G2, `results[].id`, Eingaben `input`](../../outputs/ap23g2-2026-10-22/QA-AP23G2.json) |
| H | [AP23H2, `results[].id`, Eingaben `input`](../../outputs/ap23h2-2026-10-22/QA-AP23H2.json) |
| I | [AP23I2, `results[].id`, Eingaben `input`](../../outputs/ap23i2-candidate-2026-10-22/QA-AP23I2.json) und [native I3-Fälle](../../tests/core/ap23i3-core.test.ts) |
| J | [AP23J2, `results[].id`, Eingaben `input`](../../outputs/ap23j2-candidate-2026-10-27/QA-AP23J2.json) und [native J3-Eröffnungsfälle](../../tests/core/ap23j3-core.test.ts) |
| K | [AP23K2, `results[].id`, Eingaben `input`](../../outputs/ap23k2-candidate-2026-10-27/QA-AP23K2.json) und [native K3-Fälle](../../tests/core/ap23k3-core.test.ts) |
| L | [AP23L2, `results[].id`, Eingaben `input`](../../outputs/ap23l2-candidate-2026-10-27/QA-AP23L2.json) und [native L3-Fälle](../../tests/core/ap23l3-core.test.ts) |
| M | [AP23M2, `results[].id`, Eingaben `input`](../../outputs/ap23m2-candidate-2026-10-28/QA-AP23M2.json) und [native M3-Fälle](../../tests/core/ap23m3-core.test.ts) |
| P10 | [Tatsächlicher MVP10-Paketadapter mit drei neuen Pfaden](../../spfx/test-build/mvp10-harness.cjs), [Paketfälle](../../spfx/test-build/mvp10-consumer.test.cjs) und [Exportfälle](../../spfx/test-build/mvp10-export.test.cjs) |
| U1 | [Abgenommener U1-Nachtrag](../ux/abnahme-r10-u1.md), [frühe/späte Abbruchfälle](../../tests/ui/r10-u1-trace-before-provenance.test.tsx), [Sozialinteraktion](../../tests/ui/r10-u1-social-app.test.tsx) und [tatsächlicher MVP10-Einstieg](../../tests/ui/mvp10-release.test.tsx) |

Die ursprünglichen Referenzberichte enthalten absichtlich Referenzstatus und eine damalige Exportsperre. **Nur ihre fachlichen Eingaben, Datenwerte, Sperren und Rechenmechanismen werden übernommen.** Für einen gültig qualifizierten positiven Fall mit dem hier gebundenen freigegebenen Datenrelease gilt ein definitives Resultat mit Kalenderexport. Ein negativer Fall bleibt ohne definitives Enddatum und ohne Kalenderexport. Die frühere Kandidatensperre wird nicht als Soll des MVP10-Hosts ausgegeben. Diese Übernahme ändert keine Fachregel oder Abnahme.

## 3. Kantonsabdeckung und positive Hostfälle

Jede Zeile ist auf beiden Q-Hosts auszuführen. Das Datum bezeichnet den in der Referenz bereits qualifizierten Auslöser. Bei den hier gewählten positiven Grundfällen wird keine ungeklärte Rohzustellung als rechtliche Eröffnung behandelt. Gesetzliche Tageswerte sind fest gebunden, angeordnete Tageswerte werden ausdrücklich eingegeben. Die aktuelle Fallqualifikation ist nach jedem Pfad- oder Erlasswechsel neu zu setzen.

| ID | Kanton / lokale Pfade | Konkreter Pfad und Stadium | Auslöser / Tage | Sollablauf | Referenz |
| --- | --- | --- | --- | --- | --- |
| A01 | TI / 5 | `ti-80-30`, ordentliche Verwaltungsbeschwerde | 02.10.2026 / 30 | 02.11.2026 | V09 A01 |
| A02 | GR / 7 | `gr-32-30`, ordentliche Verwaltungsbeschwerde | 02.10.2026 / 30 | 02.11.2026 | V09 A06 |
| A03 | LU / 4 | `lu-admin-30`, ordentliche Verwaltungsbeschwerde | 02.10.2026 / 30 | 02.11.2026 | V09 A13 |
| A04 | ZG / 4 | `zg-admin-20`, ordentliche Verwaltungsbeschwerde | 02.10.2026 / 20 | 22.10.2026 | V09 A17 |
| A05 | AR / 5 | `ar-execution-5`, qualifizierter Nichtgeldvollstreckungsrekurs | 02.10.2026 / 5 | 07.10.2026 | V09 A22 |
| A06 | ZH / 4 | `zh-rekurs-30`, Rekurs im Verwaltungsbeschwerdeverfahren | 02.10.2026 / 30 | 02.11.2026 | F ZH01 |
| A07 | AG / 5 | `ag-admin-30`, ordentliche Verwaltungsbeschwerde | 02.10.2026 / 30 | 02.11.2026 | F AG01 |
| A08 | SG / 8 | `sg-admin-14`, ordentlicher Rekurs an die Verwaltungsinstanz | 02.10.2026 / 14 | 16.10.2026 | F SG01 |
| A09 | UR / 5 | `ur-admin-20`, ordentliche Verwaltungsbeschwerde | 02.10.2026 / 20 | 22.10.2026 | G UR01 |
| A10 | SO / 5 | `so-admin-10`, ordentliche Verwaltungsbeschwerde | 02.10.2026 / 10 | 12.10.2026 | G SO01 |
| A11 | SH / 6 | `sh-admin-20`, ordentlicher Rekurs | 02.10.2026 / 20 | 22.10.2026 | G SH01 |
| A12 | OW / 7 | `ow-admin-20`, ordentliche Verwaltungsbeschwerde | 02.10.2026 / 20 | 22.10.2026 | H B01 |
| A13 | NW / 14 | `nw-admin-20`, ordentliche Verwaltungsbeschwerde, keine abweichende Fristvereinbarung | 02.10.2026 / 20 | 22.10.2026 | H B08 |
| A14 | GL / 19 | `gl-admin-30`, ordentliche Beschwerde, geltendes VRG und keine Art.-90-Ausnahme | 02.10.2026 / 30 | 02.11.2026 | I GL-ADMIN-30-BASIC |
| A15 | TG / 15 | `tg-admin-ordered`, angeordnete Eingabe im Verwaltungsverfahren | 02.10.2026 / 7 | 09.10.2026 | I TG-ADMIN-ORDERED-BASIC |
| A16 | FR / 11 | `fr-nontc-ordered`, angeordnete Eingabe ausserhalb des Kantonsgerichts | 02.10.2026 / 10 | 12.10.2026 | J FR-R01 |
| A17 | GE / 7 | `ge-admin-ordered`, angeordnete Eingabe im erstinstanzlichen Verfahren | 02.09.2026 / 30 | 02.10.2026 | J J1-GE-R01 |
| A18 | JU / 18 | `ju-admin-ordered`, angeordnete Eingabe im Verwaltungsverfahren | 22.06.2027 / 1 | 24.06.2027 | J JU-J1-R01 |
| A19 | BS / 8 | `bs-internal-register-10`, Anmeldung des verwaltungsinternen Rekurses | 02.10.2026 / 10 | 12.10.2026 | K K1-BS-R01 |
| A20 | BL / 8 | `bl-admin-appeal-10`, ordentliche Verwaltungsbeschwerde | 02.09.2026 / 10 | 14.09.2026 | K K1-BL-R01 |
| A21 | AI / 18 | `ai-admin-ordered`, erstinstanzliche Eingabe, innerer Kantonsteil | 02.10.2026 / 10 | 12.10.2026 | L L1-AI-R01 |
| A22 | SZ / 13 | `sz-admin-appeal-20`, Verwaltungsbeschwerde, zuständige Stelle in Schwyz, keine qualifizierte Ausnahme | 02.10.2026 / 20 | 22.10.2026 | L L1-SZ-R01 |
| A23 | NE / 16 | `ne-court-ordered`, angeordnete Eingabe im allgemeinen Gerichtsverfahren | 02.10.2026 / 10 | 12.10.2026 | M M1-NE-COURT-ORDERED-BASE, P10 |
| A24 | VD / 19 | `vd-admin-ordered`, gültige angeordnete Eingabe, rechtlich qualifizierte Eröffnung | 02.10.2026 / 10 | 12.10.2026 | M M1-VD-VD-ADMIN-ORDERED-BASE, P10 |
| A25 | VS / 14 | `vs-court-ordered`, angeordnete Eingabe im Gericht | 02.10.2026 / 10 | 12.10.2026 | M M1-VS-COURT-ORDERED-BASE, P10 |

Die Pfadzahlen stammen aus dem [gebundenen Laufzeitkatalog](../../data/releases/2026-10-28-mvp-010-approved.1/administrative-procedures/ch-cantonal-administrative-procedures.json). Sie ergeben **245 Pfade für 25 Kantone**. Bern bleibt das getrennte Bestandsprofil mit neun Regeln und wird unter C geprüft. Dies ist Abdeckung des vereinbarten allgemeinen Umfangs, keine Behauptung vollständiger kantonaler Spezialrechte. Die 25 Hostfälle sind keine 245 manuellen Pfadnachweise.

## 4. Eigenständige Regelmechanismen und Grenzen

«Gesperrt» bedeutet in allen Zeilen: kein definitives Enddatum und kein Kalenderexport. Ein vorher gültiges Resultat darf nach geänderten Eingaben nicht stehen bleiben. Die Referenzkennung bindet sämtliche aktuellen Fakten. Bei nicht im GUI angebotenen technischen Negativwerten bleibt die lokale Kern-/Vertragsprüfung massgebend, sie werden nicht künstlich als Browserbedienung erzeugt.

| ID | Vollständige synthetische Variante und Referenz | Soll |
| --- | --- | --- |
| B01 Gericht, Verwaltung und Kollision ZH | F ZH05/06: `zh-rekurs-30` und `zh-court-30`, 10.07.2027, 30 Tage. F ZH14/13: Gericht, 18.02./17.02.2027, 30 Tage | Verwaltung 09.08.2027, Gericht 10.09.2027. Kollision vom 18.02. gesperrt, Kontrolle 19.03.2027. Keine freie Ausschaltung des gesetzlichen Stillstands |
| B02 Eigenständige Behördenkalender | F AG09: `ag-admin-ordered`, 26.05.2027, ein Tag. G SO09/SO13: `so-admin-ordered`, 26.05.2027 beziehungsweise 07.12.2026, je ein Tag | AG und SO im ersten Fall 28.05.2027. SO im zweiten Fall 08.12.2026. Gebundene Verfahrenskalender, keine unaufgeforderte freie Gemeindeauswahl oder Vereinigung aller regionalen Feiertagslisten |
| B03 UR-Lokalgrenze, Begründungsstufen und SH | G UR03/N17: `ur-admin-ordered`, 02.10.2026, zehn Tage, kein zusätzlich relevanter örtlicher Feiertag versus konkret möglicher ungeklärter örtlicher Endtagseinfluss. G UR23/N31: `ur-admin-20`, 16.10.2026, 20 Tage, neu begründeter Entscheid nach rechtzeitigem beziehungsweise ungeklärtem vorherigem Begründungsersuchen. G SH22: `sh-court-reasons-30`, 23.12.2026, 30 Tage, qualifiziertes Ersuchen um Gerichtsbegründung | UR-Eingabe positiv 12.10.2026, ungeklärte Lokalwirkung gesperrt. UR-Rechtsmittel positiv 05.11.2026, ungeklärte vorherige Anforderung gesperrt. SH 01.02.2027. Begründungsersuchen und neue Rechtsmitteleröffnung getrennt halten |
| B04 NW und OW abweichende Stillstände | H NW01/NW02: Verwaltungseingabe `nw-admin-ordered` versus Einwendung `nw-einwendung-ordered`, 10.12.2026, 20 Tage. H OW05: `ow-court-suspensive-5`, 23.12.2026, fünf Tage | NW Verwaltung 30.12.2026, Einwendung 15.01.2027. OW Sonderfall 28.12.2026 ohne allgemeinen Gerichtsstillstand |
| B05 GL Ausnahme und TG Hinweis | I GL-ADMIN-30-WINTER / GL-ADMIN-30-EXCEPTION-WINTER: 14.12.2026, 30 Tage, ordentlicher Weg versus qualifizierte Ausnahme. Native I3: `tg-vg-execution-5`, 14.12.2026, fünf Tage, aktueller Ausnahmehinweis gegeben beziehungsweise nicht gegeben | GL 29.01.2027 beziehungsweise 13.01.2027. TG mit Hinweis 21.12.2026, ohne Hinweis 04.01.2027. Ungeklärter TG-Hinweis gesperrt. Der Wechsel entfernt altes Resultat/Export |
| B06 FR Stufen und JU vorsorgliches Verfahren | J FR-R04/05: `fr-tc-ordered` versus `fr-nontc-ordered`, 14.07.2027, drei Tage. J JU-J1-R03/04: Zwischenentscheid im Einspracheverfahren, 17.12.2026, zehn Tage, ordentlich versus echtes vorsorgliches Verfahren | FR Gericht 18.08.2027, ausserhalb Gericht 19.07.2027. JU ordentlich 12.01.2027, vorsorglich 28.12.2026. Keine Sozialfreigabe aus dem kantonalen Weg ableiten |
| B07 GE tatsächlicher Empfang und qualifizierte Eröffnung | Native J3: `ge-recours-30`, 05.09.2026, 30 Tage. Erst gewöhnlicher Posteingang, dann bereits rechtlich qualifizierte Eröffnung desselben Datums | Posteingang ergibt rechtliche Eröffnung 07.09., Zählbeginn 08.09. und Ablauf 07.10.2026. Bereits qualifiziert ergibt Zählbeginn 06.09. und Ablauf 05.10.2026. Keine doppelte Eröffnungsverschiebung |
| B08 BS Anmeldung und Begründung, Feiertagsrolle | K K1-BS-R01 sowie nativer K3-Fall: `bs-internal-register-10` und separat `bs-internal-reasons-30`, beide vom ausdrücklich qualifizierten 02.10.2026. K K1-BS-R13/14: `bs-court-register-10`, 28.11.2026, zehn Tage, rechtlich bestimmte Partei-/Vertretungsanknüpfung BS beziehungsweise TI | Anmeldung 12.10., separat berechnete Begründung 02.11.2026. Keine automatische Verkettung ab Anmeldeablauf. Gericht mit BS-Anknüpfung 08.12., mit TI 09.12.2026. Feld bezeichnet die Partei-/Vertretungsrolle, kein beliebiger «Feiertagskanton» |
| B09 BL Büroschliessung und ungewisser Endtag | K K1-BL-R05: bewilligte Begründungsfrist `bl-admin-reasons-granted`, 30.11.2026, 30 Tage. K K1-BL-R15: `bl-admin-appeal-10`, 30.01.2027, zehn Tage | Erster Fall nominal 30.12.2026, Ende 04.01.2027, keine Stillstandstage. Büroschliessung ist Endverschiebung und kein neuer Feiertagsname. Zweiter Fall wegen unterschiedlicher vollständiger Vergleichsergebnisse gesperrt, kein definitives Datum |
| B10 AI Eingang und erwartbare Zustellung | L L1-AI-R21/22: `ai-admin-ordered`, 19.09.2026, zehn Tage, innerer Kantonsteil. Einmal bereits qualifizierte Eröffnung, einmal physischer Trackingempfang mit erwartbarer Zustellung und verifiziertem Zugang. L L1-AI-R35/36/37 binden die ungeklärten Eingangsqualifikationen | Qualifiziert 29.09.2026. Tracking rechtliche Eröffnung 21.09. und Ablauf 01.10.2026. Ohne benötigte aktuelle Qualifikationen gesperrt. Keine Übernahme dieser AI-Voraussetzungen in den VD-Postzweig |
| B11 Längere Belehrung getrennt AI/VS | L L1-AI-R33: `ai-internal-notice-long`, 02.10.2026, ordentliche zehn und belehrte 15 Tage, Zwischenbereich ungeklärt. M M1-VS-ADMIN-NOTICE-LONG-BASE: ordentliche 30 und qualifiziert tatsächlich belehrte 40 Tage, 02.10.2026 | AI gesperrt. VS 11.11.2026. Tageszahlen und rechtliche Wirksamkeit müssen aktuell zum Fall passen. Der AI-Zwischenbereich wird nicht auf VS übertragen |
| B12 SZ Martinstag und verlängerte Winterferien | L L1-SZ-R09: `sz-court-execution-10`, Stelle in Schwyz, 01.11.2026, zehn Tage. L L1-SZ-R13/14: `sz-court-ordered` versus qualifiziert ausgenommener Weg, 05.01.2027, ein Tag | Martinstag verschiebt nominal 11.11. auf 12.11.2026. Winterfall ordentlich 08.01., ausgenommen 07.01.2027. Gebundener prozessualer Zusatz bleibt von beliebigen kommunalen Regeln getrennt |
| B13 NE regionale Behördenbindung | M M1-NE-GENERAL-CORPUS-NO / M1-NE-LANDERON-CORPUS-YES: `ne-admin-ordered`, 26.05.2027, ein Tag, zuständige Stelle ausserhalb beziehungsweise in Le Landeron. Region offen lassen und danach A23 als Gerichtskontrolle am gleichen Datum mit einem Tag | Ausserhalb 27.05., Le Landeron 28.05.2027, Region offen gesperrt. Gericht 27.05.2027 mit eigener fester Bindung. NE-Vorbehalt bleibt bei berechenbarem Fall sichtbar. Keine automatische Verwendung des Parteisitzes |
| B14 NE und VD Nachfrist | M M1-NE-ADMIN-EXTENSION-REFUSAL-3-BASE und M1-VD-VD-ADMIN-GRACE-3-BASE: ursprünglich gültige erstreckbare angeordnete Eingabefrist, keine gesetzliche Frist und keine Zahlung. Gesuch nachweislich vor dem ursprünglichen Ablauf gestellt. Die Ablehnung wird am 02.10.2026 rechtlich wirksam eröffnet, ausdrücklich erst nach dem bereits feststehenden ursprünglichen Ablauf. NE zusätzlich Behördenregion ausserhalb Le Landeron und keine individuelle Sistierung. Je drei Tage. Danach die angebotene Gesamtqualifikation auf ungeklärt oder abweichenden Fall umstellen | Beide positive Fälle 05.10.2026. Ohne passende aktuelle Gesamtqualifikation gesperrt. Keine pauschale Dreitageszugabe zum alten Ende. Die gezielten einzelnen Negativwerte «Ablehnung vor/bei ursprünglichem Ablauf» beziehungsweise «ursprüngliche Frist läuft noch» bleiben zusätzlich über M1-NE-REFUSAL-BEFORE-EXPIRY und M1-VD-REFUSAL-BEFORE-ORIGINAL-EXPIRY lokal gebunden, keine erfundene zusätzliche GUI-Auswahl |
| B15 VD Posteingang über Bettagsmontag | M M1-VD-POSTAL-BETTAG-3 / M1-VD-QUALIFIED-SATURDAY-3: `vd-admin-grace-3`, 19.09.2026, drei Tage. Post ohne Unterschrift mit zulässiger Zustellart und bestätigtem Zugang versus bereits qualifizierte Eröffnung | Postzweig rechtliche Eröffnung 22.09., Ablauf 25.09.2026. Bereits qualifiziert 22.09.2026. Fehlende aktuelle Postqualifikation sperrt, Wechsel invalidiert Ergebnis/Export |
| B16 VD Gericht / vorsorglicher Weg | M M1-VD-COURT-ORDERED-WINTER-10 / M1-VD-COURT-PROVISIONAL-NO-WINTER-10, beide 15.12.2026, zehn Tage | Gerichtseingabe 11.01.2027, vorsorglicher Weg 28.12.2026. Gebundene Ausnahme ist keine frei wählbare generelle Gerichtsferienabschaltung |
| B17 VS Winter und Karfreitag | M M1-VS-ADMIN-WINTER / M1-VS-COURT-WINTER: 10.12.2026, 30 Tage. M M1-VS-GOOD-FRIDAY-NOT-HOLIDAY: `vs-admin-ordered`, 25.03.2027, ein Tag | Verwaltung 11.01.2027, Gericht 28.01.2027 mit 19 ausgelassenen Tagen. Karfreitagsfall 26.03.2027. Keine Übertragung fremder Feiertage oder eines bloss bis 02.01. laufenden Gerichtsstillstands |
| B18 Neue Kollision mit echtem Paket | A25 mit 19.03.2027 und einem Tag. M M1-VS-END-RECESS-COLLISION und P10 | Gesperrt wegen Endverschiebung in den anwendbaren Stillstand, kein definitiver Ablauf oder Export. Positive Kontrolle A25 bleibt 12.10.2026 |
| B19 Bestandsgrenzen TI/GR/AR | V09 B01/B02: `ar-court-30` vom 18.02.2027 und `ti-80-30` vom 17.02.2027, je 30 Tage. V09 B07: `gr-52-30`, 10.07.2027, 30 Tage, ohne/mit ausdrücklicher Dringlichkeitsverfügung | AR/TI jeweils mit eigenem Sperrgrund gesperrt. GR 10.09.2027 ohne, 09.08.2027 mit Dringlichkeit. Keine irreführende Übernahme fremder Kantonsdiagnosen |
| B20 Faktenwechsel und gesetzliche Dauer | Jeweils A08, A15, A21 und A25 zunächst ohne aktuelle Gesamtqualifikation, dann positiv, danach «ungeklärt» oder abweichender Fall. Bei A15 angeordnete Dauer leer/0/366 und wieder sieben. Bei A08 gesetzliche 14 beobachten | Ohne passende aktuelle Qualifikation/Dauer kein definitives Resultat. Nach Änderung sofortige Entfernung von Resultat und Export. Gespeicherter Pfad bestätigt keine gegenwärtigen Fakten. Gesetzliche Frist bleibt gebunden |
| B21 U1 frühe Abbruchspur | U1: `gr-admin-ordered`, 28.08.2026, ein Tag. Kontrolle 29.08.2026, ein Tag. Zusätzlich `lu-admin-30`, 26.09.2026, 30 Tage, Kontrolle 27.09.2026 | Frühe Fälle gesperrt. Rechenspur erklärt fehlende Ergebnisherkunft ohne erfundene Rechtslinks, leere angewendete Listen oder Behauptung «vollständiger Angaben». Keine Meldung «Bezeichnungen können nicht …» als Ersatz für den frühen Abbruch. Kontrollen GR 31.08.2026 und LU 27.10.2026 mit tatsächlicher Rechenspur und Export |
| B22 U1 spätere Abbruchspur / Fenster | U1: `gr-admin-ordered`, 31.12.2027, ein Tag. M M1-VD-COUNT-BEYOND-WINDOW: `vd-court-final-30`, 01.12.2027, 30 Tage | Beide gesperrt wegen erforderlicher Tage ausserhalb der Abdeckung. GR hat bereits Ergebnisherkunft und betroffenen Tag 01.01.2028, dessen echte Rechenspur bleibt erhalten. Nicht pauschal jeden im Jahr 2027 empfangenen Fall freigeben |

## 5. Bundes- und Berner Bestandsverfahren

Die vollständigen aktuellen Sozialfakten folgen den genannten Referenzen. Alle elf Erlasse müssen unter BE weiterhin auswählbar sein. 44 Fachregeln und 50 Berner Anbindungen bleiben operativ auf BE und 2026–2027 begrenzt. Das ist keine neue ausserbernische Sozialfreigabe.

| ID | Eingaben | Soll und Herkunft |
| --- | --- | --- |
| C01 StPO | Sitz BE, StPO, Partei ohne Vertretung BE, 16.09.2026, zehn Tage | 28.09.2026 mit Export. V09 C01, P10 |
| C02 ZPO | Sitz TI, ordentliches ZPO-Verfahren, 07.12.2026, ein Tag. Danach Sitz BE, ordentlich, 17.12.2026, fünf Tage | TI 09.12.2026. BE 07.01.2027 mit verständlicher Art.-145-ZPO-Spur. V09 C02 |
| C03 U1 Sozialauswahl und aktuelle Fakten | BE, VRPG → Sozialversicherungsrecht → ELG → Einsprache, für diesen Verwaltungsfall zuständiger Kanton BE, Partei ohne Vertretung BE, 16.09.2026, gesetzliche 30 Tage. Zuständigkeit zuerst offen, danach BE und nach positiver Berechnung ZH oder Feiertagsanknüpfung offen | Positiv 16.10.2026 mit Export im gebundenen approved-Release. Alle unvollständigen/ausserbernischen Varianten ohne Resultat/Export. Keine Kandidatensperre übernehmen. U1 Sozialinteraktion, tatsächlicher MVP10-Einstieg und Paket-/Datenbindung |
| C04 Unterschiedliche Januarergebnisse | StPO, Sitz BE, Partei ohne Vertretung SG, 01.01.2029, ein Tag. Kontrolle 01.01.2027 | 2029 unterschiedliche Ergebnisse 02./03.01., gesperrt. 2027 gleiches Ergebnis 04.01.2027 mit Export. V09 C04, P10 |
| C05 Bundesrechtliche regionale Anknüpfung | StPO, Sitz BE, Partei ohne Vertretung NE, 26.05.2027, ein Tag, Le Landeron offen/Nein/Ja. Danach Partei GR, 16.09.2026, zehn Tage | NE offen gesperrt, Nein 27.05., Ja 28.05.2027 mit Grenze. GR 28.09.2026 mit Bundesrechtsgrenze. Nicht mit NE-/GR-Verwaltungsanknüpfung verwechseln. V09 C05 |
| C06 BE-VRPG und ATSG-Stillstand | Allgemeines BE-VRPG, 04.09.2026, zehn Tage. Danach BE/AHVG/Einsprache, kantonale Ausgleichskasse BE und Partei ohne Vertretung BE, 17.12.2026, gesetzliche 30 Tage | VRPG 14.09.2026. AHVG 01.02.2027 mit verständlichem ATSG-Stillstand und Export. V09 C03/C06 |

Rechtsgrundlagen in der Rechenspur bleiben verständlich bezeichnet und verlinkt. Technische Rohkennungen gehören nicht anstelle lesbarer Bezeichnungen in die normale Rechenspur. Ein gesonderter technischer Nachweis darf die Kennungen enthalten. Der bereits beschlossene AI-Befund, der FR-Reform-/Praxisvorbehalt, NE-Sondertage, Januargrenzen und OF-001 werden durch positive Einzelfälle nicht aufgehoben.

## 6. Technische Hostprüfungen

| ID | Konkreter Nachweis und Erfolgskriterium | Status |
| --- | --- | --- |
| T01 Identität, Paket und Konfiguration | Je Ziel bestehende App, tatsächlich geladenes Hauptbundle und gebundenes Paket `0.10.0.0` zuordnen. Provider, vollständigen Mirrorpfad und Manifest prüfen. Alle übrigen Konfigurationseigenschaften vor/nach vergleichen. Kein stiller GitHub-, BE- oder AP5-Ersatz, keine zusätzliche API-Berechtigung | Ausstehend |
| T02 Vollständige Rohbytes und Erstabruf | Neue 45 Dateien jedes der vier Mirrors gegen lokale Sollbytes prüfen. Gesicherte alte Format-9-Mirrors mit jeweils 42 Dateien separat vollständig bestätigen. Danach frischen Hostabruf anhand tatsächlicher URLs, Antworten und Bytes nachweisen. Releaseanzeige und warmer Cache allein genügen nicht | Ausstehend |
| T03 Konfigurationsgebundener Cache | Ablauf in Abschnitt 6.1 vor jedem tatsächlichen Mirrorwechsel vorbereiten. Alter Format-9-Cache darf beim gescheiterten ersten Abruf der neuen Format-17-Quelle nicht als Ersatz verwendet werden. Nach Entfernung der engen Sperre richtigen 45-Dateien-Abruf und A25 nachweisen. Späterer Fehlabruf derselben bereits verifizierten Quelle darf nur deren eigenen erneut validierten Cache nutzen | Ausstehend |
| T04 Datum, Fokus und Invalidierung | Frühzeitige Datumseingabe, Vollformat, Tag, Tag.Monat, `h`, Enter/Tab/Blur prüfen. Für Kurzformen tatsächlichen lokalen Prüftag protokollieren. Ungültiger Text sperrt. Neuer unbestätigter Text, Pfad, Stadium, Erlass, Eröffnungsart, aktuelle Qualifikation oder Feiertagsrolle entfernt altes Ergebnis/Export sofort. Kein Empfang aus Defaults, keine automatische Wiederberechnung nach Kontextwechsel | Ausstehend |
| T05 Standards V5 und Rohwertschutz | Abschnitt 6.2. Stabile Präferenzen speichern, aktuelle Fakten nicht. Beschädigte/künftige eigene Testwerte geschützt erhalten. Resetmarker und getrennte alte Schlüssel prüfen. Keine neue V5-Formatmigration behaupten | Ausstehend |
| T06 U1-Rahmen, Feldhöhe und echter Zoom | DE/FR je Host breit und schmal, anschliessend echten Browserzoom 300 Prozent prüfen. Eigene SPFx-Datenquellenzeile muss vollständig innerhalb des Rahmens umbrechen. Keine abgeschnittenen Quellenbezeichnungen, verdeckten Pflichtfelder oder unerreichbaren Buttons. Details in Abschnitt 6.3 | Ausstehend |
| T07 Q unter neuem Code mit alten Daten | Vor jeder Q-App-/Mirrorumstellung auf beiden Q-Hosts tatsächlichen neuen Paketcode und unveränderten Format-9-Mirror `2026-10-18-mvp-09-approved.1` zuordnen. C01, A05 und C03 mit altem Datenstand prüfen. Neue ausserhalb TI/GR/LU/ZG/AR liegende Verwaltungspfade dürfen aus Format 9 nicht aktiv werden. Alte Q-Konfiguration nicht als Format 17 ausgeben | Ausstehend |
| T08 Acht tatsächliche Kalenderdownloads | Auf jedem der vier aktuellen Hosts A25 in DE und FR speichern. Acht eindeutige Host-/Sprachdateien mit Sollwerten gemäss Abschnitt 6.4. Kein Outlook-Import | Ausstehend |
| T09 Historischer AP5-Erhalt | Historische SharePoint-Seite und Teams-Alias unter tatsächlich neuem Code prüfen. Alter expliziter Pin und Release `2026-08-29-ap5-approved.1` bleiben erhalten. Acht historische Dateien gegen Sollbytes prüfen. Frischen Abruf und Cache unterscheiden. C01 ergibt 28.09.2026. Keine Publikation/Umkonfiguration der historischen Seite oder Standardspeicherung | Ausstehend |
| T10 Vollständiger Vertrag und Auswahl | Tatsächlich geladene 45 Dateien an Manifest binden, Katalogzählung 245 Pfade /25 Kantone, 35 Kalender, 36 Feiertagsbindungen und 46 Stillstandsprofile bestätigen. BE bleibt getrennt. In Q alle 26 Kantonsauswahlen und zugehörigen Erlasse DE/FR prüfen. Lokale vollständige Regression und die hier ausgeführten Hostfälle getrennt bezeichnen | Ausstehend |

### 6.1 Fehlabruf vorbereiten, bevor die neue Quelle warm ist

1. Eigene isolierte Prüfsitzung und ihren tatsächlichen Origin-/Speicherkontext dokumentieren. Eine neue Prüfsitzung ist kein allgemeiner Browserdatenreset.
2. Vor dem geplanten Mirrorwechsel in dieser Sitzung den gesicherten bisherigen Format-9-Mirror regulär unter dem neuen gemeinsamen Code laden und seinen eigenen konfigurationsgebundenen Cache nachweisen. Gleichzeitig bestätigen, dass der konkrete neue Format-17-Mirror in diesem Kontext noch nicht im Cache liegt.
3. Ausschliesslich den tatsächlichen Manifestrequest der neuen Zielquelle lokal sperren. Die gespeicherte Regel vor dem Mirrorwechsel vollständig lesen. Sie muss Origin, Site, Mirrorrelease und `manifest.json` beziehungsweise den genauen SharePoint-REST-Dateiabruf treffen, einschliesslich allfälliger Queryparameter. Eine breite Regel wie `*://*` darf weder aktiviert noch stehen gelassen werden.
4. Den ohnehin separat freigegebenen Mirrorwechsel ausführen und den gescheiterten Request mit vollständiger Zuordnung nachweisen. Kein altes Resultat, kein Export und kein fremder Cache. Ein unklarer Sperrzähler ist kein Beleg für einen Fehlabruf.
5. Nur die eigene enge Sperre entfernen, Entfernung kontrollieren und erneut regulär abrufen. Antwortbytes, Quelle und A25 bestätigen. Anschliessend den warmen Fehlabruf genau derselben Quelle getrennt prüfen und die Sperre wieder entfernen.
6. Ein frischer isolierter Kontext genügt nur, solange der alte Mirrorpfad noch konfiguriert ist und der eigene Format-9-Cache vor dem Quellenwechsel regulär aufgebaut werden kann. Nach bereits erfolgter globaler Mirrorumstellung liefert ein frischer Kontext allein keinen Nachweis «alter Cache vorhanden, neue Quelle kalt». T03 bleibt dann offen. Für die Wiederholung braucht es entweder die gesonderte Freigabe zum Entfernen genau einer identifizierten eigenen Format-17-Testcachezeile in einem Kontext mit vorhandenem eigenen Format-9-Cache oder einen gesondert freigegebenen vorübergehenden Mirror-Rückwechsel. Keine solche Änderung ist automatisch durch diese Matrix freigegeben. Fremde Browserdaten bleiben unangetastet.

### 6.2 Standards in eigenen Testkontexten

Vor Schreibtests Existenz und Rohbytes von `fristenrechner.defaults.v1` und `fristenrechner.defaults.v5` sichern. Bestehende fremde Werte nicht ersetzen. Gemeinsame Speicherkontexte nacheinander prüfen. Die lokale Vierpaketsequenz ist kein Auftrag zum vorsorglichen Recoveryeinsatz im Tenant.

| Teilfall | Ausführung | Soll |
| --- | --- | --- |
| T05a Bestandspräferenz | Eigene gültige V5-BE-/TI-Auswahl laden | Stabile Auswahl bleibt. Kein erdachtes neues Verfahren und keine aktuelle Qualifikation. Alter Schlüssel bleibt bytegleich |
| T05b Neue Auswahl | A06/ZH, A21/AI, A25/VS und C03/ELG nacheinander positiv rechnen, synthetische Referenz setzen, regulär speichern und neu laden | Stabile Pfad-/Erlassauswahl bleibt, gesetzliche Dauer wird aus dem gewählten Pfad wieder bestimmt. Bei A21/AI und A25/VS bleibt die aktuelle angeordnete Dauer nach dem Neuladen leer und muss erneut eingegeben werden. Datum, Referenz, aktuelle Gesamtqualifikation, Eröffnungsqualifikation, gegenwärtige Zuständigkeit und örtliche Fallfakten fehlen. Ohne neue Qualifikation kein altes Resultat/Export. Vertrag: [aktuelle Dauer und V5-Präferenzen](../../src/ui/administrativeDefaults.ts) |
| T05c Bedingte Fallfakten | B05/TG ohne Ausnahmehinweis und B13/NE mit Le Landeron positiv rechnen, speichern und neu laden | Stabiler Pfad bleibt. Aktueller Hinweis beziehungsweise Behördenregion muss erneut qualifiziert werden, keine still aus dem Speicher konstruierte Falltatsache |
| T05d Rohwertschutz | Nur eigene synthetische beschädigte V5-, zukünftige Versions- und unbekannte Auswahlwerte prüfen. Vor-/Nachherbytes dokumentieren | Kein stiller Ersatz, Überschreiben oder Löschen. Verständlicher Schutzhinweis. Nicht den älteren Consumer installieren, um diesen Test herzustellen |
| T05e Reset und Altmigration | Eigene gültige Präferenz regulär zurücksetzen und neu laden. Getrennt in einem frischen eigenen Kontext ohne V5 einen gültigen V4-Testwert übernehmen | Resetmarker verhindert Wiederaufleben alter V1–V4-Präferenzen. Alter Schlüssel bleibt bytegleich. V4→V5 übernimmt weder Empfang noch aktuelle Qualifikation. Kein allgemeiner Browserdatenreset |

### 6.3 Darstellung und #50-Bestand

Das Datumseingabefeld bleibt auf Desktop **32 CSS-Pixel hoch, 14 CSS-Pixel Schrift, linksbündig**. Platzhalter und benachbarte Felder vergleichen. Touch-Soll sind bewusst **44 CSS-Pixel und 16 CSS-Pixel Schrift**. CSS-Masse, physische Bildpixel und echten Browserzoom getrennt dokumentieren. #50 ist bereits abgenommen, dieser Hostvergleich ist Bestandsschutz.

T06-H01 betrifft die eigene **SPFx-Datenquellenzeile**, nicht eine erneute Änderung der Rechnerfelder. Bei 100 und 300 Prozent die tatsächliche lange Quellenbezeichnung und den bilingualen Hinweis prüfen, ohne die produktive Konfiguration für eine künstliche Bezeichnung zu ändern. Schmale Inhaltsbreite und Teamsnavigation getrennt beobachten. Die lokale U1-Prüfung mit 320/373/400/1120 CSS-Pixeln sowie die lokale native 300-Prozent-Prüfung ersetzen keinen aktuellen SharePoint-/Teams-Nachweis. Den Zoom anschliessend auf den gesicherten Wert der eigenen Prüfsitzung zurücksetzen.

### 6.4 Acht tatsächlich gespeicherte Kalenderdateien

Je E-SP, E-T, Q-SP und Q-T A25 in DE und FR mit Empfang **02.10.2026**, zehn Tagen und Referenz `QA-MVP10-{E-SP|E-T|Q-SP|Q-T}-{DE|FR}-VS` rechnen. Die Dateien im jeweiligen Host tatsächlich herunterladen und speichern. Der bereits bestandene lokale Handler-/Dateitest ersetzt diese acht Downloads nicht.

Sollwerte: `DTSTART;VALUE=DATE:20261012`, exklusives `DTEND;VALUE=DATE:20261013`, `TRANSP:TRANSPARENT`, Kategorie `Fristablauf`, Erinnerung `TRIGGER:-PT112H`. DE-Betreff «Fristablauf», FR «Échéance du délai» mit synthetischer Referenz, Release `2026-10-28-mvp-010-approved.1`, Pfad `vs-court-ordered` und dessen tatsächliche Herkunft. UTF-8, CRLF, Zeilenfaltung bis 75 Bytes, UID und gespeicherte SHA-256 je Datei dokumentieren. Keine Teilnehmenden, Anhänge oder Serienregeln.

Alle acht Dateien anhand von Host, Sprache, Referenz, Zeitpunkt und SHA eindeutig zuordnen. Die Dateihashes müssen wegen UID, Erzeugungszeit und Testreferenz nicht untereinander oder mit den lokalen B-Dateien übereinstimmen. Nach B18/B20/B21 sowie unbestätigtem Datum oder Kontextwechsel darf kein neuer Export möglich sein. Eine zuvor gespeicherte Datei ist kein aktuelles Ergebnis. Sicherheits- und Browsereinstellungen für Speicherdialoge nicht verändern. **Nicht öffnen oder in Outlook importieren.**

## 7. Menschliche Prüfungen und Abschluss

| ID | Neuer Nachweis durch David | Status |
| --- | --- | --- |
| M01 Reale Geräte | Datum/Platzhalter, Touch- und Desktopgrössen, Tab/Enter/Weiter, mindestens AI-/VD-Eröffnungswahl, NE-Region, neuer positiver Fall, gesperrter Fall, Rechenspur und SPFx-Quellenzeile tatsächlich auf den verwendeten Geräten prüfen. Gerät, OS, Browser/App und Tastatur nennen. Akzeptierten iPad-/Magic-Keyboard-Befund qualifiziert erhalten. VoiceOver nur bei tatsächlicher Prüfung als bestanden ausweisen | Ausstehend |
| M02 Bestehender Gast | Bestehenden B2B-Gast in zulässiger Umgebung tatsächlich auf Q-SP und Q-T anmelden. Datenstand, A25, B18, C03 und tatsächlichen Kalenderdownload prüfen. Keine neue Einladung/Rechteänderung, Conditional Access nicht umgehen. Eigentümertest oder alte Gastabnahme ersetzt diesen Nachweis nicht | Ausstehend |
| M03 Fachliche Q-Abnahme | Gebundenes Paket, Datenstand, technische Matrix, Geräte-/Gastbelege und genau benannte offene Befunde ausdrücklich abnehmen. Keine automatische Ableitung aus «Berechnung funktioniert» | Ausstehend |
| M04 Outlook-Entscheid | Vorhandene Importnachweise nur mit begründetem aktuellem Vergleich und ausdrücklicher menschlicher Bestätigung wiederverwenden. Falls ein neuer Import nötig ist, separater Auftrag mit Konto, Kalender, Dateien und gezielter Bereinigung. Diese Matrix umfasst lediglich Datei-/Serialisierungsprüfung | Ausstehend |

Jeder Ausführungseintrag nennt Host, Fallkennung und Variante, Zeitpunkt, Paket-/Bundle-/Datenbindung, Kontoart, Gerät/Browser, vollständige tatsächliche Eingaben, Soll, Ist und Belegpfade. Gruppenzeilen dürfen erst bestanden sein, wenn alle Teilvarianten vollständig belegt sind. Zulässige Zustände sind «bestanden», «nicht bestanden» oder «nicht ausgeführt mit Grund». Wiederverwendung wird als solche begründet und nicht als neuer Hosttest ausgegeben. Passwörter, Tokens, echte Aktenreferenzen und unnötige Tenant-/Browserdaten gehören nicht in öffentliche Nachweise.

Eigene Testsperren, Zoomwerte und ausdrücklich freigegebene Testpräferenzen gezielt zurücknehmen. Ein ungeklärter fachlicher oder technischer Fehler hält das betroffene Gate an. Der [lokale technische Restpunkt R10B-CLI-H01](lokaler-releaseabschluss-mvp10.md) bleibt getrennt vor der späteren Quellpublikation zu behandeln, er wird durch die Hostmatrix weder korrigiert noch als bestanden ausgegeben.

Diese Sollmatrix verändert keine Fachfreigaben. R10-C bleibt auf die vier bestehenden E-/Q-Ziele und den gesondert gebilligten Rückfall begrenzt. AP5-Pins/Daten, AP21-Testapps, E05, zusätzliche Gäste, M365-Berechtigungen/Richtlinien, GitHub und steimer.ch-P bleiben ausserhalb der Ausführung. Keine erneute Header-/Cacheprüfung des Shared Hostings. Eine neue periodische Quellenprüfung per 15.11.2026 oder eine P-Betriebsfreigabe wird nicht aus dem technischen Q-Gate abgeleitet.
