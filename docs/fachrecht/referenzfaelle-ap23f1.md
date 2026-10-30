# AP23F1 Forschungsreferenzfälle für Zürich Aargau und St Gallen

Stand 22.10.2026. Reproduzierbare Beilage zur Fachvorlage. **Forschungs-Sollwerte, keine Fachabnahme, Produktprüfung, Exportsperrprüfung oder operative Freigabe.**

Das vorgeschlagene Fenster 29.08.2026 bis 31.12.2027 muss alle bewerteten Tage umfassen. Alle positiven Fälle verwenden ausdrücklich synthetische vollständige Qualifikationen gemäss der jeweiligen Forschungsgruppe. Daraus werden keine tatsächlichen Benutzerangaben abgeleitet.

## Umfang und Prüfergebnis

- 17 Forschungsgruppen, alle mit mindestens einem positiven Datumssollwert.
- 80 Fälle, davon 52 mit Datum, 3 ungeklärte F1-O1-Grenzfälle, 20 vorgeschlagene Qualifikationsgrenzen und 5 Fenstergrenzen.
- Zwei Zählweisen gegengeprüft: Tagesfortschaltung und Auswahl des n-ten geeigneten Datums aus einer vollständig enumerierten Datumsmenge. 80 Übereinstimmungen. Die Kalenderparameter sind gemeinsame explizite Forschungsannahmen.
- 19 einzelne Kalenderproben und 8 Jahresregelzählungen. Keine Produktkalender importiert oder verändert.
- ZH-Januar-Vergleich: 490 Kalendertage im Fenster, 0 Unterschiede der Endtagszulässigkeit zwischen RLG und einer um den 2. Januar ergänzten Liste. Das klärt die offene rechtliche Anerkennung ausserhalb dieses Fensters nicht.
- 0 Abweichungen zwischen festgelegten Erwartungen und Referenzrechnung.

## Reproduzieren

Aus dem Repositoryordner `node scripts/check-ap23f1-references.mjs` ausführen. Mit `--write` werden ausschliesslich dieser Tabellen-Nachweis und `outputs/ap23f1-2026-10-22/reference-verification.json` mechanisch erzeugt. Das Skript importiert nur Node-Standardmodule und die eigene Forschungsfixture, keinen Produktkern und keine Releasekalender.

Fixture SHA-256: `cca05cfc359a09eda399f6ee8070ad96c0186f87bbc1259595a4cff2a9287548`. Checker SHA-256: `836e8e16e9c3099c54ee8b855bf44d2b683e02509e2d96faa9a3bcd939180a89`.

## Rechtsgrundlagen und Parameter

Fachliche Herleitung und Fassungen stehen in den Nachweisen für [Zürich](ap23f1/recherche-zh.md), [Aargau](ap23f1/recherche-ag.md) und [St. Gallen](ap23f1/recherche-sg.md). Diese Tabelle ersetzt die rechtliche Fachabnahme nicht.

| Forschungsgruppe | Stufe | Dauer | Kalender | Stillstand |
| --- | --- | ---: | --- | --- |
| ZH-REKURS-30 | recourse | 30 | ZH-RLG | Keiner |
| ZH-ADMIN-ORDERED | administration / recourse | angeordnet | ZH-RLG | Keiner |
| ZH-COURT-30 | court | 30 | ZH-GOG | Drei Perioden |
| ZH-COURT-ORDERED | court | angeordnet | ZH-GOG | Drei Perioden |
| AG-ADMIN-30 | administration | 30 | AG-PROCEDURAL | Keiner |
| AG-COURT-30 | court | 30 | AG-PROCEDURAL | Drei Perioden |
| AG-ADMIN-ORDERED | administration | angeordnet | AG-PROCEDURAL | Keiner |
| AG-COURT-ORDERED | court | angeordnet | AG-PROCEDURAL | Drei Perioden |
| AG-EXECUTION-10 | court | 10 | AG-PROCEDURAL | Drei Perioden |
| SG-ADMIN-14 | administration | 14 | SG-VRP | Keiner |
| SG-VRK-14 | vrk | 14 | SG-VRP | Drei Perioden |
| SG-COURT-14 | court | 14 | SG-VRP | Drei Perioden |
| SG-ADMIN-MEASURES-5 | administration | 5 | SG-VRP | Keiner |
| SG-COURT-INTERIM-5 | court | 5 | SG-VRP | Keiner |
| SG-ADMIN-ORDERED | administration | angeordnet | SG-VRP | Keiner |
| SG-VRK-ORDERED | vrk | angeordnet | SG-VRP | Drei Perioden |
| SG-COURT-ORDERED | court | angeordnet | SG-VRP | Drei Perioden |

