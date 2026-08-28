# Rechtsmatrix für den MVP

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP4 |
| Fachstand | bereit für die Datenmodellierung in AP5 |
| Quellen geprüft am | 29. August 2026 |
| Verantwortlich | David Steimer |
| Rechtsprofile | StPO, ZPO, BGG, VwVG, VRPG Bern |
| Räumlicher MVP-Umfang | Bund und Kanton Bern |
| Fristeinheit im MVP | nach Tagen bestimmte Fristen |

## 1. Zweck und Grenzen

Diese Matrix übersetzt die gesetzlichen Grundregeln des Fristenlaufs in prüfbare fachliche Regeln. Die Arbeits-IDs sollen in AP5 wiederverwendet werden. Sie legen das technische Schema noch nicht fest.

Der MVP berechnet ausschliesslich nach Tagen bestimmte Fristen. Stunden-, Wochen-, Monats- und Jahresfristen sowie rein materiell-rechtliche Fristen sind nicht Teil des MVP. Wo eine Norm auch für andere Fristarten gilt, ist dies als Hinweis dokumentiert, aber nicht als Funktionsumfang freigegeben.

Die Eingabe `Zustellungsdatum` muss das rechtlich massgebende Datum der Zustellung oder des fristauslösenden Ereignisses bezeichnen. Der Rechner entscheidet im Grundmodus nicht, ob eine reale Postzustellung, ein erfolgloser Zustellversuch oder eine gesetzliche Zustellfiktion dieses Datum bestimmt. Die besondere Fiktion nach ZPO ist separat ausgewiesen. Näheres steht unter [offene Fachfragen](offene-fachfragen.md).

Der Rechner ist ein Arbeitsmittel. Bei unklarer Zustellung, unbekannter Spezialgesetzgebung oder widersprüchlichen Anknüpfungspunkten muss er warnen und darf keine uneingeschränkt verlässliche Berechnung behaupten.

## 2. Einheitliches Berechnungsmodell

Für eine Frist von `N` Tagen und das rechtlich massgebende Zustellungsdatum `Z` gilt im Grundmodell:

1. `Z` wird nicht mitgezählt.
2. Der folgende Kalendertag ist der erste mögliche Zähltag.
3. Jeder Kalendertag zählt, sofern er nicht in einen anwendbaren Fristenstillstand fällt.
4. Der Tag, an dem der Zähler `N` erreicht, ist das rechnerische Fristende.
5. Fällt dieses Ende auf einen Samstag, Sonntag oder massgebenden Feiertag, wird es bis zum nächsten Werktag verschoben.
6. Die Rechenspur zeigt Zustellungsdatum, ersten Zähltag, Stillstandstage, rechnerisches Ende, Verschiebungsgrund und endgültiges Fristende getrennt.

Ein Feiertag innerhalb einer laufenden Frist wird grundsätzlich mitgezählt. Er verschiebt das Ergebnis nur, wenn er auf den letzten Fristtag fällt. Ein Fristenstillstand ist etwas anderes: Tage innerhalb des Stillstands werden nicht verbraucht.

## 3. Profilübersicht

| Profil | Fristbeginn | Fristenstillstand | Wichtigste Ausnahmen | Feiertagsanknüpfung für den MVP |
| --- | --- | --- | --- | --- |
| StPO | Tag nach Zustellung oder Ereignis | keiner | keine Gerichtsferien | Kanton des Wohnsitzes oder Sitzes der Partei oder ihres Rechtsbeistands |
| ZPO | Tag nach Zustellung oder Ereignis | Ostern, Sommer, Jahreswechsel | Schlichtungs- und summarisches Verfahren, besondere SchKG-Regel | Gerichtsort |
| BGG | Tag nach Zustellung oder Ereignis | Ostern, Sommer, Jahreswechsel, nur bei Tagesfristen | vorsorgliche Massnahmen, Wechselbetreibung, Stimmrecht, internationale Rechts- und Steueramtshilfe, öffentliche Beschaffungen | Kanton des Wohnsitzes oder Sitzes der Partei oder ihrer Vertretung |
| VwVG | Tag nach Mitteilung oder Ereignis | Ostern, Sommer, Jahreswechsel, nur bei Tagesfristen | vorsorgliche Massnahmen und öffentliche Beschaffungen | Kanton des Wohnsitzes oder Sitzes der Partei oder ihrer Vertretung |
| VRPG Bern | Tag nach Mitteilung, amtlicher Publikation oder Ereignis | kein allgemeiner Stillstand im VRPG | abweichendes Bundesrecht sowie Abstimmungs- und Wahlrecht vorbehalten | bernisches Recht, unabhängig vom ausserkantonalen Wohnsitz der Partei |

