# AP18B-04, Quellenpaket Zentralschweiz und Glarus

Stand und Quellenprüfung: 13. September 2026. Kantone LU, UR, SZ, OW, NW, ZG und GL. Erfassungskandidat unter Arbeitsmappenvertrag 0.5.0. Keine Fachabnahme, kein Produktdatenexport, keine Freigabe eines weiteren kantonalen Fristenrechners.

## Ergebnis und Abgrenzung

Das Paket umfasst 126 berechenbare Regeln in zehn kantonsweiten Geltungsprofilen, 16 Quellen, 30 Verfahrenszuordnungen/Abgrenzungen und 16 Prüfvermerke. Zehn räumliche Zuordnungen verwenden die Kantone als Gebiete mit dem Bund als Elternknoten. Es werden keine amtlichen BFS-Identifikatoren behauptet.

Ein bekannter Feiertag ist bewusst **noch nicht als Datum berechenbar**. Das Glarner Fahrtsfest benötigt eine bedingte April-/Karwochenregel, die der bestätigte Vertrag nicht enthält. Der Fall `GAP-GL-FAHRT-APRIL` wird in Quellen, Mappings, Prüfnotizen und den konsolidierten offenen Fällen sichtbar mitgeführt. Die Glarner Liste darf deshalb nicht als vollständig berechenbar bezeichnet werden.

| Geltungsprofil | Berechenbare Regeln | Inhalt und Grenze |
| --- | ---: | --- |
| LU-RLG-ALL | 13 | Zehn kantonsweite Ruhetage und drei zusätzlich namentlich bezeichnete Sonntage |
| LU-JUSG-ART76 | 13 | Eigene Feiertagsliste für ZPO und StPO |
| LU-VRG-ADDITIONAL | 3 | Nur Berchtoldstag, Oster- und Pfingstmontag als zusätzliche Fristentage |
| UR-LSG-ALL | 14 | Kantonsweite LSG-Liste, keine allgemeine ArG-Liste |
| SZ-RTG-ALL | 17 | Elf Feiertage und sechs hohe Feiertage |
| OW-RTG-ALL | 13 | Acht Feiertage und fünf hohe Feiertage, einschliesslich Bruderklausenfest |
| NW-RTG-ALL | 13 | Acht Feiertage und fünf hohe Feiertage, einschliesslich Josefstag |
| ZG-RLG-ALL | 12 | Neun Tage aus § 1 und drei in § 5 namentlich erwähnte Sonntage |
| ZG-VRG-ART10 | 16 | Eigene kantonale Fristenliste |
| GL-RTG-ALL | 12 | Zwölf berechenbare Tage, zusätzlich Fahrtsfest als offener Datumsfall |

Die Datumsregeln beginnen im Modell am 1. Januar 2026. Das ist das Erhebungs- und Testfenster, **nicht** das Inkrafttreten der Erlasse. Alle neuen Regeln bleiben `open` und `blockedEffect`. Vorhandene Freigaben des Referenzbestands werden weder erweitert noch neu ausgelegt.

Arbeitsrechtliche Teilmengen sind in eigenen Mapping-Zeilen genau bezeichnet. Sie werden nicht als weitere Kopien derselben Ruhetagsregeln angelegt. Wo eine Verfahrensnorm eine eigenständige Liste oder zusätzliche Tage festlegt, erhält diese hingegen ein eigenes Profil. Samstage und gewöhnliche Sonntage werden nicht zu jährlichen Feiertagsserien aufgebläht. Ausdrücklich benannte Sonntage bleiben zur Überprüfbarkeit der Normlisten sichtbar.

## Luzern

### Öffentliche Ruhe und Arbeitsrecht