Die drei Perioden laufen einschliesslich Ostern minus sieben bis plus sieben Tage, 15. Juli bis 15. August und 18. Dezember bis 2. Januar. Feiertage und Wochenenden innerhalb einer laufenden Frist werden mitgezählt, ausser sie liegen in einem anwendbaren Stillstand. Ein erster Zähltag nach dem Stillstand kann Sonntag sein.

ZH-RLG enthält neun Tage. ZH-GOG enthält zusätzlich den 2. Januar. AG enthält tatsächlich 14 Tage: 1. und 2. Januar, 1. Mai, 1. und 15. August, 1. November, 8., 25. und 26. Dezember sowie Ostern minus zwei, plus eins, plus 39, plus 50 und plus 60 Tage. SG enthält neun Tage und keinen 2. Januar. Dieser bleibt bei den qualifizierten SG-Gerichtspfaden unabhängig davon letzter Winterstillstandstag.

Die neue ZH-Normbindung ab 2027 und die organisatorische SG-Fassung ab 1. Juni 2027 sind in den positiven Ergebnissen zeitlich ausgewiesen. Die gewöhnliche Tagesarithmetik bleibt gleich. Abruffiktion, besondere Kanalstörung und individuelle Friständerung werden dadurch nicht berechnet.

Die positiven SG-VRK-Fälle betreffen ausschliesslich den Rekurs gegen eine bereits formell eröffnete kantonale Departementsverfügung über Zugang zu amtlichen Dokumenten nach Art. 17 OeffG, mit Zuständigkeit der VRK gemäss VRP Art. 41quater Abs. 1 Bst. a bis und Verweisung nach OeffG Art. 18 Abs. 1. Keine Steuer- oder sonstige Ferienausnahme. Das vorgelagerte Verlangen nach einer formellen Verfügung innert 14 Tagen ist nicht derselbe Pfad. SG-VRK-ORDERED bezeichnet eine tatsächlich angeordnete Eingabe in genau diesem Rekursverfahren.

## Datumssollwerte und vorgeschlagene Grenzen

