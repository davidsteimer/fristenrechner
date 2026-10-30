# AP23M1 – Forschungsreferenzen und technischer Nachweis

Stand: 27. Oktober 2026. **Keine Produktprüfung und keine Fachabnahme.** Die [Fachvorlage](fachvorlage-ne-vd-vs.md) beschreibt die vorgeschlagenen rechtlichen Gruppen. Die [statische Fallsuite](referenzfaelle.json) bindet die tatsächlichen Quellenmodelle mit SHA-256 und übernimmt die von den Fachanalysen vorgegebenen Erwartungen unverändert.

## Umfang und Ergebnis

| Gegenstand | Tatsächlich geprüft |
| --- | --- |
| Vorgeschlagene Gruppen | 49, davon NE 16, VD 19 und VS 14 |
| Statische Referenzfälle | 109, davon NE 32, VD 45 und VS 32 |
| Datierte positive Werte | 73 |
| Begrenzungsfälle ohne definitives Ergebnis | 36, einschliesslich fehlender Qualifikation, falscher Fristdauer, vollständiger Zeitgrenze und tatsächlicher End-/Stillstandskollision |
| Quellenrohdateien | 64, mit Bytezahl und SHA-256 gegen die gebundenen Kopien geprüft |
| Kalenderausprägungen | Vier, NE allgemein und Le Landeron, VD-LEmp sowie VS-Verfahrenskalender |
| Unabhängige Kalender-Endtagvergleiche | 2'920, jeder Tag 2026 und 2027 für jede der vier Ausprägungen |
| Zusätzliche punktuelle Kalendererwartungen | Drei, darunter Mariä Empfängnis, 2. Januar und gerade kein allgemeiner Karfreitag im VS-Verfahrenskalender |
| Neue Forschungs-/Governanceprüfungen | 124 von 124 bestanden, davon 74 Start-/Schutztests und 50 Referenz-/Metadatentests |
| Abweichungen | Keine in der Node-Prüfung und im unabhängigen Python-Gegenvergleich |

## Ausgewählte kontrollierbare Paare

Alle positiven Beispiele setzen die in der Fallsuite ausdrücklich enthaltenen aktuellen Falltatsachen voraus. Die Tabelle ist kein verkürzter Ersatz für deren Qualifikation.

| Sachverhalt und Handlung | Erwartung | Geprüfter Unterschied |
| --- | --- | --- |
| NE, angeordnete zwei Tage, rechtliche Eröffnung 06.05.2027 | 10.05.2027 | Feiertags-/Schliessungstage im Fristinnern zählen. Samstag/Sonntag am Ende verschieben |
| NE, angeordneter Tag ab rechtlicher Eröffnung 26.05.2027, allgemeiner Stellensitz | 27.05.2027 | Kein pauschales Fronleichnam für den ganzen Kanton |
| Derselbe NE-Fall mit aktuell qualifiziertem Stellensitz Le Landeron | 28.05.2027 | Kantonalrechtliche örtliche Fronleichnamsbindung |
| NE, ein Tag ab bereits rechtlich qualifizierter Eröffnung 24.12.2026 | 04.01.2027, Eröffnung bleibt 24.12.2026 | Keine zweite Zustellverschiebung, Stillstand bis 2. Januar, anschliessende Endverschiebung |
| NE, derselbe blosse Rohzustelltag ohne rechtliche Eröffnungsqualifikation | Kein definitives Datum | Bewusste Trennung von Empfangs- und Endrollen |
| VD, gerichtliche Beschwerde, 30 Tage ab 15.12.2026 | 01.02.2027 | Gerichtlicher Winterstillstand |
| VD, verwaltungsinterne Beschwerde, ebenfalls 30 Tage ab 15.12.2026 | 14.01.2027 | Kein allgemeiner verwaltungsinterner Stillstand |
| VD, zulässige einfache Postzustellung der Erstreckungsablehnung am 19.09.2026, qualifizierte drei Tage | Eröffnung 22.09.2026, Ende 25.09.2026 | Samstag/Sonntag und Bettagsmontag verschieben die rohe postalische Eröffnung |
| VD, bereits rechtlich qualifizierte Eröffnung am 19.09.2026, dieselbe Dreitageshandlung | Eröffnung bleibt 19.09.2026, Ende 22.09.2026 | Keine doppelte Verschiebung. Innerer Feiertag zählt mit |
| VS, Verwaltungsbeschwerde, 30 Tage ab 10.12.2026 | 11.01.2027 | Kein allgemeiner Verwaltungsstillstand |
| VS, Verwaltungsgerichtsbeschwerde, ebenfalls 30 Tage ab 10.12.2026 | 28.01.2027 | Gerichtlicher Winterstillstand bis 5. Januar |
| VS, gerichtliches Fünftagesverlangen nach informierter mündlicher Eröffnung am 17.12.2026 | 11.01.2027 | Die kurze Dauer beseitigt den besonderen gesetzlichen Stillstand nicht |
| VS, angeordneter Tag ab 25.03.2027 | 26.03.2027 | Karfreitag ist hier kein allgemeiner zusätzlicher VS-Feiertag |
| VS, angeordneter Tag ab 09.10.2026 | 12.10.2026 | Nominaler Samstag verschiebt auf Montag |
| VS, kürzere Belehrung bei gesetzlicher Zehntageshandlung ab 02.10.2026 | 12.10.2026 | Gesetzliche Dauer wird nicht verkürzt |