Das [Ruhetags- und Ladenschlussgesetz, SRL 855](https://srl.lu.ch/data/855/de), Stand 1. Mai 2020, unterscheidet drei Ebenen.

- § 1a Abs. 1 Bst. b nennt Neujahr, Karfreitag, Auffahrt, Fronleichnam, Bundesfeiertag, Mariä Himmelfahrt, Allerheiligen, Mariä Empfängnis, Weihnachten und Stefanstag. Diese gelten nach Abs. 2 kantonsweit.
- § 2 bezeichnet Karfreitag, Ostersonntag, Pfingstsonntag, Eidgenössischen Bettag und Weihnachten als hohe Feiertage. Ostern, Pfingsten und Bettag kommen deshalb als drei weitere benannte Sonntage hinzu.
- § 1a Abs. 3 enthält acht arbeitsrechtlich sonntagsgleiche Tage. Mariä Empfängnis gehört nicht zu dieser Teilmenge, Stefanstag hingegen schon.

Josefstag und Patrozinium nach § 1a Abs. 1 Bst. c setzen eine Erklärung durch die Einwohnergemeinde voraus. Die kantonale Ermächtigung ist erfasst, die eigenständigen kommunalen Festlegungen werden nicht erhoben.

### Eigene verfahrensrechtliche Grundlagen

Das [Justizgesetz, SRL 260](https://srl.lu.ch/data/260/de), Stand 1. Januar 2026, enthält in § 76 eine eigene Liste von 13 Feiertagen im Sinne von Art. 142 Abs. 3 ZPO und Art. 90 Abs. 2 StPO. Im Vergleich zu den zehn Tagen aus § 1a Abs. 1 Bst. b RLG kommen Berchtoldstag, Oster- und Pfingstmontag hinzu. Die drei ohnehin auf Sonntag fallenden Tage stehen nicht zusätzlich in § 76. Das Produkt darf diese Liste nicht mit dem arbeitsrechtlichen Acht-Tage-Katalog verwechseln.

Das [VRG, SRL 40](https://srl.lu.ch/data/40/de), Stand 1. September 2021, verweist in § 34 Abs. 1 auf die öffentlichen Ruhetage, ausgenommen Patroziniumsfest und Josefstag. Berchtoldstag, Oster- und Pfingstmontag werden zusätzlich gleichgestellt. Die drei zusätzlichen Regeln stehen in `LU-VRG-ADDITIONAL`. Dieses Profil ist für sich genommen keine vollständige VRG-Feiertagsliste. Rückwärts zu zählende Fristen sind nach Abs. 2 gesondert zu behandeln. Eine solche Berechnungsfunktion wird hier nicht eingeführt.

Amtlicher Gegencheck: Das [Luzerner Steuerbuch zum Einspracheverfahren](https://steuerbuch.lu.ch/band2/verfahren/einspracheverfahren) bestätigt den Verweis auf § 34 VRG und die gesonderten zusätzlichen Tage. Es ersetzt die Normquellen nicht.

## Uri

Das [LSG, RB 70.1421, amtliche Version 963](https://rechtsbuch.ur.ch/api/de/versions/963/pdf_file) nennt in Art. 9 Abs. 1 Bst. b vierzehn kantonsweite Ruhetage. Der amtliche Text trägt das Erlassdatum 9. Februar 2003 und den Stand 1. Januar 2003. Diese Datierung wird nicht eigenmächtig korrigiert.

Die Liste umfasst Neujahr, Dreikönigen, Sankt-Josefs-Tag, Karfreitag, Ostermontag, Auffahrt, Pfingstmontag, Fronleichnam, 1. August, Mariä Himmelfahrt, Allerheiligen, Mariä Empfängnis, Weihnachten und Sankt-Stefans-Tag. **Der Stephanstag ist in dieser aktuellen Norm nicht auf bestimmte Wochentagslagen beschränkt.** Auch die [amtliche Übersicht, Stand 6. April 2023](https://www.ur.ch/publikationen/6581), nennt den 26. Dezember ohne solche Bedingung. Eine abweichende Einschränkung aus Sekundärübersichten wird nicht übernommen.

Art. 10 LSG verweist für die arbeitsrechtliche Feiertagsauswahl auf die [Kantonale Arbeitsverordnung, RB 20.1111](https://rechtsbuch.ur.ch/data/20.1111/de), Stand 1. Februar 2002. Art. 6 KAV nennt acht kantonale Tage. Dreikönigen, Josefstag, Oster- und Pfingstmontag sowie Stephanstag sind nicht Teil dieser ArG-Liste. Der Bundesfeiertag kommt bundesrechtlich hinzu. Das amtliche Merkblatt macht diese Differenz für alle vierzehn LSG-Tage sichtbar.

Gemeindefeiertage nach Art. 9 Abs. 1 Bst. c LSG bleiben ausserhalb der Erhebung. Eine universelle Fristenwirkung der LSG-Liste wird nicht freigegeben.

## Schwyz

Das [Ruhetagsgesetz, SRSZ 545.110](https://www.sz.ch/public/upload/assets/28055/545_110.pdf), enthält in § 2 Abs. 1 sechs hohe Feiertage und elf weitere Feiertage. Zusammen ergeben sich 17 benannte kantonsweite Tage. Die letzte im amtlichen PDF ausgewiesene Änderung trat am 1. Juli 2018 in Kraft. Der Druckvermerk SRSZ 1. Februar 2019 ist kein zusätzliches Inkrafttreten.

Die sechs hohen Feiertage sind Karfreitag, Ostersonntag, Pfingstsonntag, Eidgenössischer Bettag, Allerheiligen und Weihnachten. Die übrigen elf sind Neujahr, Dreikönige, St. Josef, Ostermontag, Pfingstmontag, Auffahrt, Fronleichnam, 1. August, Maria Himmelfahrt, Maria Empfängnis und Stephanstag.

§ 2 Abs. 2 enthält eine engere arbeitsrechtliche Liste. Josefstag gehört dazu, Maria Empfängnis nicht. Das aktuell verlinkte [Merkblatt des Arbeitsinspektorats](https://www.sz.ch/public/upload/assets/36693/Feiertagsregelung_Kanton_Schwyz.pdf?fp=6) bestätigt diese Differenz. Seine acht kantonalen Tage sind von der bundesrechtlichen Sonntagsgleichstellung des 1. August getrennt.

Das Merkblatt führt zudem lokal festgelegte Patronstage auf. Diese beruhen auf der Bezeichnung durch die kommunalen Stimmberechtigten nach § 2 Abs. 1 Ziff. 4, nicht auf einer abschliessenden kantonalen Gebietsregel wie in Aargau. Sie werden nicht übernommen. Dass einzelne Merkblattabschnitte diese ebenfalls kantonale Feiertage nennen, ändert die hier beschlossene Erhebungsgrenze nicht.

## Obwalden

Das [Ruhetagsgesetz, GDB 975.2, Version 103](https://gdb.ow.ch/api/de/versions/103/pdf_file), Stand 1. August 2009, nennt in Art. 2 Abs. 1 Bst. b acht Feiertage und unter Bst. c fünf hohe Feiertage. **Das Bruderklausenfest am 25. September ist ausdrücklich ein kantonaler Ruhetag.** Es wird nicht als blosser Personal-Schliesstag behandelt.

Die arbeitsrechtliche Teilmenge aus Abs. 3 enthält acht andere Tage beziehungsweise Teilmengen dieses Katalogs, ohne Bruderklausenfest. Lokale Feiertage nach Abs. 2 setzen eine Verordnung der Einwohnergemeinde voraus und bleiben ausserhalb der Erfassung. Insbesondere wird der Engelberger Benediktustag nicht aus einer blossen kantonalen Ermächtigung generiert.

Oster- und Pfingstmontag sowie Stephanstag stehen nicht in Art. 2 Abs. 1. Ihre mögliche Bedeutung in besonderen Verfahrenskontexten wird durch eine Personal- oder Schulferienliste weder bejaht noch verneint. Das Paket aktiviert keine solche zusätzliche Zuordnung.

## Nidwalden

Das [RTG, NG 921.1](https://gesetze.nw.ch/app/de/texts_of_law/921.1), Stand 1. Januar 2016, enthält in Art. 2 Abs. 1 fünf hohe und acht übrige Feiertage, zusammen 13 benannte Tage. Josefstag, 19. März, gehört zu den allgemeinen Ruhetagen. In der engeren arbeitsrechtlichen Acht-Tage-Liste des Abs. 2 fehlt er hingegen.

Weitere Feiertage nach Abs. 1 Ziff. 4 benötigen ein Reglement der politischen Gemeinde und werden nicht erhoben. Die Nachheiligtage von Ostern, Pfingsten und Weihnachten sowie Schmutziger Donnerstag werden nicht allein wegen ihrer Behandlung in der Personalverordnung als allgemeine Feiertage ergänzt. Die aktuelle [Personalverordnung, NG 165.111](https://gesetze.nw.ch/app/de/texts_of_law/165.111), unterscheidet solche arbeitsfreien Tage in § 8 zudem von den blossen Verwaltungsschliessungen in § 10. Sie ist hier nur Abgrenzungsbeleg, keine neue Feiertagsquelle.

## Zug

Das [Ruhetags- und Ladenöffnungsgesetz, BGS 942.31](https://bgs.zg.ch/app/de/texts_of_law/942.31), Stand 22. August 2025, nennt in § 1 Abs. 1 Bst. b neun Feiertage einschliesslich Bundesfeiertag. § 1 Abs. 2 enthält die acht kantonalen arbeitsrechtlichen Sonntagsgleichstellungen. § 5 Abs. 2 nennt zusätzlich Ostern, Pfingsten und Bettag im Zusammenhang mit eingeschränkten Ladenöffnungsbewilligungen. Diese drei bereits auf Sonntag fallenden Tage werden zur Normenüberprüfbarkeit ebenfalls sichtbar geführt. Eine separate gesetzliche Kategorie «hohe Feiertage» wird daraus nicht erfunden.

Die [amtliche Jahresliste 2026/2027](https://zg.ch/dam/jcr:d241f3f6-4c0c-4bb2-9096-b53dd371501c/Feiertage_2026_2027_Kt-ZG_Daten.pdf) bestätigt die neun Grundtage mit insgesamt 18 Datumsangaben. Sie beschreibt Berchtoldstag, Oster- und Pfingstmontag sowie Stephanstag arbeitsrechtlich als feiertagsähnliche Tage. Das ist keine Aussage gegen deren ausdrückliche Behandlung im kantonalen VRG.

Denn das [VRG, BGS 162.1, Version 2740](https://bgs.zg.ch/app/de/texts_of_law/162.1/versions/2740), Stand 17. Oktober 2025, nennt in § 10 Abs. 4 eine eigene Fristenliste mit 16 Tagen. Darin stehen auch diese vier Tage sowie Ostern, Pfingsten und Bettag. § 10 Abs. 3 regelt das Fristende. Bundesrecht bleibt nach § 1 Abs. 2 vorbehalten. `ZG-VRG-ART10` bleibt daher ein eigenständiges, noch nicht produktiv zugeordnetes Fristenprofil.

## Glarus und offener Datumsfall

Das [Ruhetagsgesetz, GS IX B/21/1, Version 2110](https://gesetze.gl.ch/api/de/versions/2110/pdf_file), Stand 1. Juli 2019, nennt in Art. 2 Abs. 1 acht allgemeine und fünf hohe Feiertage. Von diesen 13 Tagen sind zwölf im unveränderten Vertrag als Jahresregeln erfassbar. Art. 2 Abs. 5 stellt die nicht auf Sonntag fallenden öffentlichen Ruhetage im Sinne des Arbeitsgesetzes den Sonntagen gleich. Ladenöffnungsausnahmen in Art. 7 begründen keine neuen Feiertagsdaten.

Das Verhältnis dieser weiten Gleichstellung zur Begrenzung auf acht weitere kantonale Feiertage in Art. 20a Abs. 1 ArG ist vor einer arbeitsrechtlichen Produktfreigabe gesondert zu prüfen. Das arbeitsrechtliche Mapping bleibt gesperrt und ist keine abschliessend geklärte ArG-Liste.

Das Fahrtsfest ist als kantonaler Feiertag rechtlich belegt. Das [Gesetz betreffend die Feier der Näfelser Fahrt, GS I A/3/1](https://gesetze.gl.ch/data/I-A.3.1/de), Stand 24. Mai 1835, überträgt dem Regierungsrat in Art. 7 die jährlichen Programmanordnungen. Der Gesetzestext enthält jedoch keine ausdrückliche Datumsformel «erster Donnerstag im April, ausser Karwoche».

Die [amtliche Anordnung für 2026](https://www.gl.ch/public-newsroom.html/31/newsroomnews/14237/title/n%C3%A4felser-fahrt), Regierungsratssitzung vom 6. Januar 2026, nennt den **9. April 2026** und erklärt die übliche Regel samt Verschiebung um eine Woche, wenn der erste April-Donnerstag in die Karwoche fällt. Damit ist die zusätzliche Bedingung amtlich belegt, ohne sie fälschlich dem Wortlaut des Gesetzes von 1835 zuzuschreiben.

Folge für `GAP-GL-FAHRT-APRIL`:

- Kein unbedingter erster April-Donnerstag, denn das wäre gerade 2026 falsch.
- Kein fixer 9. April als angeblich ewiger Feiertag.
- Keine künstliche Sammlung von Einzeljahresregeln als verdeckte Vertragserweiterung.
- Quelle, Rechtsnatur, Datumsproblem und der amtliche Termin 2026 bleiben dokumentiert. Die technische Erweiterung braucht einen separaten Entscheid.

## Sprachstand und technische Prüfung

DE/FR-Grundbegriffe sowie vorhandene IT/RM-Bezeichnungen werden aus dem bestehenden Bestand übernommen. Die neuen Kantons- und Profilbezeichnungen sowie die Übersetzungen des Bruderklausenfests sind ausdrücklich provisorische Produkttexte. Damit wird keine amtliche französische, italienische oder rätoromanische Fassung der deutschsprachigen kantonalen Erlasse behauptet.

Die unabhängigen Tests in `tests/calendar-rules/ap18b-04-central.test.mjs` prüfen die zehn einzeln aus den Quellen erfassten Normlisten, alle 126 Regeln für 2026, 2027 und 2028, den unveränderten Referenzbestand, Freigabegrenzen, Bundesfeiertagsanwendungen, die Arbeitsrechts-/Verfahrensdifferenzen sowie den bewusst nicht erzeugten Glarner Datumsfall. Ergebnis: **21 Tests bestanden**, einschliesslich **378 exakter Jahresdatumsprüfungen**. Die amtlichen 18 Zuger Datumsangaben 2026/2027 wurden zusätzlich gegen die erfassten Regeln abgeglichen. 2028 ist ein rechnerischer Referenztest, keine behauptete Vollkontrolle anhand von sieben amtlichen Jahreskalendern.

Die vollständige Arbeitsmappenprüfung und die Abnahme des konsolidierten Kandidaten erfolgen separat. Dieser Quellenbericht behauptet weder eine vollständige Erhebung sämtlicher Spezialverfahrensnormen noch die Bedeutungslosigkeit ausgeschlossener kommunaler Feiertage für jedes denkbare Verfahren.