## 4. Regelkatalog StPO

Primärquelle ist die Schweizerische Strafprozessordnung, SR 312.0, Stand 1. April 2025.

| Arbeits-ID | Regel | Fachparameter | Quelle | Gültigkeit und Status |
| --- | --- | --- | --- | --- |
| `STPO-DELIV-001` | Eine nicht abgeholte eingeschriebene Postsendung gilt am siebten Tag nach dem erfolglosen Zustellungsversuch als erfolgt, sofern die Person mit einer Zustellung rechnen musste. | optionale Vorverarbeitung des Zustellungsdatums | Art. 85 Abs. 4 Bst. a StPO | geltendes Recht, geprüft 29.08.2026 |
| `STPO-START-001` | Eine durch Mitteilung oder Ereignis ausgelöste Frist beginnt am folgenden Tag. | `startOffsetDays = 1` | Art. 90 Abs. 1 StPO | geltendes Recht, geprüft 29.08.2026 |
| `STPO-COUNT-001` | Während des Fristenlaufs werden Kalendertage gezählt. Wochenenden und Feiertage innerhalb der Frist werden nicht übersprungen. | `countMode = calendarDays` | Art. 90 StPO in Verbindung mit Art. 89 Abs. 2 StPO | geltendes Recht, geprüft 29.08.2026 |
| `STPO-SUSP-001` | Im Strafverfahren gibt es keine Gerichtsferien. | `suspensions = none` | Art. 89 Abs. 2 StPO | geltendes Recht, geprüft 29.08.2026 |
| `STPO-END-001` | Endet die Frist an einem Samstag, Sonntag oder anerkannten Feiertag, gilt der nächste Werktag. | `endShift = nextWorkingDay` | Art. 90 Abs. 2 StPO | geltendes Recht, geprüft 29.08.2026 |
| `STPO-HOL-001` | Massgebend ist das Feiertagsrecht des Kantons, in dem die Partei oder ihr Rechtsbeistand Wohnsitz oder Sitz hat. | `holidayAnchor = partyOrCounselCanton` | Art. 90 Abs. 2 StPO | seit 01.01.2011, geprüft 29.08.2026 |
| `STPO-COMP-001` | Eingaben sind spätestens am letzten Tag der Strafbehörde, der Schweizerischen Post, einer schweizerischen Vertretung oder bei inhaftierten Personen der Anstaltsleitung zu übergeben. | Hinweis zur Fristwahrung | Art. 91 Abs. 1 und 2 StPO | geltendes Recht, geprüft 29.08.2026 |
| `STPO-EXT-001` | Gesetzliche Fristen sind nicht erstreckbar. Behördlich angesetzte Fristen können bei rechtzeitigem und begründetem Gesuch erstreckt werden. | Warnhinweis, keine automatische Verlängerung | Art. 89 Abs. 1 und Art. 92 StPO | geltendes Recht, geprüft 29.08.2026 |

### Profilgrenzen

- Das Profil kennt keinen Fristenstillstand, auch nicht über Ostern, im Sommer oder über den Jahreswechsel.
- Widersprechen sich Wohnsitz oder Sitz von Partei und Rechtsbeistand hinsichtlich des Feiertags, muss die Auswahl sichtbar bestätigt oder übersteuert werden.
- Die Fristwiederherstellung nach Art. 94 StPO wird nicht berechnet.

## 5. Regelkatalog ZPO

Primärquelle ist die Schweizerische Zivilprozessordnung, SR 272, Stand 1. Juli 2026.

