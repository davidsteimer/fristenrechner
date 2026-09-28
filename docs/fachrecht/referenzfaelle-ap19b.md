# AP19B · Fachliche Datumsreferenzen für ELG, AVIG und KVG

Stand: 25. September 2026. **Referenzentwurf zur fachlichen Prüfung, keine Produktfreigabe.** AP19A-Umfang und nationale Modellstruktur sind abgenommen. Die nachfolgenden konkreten Datumsfälle und Sperrgründe sind neue AP19B-Prüfgegenstände.

## 1. Ergebnis und Nachweisgrenze

Der [maschinenlesbare Referenzbestand](../../tests/golden/candidates/ap19b-social-deadlines.json) enthält **77 Fälle: 25 positive Datumsreferenzen und 52 Sperrfälle**. Alle zwölf vorgesehenen Pfade haben mindestens einen positiven Datumsfall. Der getrennte [Prüfer](../../scripts/check-ap19b-references.mjs) und [19 Governance-Tests](../../tests/governance/ap19b-references.test.mjs) bestehen unter Node 22.23.2.

Die Datumswerte sind ausdrücklich hinterlegte Sollwerte, nicht während eines Testlaufs aus dem Produktrechner erzeugte Erwartungen. Der Prüfer verwendet eine eigene UTC-basierte Enumeration kalendarischer Tage und importiert weder die produktive Fristenengine noch deren Datenlader. Stillstandsintervalle und Feiertage sind für das begrenzte Referenzfenster als konkrete Daten hinterlegt. Die Feiertagsliste wird zusätzlich gegen eine unabhängige Projektion der unverändert gelesenen CH-/BE-Kalenderregeln geprüft. Die beiden gelesenen Release-Dateien sind im Fixture durch SHA-256 gebunden.

Das ist ein unabhängiger Referenztest, **noch kein Integrationstest neuer Produktpfade**. Ein positives Ergebnis bedeutet `qualified-reference` und `candidate-not-approved`, nicht «Benutzereingabe rechtsverbindlich qualifiziert» oder «produktive Berechnung freigegeben». Sämtliche Fälle und der Gesamtbestand bleiben `runtimeActive: false`. Fachliche Abnahme, Zeitfreigabe und Releaseaktivierung bleiben getrennt.

Das Fixture ist keine Produkt-API und kein vollständiger Test des neuen Katalogschemas oder seiner `contextRoute.requiredFacts`. Sein Feld `days: 30` deklariert bei Fixfristen lediglich das fachliche Rechenmerkmal. Daraus folgt keine Erlaubnis, der Produkt-API einen Benutzeroverride zu übergeben, auch nicht mit demselben Wert 30. Der informative Stellensitz ist formal auf einen gültigen Kantonscode oder `null` beschränkt, wird aber ausdrücklich nicht zur Qualifikation von Zuständigkeit oder Freigabe verwendet.

## 2. Voraussetzungen und Zeitgrenzen

Die zwölf Pfade verwenden die in AP19A abgegrenzten individuellen Bundes-EL, individuelle Arbeitslosenentschädigung und individuelle OKP-Leistungen. Gegenstand, Handlung, Stadium, Dokument und Eröffnung sind im jeweiligen positiven Fall ausdrücklich qualifiziert. Die vereinfachte Referenzeingabe behauptet keine automatische Ermittlung des zuständigen Gerichts. Die konkrete Berner Anbindung wird im AP19B-Produktvertrag gesondert nachgewiesen.

| Teil | Referenzannahme |
| --- | --- |
| Gesetzliche Einsprache und ordentliche Beschwerde | Genau 30 Tage, nicht frei veränderbar |
| Verwaltungsanordnung und formelle Beschwerdeverbesserung | Tatsächlich nach Tagen angeordnete Dauer `N`, keine erfundene Standarddauer. Der technische Referenzkorridor 1–365 ist keine gesetzliche Höchstdauer |
| Eröffnung | Rechtlich massgebender Tag ist geklärt. Die Zählung beginnt kalendarisch am Folgetag |
| Stillstände | ATSG Art. 38 Abs. 4. Ostern jeweils vom siebten Tag davor bis zum siebten Tag danach, Sommer 15. Juli–15. August, Winter 18. Dezember–2. Januar, jeweils einschliesslich |
| Feiertagsraum | Gesondert qualifizierter Partei- oder Vertretungsanker CH/BE. Sitz der Stelle allein genügt nicht |
| Ende | Samstag, Sonntag oder einschlägiger Feiertag verschieben auf den nächsten Werktag. Solche Tage innerhalb einer laufenden Frist werden mitgezählt |
| Arithmetikfenster | 01.01.2026–31.12.2027, keine eigenständige Rechtsfreigabe für diesen Zeitraum |
| Quellenobergrenze ELG/KVG | Im Prüfkandidaten bis 31.12.2027, unter Vorbehalt der fachlichen Abnahme des [Quellenabgleichs](quellenabgleich-ap19b.md) |
| Quellenobergrenze AVIG | **Vorgeschlagene Option B** bis 31.12.2027. Für die Zeit ab 01.02.2027 erfolgt der belegte Nachweis aus amtlichem Änderungsrecht und vollständigem amtlichem Änderungsindex statt aus dem nicht verfügbaren konsolidierten Export. Diese Methode bedarf ausdrücklich der AP19B-Abnahme |

