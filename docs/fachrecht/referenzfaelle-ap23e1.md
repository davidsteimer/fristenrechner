# AP23E1 Referenzfälle für Luzern Zug und Appenzell Ausserrhoden

Stand 18. Oktober 2026. **Fachvorlage, noch nicht abgenommen.** Diese Tabelle wird aus der [maschinenlesbaren Fachreferenz](../../tests/golden/candidates/ap23e1-administrative.json) abgeleitet. Keine neuen Produktdaten und kein Integrationstest. Massgebend sind die Fallqualifikation, Pfaddefinitionen und Zeitfenster der [Fachvorlage](verwaltungsverfahren-ap23e1.md).

## Gemeinsame Voraussetzungen

Bei positiven Fällen stehen kantonale Zielstelle, zulässiger allgemeiner Weg, vollständige tatsächliche Eröffnung und unbestrittene Belehrung fest. Ordentliche Beschwerden betreffen Endentscheide. Der Fünftagesrekurs betrifft eine qualifizierte Vollstreckungsverfügung nach Art. 63 VRPG. Angeordnete Tage betreffen nur Verfahrenseingaben. Keine abweichende Spezialnorm, Verkürzung, Friständerung, Zahlungsfrist oder Zustellfiktion. Kalenderanknüpfung ist die kantonale Zielstelle. Diese Forschungsangaben sind keine neuen GUI-Felder.

LU ab 27.09.2026, ZG/AR ab 29.08.2026, alle benötigten Tage bis 31.12.2027. Zukunftsfälle unter Normfortgeltungsannahme. Die Prüfung der Kalenderformeln ausserhalb dieses Fensters erweitert die Fallfreigabe nicht.

## Positive Datumssollwerte

### LU

| Fall | Pfad | Empfang | Tage | Letzter gezählter Tag | Fristende | Zweck |
| --- | --- | --- | ---: | --- | --- | --- |
| LU01 | LU-ADMIN-30 | 16.10.2026 | 30 | 15.11.2026 | **16.11.2026** | Ordentliche Verwaltungsbeschwerde, Sonntag am Ende |
| LU02 | LU-COURT-30 | 16.10.2026 | 30 | 15.11.2026 | **16.11.2026** | Ordentliche Gerichtsbeschwerde gleicher Zählmodus |
| LU03 | LU-COURT-30 | 08.11.2026 | 30 | 08.12.2026 | **09.12.2026** | Mariä Empfängnis verschiebt Endtag |
| LU04 | LU-ADMIN-30 | 17.02.2027 | 30 | 19.03.2027 | **19.03.2027** | Josefstag ist kein VRG-Verschiebungstag |
| LU05 | LU-COURT-30 | 17.12.2026 | 30 | 16.01.2027 | **18.01.2027** | Keine Weihnachtsferien im allgemeinen Gerichtsweg |
| LU06 | LU-ADMIN-ORDERED | 18.12.2026 | 14 | 01.01.2027 | **04.01.2027** | Angeordnete Verwaltungseingabe über Jahreswechsel |
| LU07 | LU-COURT-ORDERED | 11.03.2027 | 14 | 25.03.2027 | **25.03.2027** | Kein Osterstillstand |
| LU08 | LU-COURT-ORDERED | 12.03.2027 | 14 | 26.03.2027 | **30.03.2027** | Karfreitag bis Ostermontag als Endtagskette |
| LU09 | LU-COURT-30 | 12.07.2027 | 30 | 11.08.2027 | **11.08.2027** | Kein Sommerstillstand |
| LU10 | LU-ADMIN-ORDERED | 13.05.2027 | 14 | 27.05.2027 | **28.05.2027** | Fronleichnam |

### ZG

| Fall | Pfad | Empfang | Tage | Letzter gezählter Tag | Fristende | Zweck |
| --- | --- | --- | ---: | --- | --- | --- |
| ZG01 | ZG-ADMIN-20 | 16.10.2026 | 20 | 05.11.2026 | **05.11.2026** | Verwaltungsbeschwerde mit 20 Tagen |
| ZG02 | ZG-COURT-30 | 16.10.2026 | 30 | 15.11.2026 | **16.11.2026** | Gerichtsbeschwerde mit 30 Tagen bei demselben Empfang |
| ZG03 | ZG-ADMIN-20 | 18.11.2026 | 20 | 08.12.2026 | **09.12.2026** | Mariä Empfängnis |
| ZG04 | ZG-ADMIN-20 | 17.12.2026 | 20 | 06.01.2027 | **06.01.2027** | Verwaltungsweg ohne Weihnachtsstillstand |
| ZG05 | ZG-COURT-30 | 17.12.2026 | 30 | 16.01.2027 | **18.01.2027** | Gerichtsweg ohne Weihnachtsstillstand |
| ZG06 | ZG-ADMIN-ORDERED | 04.03.2027 | 15 | 19.03.2027 | **19.03.2027** | Josefstag nicht in der Liste von § 10 |
| ZG07 | ZG-COURT-ORDERED | 12.03.2027 | 14 | 26.03.2027 | **30.03.2027** | Karfreitag und Ostermontag, keine Ferien |
| ZG08 | ZG-COURT-ORDERED | 13.05.2027 | 14 | 27.05.2027 | **28.05.2027** | Fronleichnam |
| ZG09 | ZG-ADMIN-20 | 12.07.2027 | 20 | 01.08.2027 | **02.08.2027** | Bundesfeiertag und Sonntag am Ende, kein Sommerstillstand |
| ZG10 | ZG-COURT-ORDERED | 17.12.2027 | 14 | 31.12.2027 | **31.12.2027** | Letzter gedeckter Tag ohne Weihnachtsstillstand |