| Arbeits-ID | Regel | Fachparameter | Quelle | Gültigkeit und Status |
| --- | --- | --- | --- | --- |
| `ZPO-DELIV-001` | Wird gewöhnliche Post an einem Samstag, Sonntag oder am Gerichtsort anerkannten Feiertag zugestellt, gilt die Mitteilung am nächsten Werktag als erfolgt. | optionale Vorverarbeitung des Zustellungsdatums | Art. 142 Abs. 1bis ZPO | seit 01.01.2025, geprüft 29.08.2026 |
| `ZPO-DELIV-002` | Eine nicht abgeholte eingeschriebene Postsendung gilt am siebten Tag nach dem erfolglosen Zustellungsversuch als erfolgt, sofern die Person mit einer Zustellung rechnen musste. | optionale Vorverarbeitung des Zustellungsdatums | Art. 138 Abs. 3 Bst. a ZPO | geltendes Recht, geprüft 29.08.2026 |
| `ZPO-START-001` | Eine durch Mitteilung oder Ereignis ausgelöste Frist beginnt am folgenden Tag. | `startOffsetDays = 1` | Art. 142 Abs. 1 ZPO | geltendes Recht, geprüft 29.08.2026 |
| `ZPO-COUNT-001` | Es werden Kalendertage gezählt. Anwendbare Stillstandstage werden nicht verbraucht. | `countMode = calendarDaysWithSuspension` | Art. 142, Art. 145 und Art. 146 ZPO | geltendes Recht, geprüft 29.08.2026 |
| `ZPO-SUSP-001` | Gesetzliche und gerichtliche Fristen stehen vom siebten Tag vor Ostern bis und mit dem siebten Tag nach Ostern, vom 15. Juli bis und mit 15. August sowie vom 18. Dezember bis und mit 2. Januar still. | drei inklusive Zeiträume | Art. 145 Abs. 1 ZPO | geltendes Recht, geprüft 29.08.2026 |
| `ZPO-SUSP-002` | Erfolgt die Zustellung während des Stillstands, beginnt die Frist am ersten Tag nach dessen Ende. | `deliveryDuringSuspension = firstDayAfter` | Art. 146 Abs. 1 ZPO | geltendes Recht, geprüft 29.08.2026 |
| `ZPO-SUSP-EXC-001` | Im Schlichtungsverfahren und im summarischen Verfahren gilt der Fristenstillstand nicht. | `suspension = none` bei diesen Verfahrensarten | Art. 145 Abs. 2 ZPO | geltendes Recht, geprüft 29.08.2026 |
| `ZPO-SCHKG-001` | Für gerichtliche Klagen nach SchKG gilt der ZPO-Stillstand. Für die Beschwerde an die Aufsichtsbehörde gilt er nicht. | verfahrensabhängige Ausnahme | Art. 145 Abs. 4 ZPO | seit 01.01.2025, geprüft 29.08.2026 |
| `ZPO-END-001` | Endet die Frist an einem Samstag, Sonntag oder am Gerichtsort anerkannten Feiertag, gilt der nächste Werktag. | `endShift = nextWorkingDay` | Art. 142 Abs. 3 ZPO | geltendes Recht, geprüft 29.08.2026 |
| `ZPO-HOL-001` | Für die Feiertage ist der Gerichtsort massgebend. | `holidayAnchor = courtLocation` | Art. 142 Abs. 1bis und 3 ZPO | geltendes Recht, geprüft 29.08.2026 |
| `ZPO-COMP-001` | Eingaben sind spätestens am letzten Tag dem Gericht, der Schweizerischen Post oder einer schweizerischen Vertretung zu übergeben. | Hinweis zur Fristwahrung | Art. 143 ZPO | geltendes Recht, geprüft 29.08.2026 |
| `ZPO-EXT-001` | Gesetzliche Fristen sind nicht erstreckbar. Gerichtliche Fristen können aus zureichenden Gründen erstreckt werden, wenn das Gesuch vor Fristablauf gestellt wird. | Warnhinweis, keine automatische Verlängerung | Art. 144 ZPO | geltendes Recht, geprüft 29.08.2026 |

### Profilgrenzen

- Der Nutzer muss die Verfahrensart angeben oder bestätigen, bevor ein Fristenstillstand angewendet wird.
- Die besondere Zustellungsfiktion gilt nur für gewöhnliche Post im Sinne von Art. 138 Abs. 4 ZPO. Sie darf nicht pauschal auf jede Zustellungsart übertragen werden.
- Die Fristwiederherstellung nach Art. 148 und 149 ZPO wird nicht berechnet.

