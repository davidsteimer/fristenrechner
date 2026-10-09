# AP22A Schweizweite Kalenderaktivierung

Stand: 8. Oktober 2026. **AP22A ist abgeschlossen.** David Steimer hat die begrenzte Behandlung des 2. Januar mit [DEC-2026-029](../entscheidungen/DEC-2026-029-begrenzte-behandlung-zweiter-januar.md) bestätigt. Führendes Arbeitspaket ist [Issue #46](https://github.com/davidsteimer/fristenrechner/issues/46), dessen GitHub-Status bei diesem lokalen Abschluss nicht geprüft oder verändert wurde. [DEC-2026-027](../entscheidungen/DEC-2026-027-schrittweiser-schweizausbau.md) bestätigt den Releasezuschnitt und den Start. Die fachliche Freigabe gemäss [DEC-2026-028](../entscheidungen/DEC-2026-028-operative-freigabe-kalenderzuordnungen.md), einschliesslich GR-Abgrenzung und SO-Ergänzung, bleibt unverändert. Keine technische Aktivierung oder Betriebsfreigabe. AP22B ist der nächste, noch nicht begonnene oder beschlossene Vertragsentscheid.

## Aktueller Abschlussstand

Der [Abschlussnachweis](../fachrecht/abschluss-ap22a.md) führt die 73 ursprünglichen Zuordnungsfragen in 69 konkrete Auswahlregeln und vier bestätigte begrenzte Behandlungen über. Letztere betreffen den 2. Januar in SG/StPO, SG/BGG, SG/VwVG und SH/StPO. Nur wenn die unterschiedliche Behandlung dieses Tages das Berechnungsergebnis verändert, verlangt die künftige App eine Einzelfallklärung und gibt kein definitives automatisches Fristresultat aus. Im Übrigen bleiben diese Kombinationen verwendbar. Dieser gezielte Entscheid verändert nicht die übrige Freigabe nach DEC-2026-028. Die 20 negativen Verwendungsentscheide bleiben unverändert. GR bleibt bewusst auf den kantonalen Grundkatalog einschliesslich Bundesfeiertag begrenzt.

Die separate [Abnahmematrix V1.0](../../outputs/ap22a-abnahme-2026-10-08/2026-10-08_Verfahrens-und-Gebietsmatrix_AP22A_V1.0.xlsx) und ihr [strukturierter Begleitstand](../../outputs/ap22a-abnahme-2026-10-08/matrix-data-v10.json) halten alle 198 Zuordnungszeilen und Davids Bemerkungen im beschlossenen Stand fest. Die V0.1-Ausgangsmatrix und die V0.2-Abschlussvorlage bleiben unverändert erhalten.

Die fachliche Begründung steht in den Nachträgen zu [Bundesanknüpfungen](../fachrecht/ap22a-bundesanknuepfungen.md), [AG/FR/SO/NE](../fachrecht/ap22a-regionale-zuordnungen.md) und den [weiteren kantonalen Prozesslisten](../fachrecht/ap22a-weitere-prozesslisten.md). Insbesondere ersetzt der neu geprüfte BGer-Entscheid 2E_8/2024 die frühere regionale BGG-Beurteilung für AG. Die NE-Zusätze besitzen eigene ZPO-/StPO-Grundlagen. Die bisher offenen Bundeswirkungen der SO-Prozessliste sind als normative Ableitungen dokumentiert. Bewährte AI-, GR-, SO- und NE-Abgrenzungen werden dadurch nicht stillschweigend aufgehoben.

[Positive und negative Fachreferenzen](../fachrecht/ap22a-referenzfaelle.md) und der [technische Modellcheck](kalenderaktivierung-ap22a-modellcheck.md) sind ausgearbeitet. Der lokale [Prüfnachweis vom 2. Oktober](../../outputs/ap22a-abschluss-2026-10-02/model-check.json) enthält 14 bestandene Modellproben und 220 bestandene Bestandsregressionen. Diese wurden für den Dokumentationsabschluss am 8. Oktober nicht erneut ausgeführt. Das sind keine bestandenen Produktfälle eines bereits implementierten neuen Resolvers. Empfohlen ist die versionierte Erweiterung der vorhandenen Regelkalender mit expliziter Verfahrenszuordnung. Die konkrete Vertrags- und Versionsentscheidung folgt erst in AP22B. Zusätzliche ausserbernische Sozialanbindungen sind für diesen Kalenderabschluss zurückgestellt.

Die folgenden Abschnitte zur V0.1-Arbeitsmatrix und zur ersten Quellenprüfung bewahren den **historischen Erstbefund**. Ihre damaligen offenen Punkte werden durch den vorstehenden Abschlussstand und die verlinkten Nachträge überlagert. Die gebundene Ausgangsmatrix und der ursprüngliche JSON-Stand bleiben unverändert.

## Historische Arbeitsmatrix V0.1

Die [Excel-Arbeitsmappe](../../outputs/ap22a-matrix-2026-10-02/2026-10-02_Verfahrens-und-Gebietsmatrix_AP22A_V0.1.xlsx) ist die kommentierbare Arbeitskopie. Die von David Steimer mit vier GR-Bemerkungen versehene Fassung ist im [Freigabenachweis](../entscheidungen/DEC-2026-028-operative-freigabe-kalenderzuordnungen.md#gebundene-nachweise) bytegleich archiviert. Die Arbeitskopie selbst bleibt unverändert. Der [strukturierte Begleitstand](../../outputs/ap22a-matrix-2026-10-02/matrix-data.json) dokumentiert die ursprünglichen Zuordnungen, Quellen-IDs und die Prüfsumme des unveränderten Eingangskatalogs, noch ohne die späteren Excel-Bemerkungen. Er ist ein Rechercheartefakt, kein neuer Produktvertrag und kein importierbarer Aktivierungsrelease.

| Blatt | Inhalt |
| --- | --- |
| Lesehilfe | Bundesrechtliche Anknüpfungen, Statuslegende, Umfang und dynamische Statuszählung |
| Verfahrensmatrix | 198 filterbare Zuordnungszeilen, bestehend aus 49 Räumen mal vier Bundesprofilen und zwei neuen SO-Vorschlägen |
| Geltungsräume | Alle 49 bestehenden Räume mit DE/FR/IT/RG-Bezeichnungen, räumlichen Zuordnungen, Abgrenzungen und Normfundstellen |
| Prüfpunkte | 18 positive und negative Referenz- beziehungsweise Entscheidungsfragen, noch keine ausgeführten Produkttests |
| Quellen | 84 wiederverwendete Quellenmetadaten und 24 neue, gezielte Rechercheeinträge mit einzeln ausgewiesener Prüftiefe |

Die 198 Zeilen umfassen im ursprünglichen Vorlagestand acht unveränderte Bestandszuordnungen, 91 Prüfvorschläge, 73 offene Zuordnungen, vier Quellenlücken, 20 gezielt nicht zu übernehmende Listen und zwei nötige SO-Katalogergänzungen. **Diese Zahlen zählen Datenlisten je Verfahren, nicht bereits unterstützte Kantone.** Ein Prüfvorschlag aus der abgenommenen AP18-Erhebung ist noch keine vollständige neue Quellenprüfung. «Nicht übernehmen» betrifft die bezeichnete Liste, nicht zwingend den Kanton insgesamt.

Mit DEC-2026-028 wurden die 166 ursprünglich offenen Vorschlags-, Zuordnungs- und Ergänzungszeilen fachlich zur operativen Verwendung freigegeben. Für GR gilt die gesonderte bewusste Abgrenzung. Die 20 negativen Verwendungsentscheide bleiben bestehen. Zum Zeitpunkt dieses Freigabevermerks waren bei 73 «offenen Zuordnungen» die konkreten Auswahl- und Wirkungsregeln noch auszuarbeiten. Der aktuelle Bearbeitungsstand ist im Abschlussabschnitt oben dokumentiert. Die ursprünglichen Arbeitsstatus in den gebundenen Dateien bleiben als historischer Vorlagestand erhalten. Freigabe und Bearbeitungsstand werden getrennt geführt.

Die gespeicherte Arbeitsmappe wurde erneut eingelesen und für alle fünf Blätter gerendert. Fünf native Excel-Tabellen mit Filtern, fixierte Kopfzeilen und Identifikationsspalten sowie 108 Quellenlinks sind in der XLSX-Struktur geprüft. Die fünf Statusformeln enthalten keine Fehler. Ein kontrollierter Eingabewechsel hat die Zählung aktualisiert und wurde vollständig zurückgesetzt. Eine manuelle Bedienprüfung in Microsoft Excel steht noch aus. Der begrenzte zusätzliche KI-Fachcheck ersetzt keine menschliche Fachabnahme.

## Historische Ergebnisse der ersten Quellenprüfung

### Feiertagsort und Verfahrensart getrennt bestimmen

Die ZPO knüpft an den Gerichtsort an. StPO, BGG und VwVG knüpfen dagegen an den gesetzlich massgebenden Partei- oder Vertretungsort an. Behördenebene «Bund» ist deshalb kein hinreichender Feiertagsort. Die Bundesfeiertagsliste ist nur eine Grundkomponente. Feiertagswirkung und Gerichtsferien bleiben getrennte Rechtswirkungen. [StPO Art. 90](https://www.fedlex.admin.ch/eli/cc/2010/267/de#art_90), [ZPO Art. 142](https://www.fedlex.admin.ch/eli/cc/2010/262/de#art_142), [BGG Art. 45](https://www.fedlex.admin.ch/eli/cc/2006/218/de#art_45), [VwVG Art. 20](https://www.fedlex.admin.ch/eli/cc/1969/737_757_755/de#art_20).

Beim BGG ist «Partei oder Vertreter» keine freie günstigste Auswahl. Die geprüften Entscheide stellen bei einer vertretenen Partei mit entsprechendem Zustelldomizil auf den Vertretungsort ab. Der Resolver darf daher nicht beide Feiertagslisten vereinigen. Für StPO und VwVG bleiben der genaue Übertragungsnachweis und Sonderkonstellationen gesonderte Prüfaufträge. [BGer 4A_434/2023, E. 1.1](https://www.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F05-09-2024-4A_434-2023&lang=de&type=show_document&zoom=), [BGer 7B_561/2025, E. 1.2](https://search.bger.ch/ext/eurospider/live/fr/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F01-07-2025-7B_561-2025&lang=fr&type=show_document&zoom=NO).

### Neue Solothurner Prozessliste ergänzen

Der bisher erfasste RTG-Halbtag am 1. Mai bleibt als solcher ohne eigene Fristwirkung. Neu gefunden sind gesonderte Prozessnormen: § 22 Abs. 2 EG ZPO und § 10bis EG StPO enthalten zwölf kantonale Tage, darunter den 1. Mai ohne Halbtagsbeschränkung. Mit der Bundesfeier ergibt dies 13 benannte Tage. Eine Bucheggberg-Ausnahme enthält diese Prozessliste nicht. Die aktuelle EG-ZPO-Fassung vom 1. Januar 2025 wurde im amtlichen Original vollständig gelesen. [EG ZPO/SO, Version 5488, § 22 Abs. 2](https://bgs.so.ch/api/de/versions/5488/pdf_file), [EG StPO/SO](https://bgs.so.ch/app/de/texts_of_law/321.3), [amtliches Änderungsrecht GS 2014, 63](https://bgs.so.ch/api/de/change_documents/file_dictionaries/1025/pdf_file).

**Fachlich freigegebene Präzisierung gemäss DEC-2026-028:** Der bestätigte RTG-Halbtag wird nicht umgedeutet. Zusätzlich wird eine eigene prozessuale Liste für ZPO und StPO modelliert. Für BGG und VwVG ist damit noch nicht automatisch dieselbe Auswahlregel bestimmt. Die technische Katalogergänzung steht aus.

### Gleichgestellte Tage nicht pauschal ein oder ausschliessen

Arbeitsrechtliche Feiertagslisten sind keine universellen Fristenkalender. Umgekehrt dürfen prozessual gleichgestellte Tage nicht global ausgeschlossen werden. Die Rechtsprechung erkennt unter bestimmten Voraussetzungen auch solche Tage an. Beim Neuenburger Entscheid von 2018 war jedoch die inzwischen aufgehobene LPJA massgebend. Die Verbindung zur seit 2026 geltenden LPA und die konkreten Jahresbeschlüsse sind gesondert zu prüfen. [BGE 124 II 527, E. 2b](https://entscheidsuche.ch/docs/CH_BGE/CH_BGE_004_BGE-124-II-527_1998-06-11.html), [BGer 9C_396/2018, E. 2.2–2.4](https://www.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2Faza%3A%2F%2F20-12-2018-9C_396-2018&lang=de&type=show_document&zoom=NO), [LPA/NE Art. 33 Abs. 3](https://rsn.ne.ch/DATA/program/books/rsne/pdf/152.130.pdf).

Die bereits abgenommene AI-Konfliktbehandlung, die bedingten Stephanstags- und Ersatzfeiertagsregeln sowie die Näfelser Karwochenverschiebung bleiben unverändert. Offen ist ihre konkrete operative Anbindung, nicht erneut die bereits entschiedene Kalenderarithmetik.

### Örtliche Abdeckung offenlegen

Eigenständiges kommunales Recht bleibt ausserhalb der Erhebung. Kantonalrechtlich bestimmte Teilgebiete wie Le Landeron bleiben im Umfang. Für die vier GR-Zuordnungen StPO, ZPO, BGG und VwVG hat David Steimer ausdrücklich die Verwendung des kantonalen Grundkatalogs ohne kommunale Ruhetage nach Art. 3 Abs. 1 beschlossen. Die bestehende Bundesfeiertagsanwendung bleibt erhalten. Das ist eine bewusst begrenzte Produktabdeckung, kein Nachweis rechtlicher Irrelevanz zusätzlicher örtlicher Tage. Die Grenze ist am tatsächlich massgebenden GR-Kalender sichtbar zu machen. Sie ersetzt weder die historische VRG-Abgrenzung noch eine gesonderte Prüfung weiterer Sozialanbindungen. [Freigabe und genaue Benutzerbemerkung](../entscheidungen/DEC-2026-028-operative-freigabe-kalenderzuordnungen.md#graubünden), [Ruhetagsgesetz GR, Art. 2 und 3](https://www.gr-lex.gr.ch/api/de/versions/2604/pdf_file), [NE-Ausführungsbeschluss, Art. 2](https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.020.pdf).

## Geprüfte Ausgangsbasis

Die Nur-Lese-Bestandsaufnahme bezieht sich auf Quellstand `8a156a0a6453b549adde6f1998e7c5ccb0f71d3c` und den unveränderten [MVP-0.6-Datenrelease](../../data/releases/2026-10-01-mvp-06-approved.1/README.md). Bestehende Benutzeränderungen und Sicherungen gehören nicht zu diesem Paket.

| Gegenstand | Festgestellter Bestand |
| --- | --- |
| Manifest und Mindestconsumer | 6.0.0 |
| Grundprofile | `stpo`, `zpo`, `bgg`, `vwvg`, `vrpg-be`, jeweils Tagesfristen |
| Operative Kalender | `ch-federal-calendar`, `be-public-holidays`, Kalenderkomponente 2.0.0 |
| Operative Regeln | 12 Feiertagsregeln und 3 Gerichtsferienregeln |
| Schweizer Feiertagskatalog | 1.0.0, 479 Regeln, 27 Gemeinwesen, 49 Geltungsbereiche, 95 Gebietszuordnungen, 84 Quellen und 92 Verfahrenszuordnungen |
| Kategorien der 479 Regeln | 291 öffentliche Feiertagsregeln, 103 arbeitsrechtliche Feiertagsregeln und 85 Regeln für prozessual gleichgestellte Tage |
| Operativer Status im Katalog | 12 Regeln `approved`, 467 `open`. Bei den Verfahrenszuordnungen 2 `approved`, 68 `blocked`, 22 `open`. |
| Sozialverfahrenskatalog | 2.0.0, 44 nationale Regeln, 50 ausschliesslich bernische Anbindungen und 50 Releasefreigaben |

Die offenen oder gesperrten operativen Status im unveränderten MVP-0.6-Katalog sind gewollte technische Aktivierungsgrenzen. Sie bilden die nachträgliche fachliche Freigabe gemäss DEC-2026-028 noch nicht ab. Sie bedeuten nicht, dass die bereits abgenommene Datenerhebung nachträglich als ungeprüft behandelt wird. Die drei Feiertagskategorien dürfen nicht zu einer gemeinsamen kantonalen Liste ohne Verfahrensbezug zusammengezogen werden.

Zeitlich ist zu unterscheiden: Die Manifestabdeckung beginnt am 1. Januar 2026 ohne obere Grenze. Die fünf Grundprofile sind ab 29. August 2026 ohne obere Grenze modelliert. Dagegen sind alle 50 sozialen Releasefreigaben für Fall- und Berechnungsabdeckung auf 1. Januar 2026 bis 31. Dezember 2027 begrenzt. Eine offene technische Gültigkeit ersetzt weder die periodische Quellenprüfung noch eine konkrete neue Freigabe.

## Technischer Änderungsbedarf

| Befund | Fundstelle | Konsequenz für den Entwurf |
| --- | --- | --- |
| Katalogprojektion verlangt abschliessend CH/BE mit zwölf Feiertagsregeln | [Katalog und Projektion](../../src/core/holidayCatalog.ts) | Neue Zuordnungen brauchen einen expliziten versionierten Vertrag. Keine Umdeutung der bisherigen Hauptversion. |
| Bedingte Katalogregeln sind datierbar, aber noch nicht operativ zulässig. `nthWeekdayOffsetDays` wird von der Projektion nicht übernommen. | [Katalog](../../src/core/holidayCatalog.ts), [Kalendertypen](../../src/core/calendarRuleTypes.ts) | Der abgeschlossene [Variantenvergleich](kalenderaktivierung-ap22a-modellcheck.md) empfiehlt die kontrollierte Übernahme in eine neue Hauptversion der Regelkalender. Konkreter Vertragsentscheid erst in AP22B. |
| Consumer für Format 5/6 verlangt fünf Profile und die zwei bekannten Kalender | [Releaseconsumer](../../src/core/data.ts) | TypeScript, Schemata, Builder und Python-Prüfer gemeinsam fortschreiben. Alte Hauptformate bleiben geschlossen. |
| Kantonsoptionen werden aus vorhandenen kantonalen Rechtsprofilen gewonnen | [UI-Modell](../../src/ui/model.ts) | Ein Behördenkanton muss für Bundesprofile verfügbar werden können, ohne ein vollständiges kantonales Verwaltungsprofil vorzutäuschen. |
| Kalenderwahl verwendet Bern als bevorzugten Wert und den ersten Kalender eines Kantons | [UI-Modell](../../src/ui/model.ts) | Explizite Auflösung nach Verfahren, Rolle, Ort und Zeitraum. Kein «erster Treffer» bei regionalen Alternativen. |
| Sozialauswahl und Feiertagsfakten sind noch an BE gebunden | [Sozial-UI](../../src/ui/socialUi.ts), [Katalogvalidator](../../src/core/socialCatalog.ts) | Zusätzliche Anbindungen getrennt qualifizieren. Die nationale Regel allein genügt nicht. |
| Geografische Mitgliedschaft ist ausdrücklich keine Verfahrensfreigabe | [Gebietsauflösung](../../src/core/holidayCatalog.ts) | Diese Trennung beibehalten, auch wenn zusätzliche Gebiete operativ verwendet werden. |

Die aktuellen Profilverträge unterscheiden bereits `partyOrCounselCanton` für StPO, `courtLocation` für ZPO, `partyOrRepresentativeCanton` für BGG/VwVG und eine feste bernische Zuordnung für VRPG-BE. Das ist ein Befund zum vorhandenen Vertrag, keine in diesem Paket bereits abgeschlossene neue Rechtsprüfung.

## Vorgeschlagene Aktivierungsmatrix

Die Matrix wird je relevanter Kombination geführt, nicht als pauschale Zeile «Kanton unterstützt». Ihr Entwurf enthält folgende voneinander getrennten Angaben:

| Dimension | Inhalt |
| --- | --- |
| Verfahren | Profil, gegebenenfalls Stadium, Fristtyp und konkrete Handlung |
| Anknüpfung | Massgebende Rolle, Behörden-/Gerichtsort oder Partei-/Vertretungsort. Umgang mit mehreren relevanten Orten. |
| Kalenderwirkung | Öffentlicher Feiertag, arbeitsrechtliche Kategorie oder prozessual gleichgestellter Tag und die rechtliche Wirkung im betreffenden Verfahren |
| Gebiet | Kanton und nötigenfalls kantonalrechtlich definierter Bezirk, Gemeinde oder Teilgebiet. Zeitlich gültige Zugehörigkeit. |
| Zeit | Gültigkeit der Norm und Regel, Quellenstand, gedeckter Fall- und Berechnungszeitraum |
| Nachweis | Quellen-ID, genaue Fundstelle, geprüfte Fassung und Referenzfall |
| Erhebung | Bereits abgenommene fachliche Datenerhebung und deren Referenz |
| Prüfung | Ergebnis der neuen Verfahrenszuordnung, offene Frage oder dokumentierter Vorbehalt |
| Produktfreigabe | Nicht beantragt, vorgeschlagen, ausdrücklich freigegeben oder ausgeschlossen. Freigabenachweis getrennt von der Quellenprüfung. |

Der Matrixvertrag ist ein Arbeitsvorschlag und noch kein beschlossenes JSON-Schema. Die Vollständigkeit für Bund und alle 26 Kantone sowie die 49 vorhandenen Räume ist im Inventar sichtbar. Fachlich irrelevante Räume werden begründet abgegrenzt, nicht künstlich in allen Verfahren angeboten. Die fachliche Freigabe liegt gemäss DEC-2026-028 vor. Der aktuelle Abschlussstand ergänzt die ausgearbeiteten Wirkungsdefinitionen und Referenzen sowie die mit DEC-2026-029 bestätigte begrenzte Behandlung des 2. Januar. Ein konkreter Produktformatvertrag entsteht erst in AP22B.

## Gezielte Modellproben

- **AG:** kantonalrechtlich bestimmte Bezirks-/Gemeinderäume richtig auflösen.
- **FR:** regionale arbeitsrechtliche Listen und eigenständige Verfahrenslisten auseinanderhalten. Teilgebiete nicht pauschal zur ganzen Gemeinde erweitern.
- **SO:** räumliche RTG-Ausnahmen von der neu freigegebenen kantonsweiten ZPO-/StPO-Prozessliste trennen. Bestätigter RTG-Halbtag bleibt ohne eigene Fristwirkung.
- **GR:** beschlossene begrenzte Abdeckung für die vier Bundesprofile am massgebenden Feiertagskalender ausweisen. Keine automatische Erweiterung auf ATSG.
- **AR und AI:** bereits modellierte bedingte Stephanstagsregeln operativ ausdrückbar machen. Die beschlossene Behandlung des AI-Quellenkonflikts bleibt erhalten.
- **GL:** Karwochenverschiebung der Näfelser Fahrt als vorhandene bedingte Kalenderregel berücksichtigen.
- **NE:** bedingte Ersatzfeiertage von zusätzlichen regionalen Einzelfestlegungen und Verwaltungsschliesstagen trennen. Der bestehende Vorbehalt bleibt bestehen.

Diese Liste beschreibt die aus den [AP18-Unterlagen](feiertagskatalog-ap18c.md) abgeleiteten Prüffelder. Die nun bestandenen 14 begrenzten Modellproben und 220 Bestandsregressionen sind im [Modellcheck](kalenderaktivierung-ap22a-modellcheck.md) und dessen [Prüfnachweis](../../outputs/ap22a-abschluss-2026-10-02/model-check.json) belegt. Die neuen fachlichen Sollwirkungen bleiben von späteren automatisierten Produktfällen in AP22C getrennt.

## Abnahmekriterien und nächste Arbeit

- [x] Ausgangsbestand und technische Aktivierungsgrenzen aus dem aktuellen Produktstand inventarisiert.
- [x] Matrixdimensionen, Modellproben und betroffene Consumer als Arbeitsvorschlag beschrieben.
- [x] Vollständige Bearbeitungsmatrix V0.1 für die 27 Gemeinwesen und 49 bestehenden Räume erstellt. Offene Zuordnungen sind ausdrücklich ausgewiesen, keine abgeschlossene Rechtsprüfung aller 198 Zeilen behauptet.
- [x] Fachliche Durchsicht durch David Steimer und ausdrückliche Freigabe zur operativen Verwendung gemäss DEC-2026-028 dokumentiert, einschliesslich GR-Abgrenzung und SO-Ergänzung. Kommentierte Arbeitskopie bytegleich gesichert.
- [x] Alle 73 bisherigen Prüfaufträge abgeschlossen, mit 69 konkreten Auswahlregeln und vier ausdrücklich bestätigten begrenzten Behandlungen des 2. Januar.
- [x] Verfahrensbezogene Quellenprüfung und Behandlung mehrerer rechtlich massgebender Orte dokumentiert. Belege, normative Ableitungen und verbleibende Grenzen getrennt ausgewiesen.
- [x] Positive und negative Referenzfälle mit erwarteter Wirkung festgelegt, einschliesslich regionaler, bedingter und zeitlicher Grenzen. Sollfälle nicht als bereits ausgeführte Produktfälle ausgewiesen.
- [x] Technische Alternativen bewertet und konkreten Vertrags-/Migrationsbedarf für AP22B festgehalten. 14 Modellproben und 220 Bestandsregressionen bestanden.
- [x] Zusätzliche ausserbernische Sozialanbindungen für diesen Kalenderabschluss ausdrücklich zurückgestellt.
- [x] Gesamtvorlage AP22A einschliesslich Modellcheck fachlich und technisch ausgearbeitet.
- [x] Gezielten Benutzerentscheid zu den vier Januar-2-Grenzen mit DEC-2026-029 dokumentiert und AP22A am 8. Oktober 2026 abgeschlossen. Konkrete neue Formatversionen und Releaseaktivierungen bleiben eigene spätere Entscheide.

AP22A ist mit der bestätigten begrenzten Behandlung der vier Januar-2-Verbindungen abgeschlossen. Eine zusätzliche allgemeine Abnahme ist nicht erforderlich. Die 18 ursprünglichen Prüfpunkte bleiben als historischer Arbeitsplan erhalten. Die Fachreferenzen und tatsächlichen Modellnachweise sind gesondert verlinkt. Als nächstes folgt AP22B mit dem konkreten Format- und Migrationsvertrag. Dieses Paket ist noch nicht begonnen oder beschlossen. AP21 wird nicht parallel als zweites wesentliches Paket begonnen. Die Obergrenze von fünf Nettoarbeitstagen je wesentlichem Teilpaket bleibt bestehen.

## Unveränderter Betrieb

Kein Produktcode oder Datenrelease wird durch diesen Dokumentations- und Modellabschluss geändert. Historische Releases, AP5-Ansicht, E/Q/P, Mirrors, Versionsnummern, Hosting und Berechtigungen bleiben unverändert. Die [Releaseplanung](../planung/release-mvp07.md) führt die späteren getrennten Abnahmen und Bereitstellungsschritte. GitHub-Publikation ist nicht Bestandteil dieses lokalen Abschlusses.