### AR

| Fall | Pfad | Empfang | Tage | Letzter gezählter Tag | Fristende | Zweck |
| --- | --- | --- | ---: | --- | --- | --- |
| AR01 | AR-ADMIN-20 | 16.10.2026 | 20 | 05.11.2026 | **05.11.2026** | Rekurs mit 20 Tagen |
| AR02 | AR-COURT-30 | 16.10.2026 | 30 | 15.11.2026 | **16.11.2026** | Obergerichtsbeschwerde mit 30 Tagen |
| AR03 | AR-EXECUTION-5 | 16.10.2026 | 5 | 21.10.2026 | **21.10.2026** | Eigener Vollstreckungsrekurs mit 5 Tagen |
| AR04 | AR-ADMIN-20 | 17.12.2026 | 20 | 06.01.2027 | **06.01.2027** | Rekurs ohne Weihnachtsstillstand |
| AR05 | AR-COURT-30 | 17.12.2026 | 30 | 01.02.2027 | **01.02.2027** | Gericht mit Weihnachtsstillstand bis 2. Januar |
| AR06 | AR-COURT-ORDERED | 20.12.2026 | 10 | 12.01.2027 | **12.01.2027** | Eröffnung einer Tagesfrist während Gerichtsferien |
| AR07 | AR-ADMIN-ORDERED | 20.12.2026 | 10 | 30.12.2026 | **30.12.2026** | Gleiche angeordnete Tagesfrist vor Verwaltung ohne Ferien |
| AR08 | AR-COURT-30 | 17.02.2027 | 30 | 19.03.2027 | **19.03.2027** | Normaler letzter Tag vor Osterstillstand |
| AR10 | AR-COURT-30 | 18.03.2027 | 30 | 02.05.2027 | **03.05.2027** | Osterstillstand unterbricht laufende Beschwerdefrist |
| AR11 | AR-COURT-30 | 12.07.2027 | 30 | 12.09.2027 | **13.09.2027** | Sommerstillstand vor Obergericht |
| AR12 | AR-ADMIN-20 | 12.07.2027 | 20 | 01.08.2027 | **02.08.2027** | Sommer vor Verwaltung ohne Stillstand |
| AR13 | AR-EXECUTION-5 | 22.12.2026 | 5 | 27.12.2026 | **28.12.2026** | Vollstreckungsrekurs über Weihnachten ohne Ferien |
| AR14 | AR-COURT-ORDERED | 17.12.2026 | 1 | 03.01.2027 | **04.01.2027** | Erster gezählter Tag nach Ferien kann Sonntag sein |
| AR15 | AR-COURT-30 | 24.11.2026 | 30 | 09.01.2027 | **11.01.2027** | Bereits laufende Frist am Jahreswechsel |

## Gesperrte und abgegrenzte Fälle

Kein definitives Enddatum und kein darauf gestützter Export. AR09 ist ein zur Fachentscheidung vorgeschlagener Sperrfall. Die anderen Fälle prüfen bewusst nicht aufgenommene oder unqualifizierte Konstellationen.