## 6. Regelkatalog BGG

Primärquelle ist das Bundesgerichtsgesetz, SR 173.110, Stand 1. April 2026.

| Arbeits-ID | Regel | Fachparameter | Quelle | Gültigkeit und Status |
| --- | --- | --- | --- | --- |
| `BGG-DELIV-001` | Eine nur gegen Unterschrift überbrachte Mitteilung gilt spätestens am siebten Tag nach dem ersten erfolglosen Zustellungsversuch als erfolgt. | optionale Vorverarbeitung des Zustellungsdatums | Art. 44 Abs. 2 BGG | geltendes Recht, geprüft 29.08.2026 |
| `BGG-START-001` | Eine durch Mitteilung oder Ereignis ausgelöste Frist beginnt am folgenden Tag. | `startOffsetDays = 1` | Art. 44 Abs. 1 BGG | geltendes Recht, geprüft 29.08.2026 |
| `BGG-COUNT-001` | Nach Tagen bestimmte Fristen zählen Kalendertage. Anwendbare Stillstandstage werden nicht verbraucht. | `countMode = calendarDaysWithSuspension` | Art. 44 bis 46 BGG | geltendes Recht, geprüft 29.08.2026 |
| `BGG-SUSP-001` | Gesetzlich oder richterlich nach Tagen bestimmte Fristen stehen vom siebten Tag vor Ostern bis und mit dem siebten Tag nach Ostern, vom 15. Juli bis und mit 15. August sowie vom 18. Dezember bis und mit 2. Januar still. | drei inklusive Zeiträume | Art. 46 Abs. 1 BGG | geltendes Recht, geprüft 29.08.2026 |
| `BGG-SUSP-EXC-001` | Kein Stillstand gilt bei aufschiebender Wirkung und anderen vorsorglichen Massnahmen, Wechselbetreibung, Stimmrechtssachen, internationaler Rechtshilfe in Strafsachen, internationaler Amtshilfe in Steuersachen und öffentlichen Beschaffungen. | `suspension = none` bei den aufgeführten Sachgruppen | Art. 46 Abs. 2 BGG | Beschaffungswesen seit 01.01.2021, übriger Bestand geprüft 29.08.2026 |
| `BGG-END-001` | Endet die Frist an einem Samstag, Sonntag oder anerkannten Feiertag, gilt der nächste Werktag. | `endShift = nextWorkingDay` | Art. 45 Abs. 1 BGG | geltendes Recht, geprüft 29.08.2026 |
| `BGG-HOL-001` | Massgebend ist das Feiertagsrecht des Kantons, in dem die Partei oder ihre Vertretung Wohnsitz oder Sitz hat. | `holidayAnchor = partyOrRepresentativeCanton` | Art. 45 Abs. 2 BGG | geltendes Recht, geprüft 29.08.2026 |
| `BGG-COMP-001` | Eingaben sind spätestens am letzten Tag dem Bundesgericht, der Schweizerischen Post oder einer schweizerischen Vertretung zu übergeben. | Hinweis zur Fristwahrung | Art. 48 BGG | geltendes Recht, geprüft 29.08.2026 |
| `BGG-EXT-001` | Gesetzliche Fristen sind nicht erstreckbar. Richterlich bestimmte Fristen können aus zureichenden Gründen bei rechtzeitigem Gesuch erstreckt werden. | Warnhinweis, keine automatische Verlängerung | Art. 47 BGG | geltendes Recht, geprüft 29.08.2026 |

### Profilgrenzen

- Der Stillstand gilt im BGG nur für nach Tagen bestimmte Fristen.
- Die Sachgruppe muss vor Anwendung des Stillstands bestätigt werden.
- Das noch nicht in Kraft gesetzte Bundesgesetz über Wochenend- und Feiertagszustellungen wird nicht vorweggenommen.
- Die Fristwiederherstellung nach Art. 50 BGG wird nicht berechnet.

## 7. Regelkatalog VwVG

Primärquelle ist das Verwaltungsverfahrensgesetz, SR 172.021, Stand 1. Juli 2022.