Die Quellenabdeckung muss Eröffnung, vollständige Zählung und Endverschiebung abdecken. Ein zunächst gedeckter Eröffnungstag reicht nicht, wenn die Frist oder ihre Verschiebung über die Obergrenze hinausreicht. In diesen Fällen wird kein vermeintlich gültiges Enddatum ausgegeben.

Der Fixture-Vorschlag bindet ELG/KVG an `direct-consolidations`, AVIG an `official-amendment-reconstruction`. Die Originalakte [AS 2025 814](https://www.fedlex.admin.ch/eli/oc/2025/814/de) und [AS 2026 258](https://www.fedlex.admin.ch/eli/oc/2026/258/de) sowie die vollständige Indexgegenprobe sind im [Quellenabgleich, Abschnitt 3.1](quellenabgleich-ap19b.md#31-aviv-ab-februar-2027-technische-exportlücke-und-zwei-nachweisoptionen) dokumentiert. Ein unbekannter oder bloss behaupteter Nachweismodus wird zurückgewiesen. Die drei AVIG-Fälle R23–R25 prüfen die **beantragte** zeitliche Abdeckung, nicht eine bereits erteilte Zeitfreigabe. Die technische Exportlücke wird weder verschwiegen noch als allgemeine Rechtsquellenlücke bezeichnet.

Rechtskette und Ausnahmen: [AP19A-Inventar](sozialversicherungsinventar-ap19a.md), [ELG-/AVIG-Quellenpaket](quellenpaket-ap19a-elg-avig.md), [KVG-Quellenpaket](quellenpaket-ap19a-kvg.md). Zählgrundlage ist [Art. 38 ATSG](https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de). Die Gerichtsprobe bleibt auf die formelle Beschwerdeverbesserung begrenzt, gestützt auf [BGer 8C_767/2008 vom 12. Januar 2009, E. 4.3.2](https://mcp.opencaselaw.ch/entscheid/bger_8C_767_2008#e-4-3-2), nicht auf sämtliche gerichtlichen Anordnungen.

## 3. Alle positiven Datumsfälle zur Fachabnahme

`OBJ` = Einsprache gegen qualifizierte Erstverfügung. `APP` = ordentliche Beschwerde gegen Einspracheentscheid. `ADM` = angeordnete prozessuale Verwaltungstagesfrist. `CORRECTION` = nach Tagen angeordnete formelle Beschwerdeverbesserung. Die vollständigen IDs beginnen mit `CH-SOC-`.

«Beginn» ist der kalendarische Folgetag. «Stillstand» zählt die ab diesem Beginn bis zum nominalen Ende tatsächlich übersprungenen Tage. «Verschiebung» zählt ausschliesslich zusätzliche Tage nach dem nominalen Zählende. Ein Feiertag innerhalb einer laufenden Frist erhöht die Stillstandszahl nicht.

| Fall / Pfad | Eröffnung | Dauer | Beginn | Nominales Ende | Fristende | Stillstand | Verschiebung |
| --- | --- | --- | --- | --- | --- | ---: | ---: |
| R01 · ELG-OBJ | 16.09.2026 | 30 Tage | 17.09.2026 | 16.10.2026 | **16.10.2026** | 0 | 0 |
| R02 · ELG-APP | 20.03.2026 | 30 Tage | 21.03.2026 | 04.05.2026 | **04.05.2026** | 15 | 0 |
| R03 · ELG-ADM | 10.07.2026 | 10 Tage | 11.07.2026 | 21.08.2026 | **21.08.2026** | 32 | 0 |
| R04 · ELG-CORRECTION | 15.12.2026 | 10 Tage | 16.12.2026 | 10.01.2027 | **11.01.2027** | 16 | 1 |
| R05 · AVIG-ALE-OBJ | 13.05.2026 | 30 Tage | 14.05.2026 | 12.06.2026 | **12.06.2026** | 0 | 0 |
| R06 · AVIG-ALE-APP | 26.08.2026 | 30 Tage | 27.08.2026 | 25.09.2026 | **25.09.2026** | 0 | 0 |
| R07 · AVIG-ALE-ADM | 13.05.2026 | 1 Tag | 14.05.2026 | 14.05.2026 | **15.05.2026** | 0 | 1 |
| R08 · AVIG-ALE-CORRECTION | 02.04.2026 | 5 Tage | 03.04.2026 | 17.04.2026 | **17.04.2026** | 10 | 0 |
| R09 · KVG-OKP-OBJ | 05.02.2026 | 30 Tage | 06.02.2026 | 07.03.2026 | **09.03.2026** | 0 | 2 |
| R10 · KVG-OKP-APP | 06.02.2026 | 30 Tage | 07.02.2026 | 08.03.2026 | **09.03.2026** | 0 | 1 |
| R11 · KVG-OKP-ADM | 22.05.2026 | 3 Tage | 23.05.2026 | 25.05.2026 | **26.05.2026** | 0 | 1 |
| R12 · KVG-OKP-CORRECTION | 26.03.2027 | 1 Tag | 27.03.2027 | 05.04.2027 | **05.04.2027** | 9 | 0 |
| R13 · ELG-ADM | 28.03.2026 | 1 Tag | 29.03.2026 | 13.04.2026 | **13.04.2026** | 15 | 0 |
| R14 · AVIG-ALE-ADM | 15.07.2026 | 1 Tag | 16.07.2026 | 16.08.2026 | **17.08.2026** | 31 | 1 |
| R15 · KVG-OKP-ADM | 18.12.2026 | 1 Tag | 19.12.2026 | 03.01.2027 | **04.01.2027** | 15 | 1 |
| R16 · ELG-ADM | 28.02.2026 | 1 Tag | 01.03.2026 | 01.03.2026 | **02.03.2026** | 0 | 1 |
| R17 · ELG-ADM | 28.02.2027 | 1 Tag | 01.03.2027 | 01.03.2027 | **01.03.2027** | 0 | 0 |
| R18 · KVG-OKP-OBJ | 14.07.2026 | 30 Tage | 15.07.2026 | 14.09.2026 | **14.09.2026** | 32 | 0 |
| R19 · KVG-OKP-APP | 16.09.2026 | 30 Tage | 17.09.2026 | 16.10.2026 | **16.10.2026** | 0 | 0 |
| R20 · ELG-ADM | 12.04.2026 | 1 Tag | 13.04.2026 | 13.04.2026 | **13.04.2026** | 0 | 0 |
| R21 · AVIG-ALE-ADM | 15.08.2026 | 1 Tag | 16.08.2026 | 16.08.2026 | **17.08.2026** | 0 | 1 |
| R22 · KVG-OKP-ADM | 02.01.2027 | 1 Tag | 03.01.2027 | 03.01.2027 | **04.01.2027** | 0 | 1 |
| R23 · AVIG-ALE-OBJ | 01.02.2027 | 30 Tage | 02.02.2027 | 03.03.2027 | **03.03.2027** | 0 | 0 |
| R24 · AVIG-ALE-ADM | 31.01.2027 | 1 Tag | 01.02.2027 | 01.02.2027 | **01.02.2027** | 0 | 0 |
| R25 · AVIG-ALE-ADM | 30.01.2027 | 1 Tag | 31.01.2027 | 31.01.2027 | **01.02.2027** | 0 | 1 |

R19 benutzt einen ausdrücklich qualifizierten Berner Vertretungsanker und einen Versicherersitz GE. Das Ergebnis bleibt gleich. Es wird gerade nicht aus dem Versicherersitz auf Feiertage oder Gerichtszuständigkeit geschlossen.

### Vier nachvollziehbare Zählspuren

- **R02, Osterstillstand:** 21.–28. März ergeben acht Tage. 29. März–12. April ruhen 15 Tage. 13.–30. April ergeben weitere 18 Tage, 1.–4. Mai weitere vier. Summe 30, Ende Montag, 4. Mai 2026.
- **R03, Sommerstillstand:** 11.–14. Juli ergeben vier Tage. 15. Juli–15. August ruhen 32 Tage. 16.–21. August ergeben sechs Tage. Der Sonntag 16. August zählt innerhalb der Frist mit. Summe zehn, Ende Freitag, 21. August 2026.
- **R04, Winter und Endverschiebung:** 16./17. Dezember ergeben zwei Tage. 18. Dezember–2. Januar ruhen 16 Tage. 3.–10. Januar ergeben acht Tage. Der zehnte Tag ist Sonntag, 10. Januar, daher Verschiebung auf Montag, 11. Januar 2027.
- **R11, Wochenende und Pfingstmontag:** Samstag, 23. Mai, ist Tag eins, Sonntag Tag zwei, Pfingstmontag Tag drei. Die dreitägige Frist endet nominal am 25. Mai. Nur das Ende wird wegen des Berner Feiertags auf Dienstag, 26. Mai 2026 verschoben.

## 4. Sperrfälle

Alle Sperrfälle geben `arithmetic: null` und `eligibility: blocked-input` zurück. Gesetzlicher ATSG-Ausschluss, noch nicht modellierter Produktumfang und unvollständige Tatsachenqualifikation bleiben unterscheidbar. «Produktgrenze» behauptet keine gesetzliche Unanwendbarkeit des ATSG.

| Fälle | Gegenprobe | Erwartete Sperre |
| --- | --- | --- |
| S01–S03 | Gemeinnützige EL-Leistung, kantonale Mehrleistung, unbekannte gemischte Leistung | Gesetzlicher Ausschluss, Produktgrenze beziehungsweise ungeklärter Gegenstand |
| S04–S08 | Kollektive AMM, Kurzarbeit, Schlechtwetter, Insolvenz, kantonale AMM | S04 gesetzlicher Ausschluss, übrige Fälle ausserhalb des engen ALE-Produktumfangs |
| S09–S10 | Formlose ALV-Abrechnung, AVIG-Bundesverwaltungsgerichtsweg | Kein qualifiziertes Dokument beziehungsweise falsches Stadium |
| S11–S15 | KVG-Leistungserbringerzulassung, Tarifstreit, Prämienverbilligung, Versichererstreit, Schiedsgericht | Gesetzliche ATSG-Ausschlüsse |
| S16–S22 | KVG-Taggeld, VVG-Zusatzversicherung, Prämienforderung, Betreibung, Inkasso, Versicherungspflicht, Pflege-Restfinanzierung | Ausserhalb des individuellen OKP-Leistungspfads. KVG-Taggeld ausdrücklich keine generelle ATSG-Ausnahme |
| S23–S27 | Formloses KVG-Schreiben, übersprungene Einsprache, Replik, Kostenvorschuss, allgemeine Stellungnahme | Dokument oder Handlung nicht qualifiziert. Gerichtliche Verbesserung nicht verallgemeinern |
| S28–S32 | Fehlendes `N`, Fixdatum, Monatsfrist, veränderte gesetzliche 30 Tage | Dauer nicht qualifiziert beziehungsweise gesetzliche Dauer verändert |
| S33–S36 | Unklare Eröffnung oder Zuständigkeit, unbekannter oder ausserbernischer Gerichtskanton | Keine Eröffnungs- oder Zuständigkeitsannahme, kein stiller Rückfall auf Bern |
| S37–S41 | Fehlender oder fremder Feiertagsraum, Behördenanker, Konflikt, unbekannte Region | Keine automatische Feiertagsauflösung aus dem Behördensitz |
| S42–S44 | 29. Februar 2026, Eröffnung vor Testfenster, Ergebnis nach Testfenster | Ungültiges Datum oder fehlende Kalenderabdeckung |
| S45–S48 | Null, negative Zahl, Dezimaldauer, mehr als 365 Tage | Verletzung des begrenzten technischen Tagesvertrags |
| S49–S51 | Zwischenverfügung, materielle Anspruchsfrist, Rechtsverzögerung ohne Entscheid | Kein gewöhnlicher 30-Tage- oder prozessualer Tagespfad |
| S52 | Unzulässiger Kantonscode `XX` im rein informativen Stellensitz | Formal ungültige Referenzeingabe, obwohl dieser Sitz keine Zuständigkeitsentscheidung auslöst |

## 5. Reproduzierbarkeit und Abnahme

```sh
node scripts/check-ap19b-references.mjs
node --test tests/governance/ap19b-references.test.mjs
```

Die 19 Governance-Tests prüfen zusätzlich unter anderem unveränderte Kalenderbytes, fehlende und unbekannte Felder, doppelte IDs, exakt gebundene Normbezeichnungen und versionierte Quellenlinks, veränderte Sollwerte, feste 30 Tage, erlassbezogene statt erlassübergreifend verwechselbare Ausschlüsse, Zeitzonenunabhängigkeit in UTC/Zürich/New York und das Fehlen von AP19B-Importen in Produktquellen oder freigegebenen Manifesten. Ein isolierter Gregorianiktest kennt den 29. Februar 2028, erweitert dadurch aber weder das rechtliche noch das arithmetische Referenzfenster. 2026 und 2027 sind keine Schaltjahre.

**Zur Abnahme stehen die 25 konkreten Sollrechnungen, die 52 Sperrerwartungen und die Unterscheidung zwischen Rechenreferenz, Quellenabdeckung und Freigabe.** Für AVIG 2027 ist die bezeichnete Herleitung aus Originaländerungsrecht ausdrücklich mit abzunehmen. Die Gesamtintegration muss später dieselben Fälle gegen den neuen Produktvertrag und die echte Engine ausführen. Dieses Paket allein ändert keine Rechtsdaten, Laufzeitquelle, Vorschau, SharePoint-/Teams-Installation oder öffentliche Website.