Gesonderte negative Erwartungen betreffen unter anderem rohe nicht qualifizierte Zustellung, fehlende Regionsbindung, falsche Zielkantone, falschen Ursprung des VD-Zehntagesentscheids, Spezialrecht, Zahlungen, nicht wirksame Belehrungen, abweichende gesetzliche Dauer, ungeklärte Erstreckungsablehnung vor Ursprungsablauf und ausserhalb des vollständigen Fensters liegende Tage. Die konkrete Endverschiebung in einen neu beginnenden Stillstand ergibt in allen drei Kantonen einen abgegrenzten Forschungsstatus ohne definitives Fristresultat.

## Unabhängigkeit und Reproduzierbarkeit

Die Node-Prüfung zählt Tage inkrementell. Der eigenständige Python-Prüfer ermittelt zulässige Zähltage über Datumslisten und wählt anschliessend den Endtag. Beide importieren weder Produktrechenlogik noch UI oder Produktvalidatoren. Die statischen Erwartungen werden nicht aus einer der Implementierungen zurückgeschrieben. Eine reine Korrektur des Prüfprogramms darf deshalb keine fachliche Erwartung passend machen.

Die Kalenderprüfung liest die vier bytegebundenen bestehenden Kalenderdateien und projiziert deren Rohregeln separat. Sie ändert diese Dateien nicht. Die 2'920 Vergleiche prüfen Endtaggleichstellungen, nicht alle ausserhalb des Umfangs liegenden kommunalen oder jährlichen Einzelanordnungen und nicht die Wirksamkeit einer konkreten Zustellung.

Reproduzierbare Befehle im Projektordner:

```sh
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node scripts/check-ap23m1.mjs
.venv/bin/python scripts/check_ap23m1_references.py --write
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node --test tests/governance/ap23m1-research.test.mjs tests/governance/ap23m1-references.test.mjs
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node scripts/finalize-ap23m1.mjs --check
```

Der [Node-Bericht](../../../outputs/ap23m1-2026-10-27/reference-verification.json), der [Python-Gegenvergleich](../../../outputs/ap23m1-2026-10-27/independent-verification.json) und der [Abschlussnachweis](../../../outputs/ap23m1-2026-10-27/local-completion.json) beziehen sich auf dieselbe konkrete Fallsuite. Die Schutzprüfung umfasst 11'212 unveränderte Bestandsdateien einschliesslich der historischen L3-Nachweise und der ursprünglichen M1-Vorlage. Die neuen Governance-Negativtests prüfen auch, dass Schutzbestände, Freigabeflags und Abnahmegrenzen nicht still umgeschrieben werden.

Diese Kontrollen bestätigen die modellierten mathematischen Erwartungen und die Nachweisbindung. Sie bestätigen keine juristische Auslegung automatisch, keine reale Geräte- oder Hostprüfung und keine Fach-, Quellenrelease-, Kalenderexport- oder Betriebsfreigabe.