| Arbeits-ID | Regel | Fachparameter | Quelle | Gültigkeit und Status |
| --- | --- | --- | --- | --- |
| `VWVG-DELIV-001` | Eine nur gegen Unterschrift überbrachte Mitteilung gilt spätestens am siebten Tag nach dem ersten erfolglosen Zustellungsversuch als erfolgt. | optionale Vorverarbeitung des Zustellungsdatums | Art. 20 Abs. 2bis VwVG | seit 01.01.2007, geprüft 29.08.2026 |
| `VWVG-START-001` | Eine nach Tagen berechnete und mitzuteilende Frist beginnt am Tag nach der Mitteilung. Ohne Mitteilung beginnt sie am Tag nach dem auslösenden Ereignis. | `startOffsetDays = 1` | Art. 20 Abs. 1 und 2 VwVG | geltendes Recht, geprüft 29.08.2026 |
| `VWVG-COUNT-001` | Nach Tagen bestimmte Fristen zählen Kalendertage. Anwendbare Stillstandstage werden nicht verbraucht. | `countMode = calendarDaysWithSuspension` | Art. 20 und Art. 22a VwVG | geltendes Recht, geprüft 29.08.2026 |
| `VWVG-SUSP-001` | Gesetzliche oder behördliche Tagesfristen stehen vom siebten Tag vor Ostern bis und mit dem siebten Tag nach Ostern, vom 15. Juli bis und mit 15. August sowie vom 18. Dezember bis und mit 2. Januar still. | drei inklusive Zeiträume | Art. 22a Abs. 1 VwVG | geltendes Recht, geprüft 29.08.2026 |
| `VWVG-SUSP-EXC-001` | Kein Stillstand gilt bei aufschiebender Wirkung und anderen vorsorglichen Massnahmen sowie in öffentlichen Beschaffungen. | `suspension = none` bei diesen Sachgruppen | Art. 22a Abs. 2 VwVG | Beschaffungswesen seit 01.01.2021, geprüft 29.08.2026 |
| `VWVG-END-001` | Endet die Frist an einem Samstag, Sonntag oder anerkannten Feiertag, gilt der nächste Werktag. | `endShift = nextWorkingDay` | Art. 20 Abs. 3 VwVG | geltendes Recht, geprüft 29.08.2026 |
| `VWVG-HOL-001` | Massgebend ist das Feiertagsrecht des Kantons, in dem die Partei oder ihre Vertretung Wohnsitz oder Sitz hat. | `holidayAnchor = partyOrRepresentativeCanton` | Art. 20 Abs. 3 VwVG | seit 01.01.2007, geprüft 29.08.2026 |
| `VWVG-COMP-001` | Eingaben sind spätestens am letzten Tag der Behörde, der Schweizerischen Post oder einer schweizerischen Vertretung zu übergeben. | Hinweis zur Fristwahrung | Art. 21 und 21a VwVG | geltendes Recht, geprüft 29.08.2026 |
| `VWVG-EXT-001` | Gesetzliche Fristen sind nicht erstreckbar. Behördlich angesetzte Fristen können bei rechtzeitigem Gesuch aus zureichenden Gründen erstreckt werden. | Warnhinweis, keine automatische Verlängerung | Art. 22 VwVG | geltendes Recht, geprüft 29.08.2026 |

### Profilgrenzen

- Der Stillstand gilt nur für nach Tagen bestimmte Fristen.
- Spezialgesetze können weitere Ausnahmen vorsehen. Unbekannte Spezialmaterien müssen zu einer Warnung führen.
- Das noch nicht in Kraft gesetzte Bundesgesetz über Wochenend- und Feiertagszustellungen wird nicht vorweggenommen.
- Die Fristwiederherstellung nach Art. 24 VwVG wird nicht berechnet.

## 8. Regelkatalog VRPG Bern

Primärquellen sind das Gesetz über die Verwaltungsrechtspflege, BSG 155.21, Stand 1. August 2023, und das Gesetz über die Ruhe an öffentlichen Feiertagen, BSG 555.1, Stand 1. April 2021.