| Fall | Tatsächlicher Prüfgegenstand | Eingabe | Erwartete Behandlung |
| --- | --- | --- | --- |
| AR09 | AR-O1 Endverschiebung in neu beginnenden Stillstand | AR-COURT-30, 18.02.2027, 30 Tage angegeben | Offene Endverschiebung in beginnenden Stillstand |
| N01 | LU-Einsprache nicht durch Beschwerde mit 30 Tagen ersetzen | LU-ADMIN-30, 16.10.2026, 30 Tage angegeben | Handlung liegt ausserhalb des ausgewählten Pfads |
| N02 | LU-Begründungsverlangen separat | LU-COURT-30, 16.10.2026, 30 Tage angegeben | Handlung liegt ausserhalb des ausgewählten Pfads |
| N03 | ZG-verkürzte Dringlichkeitsfrist nicht als 20 Tage rechnen | ZG-ADMIN-20, 16.10.2026, 20 Tage angegeben | Verkürzte oder besondere Frist ist kein ordentlicher Rechtsmittelpfad |
| N04 | ZG-mündliche Eröffnung mit ausstehender Bestätigung | ZG-ADMIN-20, 16.10.2026, 20 Tage angegeben | Rechtlich massgebende vollständige Eröffnung nicht geklärt |
| N05 | AR-fehlende Rechtsmittelbelehrung, Zwei-Monatsregel separat | AR-ADMIN-20, 16.10.2026, 20 Tage angegeben | Fehlende oder fehlerhafte Belehrung braucht gesonderte Prüfung |
| N06 | AR-Baurecht kein allgemeiner Gerichtsferienpfad | AR-COURT-30, 17.12.2026, 30 Tage angegeben | Besonderes Recht ist nicht durch den allgemeinen Pfad freigegeben |
| N07 | AR-Steuerrecht kein allgemeiner Gerichtsferienpfad | AR-COURT-30, 17.12.2026, 30 Tage angegeben | Besonderes Recht ist nicht durch den allgemeinen Pfad freigegeben |
| N08 | ATSG nicht unter kantonalem allgemeinem Profil freigeben | ZG-COURT-30, 17.12.2026, 30 Tage angegeben | Besonderes Recht ist nicht durch den allgemeinen Pfad freigegeben |
| N09 | Fixtermin in Gerichtsferien nicht als Tagesfrist | AR-COURT-ORDERED, 17.12.2026, 10 Tage angegeben | Fixtermin oder abweichender Beginn, keine gewöhnliche Tagesfrist |
| N10 | Monatsfrist nicht in 30 Tage umdeuten | LU-ADMIN-30, 16.10.2026, als Monatsfrist, nicht als Tage | Keine Tagesfrist |
| N11 | Keine pauschale kommunale Instanzenfreigabe | ZG-ADMIN-20, 16.10.2026, 20 Tage angegeben | Zielinstanz liegt ausserhalb des kantonalen Pilots |
| N12 | Kostenvorschuss nicht unter Stellungnahme verstecken | ZG-COURT-ORDERED, 17.12.2026, 10 Tage angegeben | Handlung liegt ausserhalb des ausgewählten Pfads |
| N13 | Rechenverlauf im Jahr 2028 ist nicht gedeckt | AR-COURT-30, 24.11.2027, 30 Tage angegeben | Mindestens ein notwendiger Tag liegt ausserhalb des Fachfensters |
| N14 | AR-Zwischenverfügung noch nicht positiv qualifiziert | AR-COURT-30, 16.10.2026, 30 Tage angegeben | Nicht als Endentscheid qualifiziert |
| N15 | Keine Fünftagesfrist für blosse Mahnung oder SchKG-Betreibung | AR-EXECUTION-5, 16.10.2026, 5 Tage angegeben | Keine qualifizierte Vollstreckungsverfügung nach Art. 63 VRPG |
| N16 | Fünftagesrekurs nicht auf späteren Gerichtsschritt übertragen | AR-EXECUTION-5, 16.10.2026, 5 Tage angegeben | Verfahrensstufe passt nicht zum Pfad |

## Unabhängige Prüfungen

Die 51 Referenzen umfassen 34 Datumssollwerte und 17 Sperrfälle. Der [JavaScript-Referenzchecker](../../scripts/check-ap23e1-references.mjs) liest keine Produktmodule. Er prüft zusätzlich 20 gezielt ungültige Varianten, 2'190 Kalendertage und 9 zusätzliche Kalenderbedingungen. [Prüfbericht](../../outputs/ap23e1-2026-10-18/QA-AP23E1.json).

Die getrennte [Python-Gegenrechnung](../../scripts/check_ap23e1_independent.py) verwendet eigene Pfaddefinitionen, eigene Feiertagslisten, eine eigenständige gregorianische Osterberechnung und eigene Zählung. Sie übernimmt nicht das Ergebnis des JavaScript-Checkers. [Unabhängiger Prüfbericht](../../outputs/ap23e1-2026-10-18/QA-AP23E1-INDEPENDENT.json). Beide Rechner prüfen die vorgegebenen fachlichen Sollwerte. Ihre Übereinstimmung ersetzt die menschliche rechtliche Abnahme nicht.

Die zusätzlichen Kalenderproben betreffen den 2. Januar in LU/ZG gegenüber AR, Josefstag in LU/ZG sowie den AR-Stephanstag 2026–2029. Der Vergleich 2026–2027 berücksichtigt die Endtagswirkung einschliesslich Wochenenden. Er beweist keine historische positive Verfahrensfreigabe vor dem Fachfenster.

Alle Forschungsergebnisse tragen `exportAllowed: false`, auch die positiven Sollwerte. Es werden keine Kalenderdateien erstellt. Die Sperrprüfung zeigt die Behandlung im unabhängigen Fachmodell, noch keine implementierte Sperre im Produkt. Die 95 bestehenden Produktquelldateien einschliesslich der lokal abgenommenen CSS-Korrektur und die 42 Dateien des MVP-0.8-Releases werden bytegebunden auf Unverändertheit geprüft.