| Fall | Forschungsgruppe | Empfang | Tage | Forschungs-Sollwert oder vorgeschlagene Grenze | Zweck |
| --- | --- | --- | ---: | --- | --- |
| ZH01 | ZH-REKURS-30 | 02.10.2026 | 30 | 02.11.2026 | Ordentlicher Rekurs |
| ZH02 | ZH-ADMIN-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Verwaltungseingabe |
| ZH03 | ZH-COURT-30 | 02.10.2026 | 30 | 02.11.2026 | Ordentliche Gerichtsbeschwerde |
| ZH04 | ZH-COURT-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Gerichtseingabe |
| AG01 | AG-ADMIN-30 | 02.10.2026 | 30 | 02.11.2026 | Verwaltungsinterne Beschwerde |
| AG02 | AG-COURT-30 | 02.10.2026 | 30 | 02.11.2026 | Ordentliche Gerichtsbeschwerde |
| AG03 | AG-ADMIN-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Verwaltungseingabe |
| AG04 | AG-COURT-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Gerichtseingabe |
| AG05 | AG-EXECUTION-10 | 02.10.2026 | 10 | 12.10.2026 | Qualifizierter Vollstreckungsteil |
| SG01 | SG-ADMIN-14 | 02.10.2026 | 14 | 16.10.2026 | Ordentlicher Verwaltungsrekurs |
| SG02 | SG-VRK-14 | 02.10.2026 | 14 | 16.10.2026 | VRK-Rekurs gegen formelle kantonale Departementsverfügung über Zugang zu amtlichen Dokumenten nach Art. 17 OeffG. Keine Steuer- oder sonstige Ferienausnahme |
| SG03 | SG-COURT-14 | 02.10.2026 | 14 | 16.10.2026 | Ordentliche Gerichtsbeschwerde |
| SG04 | SG-ADMIN-MEASURES-5 | 02.10.2026 | 5 | 07.10.2026 | Qualifizierter erster Massnahmenrekurs |
| SG05 | SG-COURT-INTERIM-5 | 02.10.2026 | 5 | 07.10.2026 | Qualifizierte vorsorgliche Massnahme Art. 60 mit richtiger Ausnahmebelehrung |
| SG06 | SG-ADMIN-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Verwaltungseingabe |
| SG07 | SG-VRK-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete VRK-Eingabe im Rekurs gegen formelle kantonale Departementsverfügung über Dokumentenzugang. Keine Steuer- oder sonstige Ferienausnahme |
| SG08 | SG-COURT-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Gerichtseingabe |
| ZH05 | ZH-REKURS-30 | 10.07.2027 | 30 | 09.08.2027 | Verwaltungsrekurs ohne Sommerstillstand |
| ZH06 | ZH-COURT-30 | 10.07.2027 | 30 | 10.09.2027 | Vier gezählte Tage vor Sommerstillstand |
| ZH07 | ZH-COURT-30 | 20.07.2027 | 30 | 14.09.2027 | Zustellung während Sommerstillstand |
| ZH08 | ZH-COURT-ORDERED | 20.07.2027 | 10 | 25.08.2027 | Gerichtliche angeordnete Sommerfrist |
| ZH09 | ZH-ADMIN-ORDERED | 20.07.2027 | 10 | 30.07.2027 | Angeordnete Rekurseingabe ohne Sommerstillstand |
| ZH10 | ZH-ADMIN-ORDERED | 30.04.2027 | 1 | 03.05.2027 | 1. Mai und Wochenende |
| ZH11 | ZH-REKURS-30 | 03.12.2026 | 30 | 04.01.2027 | Kein Winterstillstand, Jan2 Samstag |
| ZH12 | ZH-COURT-30 | 03.12.2026 | 30 | 18.01.2027 | Gerichtlicher Winterstillstand und Revisionswechsel |
| ZH13 | ZH-COURT-30 | 17.02.2027 | 30 | 19.03.2027 | Berechenbarer Kontrollfall vor Osterstillstand |
| ZH14 | ZH-COURT-30 | 18.02.2027 | 30 | F1-O1, offen. Letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Ungeklärte reine Endverschiebung in neuen Osterstillstand |
| ZH15 | ZH-COURT-ORDERED | 20.03.2027 | 1 | 05.04.2027 | Tatsächlicher Beginn während Osterstillstand ist kein F1-O1 |
| ZH16 | ZH-ADMIN-ORDERED | 29.08.2026 | 1 | 31.08.2026 | Frühe inklusive Fenstergrenze mit Wochenendverschiebung |
| ZH17 | ZH-ADMIN-ORDERED | 28.08.2026 | 1 | Vorgeschlagene Fenstergrenze, kein Datumssollwert | Vor vorgeschlagenem Fenster |
| ZH18 | ZH-ADMIN-ORDERED | 30.12.2027 | 1 | 31.12.2027 | Späte inklusive Fenstergrenze |
| ZH19 | ZH-ADMIN-ORDERED | 31.12.2027 | 1 | Vorgeschlagene Fenstergrenze, kein Datumssollwert | Empfang gedeckt, Enddatum ausserhalb |
| ZH20 | ZH-COURT-ORDERED | 17.12.2027 | 1 | Vorgeschlagene Fenstergrenze, kein Datumssollwert | Stillstand führt über späte Fenstergrenze |
| ZH21 | ZH-COURT-ORDERED | 30.12.2026 | 1 | 04.01.2027 | Erster Zähltag nach Winterstillstand ist Sonntag |
| AG06 | AG-ADMIN-ORDERED | 14.12.2026 | 10 | 24.12.2026 | Verwaltung ohne Winterstillstand und ohne Heiligabend |
| AG07 | AG-COURT-ORDERED | 14.12.2026 | 10 | 11.01.2027 | Gerichtliche Eingabe mit Winterstillstand |
| AG08 | AG-EXECUTION-10 | 20.07.2027 | 10 | 25.08.2027 | Zehntägiger Vollstreckungsweg mit Sommerstillstand |
| AG09 | AG-ADMIN-ORDERED | 26.05.2027 | 1 | 28.05.2027 | Fronleichnam kantonsweit, auch Aarau |
| AG10 | AG-ADMIN-ORDERED | 29.10.2027 | 3 | 02.11.2027 | Allerheiligen kantonsweit, auch Lenzburg |
| AG11 | AG-COURT-30 | 18.02.2027 | 30 | F1-O1, offen. Letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Ungeklärte reine Endverschiebung in Osterstillstand |
| AG12 | AG-COURT-30 | 17.02.2027 | 30 | 19.03.2027 | Berechenbarer Kontrollfall vor Osterstillstand |
| AG13 | AG-ADMIN-ORDERED | 20.03.2027 | 10 | 30.03.2027 | Verwaltung zählt auch Karfreitag und Ostermontag innerhalb der Frist |
| AG14 | AG-COURT-ORDERED | 20.03.2027 | 10 | 14.04.2027 | Gerichtliche Resttagezählung nach Osterstillstand |
| AG15 | AG-ADMIN-ORDERED | 01.01.2027 | 1 | 04.01.2027 | Berchtoldstag und Wochenende |
| AG16 | AG-ADMIN-ORDERED | 07.12.2026 | 1 | 09.12.2026 | Mariä Empfängnis kantonsweit |
| AG17 | AG-ADMIN-ORDERED | 14.08.2027 | 1 | 16.08.2027 | Mariä Himmelfahrt, hier zugleich Sonntag |
| SG09 | SG-ADMIN-14 | 10.07.2027 | 14 | 26.07.2027 | Verwaltungsrekurs ohne Sommerstillstand |
| SG10 | SG-COURT-14 | 10.07.2027 | 14 | 25.08.2027 | Gerichtsbeschwerde mit Sommerstillstand |
| SG11 | SG-VRK-14 | 17.12.2026 | 14 | 18.01.2027 | Dokumentenzugangsrekurs gegen formelle kantonale Departementsverfügung mit Winterstillstand, keine Ferienausnahme |
| SG12 | SG-COURT-INTERIM-5 | 17.12.2026 | 5 | 22.12.2026 | Art.-60-Massnahme ohne Winterstillstand |
| SG13 | SG-ADMIN-ORDERED | 22.10.2026 | 10 | 02.11.2026 | Allerheiligen und Wochenende am Ende |
| SG14 | SG-VRK-14 | 20.03.2027 | 14 | 19.04.2027 | Dokumentenzugangsrekurs gegen formelle kantonale Departementsverfügung, keine Ferienausnahme. Osterstillstand und Endwochenende |
| SG15 | SG-ADMIN-14 | 20.03.2027 | 14 | 05.04.2027 | Verwaltungsrekurs ohne Osterstillstand |
| SG16 | SG-COURT-ORDERED | 10.03.2027 | 10 | F1-O1, offen. Letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Reine Endverschiebung 20.03. in neuen Osterstillstand |
| SG17 | SG-COURT-ORDERED | 09.03.2027 | 10 | 19.03.2027 | Kontrollfall zu SG16 |
| SG18 | SG-ADMIN-ORDERED | 31.12.2026 | 2 | 04.01.2027 | Jan2 kein Feiertag, aber 2027 Samstag |
| SG19 | SG-COURT-ORDERED | 30.12.2026 | 1 | 04.01.2027 | Jan2 bleibt gerichtlicher Stillstandstag |
| SG20 | SG-COURT-14 | 16.12.2027 | 14 | Vorgeschlagene Fenstergrenze, kein Datumssollwert | Gedeckter Empfang reicht bei Enddatum ausserhalb nicht aus |
| SG21 | SG-ADMIN-ORDERED | 26.05.2027 | 1 | 27.05.2027 | Kein Fronleichnam allein aufgrund AG-Parteiort |
| N01 | UNKNOWN | 02.10.2026 | 30 | Vorgeschlagene Qualifikationsgrenze: unknownResearchPath | Unbekannter Pfad, vorgeschlagene Qualifikationsgrenze |
| N02 | ZH-COURT-30 | 02.10.2026 | 30 | Vorgeschlagene Qualifikationsgrenze: stageDoesNotMatchPath | Rekurs nicht allein wegen Gerichtsname als Gerichtsbeschwerde behandeln |
| N03 | SG-VRK-14 | 02.10.2026 | 14 | Vorgeschlagene Qualifikationsgrenze: stageDoesNotMatchPath | VRK nicht als Verwaltungsbehörde ohne Ferien behandeln |
| N04 | SG-ADMIN-MEASURES-5 | 02.10.2026 | 5 | Vorgeschlagene Qualifikationsgrenze: actionNotQualified | Beweisanordnung ist nicht automatisch qualifizierte Massnahme |
| N05 | AG-EXECUTION-10 | 02.10.2026 | 10 | Vorgeschlagene Qualifikationsgrenze: actionNotQualified | Kostenentscheid nicht Vollstreckungspfad |
| N06 | AG-COURT-ORDERED | 02.10.2026 | 10 | Vorgeschlagene Qualifikationsgrenze: paymentOrMaterialPerformanceOutsideScope | Zahlung oder materielle Erfüllung nicht Verfahrenseingabe |
| N07 | ZH-REKURS-30 | 02.10.2026 | 30 | Vorgeschlagene Qualifikationsgrenze: openingNotQualified | Ungeklärter Begründungsschritt |
| N08 | SG-COURT-14 | 02.10.2026 | 14 | Vorgeschlagene Qualifikationsgrenze: specialLawNotExcluded | Spezialrecht nicht allgemeiner Gerichtsferienpfad |
| N09 | AG-EXECUTION-10 | 02.10.2026 | 30 | Vorgeschlagene Qualifikationsgrenze: statutoryDurationMismatch | Gesetzliche Zehntagesdauer nicht frei austauschbar |
| N10 | SG-COURT-INTERIM-5 | 02.10.2026 | 5 | Vorgeschlagene Qualifikationsgrenze: exceptionNoticeNeedsIndividualReview | SG-O1, Ausnahmebelehrung fehlt oder ist streitig |
| N11 | SG-COURT-INTERIM-5 | 02.10.2026 | 5 | Vorgeschlagene Qualifikationsgrenze: actionNotQualified | Kein generischer Weiterzug nach endgültigem Vollstreckungsrekurs |
| N12 | ZH-REKURS-30 | 01.02.2027 | 30 | Vorgeschlagene Qualifikationsgrenze: zh2027SpecialChannelCase | ZH-Revisionsfall mit Kanalstörung nicht automatisch verlängern |
| N13 | ZH-ADMIN-ORDERED | 02.10.2026 | 1 | Vorgeschlagene Qualifikationsgrenze: unsupportedUnitOrDirection | Monatsfrist nicht als Tagesfrist deklarieren |
| N14 | SG-ADMIN-ORDERED | 02.10.2026 | nicht bestimmt | Vorgeschlagene Qualifikationsgrenze: orderedOrStatutoryDaysNotSpecified | Keine erfundene zweite Ergänzungsfrist ohne konkrete Tagesanordnung |
| N15 | ZH-ADMIN-ORDERED | 02.10.2026 | 10 | Vorgeschlagene Qualifikationsgrenze: targetOutsideScope | Kommunale Zielstelle ausserhalb der Fachtranche |
| N16 | AG-ADMIN-ORDERED | 02.10.2026 | 10 | Vorgeschlagene Qualifikationsgrenze: fixedDateOrDeviatingStart | Fixtermin nicht angeordnete Tagesfrist |
| N17 | AG-COURT-30 | 02.10.2026 | 30 | Vorgeschlagene Qualifikationsgrenze: termChangeNeedsIndividualReview | Wiederherstellung nicht automatische Grundrechnung |
| N18 | SG-ADMIN-14 | 28.08.2026 | 14 | Vorgeschlagene Fenstergrenze, kein Datumssollwert | Frühe Fenstergrenze auch für SG |
| N19 | AG-ADMIN-30 | 02.10.2026 | 30 | Vorgeschlagene Qualifikationsgrenze: holidayAnchorNotQualified | Keine freie Feiertagskantonwahl statt Behördenortsbindung |
| N20 | ZH-COURT-30 | 01.02.2027 | 30 | Vorgeschlagene Qualifikationsgrenze: openingNotQualified | Keine neue Abruffiktionsberechnung ab 2027 |
| N21 | SG-VRK-14 | 02.10.2026 | 14 | Vorgeschlagene Qualifikationsgrenze: vrkSubjectNotQualified | Vorgelagertes Verfügungsverlangen nach Art. 17 OeffG ist nicht der VRK-Rekurs gegen die bereits eröffnete formelle Departementsverfügung |