| Arbeits-ID | Regel | Fachparameter | Quelle | Gültigkeit und Status |
| --- | --- | --- | --- | --- |
| `VRPGBE-DELIV-001` | Eine nur gegen Unterschrift überbrachte Mitteilung gilt spätestens am siebten Tag nach dem ersten erfolglosen Zustellungsversuch als erfolgt. | optionale Vorverarbeitung des Zustellungsdatums | Art. 44 Abs. 3 VRPG | geltendes Recht, geprüft 29.08.2026 |
| `VRPGBE-START-001` | Eine durch Mitteilung, amtliche Publikation oder Ereignis ausgelöste Frist beginnt am folgenden Tag. | `startOffsetDays = 1` | Art. 41 Abs. 1 VRPG | seit 01.01.2009, geprüft 29.08.2026 |
| `VRPGBE-COUNT-001` | Es werden Kalendertage gezählt. Das VRPG enthält keinen allgemeinen Fristenstillstand. | `countMode = calendarDays`, `suspensions = none` | Art. 41 bis 44 VRPG, vollständige Prüfung des Fristenabschnitts | geltendes Recht, geprüft 29.08.2026 |
| `VRPGBE-END-001` | Endet die Frist an einem Samstag, Sonntag oder anerkannten Feiertag, gilt der nächste Werktag. | `endShift = nextWorkingDay` | Art. 41 Abs. 2 VRPG | seit 01.01.2009, geprüft 29.08.2026 |
| `VRPGBE-HOL-001` | Bei Verfahren nach bernischem VRPG sind die im bernischen Recht anerkannten Feiertage massgebend. Ein Feiertag am ausserkantonalen Wohnsitz der Partei genügt nicht. | `holidayAnchor = berneseProceduralLaw` | Art. 41 Abs. 2 VRPG, Art. 2 FRG, VGer BE SH 200 2026 421 vom 26.06.2026 E. 4 und 6 | geltendes Recht, geprüft 29.08.2026 |
| `VRPGBE-HOL-002` | Anerkannt sind Sonntage, Karfreitag, Ostern, Auffahrt, Pfingsten, Eidgenössischer Dank-, Buss- und Bettag, Weihnachten, Neujahr, 2. Januar, Ostermontag, Pfingstmontag, Bundesfeiertag und 26. Dezember. | bernischer Feiertagskalender | Art. 2 FRG | geltendes Recht, geprüft 29.08.2026 |
| `VRPGBE-LEX-001` | Besondere Fristbestimmungen des Bundesrechts sowie der Abstimmungs- und Wahlgesetzgebung gehen vor. | `requiresSpecialLawCheck = true` | Art. 41 Abs. 3 VRPG | geltendes Recht, geprüft 29.08.2026 |
| `VRPGBE-COMP-001` | Eingaben sind spätestens am letzten Tag der Behörde, der Schweizerischen Post oder einer schweizerischen Vertretung zu übergeben. Auch die rechtzeitige Eingabe bei einer unzuständigen bernischen oder eidgenössischen Verwaltungs- oder Gerichtsbehörde wahrt die Frist. | Hinweis zur Fristwahrung | Art. 42 VRPG | geltendes Recht, geprüft 29.08.2026 |
| `VRPGBE-EXT-001` | Behördlich angesetzte Fristen können bei rechtzeitigem Gesuch erstreckt werden. Gesetzliche Fristen sind nicht erstreckbar. | Warnhinweis, keine automatische Verlängerung | Art. 43 Abs. 1 VRPG | geltendes Recht, geprüft 29.08.2026 |

### Profilgrenzen

- Die Feiertage richten sich nach dem bernischen Verfahrensrecht und nicht nach dem Wohnsitz der Partei. Dies ist anders als bei StPO, BGG und VwVG.
- Spezialgesetzliche Fristregeln bleiben vorbehalten. Das Profil darf den Nutzer darüber nicht im Unklaren lassen.
- Die Fristwiederherstellung nach Art. 43 Abs. 2 VRPG wird nicht berechnet.

## 9. Gültigkeitsmatrix

| Quellen-ID | Erlass oder Regel | Verwendeter Stand | Im MVP gültig ab | Gültig bis | Nächste zwingende Prüfung |
| --- | --- | --- | --- | --- | --- |
| `SRC-STPO-20250401` | StPO Art. 85 und Art. 89 bis 92 | 01.04.2025 | 29.08.2026 als geprüfter Datenstand | offen | vor jedem Datenrelease, spätestens 15.11.2026 |
| `SRC-ZPO-20260701` | ZPO Art. 138 und Art. 142 bis 146 | 01.07.2026 | 29.08.2026 als geprüfter Datenstand | offen | vor jedem Datenrelease, spätestens 15.11.2026 |
| `SRC-BGG-20260401` | BGG Art. 44 bis 50 | 01.04.2026 | 29.08.2026 als geprüfter Datenstand | offen | vor jedem Datenrelease, spätestens 15.11.2026 |
| `SRC-VWVG-20220701` | VwVG Art. 20 bis 24 | 01.07.2022 | 29.08.2026 als geprüfter Datenstand | offen | vor jedem Datenrelease, spätestens 15.11.2026 |
| `SRC-VRPG-BE-20230801` | VRPG Art. 41 bis 44 | 01.08.2023 | 29.08.2026 als geprüfter Datenstand | offen | vor jedem Datenrelease, spätestens 15.11.2026 |
| `SRC-FRG-BE-20210401` | FRG Art. 2 | 01.04.2021 | 29.08.2026 als geprüfter Datenstand | offen | vor jedem Kalenderrelease, spätestens 15.11.2026 |

Die Angabe «im MVP gültig ab» bezeichnet den Beginn der projektintern geprüften Datenfassung. Sie behauptet nicht, dass sämtliche Normen erst an diesem Tag in Kraft getreten seien. Regelbezogene Inkrafttretensdaten sind im Regelkatalog separat aufgeführt, soweit sie für die Berechnung relevant sind.

## 10. Übergabe an AP5

Das Datenmodell muss mindestens folgende fachliche Informationen verlustfrei abbilden:

- Profil-ID und stabile Regel-ID
- Regeltyp und Fristeinheit
- Gültig-ab- und optionales Gültig-bis-Datum
- exakte Quellen-ID und Fundstelle
- Datum der Quellenprüfung und Prüfstatus
- Feiertagsanknüpfung
- inklusive Stillstandszeiträume
- positive und negative Ausnahmebedingungen
- Warnungen und manuelle Übersteuerung mit Begründung
- vollständige Rechenspur vom Eingabedatum bis zum endgültigen Fristende

Eine unbekannte Regelart, Verfahrensart oder Ausnahme darf nicht stillschweigend auf ein Standardprofil zurückfallen.

## 11. Startbestand für AP6 Golden Cases

AP6 soll mindestens folgende Fallgruppen quellenbasiert abdecken:

1. Fristbeginn am Tag nach einer gewöhnlichen Zustellung für jedes Profil
2. rechnerisches Ende an einem Samstag und Verschiebung auf Montag
3. rechnerisches Ende am 2. Januar im Kanton Bern
4. StPO-Frist über Ostern ohne Stillstand
5. ZPO-Frist über Ostern mit Stillstand
6. ZPO im summarischen Verfahren über Ostern ohne Stillstand
7. ZPO-Zustellung mit gewöhnlicher Post an einem Samstag seit 1. Januar 2025
8. BGG-Frist über den Sommerstillstand
9. BGG-Beschaffungssache über den Sommer ohne Stillstand
10. VwVG-Frist über den Jahreswechselstillstand
11. VwVG-Verfahren über vorsorgliche Massnahmen ohne Stillstand
12. VRPG-Bern-Frist ohne allgemeinen Stillstand
13. VRPG-Bern-Frist mit Ende an einem bernischen Feiertag
14. VRPG-Bern-Fall mit Fronleichnam am ausserkantonalen Wohnsitz, aber normalem Arbeitstag nach bernischem Recht, entsprechend VGer BE SH 200 2026 421
15. Warnfall mit unbekannter Spezialgesetzgebung oder widersprüchlicher Feiertagsanknüpfung
16. nicht abgeholte eingeschriebene Postsendung mit notwendiger Prüfung der Zustellfiktion

Erwartete Daten und Resultate werden erst in AP6 festgeschrieben. Vorher ist jeder Kalendertag nochmals gegen die amtlichen Kalenderdaten des betreffenden Jahres zu prüfen.