## Ungeklärte Endverschiebung F1 O1

ZH14, AG11 und SG16 zählen bis Samstag, 20. März 2027. Der nächste gewöhnliche Werktag wäre der 22. März. Der anwendbare Osterstillstand beginnt jedoch bereits am 21. März. Der vorgeschlagene vorsichtige Produktumfang weist deshalb keinen definitiven Wert aus. **Dies ist eine ungeklärte Auslegung mit vorgeschlagener enger Produktgrenze, keine bewiesene gesetzliche Sperrnorm.** Die Reproduktion zeigt ausschliesslich, dass die Forschungsrechnung genau diese Kollision erkennt.

Die übrigen negativen Fälle sind Vorschläge zur späteren Fallqualifikation. Es wurde nicht geprüft oder behauptet, dass eine bestehende App diese Fälle technisch sperrt. Ebenso fand kein Kalenderexport statt.

## Kalenderproben ausserhalb des Fallfensters

Einzelne Januarproben 2026 und die isolierende 1.-Mai-Probe 2028 prüfen ausschliesslich die Konstruktion und Unterscheidung der Listen. Sie erweitern weder das vorgeschlagene Fallfenster noch bestehende Freigaben.

| Kalender | Datum | Feiertag in dieser Forschungsmenge | Einordnung |
| --- | --- | --- | --- |
| ZH-RLG | 02.01.2026 | Nein | calendarConstructionOnlyOutsideCaseWindow |
| ZH-GOG | 02.01.2026 | Ja | calendarConstructionOnlyOutsideCaseWindow |
| SG-VRP | 02.01.2026 | Nein | calendarConstructionOnlyOutsideCaseWindow |
| AG-PROCEDURAL | 02.01.2026 | Ja | calendarConstructionOnlyOutsideCaseWindow |
| ZH-RLG | 02.01.2027 | Nein | calendarMembershipNotWeekdayEffect |
| ZH-GOG | 02.01.2027 | Ja | calendarMembershipNotWeekdayEffect |
| SG-VRP | 02.01.2027 | Nein | calendarMembershipNotWeekdayEffect |
| AG-PROCEDURAL | 27.05.2027 | Ja | calendarMembership |
| SG-VRP | 27.05.2027 | Nein | calendarMembership |
| ZH-GOG | 27.05.2027 | Nein | calendarMembership |
| AG-PROCEDURAL | 01.11.2027 | Ja | calendarMembership |
| SG-VRP | 01.11.2027 | Ja | calendarMembership |
| ZH-RLG | 01.11.2027 | Nein | calendarMembership |
| AG-PROCEDURAL | 08.12.2026 | Ja | calendarMembership |
| ZH-GOG | 08.12.2026 | Nein | calendarMembership |
| AG-PROCEDURAL | 24.12.2026 | Nein | calendarMembership |
| AG-PROCEDURAL | 01.05.2028 | Ja | calendarConstructionOnlyOutsideCaseWindow |
| ZH-RLG | 01.05.2028 | Ja | calendarConstructionOnlyOutsideCaseWindow |
| SG-VRP | 01.05.2028 | Nein | calendarConstructionOnlyOutsideCaseWindow |

## Abweichungen

Keine. Sämtliche festgelegten Forschungs-Erwartungen stimmen mit beiden Zählweisen überein.


Der Nachweis erteilt keine Fach-, Release- oder Betriebsfreigabe. Rechenlogik, freigegebene Rechtsdaten, bestehende Testdateien und E/Q/P bleiben unverändert.
